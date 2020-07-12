const User=require('../models/user')

exports.getAllUsers=(req,res)=>{
  res.status(200).json({
    status:"success",
    data:{
      user:"user"
    },
  })
};
exports.createUser=(req,res)=>{

};
exports.getUser=(req,res)=>{
  res.send('Get single tour');
};
exports.updateUser=(req,res)=>{
  res.send('Update tour');
};
exports.deleteUser =(req,res)=>{
  res.send('delete tour');
}

