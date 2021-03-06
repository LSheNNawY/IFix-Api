const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const ProfessionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 15,
        },
        services: [
            {
                service: {
                    type: String,
                    required: [true, "title is required"],
                    minLength: 5,
                    maxLength: 20,
                    trim: true,
                },
                description: {
                    type: String,
                    required: [true, "description is required"],
                    minLength: 10,
                },
                price: {
                    type: Number,
                    default: 0,
                },
                icon:{
                    type: String,
                    required:true
                }
            },
        ],
        img: {
            type: String,
            required: true,
        },
        employees: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: false,
            },
        ],
    },
    { timestamps: { createdAt: "created_at", updatedAt: false } }
);
const Profession = mongoose.model("Profession", ProfessionSchema);

module.exports = Profession;
