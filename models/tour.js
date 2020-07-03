const mongoose=require('mongoose');
const Joi=require('@hapi/joi');

const tourSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
    minlength:3,
    maxlength:30,
    unique:true,
    trim: true
  },
  duration:{
    type:Number,
    required:[true,'A tour must have a duration']
  },
  maxGroupSize: {
    type:Number,
    required:[true,'A tour must have a group size']
  },
  difficulty:{
    type:String,
    required:[true,'A tour must have a difficulty']
  },
  ratingsAverage:{
    type:Number,
    default:4.5,

  },
  ratingQuantity:{
    type:Number,
    default: 0
  },
  price:{
    type:Number,
    required:true
  },
  priceDiscount:Number,
  summary:{
    type:String,
    trim:true,
    required:[true,'A tour must have a description']
  },
  description:{
    type:String,
    trim:true
  },
  imageCover:{
    type:String,
    required:[true,'A tour must have a cover image']
  },
  images:[String],
  createdAt:{
    type:Date,
    default:Date.now()
  },
  startDates:[Date]
});

const Tour=mongoose.model('Tour',tourSchema);

const validate=tour=>{
  const schema=Joi.object({
    name:Joi.string().min(3).max(30).required(),
    duration:Joi.number().required(),
    maxGroupSize:Joi.number().required(),
    difficulty:Joi.string().required(),
    ratingsAverage:Joi.number(),
    ratingsQuantity:Joi.number(),
    price:Joi.number().required(),
    priceDiscount:Joi.number(),
    summary:Joi.string().required(),
    description:Joi.string(),
    imageCover:Joi.string().required(),
    images:Joi.array().items(Joi.string()),
    createdAt:Joi.date(),
    startDates:Joi.array().items(Joi.date()),

  })

  return schema.validate(tour);
}

module.exports.Tour=Tour;
module.exports.validate=validate;
