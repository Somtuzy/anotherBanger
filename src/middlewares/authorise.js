const adminAccess = (req, res, next) => {
    if(req.session.user.role !== 'admin') {
        return res.status(403).json({
            message: 'You are not allowed to perform this action',
            status: false
        })
    }
    next()   
}

module.exports = adminAccess;