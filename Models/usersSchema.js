const mongoose = require("mongoose");

const usersSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add the Name"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Please add the email address"],
    },
    isVerified: {
      default: false,
      type: Boolean,
      required: [true, "Verify your email"],
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Please add the username"],
    },
    password: {
      type: String,
      required: [true, "Please add the password"],
    },
    dateOfBirth: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);

const usersData = mongoose.model("moneymatterUsers", usersSchema);

module.exports = usersData;
