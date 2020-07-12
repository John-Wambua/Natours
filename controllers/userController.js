const User=require('../models/user');
const catchAsync=require('../utils/catchAsync');
const _=require('lodash');
const AppError=require('../utils/appError')


const filterObj=(obj,...allowedFields)=>{
  // {name:req.body.name,email:req.body.email}
  const newObj={};
  Object.keys(obj).forEach(el=>{
    if (allowedFields.includes(el)) newObj[el]=obj[el];
  });
  return newObj;
}

exports.getAllUsers=catchAsync(async (req,res)=>{
  const users= await User.find();
  res.status(200).json({
    status:"success",
    data:{

      users:_.map(users, _.partialRight(_.pick, ['_id', 'name', 'email', 'role','passwordChangedAt']))
    },
  })
});

exports.updateMe=catchAsync(async (req,res,next)=>{
  // 1) Create error if user posts password data
  if (req.body.password||req.body.passwordConfirm) return next(new AppError(new Error('This route is not for password updates. Please use /updateMyPassword'),400));

  // 2) Get User
  if (!req.user) return next(new AppError(new Error('You are not logged in'),401));

  const filteredBody=filterObj(req.body,'name','email')
  const updatedUser=await User.findByIdAndUpdate(req.user._id,filteredBody,{new:true,runValidators:true});

  // 3) Update user document
  res.status(200).json({
    status:'success',
    user:_.pick(updatedUser,['_id', 'name', 'email', 'role','passwordChangedAt'])
  })
})

exports.createUser=(req,res)=>{

};
exports.getUser=(req,res)=>{
  res.send('Get single tour');
};
exports.updateUser=(req,res)=>{
  res.send('Update tour');
};
exports.deleteUser =(req,res)=>{
  res.send('delete tour');
}

