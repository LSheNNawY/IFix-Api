const User = require("../models/User");
const bcrypt = require("bcrypt");
const userValidation = require("../helpers/userValidation");

const getAllAdmins = async (req, res) => {
  const { search } = req.query;
  try {
    const adminsPerPage = 10;
    const page = parseInt(req.query.page || "0");
    const totaladmins = await User.countDocuments({ role: "admin" });

    if (search) {
      let regex = new RegExp(search, "i");
      const admins = await User.find({
        role: "admin",
        $and: [
          {
            $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
          },
        ],
      })
        .limit(adminsPerPage)
        .skip(adminsPerPage * page);

      return res.status(200).json({
        totalPages: Math.ceil(admins.length / adminsPerPage),
        admins,
      });
    }

    const admins = await User.find({ role: "admin" })
      .limit(adminsPerPage)
      .skip(adminsPerPage * page);

    return res.status(200).json({
      totalPages: Math.ceil(totaladmins / adminsPerPage),
      admins,
    });
  } catch (error) {
    console.log(error);
    return res.status(402).send("error in get admins");
  }
};

const createAdmin = async (req, res) => {
  const { firstName, lastName, email, password, phone, address, dateOfBirth } =
    req.body;

  const { error } = userValidation.validate(req.body);
  if (error) {
    console.log(error);
    return res.status(402).send(error.details[0].message);
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ error: "email" });
  }

  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    return res.status(400).json({ error: "phone" });
  }
  const adminExists = await User.findOne({ email });
  if (adminExists) {
    return res.status(402).send("email is already registered");
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
    role: "admin",
    status: "active",
  });
  try {
    await newUser.save();
    return res.status(200).send(newUser);
  } catch (error) {
    console.error(error);
  }
};

const getAdminById = async (req, res) => {
  const id = req.params.id.toString();
  try {
    const admin = await User.findById(id);
    return res.status(200).json(admin);
  } catch (error) {
    console.error(error);
    return res.status(402).send("admin not found");
  }
};

const updateAdmin = async (req, res) => {
  const id = req.params.id.toString();
  const { error } = userValidation.validate(req.body);
  if (error) {
    return res.status(402).send(error.details[0].message);
  }
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists && (emailExists._id).toString() !== id) {
    return res.status(400).json({ error: "email" });
  }

  const phoneExists = await User.findOne({ phone: req.body.phone });
  if (phoneExists && (phoneExists._id).toString() !== id) {
    return res.status(400).json({ error: "phone" });
  }
  try {
    let userData = req.body;
    let picture;
    if (req.file) {
      picture = req.file.filename;
      userData.picture = picture;
    }
    const admin = await User.findOneAndUpdate({ _id: id }, userData, {
      new: true,
    });
    return res.status(200).send(admin);
  } catch (error) {
    console.error(error);
    return res.status(402).send("Error Updating");
  }
};

const blockAdmin = async (req, res) => {
  const id = req.params.id.toString();
  try {
    await User.findOneAndUpdate({ _id: id }, { status: "blocked" });
    return res
      .status(200)
      .json({ message: "Admin blocked", status: "blocked" });
  } catch (error) {
    console.error(error);
    return res.status(402).send("Error blocking admin");
  }
};
const unblockAdmin = async (req, res) => {
  const id = req.params.id.toString();
  try {
    await User.findOneAndUpdate({ _id: id }, { status: "active" });
    return res
      .status(200)
      .json({ message: "Admin unblocked", status: "active" });
  } catch (error) {
    console.error(error);
    return res.status(402).send("Error blocking admin");
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (admin) {
      await admin.remove();
      return res.status(200).json({ message: "Admin deleted successfully" });
    }
    return res.status(402).json({ message: "Error deleting admin" });
  } catch (error) {
    console.log(error);
    return res.status(402).send("error deleting admin");
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  blockAdmin,
  unblockAdmin,
  deleteAdmin,
};
