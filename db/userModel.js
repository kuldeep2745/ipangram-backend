const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an Email!"],
    unique: [true, "Email exists"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
  },
  location: {
    type: String,
    required: [true, "Please provide a location!"],
  },
  fullName: {
    type: String,
    required: [true, "Please provide a full name!"],
  },
  department: {
    type: String, // Add the department field
    required: [true, "Please provide a department!"],
  },
});

module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);
