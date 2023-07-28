const isValidToken = (req, res) => {
    const user = req.user
    
    return res.status(200).json({
        success: true,
        message: "Token is valid",
        data: user
    })
}

module.exports = isValidToken;