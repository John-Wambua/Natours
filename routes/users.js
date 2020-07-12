const express=require('express');
const router=express.Router();
const {getAllUsers,createUser,getUser,updateUser,deleteUser}=require('../controllers/userController');
const {sigup,login,forgotPassword,resetPassword}=require('../controllers/authController');


router.post('/signup',sigup)
router.post('/login',login)

router.post('/forgotPassword',forgotPassword)
router.post('/resetPassword',resetPassword)

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports=router;