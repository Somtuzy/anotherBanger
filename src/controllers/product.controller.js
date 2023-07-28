const { isValidObjectId } = require("../utils/id.utils");
const {
  userService,
  productService,
  categoryService,
} = require("../services/create.service");
const cloudinary = require("../services/cloudinary.service");
const notify = require("../services/mail.service");
const Mails = require("../configs/mails.constant.config");

class ProductController {
  // Adding a product
  async addProduct(req, res) {
    try {
      const existingUser = await userService.findOne({
        _id: req.session.user.id,
        deleted: false,
      });

      if (!existingUser) {
        return res.status(403).json({
          success: true,
          message: `You are not authorised to post products!`,
        });
      }

      if (!req.body.size) {
        return res.status(401).json({
          success: false,
          message: `Size cannot be empty`,
        });
      }

      // Searches for an existing category
      const foundCategory = await categoryService.findOne({
        name: req.body.category,
      });

      if (!foundCategory) {
        return res.status(404).json({
          success: true,
          message: `This category doesn't exist!`,
        });
      }

      const imageUrls = [];

      for (const file of req.files) {
        // Use Cloudinary to upload the file
        const result = await cloudinary.uploader.upload(file?.path);

        // Access the Cloudinary public URL via `result.secure_url`
        const imageUrl = result.secure_url;
        imageUrls.push(imageUrl);
      }

      const productDetails = [];

      if (req.body.style) {
        productDetails.push({ style: req.body.style });
      }
      if (req.body.color) {
        productDetails.push({ color: req.body.color });
      }
      if (req.body.material) {
        productDetails.push({ material: req.body.material });
      }
      if (req.body.neckline) {
        productDetails.push({ neckline: req.body.neckline });
      }
      if (req.body.length) {
        productDetails.push({ length: req.body.length });
      }
      if (req.body.sleeveLength) {
        productDetails.push({ sleeveLength: req.body.sleeveLength });
      }
      if (req.body.condition) {
        productDetails.push({ condition: req.body.condition });
      }

      const newProduct = await productService.create({
        title: req.body.title,
        details: productDetails,
        size: req.body.size,
        price: req.body.price,
        category: foundCategory._id,
        vendor: req.session.user.id,
        images: imageUrls,
      });

      await newProduct.save();

      await notify.sendMail(
        req.session.user,
        req.session.user.email,
        Mails.productUploaded.subject,
        Mails.productUploaded.body
      );

      return res.status(201).json({
        success: true,
        message: "Product uploaded successfully!",
        data: newProduct,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // Updating a product
  async editProduct(req, res) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(401).json({
          message: `Invalid product id`,
          success: false,
        });
      }

      // Checks if product already exists
      const existingProduct = await productService.findOne({
        _id: req.params.id,
        deleted: false,
      });

      // Sends a message if the specified product does not exist or the user is not authorized
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: `This product does not exist`,
        });
      }

      if (existingProduct.vendor.toString() !== req.session.user.id) {
        return res.status(403).json({
          success: false,
          message: `You're not authorized to edit this product`,
        });
      }

      const updateData = {}

      if (req.files && req.files.length > 0) {
        const imageUrls = [];

        for (const file of req.files) {
          // Use Cloudinary to upload the file
          const result = await cloudinary.uploader.upload(file?.path);

          // Access the Cloudinary public URL via `result.secure_url`
          const imageUrl = result.secure_url;
          imageUrls.push(imageUrl);
        }

        updateData.images = imageUrls
      }

      if (req.body.title) {
        updateData.title = req.body.title
      }

      if (req.body.size) {
        updateData.size = req.body.size
      }

      if (req.body.price) {
        updateData.price = req.body.price
      }

      if (req.body.category) {
        const existingCategory = await categoryService.findOne({ name: req.body.category})

        if(!existingCategory) {
          return res.status(404).json({ 
            success: false,
            message: "Category not found"
          })
        }

        updateData.category = existingCategory._id
      }

      const productDetails = [];

      if (req.body.style) {
        productDetails.push({ style: req.body.style });
      }
      if (req.body.color) {
        productDetails.push({ color: req.body.color });
      }
      if (req.body.material) {
        productDetails.push({ material: req.body.material });
      }
      if (req.body.neckline) {
        productDetails.push({ neckline: req.body.neckline });
      }
      if (req.body.length) {
        productDetails.push({ length: req.body.length });
      }
      if (req.body.sleeveLength) {
        productDetails.push({ sleeveLength: req.body.sleeveLength });
      }
      if (req.body.condition) {
        productDetails.push({ condition: req.body.condition });
      }

      updateData.details = productDetails;

      const updatedProduct = await productService.updateOne(
        req.params.id,
        updateData
      );

      await notify.sendMail(
        req.session.user,
        req.session.user.email,
        Mails.productUpdated.subject,
        Mails.productUpdated.body
      );

      return res.status(200).json({
        success: true,
        message: `Product successfully updated!`,
        data: updatedProduct,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
        success: false,
      });
    }
  }

  // Delete a product
  async deleteProduct(req, res) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(401).json({
          success: false,
          message: `Invalid product id`,
        });
      }

      const existingProduct = await productService.findOne({
        _id: req.params.id,
        deleted: false,
      });

      // Sends a message if the specified product does not exist or the user is not authorized
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: `This product does not exist.`,
        });
      }

      if (
        existingProduct.vendor.toString() !== req.session.user.id &&
        req.session.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: `You're not authorized to delete this product`,
        });
      }

      const deletedProduct = await productService.deleteOne(
        req.params.id,
        req.body
      );

      await notify.sendMail(
        req.session.user,
        req.session.user.email,
        Mails.productDeleted.subject,
        Mails.productDeleted.body
      );

      return res.status(200).json({
        success: false,
        message: `Product deleted successfully!`,
        data: deletedProduct,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  // Getting a product by id
  async getProduct(req, res) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(401).json({
          success: false,
          message: `Invalid product id`,
        });
      }

      const existingProduct = await productService.findOne({
        _id: req.params.id,
        deleted: false,
      });

      // Sends a message if the specified product does not exist
      if (!existingProduct)
        return res.status(404).json({
          success: false,
          message: `This product does not exist`,
        });

      // Sends a success message and displays the product
      return res.status(200).json({
        success: true,
        message: `Product fetched successfully!`,
        data: existingProduct,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // Get products by filter
  async getProducts(req, res) {
    try {
      const title = req.query.title;
      const size = req.query.size;
      const category = req.query.category;
      const price = req.query.price;

      // If there's no query, return a message with all rooms
      if (!title && !size && !category && !price) {
        // To display all products without filter
        const foundProducts = await productService.findAll({ deleted: false });

        if (!foundProducts) {
          return res.status(404).json({
            success: true,
            message: "There are no products to display",
            data: foundProducts,
          });
        }

        return res.status(200).json({
          success: true,
          message: "Here are all products below",
          data: foundProducts,
        });
      }

      // Creates an object to store the query values
      const filter = {
        deleted: false,
      };

      // Checks which keys were used to query and sets their values as part of the query filter data
      if (title) {
        title.toLowerCase().trim();
        filter.title = { $regex: title };
      }

      if (size) {
        size.toLowerCase().trim();
        filter.size = size;
      }

      if (category) {
        category.toLowerCase().trim();
        const foundCategory = await categoryService.findOne({ name: category });
        filter.category = foundCategory._id;
      }

      if (price) {
        price.toLowerCase().trim();
        console.log("second one:", price);

        if (price === "below 5000") filter.price = { $lte: 5000 };

        if (price === "5000 - 15000")
          filter.price = { $gte: 5000, $lte: 15000 };

        if (price === "15000 - 25000")
          filter.price = { $gte: 15000, $lte: 25000 };

        if (price === "above 25000") filter.price = { $gte: 25000 };
      }

      // Uses the entire filter data gathered from the query to look for rooms on the database that match the criteria provided the status is true.
      const foundProducts = await productService.findAll(filter);

      if (!foundProducts) {
        return res.status(404).json({
          success: false,
          message: "There are no products matching your filter criteria",
          data: foundProducts,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Here are products matching your filter criteria",
        data: foundProducts,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}

module.exports = new ProductController();
