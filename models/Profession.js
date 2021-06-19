const mongoose = require("mongoose");
const {Schema} = require("mongoose");
// const Joi = require('joi')
// Joi.objectId = require('joi-objectid')(Joi)

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
                service: {
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
        ]

    },
    {timestamps: {createdAt: "created_at", updatedAt: false}}
);
const Profession = mongoose.model("Profession", ProfessionSchema);


module.exports = Profession;
// module.exports.validate = validateProfession;
