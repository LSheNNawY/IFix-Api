const mongoose = require('mongoose');
const {Service,validateService} = require('../models/Service')


/**
 * get all service function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getAllService = async (req, res) => {
        try {
            const services = await Service.find({});
            return res.status(200).json(services);
        } catch (err) {
            console.log(err)
            return res.status(400).send({"message": "service not found"});

        }

}

/**
 * create service function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const createService = async (req, res) => {
    const {body} = req;
    const { error } = validateService(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    try {
            const newService = await Service.create(body);
            if (newService) {
                return res.status(200).send(newService);
            }
        } catch (err) {
            console.log(err)
            return res.status(500).send(err);
        }  
}

/**
 * search service function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findOne({_id: req.params.id});
        if (service) {
            res.send(service);
        }
    } catch (err) {
        return res.status(400).send({"message": "service not found"});
    }
}

/**
 * update service function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const updateService = async (req, res) => {
    const { error } = validateService(req.body);

    if (error) return res.status(400).send(error.details[0].message);
    try {
        const service = await Service.findOneAndUpdate({_id:req.params.id,},{$set:req.body},{new:true});
        if (service) {
            res.send(service);
        }
    } catch (err) {
        return res.status(400).send({"message": "service not found"});
    }
}


/**
 * delete service function
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            await service.remove();
            return res.status(200).json({message: "service Deleted"});
        }

        return res.status(404).json({message: "Error deleting service"});
    } catch (err) {
        return res.status(500).json({error: err});
    }
};




module.exports = {
    getAllService, createService, getServiceById, updateService, deleteService
}