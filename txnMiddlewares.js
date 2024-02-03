const { response } = require("express");
const txnData = require("./Models/transactionSchema");
const mongoose = require("mongoose");

const CreditDebitTotals = async (request, response) => {
  try {
    let newId = new mongoose.mongo.ObjectId(request.user.id);

    const S = await txnData.aggregate([
      {
        $match: {
          userId: newId,
        },
      },
      {
        $group: {
          _id: "$TxnType",
          sum: { $sum: "$Amount" },
        },
      },
    ]);
    response.status(200).send(S);
  } catch (error) {
    response.status(400).send("error");
  }
};

exports.CreditDebitTotals = CreditDebitTotals;

const AddTxn = async (request, response) => {
  const { txnName, TxnType, Category, Amount, txnDate } = request.body;

  const { id, name } = request.user;

  try {
    if (!txnName || !TxnType || !Category) {
      response.send({ errMsg: "Invalid Data" }).status(400);
    } else {
      const createTxn = await txnData.create({
        userId: id,
        username: name,
        txnName,
        TxnType,
        txnDate,
        Amount,
        Category,
      });

      response.status(201).send(createTxn);
    }
  } catch (error) {
    response.send(400).status({ errMsg: "Error" });
  }
};

const UpdateTxn = async (request, response) => {
  const { txnName, TxnType, Category, Amount, txnDate } = request.body;
  const { id } = request.params;

  try {
    if (!txnName || !TxnType || !Category || !Amount) {
      response.status(400).send({ errMsg: "Enter valid Inputs" });
    } else {
      const txnUpdated = await txnData.updateOne(
        { _id: id },
        { txnName, TxnType, Category, Amount, txnDate }
      );
      response.status(201).send(txnUpdated);
    }
  } catch (error) {
    response.status(400).send({ errMsg: "error " });
  }
};

const DeleteTxn = async (request, response) => {
  const { id } = request.params;

  try {
    const deleteTxn = await txnData.findByIdAndDelete(id);
    if (!deleteTxn) {
      response.status(404).send({
        errMsg: "Already deleted",
      });
    } else {
      response.status(200).send({ msg: "DELETED", ...deleteTxn });
    }
  } catch (error) {
    response.status(400).send(error);
  }
};

const GetTxns = async (request, response) => {
  const { id } = request.user;

  try {
    const txns = await txnData.find({ userId: id });

    response.status(200).send(txns);
  } catch (error) {
    response.status(400).send({ errMsg: "error" });
  }
};

const SevenDaysTxns = async (requset, response) => {
  const { id } = requset.user;

  try {
    const oneWeek = new Date();
    oneWeek.setDate(new Date().getDate() - 6);

    const SevendaysData = await txnData.find({
      userId: id,
      txnDate: { $gte: oneWeek },
    });

    response.status(200).send(SevendaysData);
  } catch (error) {}
};

exports.SevenDaysTxns = SevenDaysTxns;

exports.GetTxns = GetTxns;

exports.DeleteTxn = DeleteTxn;

exports.AddTxn = AddTxn;

exports.UpdateTxn = UpdateTxn;
