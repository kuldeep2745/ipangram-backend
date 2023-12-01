const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
  try {
    // get the token from the authorization header
    const token = request.headers.authorization;

    // check if the token is present
    if (!token) {
      return response.status(401).json({
        error: new Error("Authorization token missing"),
      });
    }

    // extract the token value
    const tokenValue = token.split(" ")[1];

    // check if the token matches the supposed origin
    const decodedToken = jwt.verify(tokenValue, "RANDOM-TOKEN");

    // retrieve the user details of the logged-in user
    const user = decodedToken;

    // pass the user down to the endpoints here
    request.user = user;

    // check if the user is an admin and pass the information down to the endpoints
    request.isAdmin = user.isAdmin || false;

    // pass down functionality to the endpoint
    next();
  } catch (error) {
    response.status(401).json({
      error: new Error("Invalid token"),
    });
  }
};
