const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    username: {
      type: String,
      required: true,
    },
    txnName: {
      type: String,
      required: [true, "Transcation name is mandatory"],
    },
    TxnType: {
      type: String,
      required: [true, "Transcation type is mandatory"],
    },
    Category: {
      type: String,
      required: [true, "Category is mandatory"],
    },
    Amount: {
      type: Number,
      required: [true, "Amount"],
    },
    txnDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const txnData = mongoose.model("transactions", transactionSchema);

module.exports = txnData;
