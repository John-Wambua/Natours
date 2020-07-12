const AppError=require('../utils/appError')

const handleCastErrorDb=(err)=> {
  const message=`Invalid ${err.path}: ${err.value}`;
  return new AppError(message,400);
}
const handleDuplicateFieldsDb=(err)=> {
  const message=`Duplicate field value:${err.keyValue.name}. Please use another name`;
  return new AppError(message,400);
}

const handleValidationErrorDB=err=>{
  const message=`Error in field ${err.details[0].path}: ${err.details[0].message}`;
  return new AppError(message,400);
}
const handleNotFoundError=err=>{
  const message=err.message;
  return new AppError(message,404);
}
const handleJWTError=()=>new AppError('Invalid token. Please log in again.',401);

const handleJWTExpError=()=>new AppError('Your token is expired. Please log in again.',401);

const sendErrorDev=(err,res)=>{
  res.status(err.statusCode).json({
    status:err.status,
    error:err,
    message:err.message,
    stack:err.stack
  })
}
const sendErrorProd=(err,res)=>{
  //Operational Errors: send message to client

  if (err.isOperational){
    res.status(err.statusCode).json({
      status:err.status,
      message:err.message
    })
    //Programming or other unknown error:don't leak error details
  }else{
    console.error('ERROR',err);
    //send generic message
    res.status(500).json({
      status:'error',
      message:'Something went wrong'
    })
  }

}

module.exports=(err,req,res,next)=>{
  err.statusCode=err.statusCode||500;
  err.status=err.status||'error'

  console.log(process.env.NODE_ENV);

  if(process.env.NODE_ENV==='development'){

    sendErrorDev(err,res)
  }else if (process.env.NODE_ENV==='production'){
    let error={...err}
    //Invalid ID
    if (error.kind==='ObjectId') error=handleCastErrorDb(error)
    //Duplicate name fields
    if (error.code===11000) error=handleDuplicateFieldsDb(error)
    //Validation errors
    if (error.hasOwnProperty('_original')) error=handleValidationErrorDB(error)
    if (error.message==='No tour found with that ID') error=handleNotFoundError(error)
    if (error.name==='JsonWebTokenError') error=handleJWTError()
    if (error.name==='TokenExpiredError') error=handleJWTExpError()
    /*Todo add not found errors in production*/
    sendErrorProd(error,res)
  }

}