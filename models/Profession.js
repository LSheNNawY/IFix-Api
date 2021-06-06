const mongoose = require("mongoose");
const {Schema} = require("mongoose");

const ProfessionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "title is required"],
            minLength: 3,
            maxLength: 15,
        },
        services: [
            {
                type: Schema.Types.ObjectId,
                ref: "Service",
                required: true,
            },
        ],
    },
    {timestamps: {createdAt: "created_at", updatedAt: false}}
);
const Profession = mongoose.model(" Profession",  ProfessionSchema);

module.exports =  Profession;