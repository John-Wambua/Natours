const mongoose =require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const saltRounds=10;

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
    type:String
  },
  password:{
    type:String,
    required:[true,'Please provide a password'],
    minlength:8,
    maxlength:255,
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
});

userSchema.pre('save',async function(next) {
  //Only run if password was modified
  try {
    if (!this.isModified('password')) return next();
    //Hash password with bcrypt
    this.password=await bcrypt.hash(this.password,saltRounds)
    console.log(this.password);
    this.passwordConfirm=undefined;
    next();
  }catch (e) {
    next(e)
  }
})
//INSTANCE METHOD
userSchema.methods.correctPassword=async function(candidatePassword,next) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  }catch (e) {
    return next(e);
  }
}
userSchema.methods.generateAuthToken=function() {
  const token=jwt.sign({id:this._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXP});
  return token;
}
userSchema.methods.changedPasswordAfter=function(JWTTimestamp) {
  if (this.passwordChangedAt){
    const changedTimestamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
    console.log(changedTimestamp,JWTTimestamp);
    return JWTTimestamp<changedTimestamp;//if true, password was changed
  }
  return false;
}
const User =mongoose.model('User',userSchema);

module.exports=User;