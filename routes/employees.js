const employeeController = require("../controllers/employeeController");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../helpers/auth");

router.get("/employees", async (req, res, next) => {
  await employeeController.getAllEmployees(req, res);
});

router.post("/employees", async (req, res, next) => {
  await employeeController.createEmployee(req, res);
});

router.get("/employees/:id", async (req, res, next) => {
  await employeeController.getEmployeeById(req, res);
});

router.put("/employees/:id", async (req, res, next) => {
  await employeeController.updateEmployee(req, res);
});

router.put("/employees/:id/block", async (req, res, next) => {
  await employeeController.blockEmployee(req, res);
});

router.put("/employees/:id/unblock", async (req, res, next) => {
  await employeeController.unblockEmployee(req, res);
});

router.delete("/employees/:id", async (req, res, next) => {
  await employeeController.deleteEmployee(req, res);
});

module.exports = router;
