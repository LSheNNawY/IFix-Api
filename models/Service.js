const mongoose = require("mongoose");
const {Schema} = require("mongoose");
const Joi = require('joi')

const ServiceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "title is required"],
            minLength: 5,
            maxLength: 20,
            trim:true
        },
        description: {
            type: String,
            required: [true,"description is required"],
            minLength: 10,

        },
        price: {
            type:Number,
            default: 0
        }

    },
    {timestamps: {createdAt: "created_at", updatedAt: false}}
);
const Service = mongoose.model("Service", ServiceSchema);
function validateService(service) {
    const schema = Joi.object({
        title: Joi.string().min(5).max(15).required(),
        description: Joi.string().min(10).required(),
        price: Joi.number()
    });
    return schema.validate(service);
}


module.exports = {
    Service,
    validateService
};