const jwt = require('jsonwebtoken') 

// Generates a token by signing a user's unique details against a secret key whenever they sign in.
exports.generateToken = async (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRES_IN})  
}

// Verifies the authenticity of a user by checking the validity of the user's token against the secret key
exports.verifyToken = async (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY)  
}

exports.checkTokenValidity = async (token) => {
    // Decode the token to extract the expiration date
    const decoded = jwt.decode(token);
    const expirationDate = new Date(decoded.exp * 1000);

    // Checks if the token is expired
    if (token && expirationDate <= new Date()) {
        return false
      }
    return true
}

exports.generateOTP = async (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_OTP_EXPIRES_IN})  
}