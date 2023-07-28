const { userService } = require("../services/create.service");
const { hashPassword, verifyPassword } = require("../services/bcrypt.service");
const { generateToken } = require("../services/jwt.service");
const { generateRandomAvatar } = require("../utils/avatar.utils");
const notify = require("../services/mail.service");
const Mails = require("../configs/mails.constant.config");

class AuthenticateController {
  async signup(req, res) {
    try {
      // Checks for existing user
      const existingUser = await userService.findOne({ email: req.body.email });

      if (existingUser && existingUser.deleted === true) {
        return res.status(403).json({
          message: `This email is taken or belongs to a disabled account. Please visit https://balethriftstore.onrender.com/api/v1/auth/recover to reactivate your account if it belongs to you.`,
          success: false,
        });
      }

      if (existingUser && existingUser.email === req.body.email) {
        return res.status(403).json({
          message: `Oops, it seems like this email is taken. Try a different email or sign in if you're the one registered with this email`,
          success: false,
        });
      }

      // Generates a random avatar for the user
      const avatarUrl = await generateRandomAvatar(req.body.email);

      // Hashes the user password
      const hashedPassword = await hashPassword(req.body.password);

      req.body.role && req.body.role === process.env.ADMIN_SECRET
        ? (req.body.role = "admin")
        : (req.body.role = "user");

      // Creates a new user
      const newUser = await userService.create({
        fullname: req.body.fullname,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: hashedPassword,
        avatar: avatarUrl,
        role: req?.body?.role,
      });

      // Generates a token for the user
      const payload = newUser.toObject();
      const token = await generateToken({
        id: payload._id,
        fullname: payload.fullname,
      });

      // Saves the user
      await newUser.save();

      // Saves the token as a cookie
      res.cookie("token", token, { httpOnly: true });

      // Returning the fields to the client side
      delete payload.password
      const signedUpUser = payload;

      console.log('Signed up User:', signedUpUser);

      // Sends an email notification
      await notify.sendMail(
        signedUpUser,
        signedUpUser.email,
        Mails.accountCreated.subject,
        Mails.accountCreated.body
      );

      await notify.sendMail(
        signedUpUser,
        signedUpUser.email,
        Mails.welcome.subject,
        Mails.welcome.body
      );

      // Retuns credentials to the client side
      return res
      .header("Authorization", `Bearer ${token}`)
      .status(200).json({
        success: true,
        message: "User signed up successfully!",
        data: signedUpUser
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "User sign up failed.",
        errormessage: err,
      });
    }
  }

  async login(req, res) {
    try {
      // Checks if the user already exists
      const existingUser = await userService.findOne({ email: req.body.email });

      // Returns a message if user doesn't exist
      if (!existingUser) {
        return res.status(404).json({
          message: `User does not exist, would you like to sign up instead?`,
          success: false,
        });
      }

      if (existingUser && existingUser.deleted === true) {
        return res.status(403).json({
          message: `This email belongs to a disabled account. Please visit https://balethriftstore.onrender.com/api/v1/auth/recover to reactivate your account if it belongs to you.`,
          success: false,
        });
      }

      // Checks if the password input by the client matches the protected password of the returned user
      const isValidPassword = await verifyPassword(
        req.body.password,
        existingUser.password
      );

      // Sends a message if the input password doesn't match
      if (!isValidPassword) {
        return res.status(401).json({
          message: `Incorrect password, please retype your password`,
          success: false,
        });
      }

      // Stores the returned user's unique id in an object to generate a token for the user
      const payload = existingUser.toObject();
      const token = await generateToken({
        id: payload._id,
        fullname: payload.fullname,
      });

      // This saves the token as a cookie
      res.cookie("token", token, { httpOnly: true });

      delete payload.password
      const loggedInUser = payload

      console.log('Logged in User:', loggedInUser);

      // Sends email notification
      await notify.sendMail(
        loggedInUser,
        loggedInUser.email,
        Mails.loggedIn.subject,
        Mails.loggedIn.body
      );

      // Retuns credentials to the client side
      return res
      .header("Authorization", `Bearer ${token}`)
      .status(200).json({
        success: true,
        message: "User logged in successfully!",
        data: loggedInUser
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "User login failed. ",
        errormessage: err,
      });
    }
  }

  async logout(req, res) {
    try {
      const token = "";

      // This saves the token as a cookie for the duration of its validity just to simulate how the request header works for the purpose of testing.
      await res.cookie("token", token, { httpOnly: true });

      // Sends email notification
      await notify.sendMail(
        req.session.user,
        req.session.user.email,
        Mails.loggedOut.subject,
        Mails.loggedOut.body
      );

      // Sends success message on the console
      console.log(`User logged out successfully `);
      delete req.session.user;

      // Returning the fields to the client side
      return res
      .header("Authorization", null)
      .status(200).json({
        success: true,
        message: "User logged out successfully!",
        data: null
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "User not logged out successfully",
        errormessage: err,
      });
    }
  }

  async recover(req, res) {
    try {
      const existingUser = await userService.findOne({
        email: req.body.email,
      });

      if (existingUser && existingUser.deleted === false)
        return res.status(403).json({
          success: false,
          message: `This email belongs to an active user, please sign in instead`,
        });

      // Returns a message if user doesn't exist
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: `User does not exist, would you like to sign up instead?`,
        });
      }

      // Checks if the password input by the client matches the protected password of the returned user
      const isValid = await verifyPassword(
        req.body.password,
        existingUser.password
      );

      // Sends a message if the input password doesn't match
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: `Incorrect password, please retype your password`,
        });
      }

      existingUser.deleted = false;
      await existingUser.save();

      // Stores the returned user's unique id in an object to generate a token for the user
      const payload = existingUser.toObject();
      const token = await generateToken({
        id: payload._id,
        fullname: payload.fullname,
      });

      // This saves the token as a cookie
      res.cookie("token", token, { httpOnly: true });

      // Removes password from output
      delete payload.password
      const recoveredUser = payload;

      console.log('Recovered user:', recoveredUser);

      // Sends email notification
      await notify.sendMail(
        recoveredUser,
        recoveredUser.email,
        Mails.recovered.subject,
        Mails.recovered.body
      );

      // Retuns credentials to the client side
      return res
      .header("Authorization", `Bearer ${token}`)
      .status(200).json({
        success: true,
        message: "Account reactivated successfully!",
        data: recoveredUser
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Account recovery failed.",
        errormessage: err,
      });
    }
  }
}
module.exports = new AuthenticateController();
