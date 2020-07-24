const express=require('express')
const router=express.Router();
const { auth }=require('../middleware/auth')
const { restrictTo }=require('../middleware/authorize');

const {resizeTourImages, getAllTours,createTour,getTour,updateTour,deleteTour,getTourStats,getMonthlyPlan,getToursWithin,getDistances,uploadTourImages }=require('../controllers/tourController')
const reviewRouter=require('../routes/reviews')



router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(auth,
  restrictTo('admin','lead-guide','guide'),getMonthlyPlan)
router
  .route('/top-5-cheap')
  .get(getAllTours);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin)
router.route('/distances/:latlng/unit/:unit').get(getDistances)

router
  .route('/')
  .get(getAllTours)
  .post(auth,restrictTo('lead-guide','admin'),createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    auth,
    restrictTo('admin','lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour)
  .delete(auth,
   restrictTo('admin','lead-guide'),
    deleteTour)

// //POST /tour/3214rg/reviews
// //GET /tour/1152th/reviews
// //GET /tour/1152th/reviews/26657uijbg/
// router
//   .route('/:tourId/reviews')
//   .post(auth,restrictTo('user'),createReview)
router.use('/:tourId/reviews',reviewRouter);
module.exports=router;
