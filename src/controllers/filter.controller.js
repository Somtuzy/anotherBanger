const {
  productService,
  categoryService,
} = require("../services/create.service");

class FilterOptions {
  async getCategoryFilterOptions (req, res) {
    try {
      const categoryNames = [];
      const categories = await categoryService.findAll({ deleted: false });
  
      console.log("these are the products:", categories);
      if (!categories) {
        return res.status(404).json({
          status: false,
          message: "No categories found",
        });
      }
  
      for (const category of categories) {
        categoryNames.push(category.name);
        console.log("these are the categories:", categoryNames);
      }
  
      return res.status(200).json({
        status: true,
        message: "Categories fetched successfully",
        data: categoryNames,
      });
    } catch (err) {
      return res.status(500).json({
        status: true,
        message: err.message,
      });
    }
  };
  
  async getSizeFilterOptions(req, res) {
    try {
      const sizeNames = [];
      const products = await productService.findAll({ deleted: false });
  
      if (!products) {
        return res.status(404).json({
          status: false,
          message: "No products found",
        });
      }
  
      for (const product of products) {
        sizeNames.push(product.size);
        return res.status(200).json({
          status: true,
          message: "Sizes fetched successfully",
          data: sizeNames,
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: true,
        message: err.message,
      });
    }
  };
  
  // Get a category
  async getProductsBySize(req, res) {
    try {
      const products = await productService.findAll({
        size: req.params.sizename,
        deleted: false,
      });
  
      if (!products) {
        return res.status(404).json({
          success: false,
          message: "There are no products matching your criteria",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
}

module.exports = new FilterOptions()