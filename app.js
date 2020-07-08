const express=require('express');
const morgan=require('morgan');

const AppError=require('./utils/appError')
const globalErrorHandler=require('./middleware/error');
const tours=require('./routes/tours')
const users=require('./routes/users')

const app=express();


//MIDDLEWARE
app.use(express.static(`${__dirname}/public`));
app.use(express.urlencoded({extended:true}))
app.use(morgan('dev'));
app.use(express.json());

//ROUTES
app.use('/api/v1/tours',tours);
app.use('/api/v1/users',users);

app.all('*',(req,res,next)=>{

  next(new AppError(`Can\'t find ${req.originalUrl} on this server!`,404));

})
// console.log(app.get('env'));
app.use(globalErrorHandler)

module.exports=app;

