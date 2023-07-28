const notify = require("../services/mail.service");
const { generateOTP, verifyToken } = require("../services/jwt.service");
const { hashPassword } = require("../services/bcrypt.service");
const { userService } = require("../services/create.service");

// Password Reset Request
const resetPasswordRequest = async (req, res) => {
  try {
    // Find user by email
    const email = req.body.email || req.query.email;
  
    const user = await userService.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate reset token
    const token = await generateOTP({ id: user._id, email: user.email });
    const encodedToken = encodeURIComponent(token);
    
    let resetMessage = `You requested a password reset. Please click this link to reset your password: `

    await notify.sendMail(
      user,
      user.email,
      "Password reset",
      `${resetMessage} ${process.env.BASE_URL}/auth/reset-password/${encodedToken}`
    );

    return res.status(200).json({
      success: true,
      message: "Reset email sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

// Password Reset
const resetPassword = async (req, res) => {
  try {
    // Verify the token
    const decoded = await verifyToken(req.params.token);

    // Find user by ID
    const user = await userService.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user's password
    const hashedPassword = await hashPassword(req.body.password);
    user.password = hashedPassword;

    await user.save();

    await notify.sendMail(
      user,
      user.email,
      "Password Reset Successful",
      `Your password has been reset successfully!`
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

module.exports = { resetPassword, resetPasswordRequest };
