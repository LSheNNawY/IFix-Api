const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userValidation = require("../helpers/userValidation");
const Job = require("../models/Job");
const { mail } = require("../helpers/mail");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  createAndSendConfirmationTokenMail,
} = require("../controllers/authenticationController");

/**
 * get all users function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const getAll = async (req, res) => {
  const { search } = req.query;
  try {
    const usersPerPage = 10;
    const page = parseInt(req.query.page || "0");
    const totalusers = await User.countDocuments({ role: "user" });

    if (search) {
      const regex = new RegExp(search, "i");
      const users = await User.find({
        role: "user",
        $and: [
          {
            $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
          },
        ],
      })
        .limit(usersPerPage)
        .skip(usersPerPage * page);

      return res.status(200).json({
        totalPages: Math.ceil(users.length / usersPerPage),
        users,
      });
    }

    const users = await User.find({ role: "user" })
      .limit(usersPerPage)
      .skip(usersPerPage * page);

    return res.status(200).json({
      totalPages: Math.ceil(totalusers / usersPerPage),
      users,
    });
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
  const { firstName, lastName, email, password, phone, address, dateOfBirth } =
    req.body;
  let picture;
  if (req.file) picture = req.file.filename;

  const { error } = userValidation.validate(req.body);
  if (error) {
    console.log(error);
    return res.status(400).json({ error: error.details[0].message });
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ error: "email" });
  }

  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    return res.status(400).json({ error: "phone" });
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
      await createAndSendConfirmationTokenMail(email, "register-confirmation");
      return res.status(200).send(newUser);
    }
  } catch (error) {
    console.error(error);
  }
};

const getUserById = async (req, res) => {
  const id = req.params.id.toString();
  try {
    const user = await User.findById(id).populate("jobs");
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
    return res.status(402).send(error.details[0].message);
  }

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists && emailExists._id.toString() !== id) {
    return res.status(400).json({ error: "email" });
  }

  const phoneExists = await User.findOne({ phone: req.body.phone });
  if (phoneExists && phoneExists._id.toString() !== id) {
    return res.status(400).json({ error: "phone" });
  }
  try {
    let userData = req.body;
    let picture;
    if (req.file) {
      picture = req.file.filename;
      userData.picture = picture;
    }
    const user = await User.findOneAndUpdate({ _id: id }, userData, {
      new: true,
    });
    return res.status(200).send(user);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.details[0].message);
  }
};

const blockUser = async (req, res) => {
  const id = req.params.id.toString();

  try {
    await User.findOneAndUpdate({ _id: id }, { status: "blocked" });
    return res.status(200).json({ message: "User blocked", status: "blocked" });
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

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: "wrong" });
    }

    if (user.status === "pending activation") {
      return res.status(401).json({ error: "inactive" });
    }

    if (user.status === "pending interview") {
      return res.status(401).json({ error: "pending" });
    }

    if (user.status === "blocked") {
      return res.status(401).json({ error: "blocked" });
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

        res.setHeader("set-cookie", [
          `token=${token}; httpOnly=true; expires: ${expirationTime}; SameSite=None; Secure`,
          `email=${data.email}; httpOnly=true; expires: ${expirationTime}; SameSite=None; Secure`,
          `userId=${data.userId}; httpOnly=true; expires: ${expirationTime}; SameSite=None; Secure`,
          `role=${data.role}; httpOnly=true; expires: ${expirationTime}; SameSite=None; Secure`,
        ]);

        // res.cookie("token", token, {
        //   httpOnly: true,
        //   expires: expirationTime,
        // });

        // res.cookie("email", data.email, {
        //   httpOnly: true,
        //   expires: expirationTime,
        // });

        // res.cookie("userId", data.userId, {
        //   httpOnly: true,
        //   expires: expirationTime,
        // });

        // res.cookie("role", data.role, {
        //   httpOnly: true,
        //   expires: expirationTime,
        // });

        return res.status(200).json({ ...data });
      }
      return res.status(401).json({ error: "wrong" });
    });
  } catch (err) {
    res.status(401).json({
      error: "Error logging you in, please try again later",
    });
  }
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const data = {};

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ error: "wrong" });
    }

    if (user.role === "user") {
      return res.status(401).json({ error: "invalid credentials" });
    }

    if (user.status === "blocked") {
      return res.status(401).json({ error: "blocked" });
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

        res.setHeader("set-cookie", [
          `token=${token}; httpOnly=true; expires: ${expirationTime}; SameSite=None; Secure`,
          `email=${data.email}; httpOnly=true; expires: ${expirationTime}; SameSite=None; Secure`,
          `userId=${data.userId}; httpOnly=true; expires: ${expirationTime}; SameSite=None; Secure`,
          `role=${data.role}; httpOnly=true; expires: ${expirationTime}; SameSite=None; Secure`,
        ]);

        // res.cookie("token", token, {
        //   httpOnly: true,
        //   expires: expirationTime,
        // });

        // res.cookie("email", data.email, {
        //   httpOnly: true,
        //   expires: expirationTime,
        // });

        // res.cookie("userId", data.userId, {
        //   httpOnly: true,
        //   expires: expirationTime,
        // });

        // res.cookie("role", data.role, {
        //   httpOnly: true,
        //   expires: expirationTime,
        // });

        return res.status(200).json({ ...data });
      }
      return res.status(401).json({ error: "wrong" });
    });
  } catch (err) {
    res.status(401).json({
      error: "Error logging you in, please try again later",
    });
  }
};

const verifyPassword = async (req, res) => {
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
  res.setHeader("set-cookie", [
    `token=""; httpOnly=true; expires: ${new Date(0)}; SameSite=None; Secure`,
    `email=""; httpOnly=true; expires: ${new Date(0)}; SameSite=None; Secure`,
    `userId=""; httpOnly=true; expires: ${new Date(0)}; SameSite=None; Secure`,
    `role=""; httpOnly=true; expires: ${new Date(0)}; SameSite=None; Secure`,
  ]);

  // res.cookie("token", "", {
  //   httpOnly: true,
  //   expires: new Date(0),
  // });
  // res.cookie("username", "", {
  //   expires: new Date(0),
  // });
  // res.cookie("userId", "", {
  //   expires: new Date(0),
  // });
  // res.cookie("role", "", {
  //   expires: new Date(0),
  // });
  res.send();
};

const getCurrentUser = async (req, res) => {
  let user = {};
  try {
    const userData = await User.findById(req.cookies.userId);
    if (userData) {
      user = {
        id: userData._id,
        username: userData.firstName + " " + userData.lastName,
        email: userData.email,
        address: userData.address,
        role: userData.role,
        picture: userData.picture,
      };

      return res.status(200).json(user);
    }

    return res.send(undefined);
  } catch (err) {
    res.send(err);
  }
};

const payment = async (req, res) => {
  const { amount, job_id, id } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "USD",
      description: "Your Company Description",
      payment_method: id,
      confirm: true,
    });

    console.log("stripe-routes.js 19 | payment", paymentIntent);
    const job = await Job.findById(job_id);
    job.price = amount;
    job.payment_method = "Credit Card";
    job.ended_at = new Date();
    job.save();
    return res.status(200).json({ paymentIntent, job });
  } catch (err) {
    res.send(err);
  }
};

const sendMailer = async (req, res) => {
  const { email, body, name } = req.body;
  let to = `IFIX < ${process.env.MAIL_SENDER_EMAIL_ADDRESS} >`;
  console.log(to);
  let subject = "IFix Comment";
  try {
    await mail({
      from: email,
      to: to,
      html: `<table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
                <tr>
                <td style="padding:0;background:#70bbd9;">
                    my name : ${name}
                </td>
                </tr>
                <tr>
                <td style="padding:0;">
                ${body}
                </td>
                </tr>
                </table>`,
      subject: subject,
    });
    return res.status(200).send("done");
  } catch (err) {
    console.log(err);
    return res.status(500).send("error");
  }
};

const StatisticsTotal = async (req, res) => {
  try {
    const TotalCountUsers = await User.countDocuments({ role: "user" });
    const TotalCountEmployees = await User.countDocuments({ role: "employee" });
    const TotalCountJobs = await Job.countDocuments({});

    return res
      .status(200)
      .json({ TotalCountUsers, TotalCountEmployees, TotalCountJobs });
  } catch (error) {
    console.log(error);
    return res.status(400).send("error in get count");
  }
};
const StatisticsTotalRecent = async (req, res) => {
  const now = new Date();
  // console.log(now.getDate())
  let startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    const TotalCountUsers = await User.countDocuments({
      role: "user",
      created_at: { $gte: startOfToday },
    });
    const TotalCountEmployees = await User.countDocuments({
      role: "employee",
      created_at: { $gte: startOfToday },
    });
    const TotalCountJobs = await Job.countDocuments({
      created_at: { $gte: startOfToday },
    });

    return res
      .status(200)
      .json({ TotalCountUsers, TotalCountEmployees, TotalCountJobs });
  } catch (error) {
    console.log(error);
    return res.status(400).send("error in get count");
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
  verifyPassword,
  isLoggedIn,
  logout,
  getCurrentUser,
  payment,
  sendMailer,
  adminLogin,
  StatisticsTotal,
  StatisticsTotalRecent,
};
