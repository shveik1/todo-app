const express = require("express");
const session = require("express-session");

const { DatabaseHelper } = require("./database");
const { ObjectId } = require("mongodb");

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    name: "session",
    cookie: { maxAge: 86400000 },
  })
);

app.use(express.static(__dirname + "/public"));

app.use("/api", require("./routes/api"));
app.use("/auth", require("./routes/auth"));

app.set("views", __dirname + "/pages");
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;

let database;

app.use((req, res, next) => {
  if (req.url === "/login" || req.url === "/registration") {
    if (req.session.userId) return res.redirect("/");
    return next();
  }

  if (!req.session.userId) return res.redirect("/login");

  next();
});

app.get("/", async (req, res) => {
  try {
    const user = await database
      .collection("users")
      .findOne(
        { _id: ObjectId(req.session.userId) },
        { projection: { firstname: 1, lastname: 1 } }
      );

    let tasks = await database
      .collection("tasks")
      .find({ userId: ObjectId(req.session.userId), isFinished: false })
      .toArray();

    tasks = tasks.sort((task) => {
      if (task.isImportant === true) return -1;
      return 1;
    });
    res.render("index", { tasks, path: "/", user });
  } catch (error) {
    res.sendStatus(500);
  }
});
app.get("/finished", async (req, res) => {
  try {
    const user = await database
      .collection("users")
      .findOne(
        { _id: ObjectId(req.session.userId) },
        { projection: { firstname: 1, lastname: 1 } }
      );
    let tasks = await database
      .collection("tasks")
      .find({ userId: ObjectId(req.session.userId), isFinished: true })
      .toArray();

    res.render("finished", { tasks, path: "/finished", user });
  } catch (error) {
    res.sendStatus(500);
  }
});
app.get("/login", async (req, res) => {
  res.render("login");
});
app.get("/registration", async (req, res) => {
  res.render("registration");
});

app.get("*", async (req, res) => {
  const user = await database
    .collection("users")
    .findOne(
      { _id: ObjectId(req.session.userId) },
      { projection: { firstname: 1, lastname: 1 } }
    );
  res.render("page404", { user });
});

app.listen(PORT, async () => {
  let databaseHelper = new DatabaseHelper();
  await databaseHelper.initialize();
  database = databaseHelper.getDatabase();
  app.set("database", database);

  console.log(`Server has been started on http://localhost:${PORT}`);
});
