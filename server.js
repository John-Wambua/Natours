const mongoose=require('mongoose');
require('dotenv').config();


process.on('uncaughtException',err=>{
  console.log('Uncaught Exception...📌');
  console.log(err);
    process.exit(1)

})
process.on('unhandledRejection',err=>{
  console.log(' unhandled Promise Rejection...📌');
  console.log(err);
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

const port=process.env.PORT || 3000;
const server = app.listen(port,()=>{
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${port}...`);
});

//Respond to Heroku Sigterm signals
process.on('SIGTERM', ()=>{
  console.log('SIGTERM RECEIVED. Shutting down...');
  //Allow all pending requests to function till the end
  server.close(()=>{
    console.log('Process Terminated');
  })
})




