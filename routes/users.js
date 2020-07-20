const express=require('express');
const router=express.Router();
const {getAllUsers,updateMe,deleteMe,deleteUser}=require('../controllers/userController');
const {sigup,login,forgotPassword,resetPassword,updatePassword,}=require('../controllers/authController');
const auth=require('../middleware/auth')
const {restrictTo}=require('../middleware/authorize')


router.post('/signup',sigup)
router.post('/login',login)

router.post('/forgotPassword',forgotPassword)
router.patch('/resetPassword/:token',resetPassword)

router.patch('/updateMyPassword',auth,updatePassword)
router.patch('/updateMe',auth,updateMe)
router.delete('/deleteMe',auth,deleteMe)

router
  .route('/')
  .get(getAllUsers);
  // .post(createUser);

router
  .route('/:id')
  // .get(getUser)
  // .patch(updateUser)
  .delete(auth,restrictTo('admin'),deleteUser);

module.exports=router;