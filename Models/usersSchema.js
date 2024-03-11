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
    passChangeAllowed: {
      type: Boolean,
      default: false,
    },
    dateOfBirth: {
      type: Date,
      default: Date.now,
    },
    present_address: {
      type: String,
    },
    permanent_address: {
      type: String,
    },
    city: {
      type: String,
    },
    Postal_code: {
      type: String,
    },
    country: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

const usersData = mongoose.model("moneymatterUsers", usersSchema);

module.exports = usersData;
