const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const jobSchema = new mongoose.Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    profession: {
      type: Schema.Types.ObjectId,
      ref: "Profession",
    },
    warranty: {
      type: Number,
      default: 1,
      required: true,
    },
    description: {
      type: String
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
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
    },
    review: {
      rate: {
        type: Number,
        default: 0,
      },
      comment: {
        type: String,
      },
    },
    started_at: {
        date:{
            type:String,
            require:true
        },
        time:{
           type:String,
           require:true
       }
      },
      ended_at: {
        date:{
            type:String,
            require:true
        },
        time:{
           type:String,
           require:true
       }
      }
  },
  
  { timestamps: { createdAt: "created_at"}}
);
const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
