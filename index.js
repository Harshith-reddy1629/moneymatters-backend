const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv").config();

const mongooseConnection = require("./mongoConnection");
const {
  sample,
  inputValidation,
  valuesValidation,
  registeringUser,
  loginUser,
} = require("./userMiddlewares");

const app = express();

app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 8001;

const initializeServer = () => {
  try {
    app.listen(PORT, () =>
      console.log(`Server Running at http://localhost:${PORT}/`)
    );
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

mongooseConnection();

initializeServer();

app.get("/", sample);
app
  .post("/register/", inputValidation, valuesValidation, registeringUser)
  .post("/login/", loginUser);
