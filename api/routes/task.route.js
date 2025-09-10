const router = require("express").Router();
const { validate, schemas } = require("../middlewares/validation");
const {
  createTask,
  updateTask,
  deleteTask,
  getTask,
  getAllTasks,
  getTasksByEmployee,
  getDailySummary,
} = require("../controllers/task.controller");

// CRUD
router.post("/", validate(schemas.task), createTask);
router.put("/:id", validate(schemas.task), updateTask);
router.delete("/:id", deleteTask);
router.get("/:id", getTask);
router.get("/", getAllTasks);

// Employee Tasks
router.get("/employee/:employeeId", getTasksByEmployee);

// Daily
router.get("/summary/:employeeId/:date", getDailySummary);

module.exports = router;
