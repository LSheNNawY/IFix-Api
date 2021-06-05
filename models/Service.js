const mongoose = require("mongoose");
const {Schema} = require("mongoose");
const ServiceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "title is required"],
            minLength: 5,
            maxLength: 20,
        },
        description: {
            type: String,
            required: [true,"description is required"],
            minLength: 10
        },
        price: {
            type:Number,
            default: 0
        }

    },
    {timestamps: {createdAt: "created_at", updatedAt: false}}
);
const Service = mongoose.model("Service", ServiceSchema);

module.exports = Service;