const express=require('express')
const router=express.Router({mergeParams: true});
const {getAllReviews,createReview,deleteReview}=require('../controllers/reviewsController')
const auth=require('../middleware/auth');
const {restrictTo}=require('../middleware/authorize');

router
  .route('/')
  .get(getAllReviews)
  .post(auth,restrictTo('user'),createReview)

router
  .route('/:id')
  .delete(auth,deleteReview)


module.exports=router;