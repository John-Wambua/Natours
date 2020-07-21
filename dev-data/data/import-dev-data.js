const fs=require('fs');
const mongoose=require('mongoose')
require('dotenv').config();
const Tour=require('./../../models/tour')
const Review=require('./../../models/review')
const User=require('./../../models/user')

mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser:true,
  useUnifiedTopology:true,
  useFindAndModify:false,
  useCreateIndex:true
},err=>{
  if (err) return console.log('Could not connect to DB');
  console.log('Database Connected Successfully');
})

//READ FILE
const tours=JSON.parse(fs.readFileSync(`${__dirname}\\tours.json`,'utf-8'));
const users=JSON.parse(fs.readFileSync(`${__dirname}\\users.json`,'utf-8'));
const reviews=JSON.parse(fs.readFileSync(`${__dirname}\\reviews.json`,'utf-8'));

//IMPORT DATA INTO DB

const importData=async ()=>{
  try{
    await Tour.create(tours);
    await User.create(users,{validateBeforeSave:false});
    await Review.create(reviews);
    console.log('Data successfully loaded');
    process.exit();
  }catch (e) {
    console.log(e);
  }
};

//DELETE ALL DATA FROM COLLECTION
const deleteData=async ()=>{
  try{
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
    process.exit();
  }catch (e) {
    console.log(e);
  }
}
// deleteData();
importData();