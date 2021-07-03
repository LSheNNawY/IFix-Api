const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const professionValidation = Joi.object({
  title: Joi.string().min(3).max(15).required(),

  services: Joi.array().items(
    Joi.object().keys({
      service: Joi.string().min(5).max(30).trim().required(),
      description: Joi.string().min(10).required(),
      price: Joi.number(),
      icon: Joi.string().required()
    })
    
  ),
  img: Joi.string().required()
});

module.exports = professionValidation;
