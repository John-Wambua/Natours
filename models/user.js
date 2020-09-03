const crypto=require('crypto');
const mongoose =require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const _=require('lodash')
const saltRounds=10;
const catchAsync =require('../utils/catchAsync')

const userSchema=new mongoose.Schema({
  name:{
    type:String,
    required:[true,'Please provide your name'],
    minlength: 5,
    maxlength: 50
  },
  email:{
    type: String,
    required: [true,'Please provide your email'],
    unique:true,
    lowercase:true,
    validate:[validator.isEmail,'Please provide a valid email']
  },
  role:{
    type:String,
    enum:['user','guide','lead-guide','admin'],
    default:'user'
  },
  photo:{
    type:String,
    default:'default.jpg'
  },
  password:{
    type:String,
    required:[true,'Please provide a password'],
    minlength:8,
    maxlength:255,
    select: false
  },
  passwordConfirm:{
    type:String,
    required:[true,'Please confirm your password'],
    validate:{
      //This only works on CREATE or SAVE!
      validator:function(val) {
        return this.password===val;
      },
      message:'Passwords do not match'
    }

  },
  passwordChangedAt:Date,
  passwordResetToken:String,
  passwordResetExpires:Date,
  active:{
    type:Boolean,
    default: true,
    select:false
  }
});

userSchema.pre('save',function(next) {
  if (!this.isModified('password'|| this.isNew)) return next();

  this.passwordChangedAt=Date.now()-1000;
  next();

})

userSchema.pre('save',async function(next) {
  //Only run if password was modified
  try {
    if (!this.isModified('password')) return next();
    //Hash password with bcrypt
    this.password=await bcrypt.hash(this.password,saltRounds)
    this.passwordConfirm=undefined;
    next();
  }catch (e) {
    next(e)
  }

})
//Query MIDDLEWARE
userSchema.pre(/^find/,function(next) {
  //this points to current query
  this.find({active: { $ne:false }})
  next();
})

//INSTANCE METHOD
userSchema.methods.correctPassword=async function(candidatePassword,dbPassword,next) {
  try {
    return await bcrypt.compare(candidatePassword, dbPassword);
  }catch (e) {
    next(e)
  }

}
userSchema.methods.generateAuthToken=function(statusCode,res,req) {
  const token=jwt.sign({id:this._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXP});

  res.cookie('jwt',token,{
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 *60*60*1000),
    httpOnly:true,
    //Test if app is secure
    secure: req.secure || req.headers('x-forwarded-proto')==='https'
  });
  return res.status(statusCode).json({
    status:'success',
    token,
    data:{
      user:_.pick(this,['_id','name','email','photo','role'])

    }
  });
}
userSchema.methods.changedPasswordAfter=function(JWTTimestamp) {
  if (this.passwordChangedAt){
    const changedTimestamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
    return JWTTimestamp<changedTimestamp;//if true, password was changed
  }
  return false;
}
userSchema.methods.createPasswordResetToken=function() {
  const resetToken=crypto.randomBytes(32).toString('hex');

  this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires=Date.now() + 10*60*1000;

  return resetToken;

}
const User =mongoose.model('User',userSchema);

module.exports=User;