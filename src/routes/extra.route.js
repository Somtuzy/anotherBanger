const express = require("express");
const {
  verifyEmail,
  verifyEmailRequest,
} = require("../controllers/email.verify.controller");
const {
  resetPassword,
  resetPasswordRequest,
} = require("../controllers/password.reset.controller");
const authenticate = require("../middlewares/authenticate");

const extraRouter = express.Router();

// Email verification Request
extraRouter.post("/verify/email", authenticate, verifyEmailRequest);

extraRouter.post("/verify/email/:token", authenticate, verifyEmail);

extraRouter.post("/reset/password", resetPasswordRequest);

extraRouter.post("/reset/password/:token", resetPassword);

module.exports = extraRouter;
