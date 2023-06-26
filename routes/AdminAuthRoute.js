const AdminAuthRoute = require('express').Router()
const asyncHandler = require('express-async-handler')
const Admin = require('../models/AdminModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verify = require('../middleware/verify')
const authAdmin = require('../middleware/authAdmin')




AdminAuthRoute.post('/admin/register', asyncHandler(async(req, res) => {

const {email, password} = req.body

if ( !email ||  !password   ) {
    res.json({ msg: "input box cannot be empty!" });
  }


const salt =  await bcrypt.genSalt(10);
const hashedPassword = await  bcrypt.hash(password, salt);

await Admin.create  ({
  email,

  password: hashedPassword,
  
});

  res.json({msg: "account created"});



}))


AdminAuthRoute.post('/admin/login', asyncHandler(async(req, res) => {

  const { email, password } = req.body;

  const userExists = await Admin.findOne({ email }).select("+password");

  
  

  if (!userExists) {
    res.json({
      msg: "No user associated with this username exists in our system. Please register.",
    });
  }

  const passwordMatch = await bcrypt.compare(password, userExists.password);

  

  if (passwordMatch) {
    let accesstoken = createAccessToken({id: userExists._id })
    let refreshtoken = createRefreshToken({id: userExists._id})

    res.cookie('refreshtoken', refreshtoken, { expire: new Date() + 9999 });

    jwt.verify(refreshtoken, process.env.REFRESH_TOKEN, (err, user) =>{
      if(err) return res.status(400).json({msg: "Please Login or Register"})
  
      const accesstoken = createAccessToken({id: user.id})
      
  
      res.json({accesstoken}) })


    
  } else {
    res.json({ msg: "check your password again" });
  } 





    

}))

AdminAuthRoute.get('/admin/user', verify, asyncHandler(async(req, res) => {
  try {
    const user = await Admin.findById(req.user).select('-password');


    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
   
    res.json(user);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
  


}))




const createAccessToken = (user) =>{
    return jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '7d'})
  }
  const createRefreshToken = (user) =>{
    return jwt.sign(user, process.env.REFRESH_TOKEN, {expiresIn: '7d'})
  }


module.exports = AdminAuthRoute