const Joi = require("joi");

exports.SignUpUserSchema = Joi.object({
  fullname: Joi.string().trim().min(3).max(40).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().min(11).max(14).required(),
  password: Joi.string().min(8).required(),
  birthday: Joi.string().optional(),
  address: Joi.string().optional(),
  role: Joi.string().optional(),
});

exports.UpdateUserSchema = Joi.object({
  fullname: Joi.string().min(3).max(40).trim().optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().min(11).max(14).optional(),
  password: Joi.string().min(8).optional(),
  newPassword: Joi.string().min(8).max(20).optional(),
  birthday: Joi.string().optional(),
  address: Joi.string().optional(),
});

exports.LoginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
