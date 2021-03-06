const bcrypt = require("bcrypt");
const User = require("../models/User");
const userValidation = require("../helpers/userValidation");
const { assignEmployeeToProfession } = require("./professionController");

const getAllEmployees = async (req, res) => {
  const { search } = req.query;
  try {
    const employeesPerPage = 10;
    const page = parseInt(req.query.page || "0");
    const totalemployees = await User.countDocuments({ role: "employee" });

    if (search) {
      const regex = new RegExp(search, "i");
      const employees = await User.find({
        role: "employee",
        $and: [
          {
            $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
          },
        ],
      })
        .populate("profession")
        .limit(employeesPerPage)
        .skip(employeesPerPage * page);

      return res.status(200).json({
        totalPages: Math.ceil(employees.length / employeesPerPage),
        employees,
      });
    }

    const employees = await User.find({ role: "employee" })
      .populate("profession")
      .limit(employeesPerPage)
      .skip(employeesPerPage * page);
    return res.status(200).json({
      totalPages: Math.ceil(totalemployees / employeesPerPage),
      employees,
    });
  } catch (error) {
    console.log(error);
    return res.status(402).send("error in get employees");
  }
};

const createEmployee = async (req, res) => {
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
  if (req.file) {
    picture = req.file.filename;
  }
  const { error } = userValidation.validate(req.body);
  if (error) {
    console.log(error);
    return res.status(402).send(error.details[0].message);
  }

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    return res.status(400).json({ error: "email" });
  }

  const phoneExists = await User.findOne({ phone: req.body.phone });
  if (phoneExists) {
    return res.status(400).json({ error: "phone" });
  }

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  const newEmployee = new User({
    firstName,
    lastName,
    email,
    passwordHash,
    phone,
    address,
    dateOfBirth,
    profession,
    picture,
    role: "employee",
    status: "pending interview",
  });
  try {
    await newEmployee.save();
    await assignEmployeeToProfession(profession, newEmployee._id);
    return res.status(200).send(newEmployee);
  } catch (error) {
    console.error(error);
  }
};

const getEmployeeById = async (req, res) => {
  const id = req.params.id.toString();
  try {
    const employee = await User.findById(id)
      .populate("profession")
      .populate({
        path: "jobs",
        populate: {
          path: "client",
          model: "User",
        },
      });
    return res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    return res.status(402).send("employee not found");
  }
};

const updateEmployee = async (req, res) => {
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
    const employee = await User.findOneAndUpdate({ _id: id }, userData, {
      new: true,
    });
    return res.status(200).send(employee);
  } catch (error) {
    console.error(error);
    return res.status(402).send("Error Updating");
  }
};

const blockEmployee = async (req, res) => {
  const id = req.params.id.toString();
  try {
    await User.findOneAndUpdate({ _id: id }, { status: "blocked" });
    return res.status(200).json({ message: "User blocked", status: "blocked" });
  } catch (error) {
    console.error(error);
    return res.status(402).send("Error blocking Employee");
  }
};

const unblockEmployee = async (req, res) => {
  const id = req.params.id.toString();
  try {
    await User.findOneAndUpdate({ _id: id }, { status: "active" });
    return res
      .status(200)
      .json({ message: "Employee unblocked", status: "active" });
  } catch (error) {
    console.error(error);
    return res.status(402).send("Error unblocking Employee");
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (employee) {
      await employee.remove();
      return res.status(200).json({ message: "employee deleted successfully" });
    }
    return res.status(402).json({ message: "Error deleting employee" });
  } catch (error) {
    console.log(error);
    return res.status(402).send("error deleting employee");
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  blockEmployee,
  unblockEmployee,
  deleteEmployee,
};
