const authenticationController = require("../controllers/authenticationController");
const express = require("express");
const { route } = require("./users");
const router = express.Router();

router.get("/account-activation", async (req, res) => {
    await authenticationController.confirmAccount(req, res);
});

router.post("/resend-token", async (req, res) => {
    const { email } = req.query;
    if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
        await authenticationController.createAndSendConfirmationTokenMail(
            email,
            "register-confirmation"
        );
        return res.status(200).json({ msg: "token sent" });
    }

    return res.status(500).send("error");
});

router.post("/forgot-password", async (req, res) => {
    res.status(200).send("request recieved");

    const { email } = req.body;
    await authenticationController.forgotPassword(email, "password-reset");
});

router.get("/check-reset-token", async (req, res) => {
    await authenticationController.checkResetToken(req, res);
})

router.post("/password-reset", async (req, res) => {
    await authenticationController.resetPassword(req, res);
})

module.exports = router;
