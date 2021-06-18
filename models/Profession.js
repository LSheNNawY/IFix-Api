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
        ],
        employees:[
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: false,
            },
        ],
        img: {
            type: String,
        }

    },
    {timestamps: {createdAt: "created_at", updatedAt: false}}
);
const Profession = mongoose.model("Profession", ProfessionSchema);
//
// function validateProfession(professions) {
//     const schema = Joi.object({
//         title: Joi.string().min(3).max(15).required(),
//         services: Joi.array().items(Joi.array())
//     });
//     return schema.validate(professions);
// }


module.exports = Profession;
// module.exports.validate = validateProfession;
