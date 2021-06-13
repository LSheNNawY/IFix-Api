const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const userValidation = require("../helpers/userValidation");
/**
 * get all users function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const getAll = async (req, res, next) => {
    try {
        const users = await User.find({});
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
        profession,
    } = req.body;
    let picture;
    if (req.file) picture = req.file.originalname;

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
        profession,
        picture,
    });
    try {
        await newUser.save();
        return res.status(200).send(newUser);
    } catch (error) {
        console.error(error);
    }
};

const getUserById = async (req, res, next) => {
    const id = req.params.id.toString();
    try {
        const user = await User.findById(id);
        return res.status(200).send(user);
    } catch (error) {
        console.error(error);
        return res.status(400).send("User not found");
    }
};

const updateUser = async (req, res, next) => {
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

const deleteUser = async (req, res, next) => {
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

const login = async (req, res, next) => {
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
    deleteUser,
    login,
};
