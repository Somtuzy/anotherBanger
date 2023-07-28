const { Router } = require("express");
const { getUsers, getUser, updateUser, deleteUser } = require("../controllers/user.controller");
const validator = require("../middlewares/validator.middleware");
const { UpdateUserSchema } = require("../schemas/user.schema");
const authenticate = require("../middlewares/authenticate");
const { uploadAvatar } = require("../middlewares/upload.middleware");

const userRouter = Router();

userRouter.get("/", authenticate, getUsers);

userRouter
  .route("/:id")
  .get(authenticate, getUser)
  .patch(
    authenticate,
    uploadAvatar,
    [validator(UpdateUserSchema)],
    updateUser
  )
  .delete(authenticate, deleteUser);

module.exports = userRouter;
