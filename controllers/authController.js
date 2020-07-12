const User=require('../models/user');
const jwt=require('jsonwebtoken');
const AppError=require('../utils/appError');
const _=require('lodash');
const catchAsync=require('../utils/catchAsync');

exports.sigup=(req,res,next)=>{
  User.create({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
    passwordConfirm:req.body.passwordConfirm,
    passwordChangedAt:req.body.passwordChangedAt,
  },(err,user)=>{
    if (err) return next(err)
    const token=user.generateAuthToken();
      res.status(200).json({
        status:"success",
        token,
        data: {
          user:_.pick(user,['_id','name','email','role'])
        }
      })

  })
}
exports.login= (req,res,next)=>{
  const { email,password }=req.body;

  //1) Check if email and password exist
  if(!email||!password) return next(new AppError(new Error('Please provide email and password'),400))

  //2) check if user exists && password exists
  User.findOne({email},async (err,user)=>{
    if (err) return next(err)

    if (!user||!await user.correctPassword(password,next)) return next(new AppError(new Error('Incorrect email or password'),401));
    //3) send token to user
    const token=user.generateAuthToken();
    res.status(200).json({
      status:'success',
      token
    });
  })

}

exports.forgotPassword=catchAsync(async (req,res,next)=>{
  // 1) Get user based on posted email.
  const user=await User.findOne({email:req.body.email})

  if (!user) return next(new AppError(new Error('There is no user with the specified email address'),404));

  // 2) Generate the random reset token

  // 3) Send it to user's email

})
exports.resetPassword=(req,res,next)=>{

}
