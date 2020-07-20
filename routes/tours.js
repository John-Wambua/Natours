const express=require('express')
const router=express.Router();
const auth=require('../middleware/auth')
const { restrictTo }=require('../middleware/authorize');

const { getAllTours,createTour,getTour,updateTour,deleteTour,getTourStats,getMonthlyPlan }=require('../controllers/tourController')
const reviewRouter=require('../routes/reviews')



router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router
  .route('/top-5-cheap')
  .get(getAllTours);
router
  .route('/')
  .get(auth,getAllTours)
  .post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
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
