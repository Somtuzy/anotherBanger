const { Router } = require("express");
const {
  addCategory,
  editCategory,
  getCategory,
  getCategories,
  deleteCategory,
} = require("../controllers/category.controller");
const validate = require("../middlewares/validator.middleware");
const authenticate = require("../middlewares/authenticate");
const adminAccess = require("../middlewares/authorise");
const {
  NewCategorySchema,
  UpdateCategorySchema,
} = require("../schemas/category.schema");

const categoryRouter = Router();

categoryRouter.post(
  "/",
  authenticate,
  adminAccess,
  [validate(NewCategorySchema)],
  addCategory
);

categoryRouter.get("/", getCategories);

categoryRouter
  .route("/:id")
  .patch(authenticate, adminAccess, [validate(UpdateCategorySchema)], editCategory)
  .get(getCategory)
  .delete(authenticate, adminAccess, deleteCategory);

module.exports = categoryRouter;
