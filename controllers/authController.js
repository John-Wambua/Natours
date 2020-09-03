const User=require('../models/user');
const AppError=require('../utils/appError');
const _=require('lodash');
const catchAsync=require('../utils/catchAsync');
const Email=require('../utils/email');
const crypto=require('crypto');


exports.signup=catchAsync(async (req,res,next)=>{
  const user =await User.create({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
    passwordConfirm:req.body.passwordConfirm,
    passwordChangedAt:req.body.passwordChangedAt,
  });
  const url=`${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(user,url).sendWelcome()
  user.generateAuthToken(201,res,req);

})
exports.login= catchAsync(async (req,res,next)=>{
  const { email,password }=req.body;

  //1) Check if email and password exist
  if(!email||!password) return next(new AppError('Please provide email and password',400))

  //2) check if user exists && password exists
  const user= await User.findOne({email}).select('+password')
    if (!user||!await user.correctPassword(password,user.password,next)) return next(new AppError('Incorrect email or password',401));
    //3) send token to user
    user.generateAuthToken(200,res,req);


});

exports.forgotPassword=catchAsync(async (req,res,next)=>{
  // 1) Get user based on posted email.
  const user=await User.findOne({email:req.body.email})

  if (!user) return next(new AppError('There is no user with the specified email address',404));

  // 2) Generate the random reset token
  const resetToken=user.createPasswordResetToken();
  await user.save({validateBeforeSave:false})

  // 3) Send it to user's email

  try {
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user,resetURL).sendPasswordReset();
    res.status(200).json({
      status:'success',
      message:'Token sent to email'
    });
  }catch (e) {
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;

    await user.save({validateBeforeSave:true});
    return next(new AppError('There was an error sending the email.Try again later!',500));
  }


})
exports.resetPassword=catchAsync(async (req,res,next)=>{
  // 1) get user based on the token
  const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}})

  // 2) If token has not expires and there is user, set the new password
  if (!user) return next(new AppError(new Error('Token is invalid or has expired'),400))
  user.password=req.body.password;
  user.passwordConfirm=req.body.passwordConfirm;
  user.passwordResetToken=undefined;
  user.passwordResetExpires=undefined;

  await user.save();

  //3) Update changedPasswordAt property for the user

  //4) Log user in, send JWT
  user.generateAuthToken(200,res,req);

})

exports.logout=(req,res)=>{
  res.cookie('jwt','logged out',{
    expires: new Date(Date.now() +10*1000),
    httpOnly:true
  });
  res.status(200).json({status:'success'})
}

exports.updatePassword=catchAsync(async (req,res,next)=>{
  // 1) Get User
  if (!req.user) return next(new AppError('You are not logged in',401));
  const user=await User.findById(req.user._id).select('+password');
  // 2) Check if posted password is correct
  console.log(user);
  if (!await user.correctPassword(req.body.password,user.password,next)) return next(new AppError('Incorrect Password!',401));

  // 3) Update password
  user.password=req.body.newPassword;
  user.passwordConfirm=req.body.newPasswordConfirm;
  await user.save()
  // 4) Log in user.
  user.generateAuthToken(200,res,req);

})
