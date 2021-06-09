const userController = require("../controllers/userController");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../helpers/auth");

// SetUp multer

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/users", async (req, res, next) => {
  await userController.getAll(req, res);
});

router.post("/users", upload.single("file"), async (req, res, next) => {
  await userController.createUser(req, res);
});

router.post("/users/login", async (req, res, next) => {
  await userController.login(req, res);
});

router.post("/users/logout", auth, async (req, res, next) => {
  res.clearCookie("token");
  res.clearCookie("user_id");
  res.clearCookie("username");
});

router.get("/users/:id", async (req, res, next) => {
  await userController.getUserById(req, res);
});

router.put("/users/:id", auth, async (req, res, next) => {
  await userController.updateUser(req, res);
});

router.delete("/users/:id", auth, async (req, res, next) => {
  await userController.deleteUser(req, res);
});

module.exports = router;
