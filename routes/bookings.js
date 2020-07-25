const express=require('express')
const {createBooking,updateBooking,deleteBooking,getAllBookings,getBooking,getCheckoutSession}=require('../controllers/bookingController')
const { auth }=require('../middleware/auth');
const {restrictTo}=require('../middleware/authorize');

const router=express.Router();
router.use(auth)
router.get('/checkout-session/:tourID',auth,getCheckoutSession)

router.use(restrictTo('admin','lead-guide'))
router.route('/')
  .get(getAllBookings)
  .post(createBooking)

router.route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking)


module.exports=router;