const router = require("express").Router();
const { validate, schemas } = require("../middlewares/validation");
const {
  createEmployee,
  updateEmployee,
  getEmployee,
  deleteEmployee,
  getAllEmployees,
} = require("../controllers/employee.controller");

router.post("/", validate(schemas.employee), createEmployee);
router.put("/:id", validate(schemas.employeeUpdate), updateEmployee);
router.delete("/:id", deleteEmployee);
router.get("/:id", getEmployee);
router.get("/", getAllEmployees);

module.exports = router;
