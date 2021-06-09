const mongoose = require('mongoose');
const Profession = require('../models/Profession');
const multer= require('multer');

/**
 * get all profession function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const getAll = async (req, res) => {

        try {
            const professions= await Profession.find({}).populate('services')
            return res.status(200).json(professions);
        } catch (err) {
            return res.status(400).send({"message": "profession not found"});
        }

}

/**
 * create profession function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const createProfession = async (req, res) => {
    if(req.file) req.body.img=req.file.filename
    const { body } = req;
    // const { error } = validate(req.body);
    //
    // if (error) return res.status(400).send(error.details[0].message);

    try {
        const newProfession = await Profession.create(body);
        if (newProfession) {
            return res.status(200).send(newProfession);
        }
    } catch (err) {
        return res.status(500).send(err);
    }
}

/**
 * search profession function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getProfessionById = async (req, res) => {
    try {
        const profession = await Profession.findOne({_id: req.params.id});
        if (profession) {
            res.send(profession);
        }
    } catch (err) {
        return res.status(400).send({"message": "profession not found"});
    }
}

/**
 * update profession function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const updateProfession = async (req, res) => {

    // const { error } = validate(req.body);
    //
    // if (error) return res.status(400).send(error.details[0].message);

    try {
        const profession = await Profession.findOneAndUpdate({_id:req.params.id},{$set:req.body},{new:true});
        if (profession) {
            res.send(profession);
        }
    } catch (err) {
        return res.status(400).send({"message": "profession not found"});
    }
}


/**
 * delete profession function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const deleteProfession = async (req, res) => {
    try {
        const profession = await Profession.findById(req.params.id);

        if (profession) {
            await profession.remove();
            return res.status(200).json({message: "profession Deleted"});
        }
        return res.status(404).json({message: "Error deleting profession"});
    } catch (err) {
        return res.status(500).json({error: err});
    }
};




module.exports = {
    getAll, createProfession, getProfessionById, updateProfession, deleteProfession 
}