const app=require('./app')
const mongoose=require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser:true,
  useUnifiedTopology:true,
  useFindAndModify:false,
  useCreateIndex:true
},err=>{
  if (err) return console.log('Database connection failed');
  console.log('Database Connected Successfully');
})

const port=3000;
app.listen(port,()=>{
  console.log(`Server is running in port ${port}...`);
});