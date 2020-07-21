const express=require('express');
const router=express.Router();
const {getAllUsers,updateMe,deleteMe,deleteUser,updateUser,getUser,getMe}=require('../controllers/userController');
const {sigup,login,forgotPassword,resetPassword,updatePassword,}=require('../controllers/authController');
const auth=require('../middleware/auth')
const {restrictTo}=require('../middleware/authorize')


router.post('/signup',sigup)
router.post('/login',login)

router.post('/forgotPassword',forgotPassword)
router.patch('/resetPassword/:token',resetPassword)

router.use(auth)
router.patch('/updateMyPassword',updatePassword)
router.patch('/updateMe',updateMe)
router.delete('/deleteMe',deleteMe)

router.get('/me',getMe,getUser);

router.use(restrictTo('admin'));
router
  .route('/')
  .get(getAllUsers);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports=router;