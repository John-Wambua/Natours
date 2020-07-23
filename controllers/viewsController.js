const Tour=require('../models/tour');
const catchAsync=require('../utils/catchAsync');
const AppError=require('../utils/appError');

exports.getOverview=catchAsync(async (req,res,next)=>{
  // 1) Get tour data from collection
  const tours=await Tour.find();
  // 2) Build Template
  // 3) Render template
  res.status(200).render('overview',{
    title:'All Tours',
    tours
  });
})
exports.getTour=catchAsync(async (req,res,next)=>{
  const tour=await Tour.findOne({slug:req.params.slug}).populate({
    path:'reviews',
    fields:'review rating user'
  })
  if (!tour) return next(new AppError('Tour not found!',404))
  res.status(200).render('tour',{
    title:tour.name,
    tour
  });
})
exports.getLoginForm= (req,res,next)=>{
  res.status(200).render('login',{
    title:'Log into your account'
  })
}
exports.getSignUpForm= (req,res,next)=> {
  res.status(200).render('signup', {
    title: 'Sign up for an account'
  })
}
exports.getAccountPage=(req,res)=>{
  res.status(200).render('account', {
    title: 'Your account'
  })
}
