const employeeController = require("../controllers/employeeController");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../helpers/auth");

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "./public/uploads/users/");
  },
  filename: (req, file, callBack) => {
    callBack(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/employees", async (req, res, next) => {
  await employeeController.getAllEmployees(req, res);
});

router.post("/employees", upload.single("picture"), async (req, res, next) => {
  await employeeController.createEmployee(req, res);
});

router.get("/employees/:id", async (req, res, next) => {
  await employeeController.getEmployeeById(req, res);
});

router.put(
  "/employees/:id",
  upload.single("picture"),
  async (req, res, next) => {
    await employeeController.updateEmployee(req, res);
  }
);

router.put(
  "/employees/:id/block",
  // upload.single("picture"),
  async (req, res, next) => {
    await employeeController.blockEmployee(req, res);
  }
);

router.put("/employees/:id/unblock", async (req, res, next) => {
  await employeeController.unblockEmployee(req, res);
});

router.delete("/employees/:id", async (req, res, next) => {
  await employeeController.deleteEmployee(req, res);
});

module.exports = router;
