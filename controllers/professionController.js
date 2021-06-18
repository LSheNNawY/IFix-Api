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
  try {
    if (req.query.professions) {
      const professions = await Profession.find({})
          .populate("services")
          .limit(+req.query.professions);
      return res.status(200).json(professions);
    } else {
      const professions = await Profession.find({}).populate('employees');
      return res.status(200).json(professions);
    }
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
  const {body}=req;

  body.services=JSON.parse(body.services)

  if (req.file) body.img = req.file.filename;
  const { error } = professionValidation.validate(body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const newProfession = await Profession.create(body);
    if (newProfession) {
      return res.status(200).send(newProfession);
    }

  } catch (err) {
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
  try {
    const profession = await Profession.findOne({ _id: req.params.id }).populate('employees');
    if (profession) {
      res.send(profession);
    }
  } catch (err) {
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

  // const { error } = professionValidation.validate(req.body);
  console.log(req.body);
  // console.log(error)

  // if (error) return res.status(400).send(error.details[0].message);

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

module.exports = {
  getAll,
  createProfession,
  getProfessionById,
  updateProfession,
  deleteProfession,
};
