const { ObjectId } = require("mongodb");

class Task {
  constructor(userId, taskDescription, isImportant = false, isFinished = false) {
    this.userId = ObjectId(userId);
    this.taskDescription = taskDescription;
    this.isImportant = isImportant;
    this.isFinished = isFinished;
  }

  getObject() {
    return {
      userId: this.userId,
      taskDescription: this.taskDescription,
      isImportant: this.isImportant,
      isFinished: this.isFinished,
    };
  }
}

module.exports = {
  Task,
};
