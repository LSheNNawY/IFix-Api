const adminsController = require("../controllers/adminsController");
const express = require("express");
const verify = require("../helpers/verify");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "./public/uploads/users/");
  },
  filename: (req, file, callBack) => {
    callBack(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/admins", verify.isSuperAdmin, async (req, res, next) => {
  await adminsController.getAllAdmins(req, res);
});

router.post("/admins", verify.isSuperAdmin, async (req, res, next) => {
  await adminsController.createAdmin(req, res);
});

router.get("/admins/:id", verify.isSuperAdmin, async (req, res, next) => {
  await adminsController.getAdminById(req, res);
});

router.put(
  "/admins/:id",
  verify.isSuperAdmin,
  upload.single("picture"),
  async (req, res) => {
    await adminsController.updateAdmin(req, res);
  }
);

router.put("/admins/:id/block", verify.isSuperAdmin, async (req, res, next) => {
  await adminsController.blockAdmin(req, res);
});

router.put(
  "/admins/:id/unblock",
  verify.isSuperAdmin,
  async (req, res, next) => {
    await adminsController.unblockAdmin(req, res);
  }
);

router.delete("/admins/:id", verify.isSuperAdmin, async (req, res, next) => {
  await adminsController.deleteAdmin(req, res);
});

module.exports = router;
