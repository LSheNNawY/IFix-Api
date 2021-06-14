const adminsController = require("../controllers/adminsController");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../helpers/auth");

router.get("/admins", async (req, res, next) => {
    await adminsController.getAllAdmins(req, res);
});

router.post("/admins", async (req, res, next) => {
    await adminsController.createAdmin(req, res);
});

router.get("/admins/:id", async (req, res, next) => {
    await adminsController.getAdminById(req, res);
});

router.put("/admins/:id", async (req, res, next) => {
    await adminsController.updateAdmin(req, res);
});

router.put("/admins/:id/block", async (req, res, next) => {
    await adminsController.blockAdmin(req, res);
});

router.put("/admins/:id/unblock", async (req, res, next) => {
    await adminsController.unblockAdmin(req, res);
});

router.delete("/admins/:id", async (req, res, next) => {
    await adminsController.deleteAdmin(req, res);
});

module.exports = router;
