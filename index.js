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
  getUserDetails,
  generateEmail,
  emailVerification,
  resendMail,
  trailEmail,
  allowChangePassword,
  forgotChangePassword,
} = require("./userMiddlewares");

const tokenValidator = require("./tokenValidator");

const {
  AddTxn,
  UpdateTxn,
  DeleteTxn,
  CreditDebitTotals,
  GetTxns,
  SevenDaysTxns,
} = require("./txnMiddlewares");

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
  .post(
    "/register/",
    inputValidation,
    valuesValidation,
    registeringUser,
    generateEmail
  )
  .post("/login/", loginUser)
  .get("/verify-email/:id", emailVerification)
  .get("/resend-mail/:email", resendMail)
  .post("/allow-change-password", allowChangePassword)
  .post("/change-password/:id", forgotChangePassword);

app
  .get("/all-transactions/", tokenValidator, GetTxns)
  .get("/credit-debit-transactions/", tokenValidator, CreditDebitTotals)
  .post("/add-txn", tokenValidator, AddTxn)
  .put("/update-txn/:id/", tokenValidator, UpdateTxn)
  .delete("/delete-txn/:id", tokenValidator, DeleteTxn)
  .get("/seven-days-txns/", tokenValidator, SevenDaysTxns)
  .get("/get-user-details", tokenValidator, getUserDetails);

// generateEmail();
