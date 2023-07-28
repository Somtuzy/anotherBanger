const { Router } = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  getSizeFilterOptions,
  getCategoryFilterOptions,
} = require("../controllers/filter.controller");

const filterRouter = Router();

filterRouter.get("/categories", authenticate, getCategoryFilterOptions);

filterRouter.get("/sizes", authenticate, getSizeFilterOptions);

module.exports = filterRouter;
