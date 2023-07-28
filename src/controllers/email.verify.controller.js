const notify = require("../services/mail.service");
const { generateOTP, verifyToken } = require("../services/jwt.service");
const { userService } = require("../services/create.service");

const verifyEmailRequest = async (req, res) => {
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
    
    await notify.sendMail(
      user,
      user.email,
      "Email Verification",
      `${process.env.BASE_URL}/verify/email/${token}`
    );

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

// Email verification
const verifyEmail = async (req, res) => {
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

    user.verified = true;
    await user.save();

    await notify.sendMail(
      user,
      user.email,
      "Email Verification Successful",
      `Your email has been verified successfully!`
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

module.exports = { verifyEmail, verifyEmailRequest };
