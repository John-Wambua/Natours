const express=require('express')
const router=express.Router();

const { getAllTours,createTour,getTour,updateTour,deleteTour,getTourStats,getMonthlyPlan }=require('../controllers/tourController')

// router.param('id',checkId);

router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router
  .route('/top-5-cheap')
  .get(getAllTours);
router
  .route('/')
  .get(getAllTours)
  .post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour)

module.exports=router;
