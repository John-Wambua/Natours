const express=require('express')
const router=express.Router({mergeParams: true});
const {getAllReviews,createReview}=require('../controllers/reviewsController')
const auth=require('../middleware/auth');
const {restrictTo}=require('../middleware/authorize');

router
  .route('/')
  .get(getAllReviews)
  .post(auth,restrictTo('user'),createReview)


module.exports=router;