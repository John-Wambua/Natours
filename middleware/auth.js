const {promisify}=require('util')
const AppError=require('../utils/appError');
const jwt=require('jsonwebtoken');
const User=require('../models/user')
const catchAsync=require('../utils/catchAsync')


exports.auth=catchAsync(async (req,res,next)=>{
  // 1) Get token and check if it exits
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token=req.headers.authorization.split(' ')[1]
  }else if(req.cookies.jwt){
    token=req.cookies.jwt;
  }

 if (!token) {
   if (req.originalUrl.startsWith('/api'))
     return next(new AppError('You are not logged in, please log in and try again', 401))
   return res.redirect('/login');
 }
  //2) Verify token
  const decoded=await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  //3) Check if user still exists
  const currentUser=await User.findById(decoded.id)
  if (!currentUser) return next(new AppError('The user belonging to the token no longer exists',401))
  //4) Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) return next(new AppError('Password was recently changed! Please login again',401))
  //Grant Access to protected route
  req.user=currentUser;
  res.locals.user = currentUser
  next();

})

//only for rendered pages, no errors!
exports.isLoggedIn=async (req,res,next)=>{
  try {
    if (req.cookies.jwt) {

      // 1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //2) Check if user still exists
      const currentUser = await User.findById(decoded.id)
      if (!currentUser)
        return next();
      //3) Check if user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat))
        return next();
      //There is a logged in user
      res.locals.user = currentUser
      return next();
    }
  }catch (e) {
    return next();
  }
  next();

}