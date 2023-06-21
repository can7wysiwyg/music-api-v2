const Admin = require('../models/AdminModel')
const asyncHandler = require('express-async-handler')

const authAdmin = asyncHandler(async(req, res, next) => {

    const user = await Admin.findOne({
        _id: req.user.id
    })

    if(user.admin === 0) return res.json({msg: "you are not an admin"})

    next()


})

module.exports = authAdmin