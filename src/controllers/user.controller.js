const { userService } = require("../services/create.service");
const { hashPassword, verifyPassword } = require("../services/bcrypt.service");
const { isValidObjectId } = require("../utils/id.utils");
const cloudinary = require("../services/cloudinary.service");
const notify = require("../services/mail.service");
const Mails = require("../configs/mails.constant.config");
const objectToString = require("../utils/objToString.utils");

class UserController {
  // Updating a user
  async updateUser(req, res) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(401).json({
          success: false,
          message: `Invalid user id`
        });
      }

      // Checks if user already exists
      const existingUser = await userService.findOne({
        _id: req.params.id,
        deleted: false,
      });

      // Sends a message if the specified user does not exist
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: `This user does not exist`,
        });
      }

      if (req.session.user.id !== existingUser._id.toString())
        return res.status(403).json({
          success: false,
          message: `You cannot update this user`
        });

      let imageUrl = "";

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          // Use Cloudinary to upload the file
          const result = await cloudinary.uploader.upload(file?.path);

          // Access the Cloudinary public URL via `result.secure_url`
          imageUrl = result.secure_url;
        }
      }

      // Updates the user based on what was provided
      const data = {};
      if (req.body.fullname) {
        data.fullname = req.body.fullname;
      }
      if (req.body.email) {
        data.email = req.body.email;
      }
      if (req.body.birthday) {
        data.birthday = req.body.birthday;
      }
      if (req.body.phoneNumber) {
        data.phoneNumber = req.body.phoneNumber;
      }
      if (req.body.address) {
        data.address = req.body.address;
      }
      if (imageUrl) {
        data.avatar = imageUrl;
      }

      if (!req.body.password && req.body.newPassword) {
        return res.status(401).json({
          message: `Please input your current password`,
          success: false,
        });
      }

      if (req.body.password && !req.body.newPassword)
        return res.status(401).json({
          message: `Please input your new password`,
          success: false,
        });

      if (req.body.password && req.body.newPassword) {
        const isValid = await verifyPassword(
          req.body.password,
          existingUser.password
        );
        if (!isValid) {
          return res.status(401).json({
            message: `Password is incorrect`,
            success: false,
          });
        }
          
        const updatedPassword = await hashPassword(req.body.newPassword);
        if (updatedPassword) {
          data.password = updatedPassword;
        }
      }

      const _updatedUser = await userService.updateOne(req.params.id, data);

      const { _id, fullname, email, birthday, address, phoneNumber, avatar } =
        _updatedUser;
      const updatedUser = {
        _id,
        fullname,
        email,
        birthday,
        address,
        phoneNumber,
        avatar,
      };

      // Sends a success message and displays the updated user
      const updateMessages = {};

      // Sends a success message and displays the updated user
      if (data.fullname) {
        updateMessages.fullname = `Your fullname has been updated successfully!`;
      }

      if (data.email) {
        updateMessages.email = `Your email has been updated successfully!`;
      }
        
      if (data.birthday) {
        updateMessages.birthday = `Your birthday has been updated successfully!`;
      }

      if (data.password) {
        updateMessages.password = `Your password has been changed successfully!`;
      }

      if (data.phoneNumber) {
        updateMessages.phoneNumber = `Your phone number has been updated successfully!`;
      }
      
      if (data.address) {
        updateMessages.address = `Your address has updated successfully!`;
      }

      if (data.avatar) {
        updateMessages.avatar = `Your avatar changed successfully!`;
      }

      const messages = objectToString(updateMessages);

      for (const message of messages) {
        await notify.sendMail(
          req.session.user,
          req.session.user.email,
          Mails.accountUpdated,
          message
        );
      }

      return res.status(200).json({
        success: true,
        message: updateMessages,
        data: updatedUser,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Deleting a user
  async deleteUser(req, res) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(401).json({
          success: false,
          message: `Invalid user id`
        });
      }

      const existingUser = await userService.findOne({
        _id: req.params.id,
        deleted: false,
      });

      // Sends a message if the specified user does not exist
      if (!existingUser)
        return res.status(404).json({
          success: false,
          message: `This user does not exist`
        });

      if (req.session.user.id !== existingUser._id.toString() && req.session.user.role !== "admin")
        return res.status(403).json({
          success: false,
          message: `You cannot delete this user`
        });

      // This soft deletes a user
      existingUser.deleted = true;
      await existingUser.save();

      const { _id, fullname, email, password, birthday } = existingUser;
      const deletedUser = { _id, fullname, email, password, birthday };

      await notify.sendMail(
        req.session.user,
        req.session.user.email,
        Mails.accountDeleted.subject,
        Mails.accountDeleted.body
      );

      // Sends a success message and displays the deleted user
      return res.status(200).json({
        success: true,
        message: `User deleted successfully!`,
        data: deletedUser,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Getting a user by id
  async getUser(req, res) {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(401).json({
          success: false,
          message: `Invalid user id`
        });
      }

      const _existingUser = await userService.findOne({
        _id: req.params.id,
        deleted: false,
      });

      // Sends a message if the specified user does not exist
      if (!_existingUser)
        return res.status(404).json({
          success: false,
          message: `This user does not exist`,
        });

      const { _id, fullname, email, password, birthday } = _existingUser;
      const existingUser = { _id, fullname, email, password, birthday };

      // Sends a success message and displays user
      return res.status(200).json({
        success: true,
        message: `User fetched successfully!`,
        data: existingUser,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Getting all users
  async getUsers(req, res) {
    try {
      const users = await userService.findAll({ deleted: false });

      // Sends a message if no users exist
      if (!users)
        return res.status(404).json({
          success: false,
          message: `Oops, it seems like there are no users yet`
        });

      // Sends a success message and displays users
      return res.status(200).json({
        success: true,
        message: `Users fetched successfully!`,
        data: users,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new UserController();
