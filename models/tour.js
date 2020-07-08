const mongoose=require('mongoose');
const Joi=require('@hapi/joi');
const slugify=require('slugify');
const validator=require('validator');

const tourSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
    minlength:[10],
    maxlength:[40,'A tour name must not exceed 40 characters'],
    unique:true,
    trim: true,
    // validate:[validator.isAlpha,'Tour name must only contain letters']
  },
  slug:String,
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
    required:[true,'A tour must have a difficulty'],
    enum: {
      values:['easy', 'medium', 'difficult'],
      message:'Difficulty can be either easy, medium or difficult'
    }
  },
  ratingsAverage:{
    type:Number,
    default:4.5,
    min:[1,'Rating must not be less than 1'],
    max:[5,'Rating must not be more than 5']

  },
  ratingQuantity:{
    type:Number,
    default: 0
  },
  price:{
    type:Number,
    required:true
  },
  priceDiscount:{
    type:Number,
    validate:{
      validator:function(val) {
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price'
     }
  },
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
    default:Date.now(),
    select:false,
  },
  startDates:[Date],
  secretTour:{
    type:Boolean,
    default:false,
  }
},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration/7;
})
//Document Middleware: runs before .create() and .save()
tourSchema.pre('save',function(next) {
  this.slug=slugify(this.name,{lower:true})
  next();
})

//QUERY MIDDLEWARE
tourSchema.pre(/^find/,function(next) {
// tourSchema.pre('find',function(next) {
  this.find({secretTour:{$ne:true}})
  next();
})
// tourSchema.post(/^find/,function(docs,next) {
// // tourSchema.pre('find',function(next) {
//   docs.find({secretTour:{$ne:true}})
//   next();
// })

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate',function(next) {
  this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
  console.log(this.pipeline());
  next();
})

const Tour=mongoose.model('Tour',tourSchema);

const validate=tour=>{
  const schema=Joi.object({
    name:Joi.string().min(10).max(40).required(),
    slug:Joi.string(),
    duration:Joi.number().required(),
    maxGroupSize:Joi.number().required(),
    difficulty:Joi.string().required().valid('easy', 'medium', 'difficult'),
    ratingsAverage:Joi.number().min(1).max(5),
    ratingsQuantity:Joi.number(),
    price:Joi.number().required(),
    priceDiscount:Joi.number(),
    summary:Joi.string().required(),
    description:Joi.string(),
    imageCover:Joi.string().required(),
    images:Joi.array().items(Joi.string()),
    createdAt:Joi.date(),
    startDates:Joi.array().items(Joi.date()),
    secretTour:Joi.boolean()

  })

  return schema.validate(tour);
}

module.exports.Tour=Tour;
module.exports.validate=validate;
