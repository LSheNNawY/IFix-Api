const mongoose = require("mongoose");
const Profession = require("../models/Profession");
const multer = require("multer");
const professionValidation = require("../helpers/professionValidations");

/**
 * get all professions function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const getAll = async (req, res) => {
  const { search } = req.query;
  try {
    const professionsPerPage = 10;
    const page = parseInt(req.query.page || "0");
    const totalProfessions = await Profession.countDocuments({});

    if (req.query.professions) {
      const professions = await Profession.find({})
        .populate("services")
        .populate("employees")
        .limit(+req.query.professions);
      return res.status(200).json(professions);
    }

    if (search) {
      const regex = new RegExp(search, "i");
      const professions = await Profession.find({ $or: [{ title: regex }] })
        .limit(professionsPerPage)
        .skip(professionsPerPage * page);

      return res.status(200).json({
        totalPages: Math.ceil(totalProfessions / professionsPerPage),
        professions,
      });
    }

    const professions = await Profession.find({})
      .populate("services")
      .populate("employees")
      .limit(professionsPerPage)
      .skip(professionsPerPage * page);
    return res.status(200).json({
      totalPages: Math.ceil(professions.length / professionsPerPage),
      professions,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "professions not found" });
  }
};

/**
 * create professions function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const createProfession = async (req, res) => {
  const { body } = req;

  body.services = JSON.parse(body.services);

  if (req.file) body.img = req.file.filename;
  const { error } = professionValidation.validate(body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const newProfession = await Profession.create(body);
    if (newProfession) {
      return res.status(200).send(newProfession);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

/**
 * search professions function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getProfessionById = async (req, res) => {
  const serviceQuery = req.query.services;
  try {
    if (serviceQuery) {
      const profession = await Profession.findOne({
        _id: req.params.id,
      });
      console.log(profession);
      return res.status(200).json(profession.services);
    }
    const profession = await Profession.findOne({
      _id: req.params.id,
    }).populate("employees");
    return res.status(200).json(profession);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "professions not found" });
  }
};

/**
 * update professions function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const updateProfession = async (req, res) => {
  if (req.file) req.body.img = req.file.filename;
  try {
    const profession = await Profession.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (profession) {
      res.send(profession);
    }
  } catch (err) {
    return res.status(400).send({ message: "professions not found" });
  }
};

/**
 * delete professions function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const deleteProfession = async (req, res) => {
  try {
    const profession = await Profession.findById(req.params.id);

    if (profession) {
      await profession.remove();
      return res.status(200).json({ message: "professions Deleted" });
    }
    return res.status(404).json({ message: "Error deleting professions" });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const assignEmployeeToProfession = async (professionId, employeeId) => {
  const profession = await Profession.findById(professionId);
  profession.employees.push(employeeId);
  profession.save();
};

module.exports = {
  getAll,
  createProfession,
  getProfessionById,
  updateProfession,
  deleteProfession,
  assignEmployeeToProfession,
};
