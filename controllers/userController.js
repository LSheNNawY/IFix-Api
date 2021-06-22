const User = require("../models/User");
const bcrypt = require("bcrypt");
const { mail } = require("../helpers/mail");
const jwt = require("jsonwebtoken");
const userValidation = require("../helpers/userValidation");
/**
 * get all users function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const getAll = async (req, res) => {
    try {
        const users = await User.find({ role: "user" });
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(400).send("error in get users");
    }
};

/**
 * register or create user function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const createUser = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phone,
        address,
        dateOfBirth,
    } = req.body;
    let picture;
    if (req.file) picture = req.file.filename;

    const { error } = userValidation.validate(req.body);
    if (error) {
        console.log(error);
        return res.status(400).send(error.details[0].message);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).send("email is already registered");
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
        firstName,
        lastName,
        email,
        passwordHash,
        phone,
        address,
        dateOfBirth,
        picture,
    });
    try {
        const saved = await newUser.save();
        if (saved) {
            await mail({
                to: email,
                html: `<h2>You have registered</h2>`,
                subject: 'IFix registeratin'
            });
            return res.status(200).send(newUser);
        }
    } catch (error) {
        console.error(error);
    }
};

const getUserById = async (req, res) => {
    const id = req.params.id.toString();
    try {
        const user = await User.findById(id);
        return res.status(200).send(user);
    } catch (error) {
        console.error(error);
        return res.status(400).send("User not found");
    }
};

const updateUser = async (req, res) => {
    const id = req.params.id.toString();
    const { error } = userValidation.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    try {
        await User.findOneAndUpdate({ _id: id }, req.body);
        return res.status(200).send("Updated Successfully");
    } catch (error) {
        console.error(error);
        return res.status(400).send("Error encountred");
    }
};

const blockUser = async (req, res) => {
    const id = req.params.id.toString();
    try {
        await User.findOneAndUpdate({ _id: id }, { status: "blocked" });
        return res
            .status(200)
            .json({ message: "User blocked", status: "blocked" });
    } catch (error) {
        console.error(error);
        return res.status(402).send("Error blocking user");
    }
};

const unblockUser = async (req, res) => {
    const id = req.params.id.toString();
    try {
        await User.findOneAndUpdate({ _id: id }, { status: "active" });
        return res
            .status(200)
            .json({ message: "User unblocked", status: "active" });
    } catch (error) {
        console.error(error);
        return res.status(402).send("Error blocking user");
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.remove();
            return res.status(200).json({ message: "Delete user done" });
        }
        return res.status(400).json({ message: "Error deleting user" });
    } catch (error) {
        console.log(error);
        return res.status(400).send("error in delete user");
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const data = {};
    console.log(req.body);

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ error: "invalid credentials" });
        }
        bcrypt.compare(password, user.passwordHash, (err, matched) => {
            if (matched) {
                data.userId = user.id;
                data.username = user.firstname + " " + user.lastname;
                data.email = user.email;
                data.role = user.role;
                data.created_at = user.created_at;

                const token = jwt.sign(
                    { email: user.email },
                    process.env.SECRET_KEY
                );
                const expirationTime = new Date(
                    Date.now() + parseInt(process.env.JWT_EXPIRATION)
                );

                res.cookie("token", token, {
                    httpOnly: true,
                    expires: expirationTime,
                });

                res.cookie("email", data.email, {
                    httpOnly: true,
                    expires: expirationTime,
                });

                res.cookie("userId", data.userId, {
                    httpOnly: true,
                    expires: expirationTime,
                });

                return res.status(200).json({ ...data });
            }
            return res.status(401).json({ error: "Invalid credentials" });
        });
    } catch (err) {
        res.status(401).json({
            error: "Error logging you in, please try again later",
        });
    }
};

module.exports = {
    createUser,
    getAll,
    getUserById,
    updateUser,
    blockUser,
    unblockUser,
    deleteUser,
    login,
};
