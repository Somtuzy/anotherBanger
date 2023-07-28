const { Router } = require("express");
const {
  addProduct,
  getProduct,
  editProduct,
  deleteProduct,
  getProducts,
} = require("../controllers/product.controller");
const validate = require("../middlewares/validator.middleware");
const authenticate = require("../middlewares/authenticate");
const { uploadFiles } = require("../middlewares/upload.middleware");
const {
  NewProductSchema,
  UpdateProductSchema,
} = require("../schemas/product.schema");
const { getProductsBySize } = require("../controllers/filter.controller");

const productRouter = Router();

productRouter.post(
  "/",
  authenticate,
  uploadFiles,
  [validate(NewProductSchema)],
  addProduct
);

productRouter.get("/", getProducts);

productRouter.get("/sizes/:sizename", getProductsBySize);

productRouter
  .route("/:id")
  .patch(
    authenticate,
    uploadFiles,
    [validate(UpdateProductSchema)],
    editProduct
  )
  .get(getProduct)
  .delete(authenticate, deleteProduct);

module.exports = productRouter;
