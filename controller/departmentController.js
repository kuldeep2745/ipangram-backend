// departmentController.js
const Department = require("../model/departmentModel");

// Create a new department
const createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res
      .status(201)
      .json({ message: "Department created successfully", department });
  } catch (error) {
    res.status(500).json({ message: "Error creating department", error });
  }
};

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments", error });
  }
};

// Get a specific department by ID
const getDepartmentById = async (req, res) => {
  const departmentId = req.params.departmentId;
  try {
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: "Error fetching department", error });
  }
};

// Update a department by ID
const updateDepartmentById = async (req, res) => {
  const departmentId = req.params.departmentId;
  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      departmentId,
      req.body,
      { new: true }
    );
    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(updatedDepartment);
  } catch (error) {
    res.status(500).json({ message: "Error updating department", error });
  }
};

// Delete a department by ID
const deleteDepartmentById = async (req, res) => {
  const departmentId = req.params.departmentId;
  try {
    const deletedDepartment = await Department.findByIdAndDelete(departmentId);
    if (!deletedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(deletedDepartment);
  } catch (error) {
    res.status(500).json({ message: "Error deleting department", error });
  }
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartmentById,
  deleteDepartmentById,
};
