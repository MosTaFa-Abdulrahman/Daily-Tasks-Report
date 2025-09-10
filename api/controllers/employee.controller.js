const employeeModel = require("../models/employee.model");

// Create
const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, position } = req.body;

    const existingEmployee = await employeeModel.findOne({ email });
    if (existingEmployee) {
      return res
        .status(400)
        .json({ error: "Employee with this email already exists" });
    }

    const employee = new employeeModel({ name, email, phone, position });
    await employee.save();

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ error: "Create Employee Failed" });
  }
};

// Update
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, position } = req.body;

    const employee = await employeeModel.findByIdAndUpdate(
      id,
      { name, phone, position },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: "Update Employee Failed" });
  }
};

// Delete
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await employeeModel.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete Employee Failed" });
  }
};

// Get Single
const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await employeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: "Get Single Employee Failed" });
  }
};

// Get All
const getAllEmployees = async (req, res) => {
  try {
    const employees = await employeeModel.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: "Get All Employees Failed" });
  }
};

module.exports = {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
  getAllEmployees,
};
