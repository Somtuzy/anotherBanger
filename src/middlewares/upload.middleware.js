const upload = require("../services/multer.service");

// Handle file upload
const uploadFiles = (req, res, next) => {

  try {
    upload.array("images")(req, res, function (err) {
      if (err) {
        // Handle any errors during upload
        return res.status(500).json({
          success: false,
          message: "Error uploading file(s)",
          error: err,
        });
      }
      
      next();
    });
  } catch (err) {
    // Handle any other errors
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
      error: err,
    });
  }
};

// Handle file upload
const uploadAvatar = (req, res, next) => {
  try {
    upload.array("avatar")(req, res, function (err) {
      if (err) {
        // Handle any errors during upload
        return res.status(500).json({
          success: false,
          message: "Error uploading Avatar image",
          error: err,
        });
      }
      
      next();
    });
  } catch (err) {
    // Handle any other errors
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
      error: err,
    });
  }
};

module.exports = { uploadFiles, uploadAvatar };
