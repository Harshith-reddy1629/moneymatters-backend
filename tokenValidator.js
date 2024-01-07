const jwt = require("jsonwebtoken");

const tokenValidator = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(
      jwtToken,
      process.env.MY_SECRET_TOKEN,
      async (error, payload) => {
        if (error) {
          response.status(401);
          response.send({ errMsg: "Invalid JWT Token" });
        } else {
          // console.log(payload);
          request.user = payload;
          next();
        }
      }
    );
  }
};

module.exports = tokenValidator;
