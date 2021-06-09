const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
      minLength: 3,
      maxLength: 15,
    },
    lastname: {
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
      match: [/\d{3}-\d{4}-\d{4}/, "Please fill a valid phone number"],
    },
    password: {
      type: String,
      minLength: 6,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user", "employee"],
      default: "user",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    picture: {
      type: String,
    },
    date_of_birth: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    profession: {
        type: Schema.Types.ObjectId,
        ref: 'Profession'
    },
    jobs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Job'
        }
    ]

}, {timestamps: {createdAt: 'created_at', updatedAt: false}});
const User = mongoose.model('User', userSchema);


module.exports = User;
