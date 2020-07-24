const sharp=require('sharp')
const multer=require('multer')
const catchAsync=require('../utils/catchAsync');
const _=require('lodash');
const User=require('../models/user');
const AppError=require('../utils/appError');
const {deleteOne,updateOne,getOne,getAll}=require('../controllers/handlerFactory')

// const multerStorage = multer.diskStorage({
//   destination:  (req, file, cb)=> {
//     cb(null, 'public/img/users');
//   },
//   filename:  (req, file, cb)=> {
//     const ext=file.mimetype.split('/')[1]
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   }
// })

const multerStorage=multer.memoryStorage();

const multerFilter=(req,file,cb)=>{
  //Check if uploaded file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  }else{
    cb(new AppError('Not an image! Please upload only images',400),false);
  }
}

const upload = multer({
  storage:multerStorage,
  fileFilter:multerFilter
})

exports.uploadUserPhoto=upload.single('photo');

//Runs after photo is uploaded
exports.resizeUserPhoto=catchAsync(async (req,res,next)=>{
  if (!req.file) return next();

  req.file.filename=`user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/users/${req.file.filename}`);

  next();
})

const filterObj=(obj,...allowedFields)=>{
  // {name:req.body.name,email:req.body.email}
  const newObj={};
  Object.keys(obj).forEach(el=>{
    if (allowedFields.includes(el)) newObj[el]=obj[el];
  });
  return newObj;
}
exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id;
  next();
}

exports.getAllUsers=getAll(User,'users')
//users:_.map(users, _.partialRight(_.pick, ['_id', 'name', 'email', 'role','passwordChangedAt']))

exports.updateMe=catchAsync(async (req,res,next)=>{

  // 1) Create error if user posts password data
  if (req.body.password||req.body.passwordConfirm) return next(new AppError(new Error('This route is not for password updates. Please use /updateMyPassword'),400));

  // 2) Get User
  if (!req.user) return next(new AppError(new Error('You are not logged in'),401));

  const filteredBody=filterObj(req.body,'name','email')
  if (req.file)  filteredBody.photo=req.file.filename;
  const updatedUser=await User.findByIdAndUpdate(req.user._id,filteredBody,{new:true,runValidators:true});

  // 3) Update user document
  res.status(200).json({
    status:'success',
    // user:_.pick(updatedUser,['_id', 'name', 'email', 'role','passwordChangedAt'])
    user:updatedUser
  })
})
exports.deleteMe=catchAsync(async (req,res,next)=>{
  await User.findByIdAndUpdate(req.user._id,{active:false});
  res.status(204).json({
    status:'success',
    data:null
  })
})

exports.createUser=(req,res)=>{
  res.status(500).json({
    status:'error',
    message:'This route is not defined. Please use /signup instead',
  })
};
exports.getUser=getOne(User,'user');

//Do not update password with this
exports.updateUser=updateOne(User,'user');
exports.deleteUser =deleteOne(User,'user');
