const Review=require('../models/review')
const _=require('lodash')
const catchAsync=require('../utils/catchAsync')
const {deleteOne,updateOne,getOne,getAll}=require('../controllers/handlerFactory')

exports.createReview=catchAsync(async (req,res,next)=>{
  if (!req.body.tour) req.body.tour=req.params.tourId;
  if (!req.body.user) req.body.user=req.user.id;
  const newReview=await Review.create(req.body);
  res.status(201).json({
    status:'success',
    data:{
      review:_.pick(newReview,['_id','review','rating','tour','user','createdAt'])
    }
  })
})
exports.getAllReviews=getAll(Review,'reviews')
exports.getReview=getOne(Review,'review')
exports.updateReview=updateOne(Review,'review');
exports.deleteReview=deleteOne(Review,'review');

