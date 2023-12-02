// departmentModel.js
const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a department name!"],
    unique: [true, "Department name exists"],
  },
  // Add more fields as needed for your department entity
});

module.exports = mongoose.model("Department", DepartmentSchema);
