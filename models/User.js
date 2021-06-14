const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            minLength: 3,
            maxLength: 15,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            minLength: 3,
            maxLength: 15,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            match: [
                /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/,
                "Please fill a valid email address",
            ],
            unique: true,
        },
        phone: {
            type: String,
            required: [true, "Phone is required"],
            match: [/^01[0125][0-9]{8}$/gm, "Please fill a valid phone number"],
        },
        passwordHash: {
            type: String,
            minLength: 6,
            required: [true, "Password is required"],
        },
        role: {
            type: String,
            enum: ["super admin", "admin", "user", "employee"],
            default: "user",
        },
        address: {
            type: String,
            required: [true, "Address is required"],
        },
        picture: {
            type: String,
        },
        dateOfBirth: {
            type: Date,
        },
        status: {
            type: String,
            enum: [
                "pending activation",
                "active",
                "blocked",
                "pending interview",
            ],
            default: "pending activation",
        },
        rating: {
            type: Number,
        },
        profession: {
            type: Schema.Types.ObjectId,
            ref: "Profession",
        },
        jobs: [
            {
                type: Schema.Types.ObjectId,
                ref: "Job",
            },
        ],
    },
    { timestamps: { createdAt: "created_at", updatedAt: false } }
);
const User = mongoose.model("User", userSchema);

module.exports = User;
