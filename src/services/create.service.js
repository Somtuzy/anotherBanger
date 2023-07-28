const BaseService = require("./base.service");
const User = require("../models/user.model");
const Category = require("../models/category.model");
const Product = require("../models/product.model");

const userService = new BaseService(User);
const categoryService = new BaseService(Category);
const productService = new BaseService(Product);

module.exports = { userService, categoryService, productService };
