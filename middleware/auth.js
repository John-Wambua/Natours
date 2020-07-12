const AppError=require('../utils/appError');
const jwt=require('jsonwebtoken');
const User=require('../models/user')

module.exports=(req,res,next)=>{
  // 1) Get token and check if it exits
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token=req.headers.authorization.split(' ')[1]
  }
 if (!token) return next(new AppError(new Error('Access denied! No token provided.'),401))
  //2) Verify token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
    if (err) return next(err)
    //3) Check if user still exists
    try {
      const currentUser=await User.findById(decoded.id)
      if (!currentUser) return next(new AppError(new Error('The user belonging to the token no longer exists'),401))
      //4) Check if user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) return next(new AppError(new Error('Password was recently changed! Please login again'),401))
      //Grant Access to protected route
      req.user=currentUser;
      next();
    }catch (e) {
      next(e);
    }

  });



}