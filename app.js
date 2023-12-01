const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors"); // Import the cors middleware

// require database connection
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const auth = require("./auth");

// execute database connection
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// use cors middleware
app.use(cors());

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// register endpoint
app.post("/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// login endpoint
app.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {
          // check if password matches
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords do not match",
              error,
            });
          }

          // create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
              isAdmin: user.isAdmin, // Assuming you have an 'isAdmin' field in your user model
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          // return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords do not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// Admin-only endpoint example
app.post("/admin-action", auth, (request, response) => {
  if (request.user.isAdmin) {
    // Admin-only logic here
    response.status(200).send({
      message: "Admin action successful",
    });
  } else {
    response.status(403).send({
      message: "Forbidden: Only admins can perform this operation",
    });
  }
});

// Dummy admin login endpoint
app.post("/admin-login-dummy", (request, response) => {
  const { email, password } = request.body;

  // Check if the provided credentials match the dummy admin credentials
  if (email === "admin@example.com" && password === "adminpassword") {
    // Generate a dummy admin token
    const token = jwt.sign(
      { userId: "dummyAdminId", userEmail: "admin@example.com", isAdmin: true },
      "RANDOM-TOKEN",
      { expiresIn: "24h" }
    );

    response.status(200).json({ message: "Dummy Admin login successful", token });
  } else {
    response.status(401).json({ message: "Invalid dummy admin credentials" });
  }
});
app.get("/auth-endpoint", auth, (request, response) => {
  response.status(200).json({ message: "Authenticated endpoint", user: request.user, isAdmin: "true" });
});

// ... (other routes)

module.exports = app;
