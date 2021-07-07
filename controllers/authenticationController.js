const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Authentication = require("../models/Authentication");
const { mail } = require("../helpers/mail");
const {resetPasswordTemplate, confirmationEmailTemplate} = require('../helpers/emailTemplates')

const createAndSendConfirmationTokenMail = async (email, type) => {
    const token = jwt.sign({ email }, process.env.SECRET_KEY);
    await Authentication.create({
        email,
        token,
        type,
    });

    await mail({
        from: `IFIX < Team >`,
        to: email,
        html:
            type === "register-confirmation"
                ? confirmationEmailTemplate(email, token)
                : resetPasswordTemplate(email, token),
        subject:
            type === "register-confirmation"
                ? "IFix account confirmation"
                : "IFix password reset",
    });
};

const confirmAccount = async (req, res) => {
    const { email, token } = req.query;
    const account = await Authentication.findOne({
        email,
        token,
        type: "register-confirmation",
    }).sort({ createdAt: -1 });

    if (account) {
        // check if is more than 1 hour
        const created_at_time = new Date(account.createdAt).getTime();

        const now_time = new Date().getTime();
        console.log((now_time - created_at_time) / (1000 * 60 * 60));
        if ((now_time - created_at_time) / (1000 * 60 * 60) > 1) {
            return res.status(400).json({ msg: "token expired" });
        }

        // activate user account
        const user = await User.findOne({ email });
        user.status = "active";
        user.save();

        // delete token after activation
        await Authentication.deleteMany({email});

        return res.status(200).json({ msg: "account activated successfully" });
    }

    return res.status(404).json({ msg: "not found" });
};

const forgotPassword = async (email, type) => {
    if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
        await createAndSendConfirmationTokenMail(email, "password-reset");
    }
};

const checkResetToken = async (req, res) => {
    const { email, token } = req.query;
    const account = await Authentication.findOne({
        email,
        token,
        type: "password-reset",
    }).sort({ createdAt: -1 });

    if (account) {
        // check if is more than 1 hour
        const created_at_time = new Date(account.createdAt).getTime();

        const now_time = new Date().getTime();
        if ((now_time - created_at_time) / (1000 * 60 * 60) > 1) {
            return res.status(400).json({ msg: "token expired" });
        }

        return res.status(200).json({ msg: "valid-token" });
    }

    return res.status(404).json({ msg: "not found" });
};

const resetPassword = async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        user.passwordHash = passwordHash;

        user.save();

        // remove tokens 
        await Authentication.deleteMany({email});

        return res.status(200).json({ msg: "password reset" });
    }

    return res.status(400).send("error");
};


module.exports = {
    createAndSendConfirmationTokenMail,
    confirmAccount,
    forgotPassword,
    checkResetToken,
    resetPassword,
};
