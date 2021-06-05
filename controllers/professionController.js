const mongoose = require('mongoose');
const Profession = require('../models/Profession')



/**
 * get all service function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getAll = async (req, res) => {
        try {
            const professions= await Profession.find({}).populate('services')
            return res.status(200).json(professions);
        } catch (err) {
            console.log(err)
            return res.status(400).send({"message": "profession not found"});
        }

}

/**
 * create service function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const createProfession = async (req, res) => {
    const {body} = req;
    try {
        const newProfession = await Profession.create(body);
        console.log(newProfession);
        if (newProfession) {
            return res.status(200).send(newProfession);
        }
    } catch (err) {
        return res.status(500).send(err);
    }
}

/**
 * search service function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getById = async (req, res) => {
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
 * update service function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const getByIdAndUpdate = async (req, res) => {
    try {
        const profession = await Profession.findOneAndUpdate({_id:req.params.id,},{$set:req.body},{new:true});
        if (profession) {
            res.send(profession);
        }
    } catch (err) {
        return res.status(400).send({"message": "profession not found"});
    }
}


/**
 * delete service function
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
    getAll, createProfession, getById, getByIdAndUpdate, deleteProfession 
}