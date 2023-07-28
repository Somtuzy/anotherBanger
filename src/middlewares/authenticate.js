const { verifyToken, checkTokenValidity } = require("../services/jwt.service");
const { userService } = require("../services/create.service");

const authenticate = async (req, res, next) => {
  try {
    const authHeaders = req.header("Authorization");
    const token =
      authHeaders && authHeaders.substring(0, 7) === "Bearer "
        ? authHeaders.replace("Bearer ", "")
        : req.cookies.token;

    if (!token) {
      return res.status(403).json({
        success: false,
        message: 'You must be signed in to continue'
      })
    }

    // Extracts the expiration date from the token available
    const isValidToken = await checkTokenValidity(token);

    // Checks if the token is expired
    if (!isValidToken) {
      // Stores the users current page in the session parameter then sends them to sign in
      return res.status(403).json({
        success: false,
        message: 'Session expired, sign in to continue'
      })
    }

    // Decode the user token to get user credentials
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token provided'
      })
    }

    // Searches for an existing user with the decoded credentials
    const user = await userService.findOne({ _id: decoded.id, deleted: false });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(`Authentication for ${user.fullname} successful`);

    // The user is then added to the request
    req.user = user;
    req.session.user = user;
    req.token = token;

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = authenticate;
