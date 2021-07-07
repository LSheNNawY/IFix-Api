const { date } = require("joi");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const timeZone = require("mongoose-timezone");

const AuthenticationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["register-confirmation", "password-reset"],
      required: true,
    },
    confiremedAt: {
      type: Date,
    },
  },
  { timestamps: { updatedAt: false } }
);

AuthenticationSchema.plugin(timeZone, { paths: ["date", "createdAt"] });
const Authentication = mongoose.model("Authentication", AuthenticationSchema);

module.exports = Authentication;
