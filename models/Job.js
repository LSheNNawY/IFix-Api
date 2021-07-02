const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const timeZone = require('mongoose-timezone');

const JobSchema = new mongoose.Schema(
    {
        client: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        employee: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        profession: {
            type: Schema.Types.ObjectId,
            ref: "Profession",
            required: true,
        },
        warranty: {
            type: Number,
            default: 0,
        },
        service: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        payment_method: {
            type: String,
            enum: ["Cash on delivery", "Credit Card"],
            default: "Cash on delivery",
        },
        review: {
            rate: {
                type: Number,
                min: 1,
                max: 5,
            },
            comment: {
                type: String,
            },
        },
        started_at: {
            type: String,
        },
        ended_at: {
            type: String,
        },
        wish_date: {
            type: String
        }
    },

    { timestamps: { createdAt: "created_at" } }
);

JobSchema.plugin(timeZone, { paths: ['date', 'created_at', 'started_at', 'wish_date', 'ended_at'] });

const Job = mongoose.model("Job", JobSchema);

module.exports = Job;
