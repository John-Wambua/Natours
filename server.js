const mongoose=require('mongoose');
require('dotenv').config();


process.on('uncaughtException',err=>{
  console.log('Uncaught Exception...📌');
  console.log(err.name,err.message);
    process.exit(1)

})
process.on('unhandledRejection',err=>{
  console.log(' unhandled Promise Rejection...📌');
  console.log(err.name,err.message);
  process.exit(1)

})
const app=require('./app')

mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser:true,
  useUnifiedTopology:true,
  useFindAndModify:false,
  useCreateIndex:true
},err=>{
  if (err) return console.log('Database connection failed',err);
  console.log('Database Connected Successfully');
})

const port=3000;
app.listen(port,()=>{
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${port}...`);
});




