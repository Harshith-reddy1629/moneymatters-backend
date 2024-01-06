const mongoose = require("mongoose");

const mongoConnection = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("database", connect.connection.name);
  } catch (error) {
    console.log("error", error);
    process.exit(1);
  }
};

module.exports = mongoConnection;
