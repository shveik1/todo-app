const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const { User } = require("../models/user");

let database;

router.use(async (req, res, next) => {
  if (!database) database = req.app.get("database");
  console.log(database);
  next();
});

function validateRegistration(req, res, next) {
  if (!(/\S+@\S+\.\S+/g.test(req.body.email.split(" ").join("")))) return res.send({ error: "Invalid email" })
  if (req.body.password.split(" ").join("").length < 6) return res.send({ error: "Too weak password" })
  next();
}

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const isUser = await database.collection("users").findOne({ email });

    if (!isUser)
      return res.send({ error: "Wrong email or password, try again" });

    if (!bcrypt.compareSync(password, isUser.password))
      return res.send({ error: "Wrong email or password, try again" });

    if (!req.session.userId) req.session.userId = isUser._id.toHexString();

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
router.post("/register", validateRegistration, async (req, res) => {
  const salt = bcrypt.genSaltSync();
  let password = bcrypt.hashSync(req.body.password, salt);

  try {
    let newUser = new User(
      req.body.firstname,
      req.body.lastname,
      req.body.email,
      password
    );
    await database.collection("users").insertOne(newUser.getObject());
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
router.get("/logout", (req, res) => {
  delete req.session.userId;
  res.redirect("/login");
});

router.get("*", async (req, res) => {
  res.send("Incorrect url");
});

module.exports = router;
