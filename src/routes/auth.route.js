const { Router } = require("express");
const {
  login,
  signup,
  logout,
  recover,
} = require("../controllers/auth.controller");
const validator = require("../middlewares/validator.middleware");
const { SignUpUserSchema, LoginUserSchema } = require("../schemas/user.schema");
const isValidToken  = require("../middlewares/isValidToken.middleware")
const authenticate = require("../middlewares/authenticate");

const authRouter = Router();

authRouter.post("/login", [validator(LoginUserSchema)], login);

authRouter.post("/signup", [validator(SignUpUserSchema)], signup);

authRouter.post("/recover", [validator(LoginUserSchema)], recover);

authRouter.get("/logout", authenticate, logout);

authRouter.get("/", authenticate, isValidToken);

module.exports = authRouter;
