const usersData = require("./Models/usersSchema");

const EmailValidator = require("email-validator");

const nodemailer = require("nodemailer");

const bcrypt = require("bcrypt");
const { response, request } = require("express");

const jwt = require("jsonwebtoken");

const sample = async (req, res) => {
  res.send("sample").status(200);
};

exports.sample = sample;

// INPUT VALIDATION

const inputValidation = (request, response, next) => {
  const { username, name, password, email } = request.body;

  if (!username || !name || !password || !email) {
    response.status(400).send({ errMsg: "All Fields are mandatory" });
  } else {
    next();
  }
};

exports.inputValidation = inputValidation;

const valuesValidation = async (request, response, next) => {
  const { email, username, password } = request.body;

  const ValidationErrors = {};

  const isAnyObjectWithThisMail = await usersData.findOne({ email });
  const checkUsername = await usersData.findOne({ username });
  const isPasswordLT8 = password.length < 8;
  const isPasswordGT16 = password.length > 16;

  if (!!isAnyObjectWithThisMail)
    ValidationErrors.mailError = "user already exist with this email";
  if (!!checkUsername)
    ValidationErrors.usernameError = "this username already exists";
  if (isPasswordLT8)
    ValidationErrors.passwordError =
      "Password should have minimum 8 characters";
  if (isPasswordGT16)
    ValidationErrors.passwordError = "max 16 characters are allowed";

  if (
    !isAnyObjectWithThisMail &&
    !checkUsername &&
    !isPasswordLT8 &&
    !isPasswordGT16
  ) {
    next();
  } else {
    response.status(400).send(ValidationErrors);
  }
};

exports.valuesValidation = valuesValidation;

const registeringUser = async (request, response, next) => {
  const { name, username, password, email, date } = request.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const checkUsername = await usersData.findOne({ username });

  if (!checkUsername) {
    const newUser = await usersData.create({
      name,
      username,
      password: hashedPassword,
      email,
      dateOfBirth: date,
    });

    // response.status(201).send(newUser);
    next();
  } else {
    response.status(400).send({
      errMsg: "Username already exists",
    });
  }
};

exports.registeringUser = registeringUser;

const loginUser = async (request, response) => {
  const { username, password } = request.body;

  try {
    const dbUser = await usersData.findOne({ username });
    if (!dbUser) {
      response.status(400).send({ errMsg: "Invalid Username or password" });
    } else {
      const { id, name, email, isVerified } = dbUser;
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      if (isPasswordMatched) {
        if (isVerified) {
          const payload = {
            username,
            id,
            name,
            email,
          };
          const jwtToken = jwt.sign(payload, process.env.MY_SECRET_TOKEN);

          response.status(200).send({ jwtToken });
        } else {
          response.status(401).send({ errMsg: "your account is not verified" });
        }
      } else {
        response.status(400);
        response.send({ errMsg: "Invalid Username or Password" });
      }
    }
  } catch (error) {
    response.status(400).send(error);
  }
};

exports.loginUser = loginUser;

const getUserDetails = async (request, response) => {
  const { id } = request.user;

  try {
    const getUser = await usersData.findOne({ _id: id });

    response.status(200).send(getUser);
  } catch (error) {
    response.status(400).send(error);
  }
};

exports.getUserDetails = getUserDetails;

const generateEmail = async (request, response) => {
  try {
    const { email, name, username } = request.body;

    const getId = await usersData.findOne({ email });

    const transporter = nodemailer.createTransport({
      host: "SMTPConnection.gmail.com",
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASS,
      },
    });

    if (!getId) {
      response.status(404).send({ errMsg: "invalid" });
    } else {
      const { _id, name } = getId;

      await transporter.sendMail({
        from: process.env.MY_EMAIL,
        to: email,
        subject: "Verify email",
        text: `Hi ${name},\nWe just need to verify your email address before you can access MoneyMatters.\nVerify your email address https://money-matters-frontend.vercel.app/verify/mail/${_id}`,
      });
    }

    response.status(201).send({ msg: "email sent," });
  } catch (error) {
    response.status(500).send(error);
  }
};
exports.generateEmail = generateEmail;

const emailVerification = async (request, response) => {
  const { id } = request.params;

  try {
    const UserwithId = await usersData.findOne({ _id: id });

    if (!UserwithId) {
      response.status(404).send({ errMsg: "Invalid Url" });
    } else {
      const { isVerified } = UserwithId;

      if (isVerified) {
        response.status(400).send({ errMsg: "Email already verified" });
      } else {
        const verifyUser = await usersData.updateOne(
          { _id: id },
          { isVerified: true }
        );

        response.status(200).send(verifyUser);
      }
    }
  } catch (error) {
    response.status(400).send("failed");
  }
};

exports.emailVerification = emailVerification;

const resendMail = async (request, response) => {
  try {
    const { email } = request.params;

    const getId = await usersData.findOne({ email });

    const transporter = nodemailer.createTransport({
      host: "SMTPConnection.gmail.com",
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASS,
      },
    });

    if (!getId) {
      response.status(404).send({ errMsg: "invalid email" });
    } else {
      const { _id, isVerified, name } = getId;

      if (isVerified) {
        response.status(200).send({ msg: "this email was verified" });
      } else {
        await transporter.sendMail({
          from: process.env.MY_EMAIL,
          to: email,
          subject: "Verify email",
          text: `Hi ${name},\nWe just need to verify your email address before you can access MoneyMatters.\nVerify your email address https://money-matters-frontend.vercel.app/verify/mail/${_id}`,
        });
        response.status(200).send({ msg: "email sent," });
      }
    }
  } catch (error) {
    response.status(500).send(error);
  }
};

exports.resendMail = resendMail;

exports.allowChangePassword = async (req, res) => {
  try {
    const { email } = req.body;

    const isValidUser = await usersData.findOne({ email });
    const transporter = nodemailer.createTransport({
      host: "SMTPConnection.gmail.com",
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASS,
      },
    });

    if (isValidUser) {
      const getID = await usersData.updateOne(
        { email },
        { passChangeAllowed: true },
        { new: true }
      );

      const { _id, isVerified, name } = getID;

      await transporter.sendMail({
        from: process.env.MY_EMAIL,
        to: email,
        subject: "Change Password",
        text: `Hi ${name},\nWe just need to verify your email address before you can access MoneyMatters.\nVerify your email address https://money-matters-frontend.vercel.app/change-password/${_id}`,
      });
      res.status(200).send({ msg: "email sent," });
    } else {
      res.status(404).send({ errMsg: "No user found with this details" });
    }
  } catch (error) {
    res.status(500).send({ errMsg: "Internal Error", error: error.message });
  }
};

exports.checkpassword = async (req, res, next) => {
  const { newPassword } = req.body;

  if (newPassword) {
    const isPasswordGT16 = newPassword.length > 16;
    const isPasswordLT8 = newPassword.length < 8;

    if (isPasswordGT16 || isPasswordLT8) {
      res.status(400).send({ errMsg: "Password length should be 8-12 " });
    } else {
      next();
    }
  } else {
    res.status(400).send({ errMsg: "Invalid Input" });
  }
};

exports.forgotChangePassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const getUser = await usersData.findOne({ _id: id });

    const { passChangeAllowed } = getUser;

    if (passChangeAllowed) {
      const updatepassword = await usersData.findOneAndUpdate(
        { _id: id },
        { password: hashedPassword, passChangeAllowed: false }
      );

      res.status(200).send({ message: "Password changed" });
    } else {
      res.status(400).send({
        errMsg:
          "Password has been already updated or not allowed to change password",
      });
    }
  } catch (error) {
    res.status(500).send({ errMsg: "Internal Error." });
  }
};

exports.updateAdrress = async (req, res) => {};
