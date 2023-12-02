const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

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
  bcrypt.hash(request.body.password, 10)
  .then((hashedPassword) => {
    const user = new User({
      email: request.body.email,
      password: hashedPassword,
      location: request.body.location,
      fullName: request.body.fullName,
      department: request.body.department, // Include department in the user object
    });

      user.save()
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
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
  response.status(200).json({ message: "Authenticated endpoint", user: request.user, isAdmin: request.isAdmin });
});

// Authenticated endpoint to get user (Read)
app.get("/user", auth, (request, response) => {
  const userId = request.user.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return response.status(404).json({ message: "User not found" });
      }
      response.status(200).json(user);
    })
    .catch((error) => {
      response.status(500).json({ message: "Error fetching user", error });
    });
});

// Get all users
app.get("/users", auth, (request, response) => {
  if (!request.user.isAdmin) {
    return response.status(403).json({ message: "Forbidden: Only admins can access this endpoint." });
  }

  User.find()
    .then((users) => {
      response.status(200).json(users);
    })
    .catch((error) => {
      response.status(500).json({ message: "Error fetching users", error });
    });
});

// Update a user (Edit)
app.put("/users/:userId", auth, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Only admins can update users." });
    }

    const userId = req.params.userId;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});


// Delete a user
app.delete("/users/:userId", auth, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Only admins can delete users." });
    }

    const userId = req.params.userId;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
});

// ... (other routes)

module.exports = app;
