const mongoose = require("mongoose");
const {Schema} = require("mongoose");
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const ProfessionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 15
        },
        services: [
            {
                type: Schema.Types.ObjectId,
                ref: "Service",
                required:true
            },
        ],
    },
    {timestamps: {createdAt: "created_at", updatedAt: false}}
);
const Profession = mongoose.model("Profession", ProfessionSchema);

function validateProfession(profession) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(15).required(),
        services: Joi.array().items(Joi.objectId()).required()
    });
    return schema.validate(profession);
}


module.exports.Profession = Profession;
module.exports.validate = validateProfession;
