const usersData = require("./Models/usersSchema");

const bcrypt = require("bcrypt");

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

const registeringUser = async (request, response) => {
  const { name, username, password, email } = request.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const checkUsername = await usersData.findOne({ username });

  if (!checkUsername) {
    const newUser = await usersData.create({
      name,
      username,
      password: hashedPassword,
      email,
    });

    response.status(201).send(newUser);
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
      const { id, name, email } = dbUser;
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      if (isPasswordMatched) {
        const payload = {
          username,
          id,
          name,
          email,
        };
        const jwtToken = jwt.sign(payload, process.env.MY_SECRET_TOKEN);

        response.send({ jwtToken });
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
  // console.log(request.user);
  // response.status(200).send(request.user);

  const { id } = request.user;

  try {
    const getUser = await usersData.findOne({ _id: id });

    response.status(200).send(getUser);
  } catch (error) {
    response.status(400).send(error);
  }
};

exports.getUserDetails = getUserDetails;
