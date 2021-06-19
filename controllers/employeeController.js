const bcrypt = require("bcrypt");
const User = require("../models/User");
const userValidation = require("../helpers/userValidation");

const getAllEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: "employee" }).populate('profession')
        return res.status(200).json(employees);
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

    const { error } = userValidation.validate(req.body);
    if (error) {
        console.log(error);
        return res.status(402).send(error.details[0].message);
    }

    const employeeExists = await User.findOne({ email });
    if (employeeExists) {
        return res.status(402).send("email is already registered");
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
        role: "employee",
        status: "pending interview",
    });
    try {
        await newEmployee.save();
        return res.status(200).send(newEmployee);
    } catch (error) {
        console.error(error);
    }
};

const getEmployeeById = async (req, res) => {
    const id = req.params.id.toString();
    try {
        const employee = await User.findById(id).populate('profession').populate({
            path: 'jobs',
            populate: {
                path: 'client', 
                model: 'User'
            }
        })
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
    try {
        await User.findOneAndUpdate({ _id: id }, req.body);
        return res.status(200).send("Updated Successfully");
    } catch (error) {
        console.error(error);
        return res.status(402).send("Error Updating");
    }
};

const blockEmployee = async (req, res) => {
    const id = req.params.id.toString();
    try {
        await User.findOneAndUpdate({ _id: id }, { status: "blocked" });
        return res
            .status(200)
            .json({ message: "User blocked", status: "blocked" });
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
            return res
                .status(200)
                .json({ message: "employee deleted successfully" });
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
