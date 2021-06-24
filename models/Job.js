const mongoose = require("mongoose");
const {Schema} = require("mongoose");
const jobSchema = new mongoose.Schema(
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
            required: true
        },
        address: {
            type: String,
            required: true
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
                max: 5
            },
            comment: {
                type: String,
            },
        },
        started_at: {
            date: {
                type: String
            },
            time: {
                type: String
            }
        },
        ended_at: {
            date: {
                type: String
            },
            time: {
                type: String
            }
        }
    },

    {timestamps: {createdAt: "created_at"}}
);
const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
