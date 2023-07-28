const Joi = require("joi");

exports.NewCategorySchema = Joi.object({
  name: Joi.string().trim().min(3).max(20).required()
});

exports.UpdateCategorySchema = Joi.object({
  name: Joi.string().trim().min(3).max(20).optional()
});
