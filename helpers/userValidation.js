const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const userValidation = Joi.object({
  firstName: Joi.string().min(3).max(15).required(),
  lastName: Joi.string().min(3).max(15).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .regex(/^01[0125][0-9]{8}$/m)
    .required(),
  password: Joi.string().required(),
  address: Joi.string().required(),
  dateOfBirth: Joi.string(),
  profession: Joi.string(),
});

module.exports = userValidation;
