const User = require("../models/User");
const bcrypt = require("bcrypt");
const { mail } = require("../helpers/mail");
const jwt = require("jsonwebtoken");
const userValidation = require("../helpers/userValidation");
const stripScretKey = process.env.STRIPE_SECRET_KEY;

const stripe = require('stripe')(stripScretKey)

/**
 * get all users function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const getAll = async(req, res) => {
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

const createUser = async(req, res) => {
    const { firstName, lastName, email, password, phone, address, dateOfBirth } =
    req.body;
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
                subject: "IFix registeratin",
            });
            return res.status(200).send(newUser);
        }
    } catch (error) {
        console.error(error);
    }
};

const getUserById = async(req, res) => {
    const id = req.params.id.toString();
    try {
        const user = await User.findById(id);
        return res.status(200).send(user);
    } catch (error) {
        console.error(error);
        return res.status(400).send("User not found");
    }
};

const updateUser = async(req, res) => {
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

const blockUser = async(req, res) => {
    const id = req.params.id.toString();
    try {
        await User.findOneAndUpdate({ _id: id }, { status: "blocked" });
        return res.status(200).json({ message: "User blocked", status: "blocked" });
    } catch (error) {
        console.error(error);
        return res.status(402).send("Error blocking user");
    }
};

const unblockUser = async(req, res) => {
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

const deleteUser = async(req, res) => {
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

const login = async(req, res) => {
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
                data.username = user.firstName + " " + user.lastName;
                data.email = user.email;
                data.role = user.role;
                data.picture = user.picture;
                data.created_at = user.created_at;

                const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY);
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

                return res.status(200).json({...data });
            }
            return res.status(401).json({ error: "Invalid credentials" });
        });
    } catch (err) {
        res.status(401).json({
            error: "Error logging you in, please try again later",
        });
    }
};

const verifyPassword = async(req, res) => {
    const { userId, password } = req.body;
    console.log(req.body);
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found " });
        }
        bcrypt.compare(password, user.passwordHash, (err, matched) => {
            if (matched) {
                return res.json(true);
            } else {
                return res.json(false);
            }
        });
    } catch (err) {
        console.error(err);
    }
};

const isLoggedIn = (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.json(false);
        }

        const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
        res.send(true);
    } catch (err) {
        res.send(false);
    }
};

const logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.cookie("username", "", {
        expires: new Date(0),
    });
    res.cookie("userId", "", {
        expires: new Date(0),
    });
    res.send();
};

const getCurrentUser = async(req, res) => {
    let user = {};
    try {
        const userData = await User.findById(req.cookies.userId);
        console.log(userData)
        if (userData) {
            user = {
                id: userData._id,
                username: userData.firstName + " " + userData.lastName,
                email: userData.email,
                role: userData.role,
                picture: userData.picture,
            };

            res.status(200).json(user);
        }

        res.send(undefined)

    } catch (err) {
        res.send(err);
    }
};



const payment = async(req, res) => {

    // var param = {};
    // param.card = {
    //     number: req.body.number,
    //     exp_month: 2,
    //     exp_year: 2024,
    //     cvc: '212'
    // }

    // stripe.tokens.create(param, function(err, token) {
    //     if (err) {
    //         console.log("err: " + err);
    //     }
    //     if (token) {
    //         console.log("success: " + JSON.stringify(token, null, 2));
    //     } else {
    //         console.log("Something wrong")
    //     }
    // })




    const amount = 2500;

    try {
        const charge = await stripe.charges.create({
            amount: req.body.amount,
            currency: 'usd',
            source: req.body.source,
            description: 'My First Test Charge (created for API docs)',
        });
        res.status(200).json(charge);

    } catch (err) {
        console.log(err)
    }





    // let { price, id } = req.body;
    // console.log(req.body.source.number)
    // try {
    //     stripe.customers.create({
    //             name: req.body.name,
    //             email: req.body.email,
    //             source: req.body.stripeToken
    //         }).then(customer => stripe.charges.create({
    //             amount: req.body.amount,
    //             currency: 'usd',
    //         })).then(() => {
    //             console.log("customer")
    //         })
    //         .catch(err => console.log(err))
    // } catch (err) { res.send(err) }




    //   stripe.customers.create({
    //     email: req.body.email,
    //     source: {
    //         object: 'card',
    //         exp_month: req.body.exp_month,
    //         exp_year: req.body.exp_month,
    //         number: req.body.number,
    //         cvc: req.body.cvc
    //     }
    // }).then(function(customer) {
    //     return stripe.charges.create({
    //         amount: req.body.amount,
    //         currency: 'usd',
    //         customer: customer.id
    //     });
    // }).then(() => {
    //     console.log("done")
    // })



}


module.exports = {
    createUser,
    getAll,
    getUserById,
    updateUser,
    blockUser,
    unblockUser,
    deleteUser,
    login,
    verifyPassword,
    isLoggedIn,
    logout,
    getCurrentUser,
    payment
};