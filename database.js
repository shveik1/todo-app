const { MongoClient } = require("mongodb");

const process = require("process");
require("dotenv").config()

const MONGO_URI = process.env.MONGO_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;

console.log(MONGO_URI);
console.log(DATABASE_NAME);

const client = new MongoClient(MONGO_URI);

class DatabaseHelper {
  constructor() { }

  async initialize() {
    try {
      await client.connect();
      this.database = client.db(DATABASE_NAME);

      const isUsers = await this.database
        .listCollections({ name: "users" })
        .hasNext();
      const isTasks = await this.database
        .listCollections({ name: "tasks" })
        .hasNext();

      if (!isUsers) this.database.createCollection("users");
      if (!isTasks) this.database.createCollection("tasks");

      console.log("Connected to database");
    } catch (error) {
      console.log("Error occured");
    }
  }

  getDatabase() {
    if (!this.database) {
      console.log("Not initilized yet");
      return;
    }
    return this.database;
  }
}

process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB disconnected on app termination");
  process.exit(0);
});

module.exports = {
  DatabaseHelper,
};
