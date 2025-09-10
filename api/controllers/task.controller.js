const employeeModel = require("../models/employee.model");
const taskModel = require("../models/task.model");

// Helper function to calculate total hours for a day
const getTotalHoursForDate = async (employeeId, date) => {
  const tasks = await taskModel.find({ employeeId, date });
  return tasks.reduce((total, task) => total + task.duration, 0);
};

// Create Task
const createTask = async (req, res) => {
  try {
    const { employeeId, description, from, to } = req.body;

    // Check if employee exists
    const employee = await employeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const fromTime = new Date(from);
    const toTime = new Date(to);
    const date = fromTime.toISOString().split("T")[0];

    // Calculate task duration
    const duration = (toTime - fromTime) / (1000 * 60 * 60);

    // Check if task duration exceeds 8 hours
    if (duration > 8) {
      return res
        .status(400)
        .json({ error: "Task duration cannot exceed 8 hours" });
    }

    // Check if task duration is positive
    if (duration <= 0) {
      return res
        .status(400)
        .json({ error: "End time must be after start time" });
    }

    // Check total hours for the day
    const totalHoursForDay = await getTotalHoursForDate(employeeId, date);
    if (totalHoursForDay + duration > 8) {
      return res.status(400).json({
        error: "Total daily tasks cannot exceed 8 hours",
        currentHours: totalHoursForDay,
        remainingHours: 8 - totalHoursForDay,
      });
    }

    const task = new taskModel({ employeeId, description, from, to });
    const savedTask = await task.save();

    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: "Create Task Failed" });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, description, from, to } = req.body;

    const existingTask = await taskModel.findById(id);
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    const fromTime = new Date(from);
    const toTime = new Date(to);
    const date = fromTime.toISOString().split("T")[0];
    const duration = (toTime - fromTime) / (1000 * 60 * 60);

    // Check if task duration exceeds 8 hours
    if (duration > 8) {
      return res
        .status(400)
        .json({ error: "Task duration cannot exceed 8 hours" });
    }

    if (duration <= 0) {
      return res
        .status(400)
        .json({ error: "End time must be after start time" });
    }

    // Check total hours for the day (excluding current task)
    const totalHoursForDay = await getTotalHoursForDate(employeeId, date);
    const totalHoursWithoutCurrentTask =
      totalHoursForDay - existingTask.duration;

    if (totalHoursWithoutCurrentTask + duration > 8) {
      return res.status(400).json({
        error: "Total daily tasks cannot exceed 8 hours",
        currentHours: totalHoursWithoutCurrentTask,
        remainingHours: 8 - totalHoursWithoutCurrentTask,
      });
    }

    const task = await taskModel.findByIdAndUpdate(
      id,
      { employeeId, description, from, to },
      { new: true }
    );

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: "Update Task Failed" });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await taskModel.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete Task Failed" });
  }
};

// Get Single Task
const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await taskModel
      .findById(id)
      .populate("employeeId", "name email");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: "Get Single Task Failed" });
  }
};

// Get All Tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskModel
      .find()
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Get All Tasks Failed" });
  }
};

// Get Tasks For Employee
const getTasksByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const tasks = await taskModel
      .find({ employeeId })
      .populate("employeeId", "name email")
      .sort({ date: -1, from: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Get All Tasks For Employee Failed" });
  }
};

// Get Daily Tasks
const getDailySummary = async (req, res) => {
  try {
    const { employeeId, date } = req.params;

    // Check if employee exists
    const employee = await employeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const tasks = await taskModel.find({ employeeId, date });
    const totalHours = tasks.reduce((total, task) => total + task.duration, 0);
    const remainingHours = Math.max(0, 8 - totalHours);

    res.status(200).json({
      date,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
      },
      totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      remainingHours: Math.round(remainingHours * 100) / 100,
      tasks: tasks.map((task) => ({
        id: task._id,
        description: task.description,
        from: task.from,
        to: task.to,
        duration: Math.round(task.duration * 100) / 100,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Get Daily Tasks Failed" });
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getTask,
  getAllTasks,
  getTasksByEmployee,
  getDailySummary,
};
