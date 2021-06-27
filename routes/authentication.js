const authenticationController = require("../controllers/authenticationController");
const express = require("express");
const router = express.Router();


router.get("/confirm", async (req, res) => {
    await authenticationController.confirmAccount(req, res);
});

module.exports = router;
