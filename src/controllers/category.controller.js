const { categoryService, productService } = require("../services/create.service");
const { isValidObjectId } = require("../utils/id.utils");
const notify = require('../services/mail.service')
const Mails = require('../configs/mails.constant.config')

class CategoryController {
  //Create category
  async addCategory(req, res) {
    try {
      //check to see if a category with name exists
      const existingCategory = await categoryService.findOne({
        name: req.body.name,
        deleted: false,
      });

      //sends an error if the name exists
      if (existingCategory) {
        return res.status(403).json({
          success: false,
          message: "This category already exists",
        });
      }

      //create a category if the name doesn't exist
      const createdCategory = await categoryService.create({
        name: req.body.name,
      });

      await createdCategory.save();

      // Sends email notification
      await notify.sendMail(
        req.session.user,
        req.session.user.email,
        Mails.categoryCreated.subject,
        Mails.categoryCreated.body
      );

      // Returns credentials to the client side
      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: createdCategory,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // Get all categories
  async getCategories(req, res) {
    try {
      const categories = await categoryService.findAll({
        deleted: false,
      });

      if (!categories) {
        res.status(404).json({
          success: false,
          message: "Categories not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: categories,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  
  // Get a category
  async getCategory(req, res) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(403).json({
          success: false,
          message: `${req.params.id} is not a valid id`
        });
      }

      const category = await categoryService.findOne({
        _id: req.params.id,
        deleted: false,
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "This Category does not exist",
        });
      }

      const foundProductsForThisCategory = await productService.findAll({category: category, deleted: false})

      if(!foundProductsForThisCategory) {
        return res.status(200).json({
          success: true,
          message: "Category fetched successfully",
          category: category, 
          products: 'There are no products under this category'
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category fetched successfully",
        category: category, 
        products: foundProductsForThisCategory
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // Edit a category
  async editCategory(req, res) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(403).json({
          message: `${req.params.id} is not a valid id`,
          success: false,
        });
      }

      const existingCategory = await categoryService.findOne({ _id: req.params.id });

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      const updateData = {name: req.body.name}

      const updatedCategory = await categoryService.updateOne(
        req.params.id,
        updateData
      );

      await updatedCategory.save()

      await notify.sendMail(
        req.session.user,
        req.session.user.email,
        Mails.categoryUpdated.subject,
        Mails.categoryUpdated.body
      );

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
    }
  }

  // Delete a category
  async deleteCategory(req, res) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(403).json({
          success: false,
          message: `${req.params.id} is not a valid id`,
        });
      }

      const existingCategory = await categoryService.findOne({ _id: req.params.id });

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Delete the category
      const deletedCategory = await categoryService.deleteOne(req.params.id);

      await notify.sendMail(
        req.session.user,
        req.session.user.email,
        Mails.categoryDeleted.subject,
        Mails.categoryDeleted.body
      );

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        data: deletedCategory
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new CategoryController();
