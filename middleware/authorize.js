const AppError=require('../utils/appError');


exports.restrictTo=(...roles)=>{
  return (req,res,next)=>{
    //roles is an array of input roles:['admin','lead-guide']
    if (!roles.includes(req.user.role)) return next(new AppError(new Error('You do not have permission to perform this action'),403));
    next();
  }
}