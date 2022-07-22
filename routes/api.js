const express = require("express");
const router = express.Router();

const { ObjectId } = require("mongodb");
const { Task } = require("../models/task");

let database;

router.use(async (req, res, next) => {
  if (!database) database = req.app.get("database");
  next();
});

function validateTask(req, res, next) {
  const isEmpty = req.body.taskDescription.length > 0;

  if (!isEmpty) return res.sendStatus(400);
  next();
}

router.post("/saveTask", validateTask, async (req, res) => {
  try {
    let newTask = new Task(req.session.userId, req.body.taskDescription);
    let inserted = await database
      .collection("tasks")
      .insertOne(newTask.getObject());
    newTask._id = inserted.insertedId.toString();
    res.send(newTask);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/deleteTask", async (req, res) => {
  try {
    const taskId = ObjectId(req.body.taskId);
    const userId = ObjectId(req.session.userId)
    await database.collection("tasks").deleteOne({ _id: taskId, userId });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/deleteFinished", async (req, res) => {
  try {
    const tasksIds = req.body.tasksIds
    const userId = ObjectId(req.session.userId)

    tasksIds.map(async (taskId) => {
      await database.collection("tasks").deleteOne({ _id: ObjectId(taskId), userId });
    })

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
})

router.post("/setImportance", async (req, res) => {
  try {
    let isImportant = req.body.isImportant == true;
    let taskId = ObjectId(req.body.taskId);
    await database
      .collection("tasks")
      .updateOne({ _id: taskId }, { $set: { isImportant } });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

router.post("/finishTask", async (req, res) => {
  try {
    let taskId = ObjectId(req.body.taskId);
    await database
      .collection("tasks")
      .updateOne({ _id: taskId }, { $set: { isFinished: true } });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

router.post("/restoreTask", async (req, res) => {
  try {
    let taskId = ObjectId(req.body.taskId);
    await database
      .collection("tasks")
      .updateOne({ _id: taskId }, { $set: { isFinished: false } });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

router.get("*", async (req, res) => {
  res.send("Incorrect url");
});

module.exports = router;