const User=require('../models/user');
const AppError=require('../utils/appError');
const _=require('lodash');
const catchAsync=require('../utils/catchAsync');
const sendEmail=require('../utils/email');
const crypto=require('crypto');

exports.sigup=(req,res,next)=>{
  User.create({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
    passwordConfirm:req.body.passwordConfirm,
    passwordChangedAt:req.body.passwordChangedAt,
  },(err,user)=>{
    if (err) return next(err)
   user.generateAuthToken(201,res);


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
    user.generateAuthToken(200,res);

  })

}

exports.forgotPassword=catchAsync(async (req,res,next)=>{
  // 1) Get user based on posted email.
  const user=await User.findOne({email:req.body.email})

  if (!user) return next(new AppError(new Error('There is no user with the specified email address'),404));

  // 2) Generate the random reset token
  const resetToken=user.createPasswordResetToken();
  await user.save({validateBeforeSave:false})

  // 3) Send it to user's email
  const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message=`Forgot your password? No problem, simply reset it at ${resetURL}.\nIf you did not initiate this process, please ignore this email.`;

  try {
    await sendEmail({
      email:user.email,
      subject:"Your password reset token (Valid for 10 minutes)",
      message:message
    });
    res.status(200).json({
      status:'success',
      message:'Token sent to email'
    });
  }catch (e) {
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;

    await user.save({validateBeforeSave:true});
    return next(new AppError(new Error('There was an error sending the email.Try again later!'),500));
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
  user.generateAuthToken(200,res);

})
exports.updatePassword=catchAsync(async (req,res,next)=>{
  // 1) Get User
  if (!req.user) return next(new AppError(new Error('You are not logged in'),401));
  const user=req.user;
  // 2) Check if posted password is correct
  if (!await user.correctPassword(req.body.password,next)) return next(new AppError(new Error('Incorrect Password!'),401));

  // 3) Update password
  user.password=req.body.newPassword;
  user.passwordConfirm=req.body.newPasswordConfirm;
  await user.save()
  // 4) Log in user.
  user.generateAuthToken(200,res);

})
