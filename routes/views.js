const express=require('express');
const {getOverview,getTour,getMyTours,getLoginForm,getSignUpForm,getAccountPage}=require('../controllers/viewsController')
const {auth,isLoggedIn}=require('../middleware/auth')
const router=express.Router();


router.get('/', isLoggedIn, getOverview)
router.get('/me',auth,getAccountPage)
router.get(
  '/my-tours',
  auth,
  getMyTours
)
router.get('/tour/:slug',isLoggedIn,getTour)
router.get('/login',isLoggedIn,getLoginForm)
router.get('/signup',isLoggedIn,getSignUpForm)

module.exports=router;