const express=require('express');
const {getAllUsers,updateMe,deleteMe,deleteUser,updateUser,getUser,getMe,uploadUserPhoto,resizeUserPhoto}=require('../controllers/userController');
const {sigup,login,forgotPassword,resetPassword,updatePassword,logout}=require('../controllers/authController');
const { auth }=require('../middleware/auth')
const {restrictTo}=require('../middleware/authorize')



const router=express.Router();

router.post('/signup',sigup)
router.post('/login',login)
router.get('/logout',logout)

router.post('/forgotPassword',forgotPassword)
router.patch('/resetPassword/:token',resetPassword)

router.use(auth)
router.patch('/updateMyPassword',updatePassword)
router.patch('/updateMe',
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe
);
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