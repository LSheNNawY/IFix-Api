const userController = require("../controllers/userController");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../helpers/auth");

// SetUp multer

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "./public/uploads/users/");
  },
  filename: (req, file, callBack) => {
    callBack(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/users/verify-password", async (req, res) => {
  await userController.verifyPassword(req, res);
});

router.get("/users/logged-in", async (req, res) => {
  await userController.isLoggedIn(req, res);
});

router.post("/users", upload.single("picture"), async (req, res) => {
  await userController.createUser(req, res);
});
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/users", async (req, res, next) => {
  await userController.getAll(req, res);
});

router.post("/users/login", async (req, res) => {
  await userController.login(req, res);
});

router.post("/admin/login", async (req, res) => {
  await userController.adminLogin(req, res);
});

router.post("/users/logout", auth, async (req, res) => {
  res.clearCookie("token");
  res.clearCookie("userId");
  res.clearCookie("email");
  res.clearCookie("role");
  res.status(200).json({ ok: true });
});

router.get("/users/current-user", async (req, res) => {
  await userController.getCurrentUser(req, res);
});

router.get("/users/:id", async (req, res) => {
  await userController.getUserById(req, res);
});

router.put("/users/:id", async (req, res) => {
  await userController.updateUser(req, res);
});

router.put("/users/:id/block", async (req, res) => {
  await userController.blockUser(req, res);
});

router.put("/users/:id/unblock", async (req, res) => {
  await userController.unblockUser(req, res);
});

router.delete("/users/:id", async (req, res) => {
  await userController.deleteUser(req, res);
});

router.post("/payment", async (req, res) => {
  await userController.payment(req, res);
});

router.post("/mail", async (req, res) => {
  await userController.sendMailer(req, res);
});

module.exports = router;
