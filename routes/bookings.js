const express=require('express')
const {getCheckoutSession}=require('../controllers/bookingController')
const { auth }=require('../middleware/auth');
const {restrictTo}=require('../middleware/authorize');

const router=express.Router();

router.get('/checkout-session/:tourID',auth,getCheckoutSession)


module.exports=router;