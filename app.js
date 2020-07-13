const express=require('express');
const morgan=require('morgan');
const rateLimit=require('express-rate-limit');
const helmet=require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');

const AppError=require('./utils/appError')
const globalErrorHandler=require('./middleware/error');
const tours=require('./routes/tours')
const users=require('./routes/users')

const app=express();


//MIDDLEWARE
//Set HTTP security headers
app.use(helmet());

//Development logging
if(process.env.NODE_ENV==='development'){
  app.use(morgan('dev'));
}

//Limit requests from same IP
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 100,
  message:'Too many requests from this IP, please try again in an hour!'
});

// only apply to requests that begin with /api/
app.use("/api/", apiLimiter);

app.use(express.static(`${__dirname}/public`));
//Body-parsing
app.use(express.urlencoded({extended:true,limit:'10kb'}))
//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss())

//Prevent parameter pollution
app.use(hpp({
  whitelist:[
    'duration','ratingsAverage','ratingQuantity','maxGroupSize','difficulty','price'
  ]
}));


//ROUTES
app.use('/api/v1/tours',tours);
app.use('/api/v1/users',users);

app.all('*',(req,res,next)=>{

  next(new AppError(`Can\'t find ${req.originalUrl} on this server!`,404));

})
// console.log(app.get('env'));
app.use(globalErrorHandler)

module.exports=app;

