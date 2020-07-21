const mongoose=require('mongoose');
const slugify=require('slugify');
// const User=require('./user');

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
    max:[5,'Rating must not be more than 5'],
    set:val=>Math.round(val*10)/10

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
  },
  startLocation: {
    //GeoJSON
    type:{
      type:String,
      default:'Point',
      enum:['Point'],
    },
    coordinates:[Number],
    address:String,
    description:String

  },
  locations:[
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day:Number
    }
    ],
  guides:[
    {
      type:mongoose.Schema.ObjectId,
      ref:'User'
    }
  ]
},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true},
  id:false
});
// tourSchema.index({price:1})
tourSchema.index({price:1,ratingsAverage: -1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:'2dsphere'});
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration/7;
})
//Virtual populate
tourSchema.virtual('reviews',{
  ref:'Review',
  foreignField:'tour',
  localField:'_id'
})
//Document Middleware: runs before .create() and .save()
tourSchema.pre('save',function(next) {
  this.slug=slugify(this.name,{lower:true})
  next();
})
//EMBEDDING
// tourSchema.pre('save',async function(next) {
//   const guidesPromises=this.guides.map(async id=>await User.findById(id));
//   this.guides=await Promise.all(guidesPromises)
//   next();
// })

//QUERY MIDDLEWARE
tourSchema.pre(/^find/,function(next) {
// tourSchema.pre('find',function(next) {
  this.find({secretTour:{$ne:true}})
  next();
})
tourSchema.pre(/^find/,function(next) {
// tourSchema.pre('find',function(next) {
  this.populate({
    path:'guides',
    select:'-__v -passwordChangedAt -password'
  });
  next();
})

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate',function(next) {
//   this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
//   console.log(this.pipeline());
//   next();
// })


const Tour=mongoose.model('Tour',tourSchema);



module.exports=Tour;
