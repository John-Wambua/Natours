const mongoose=require('mongoose');
const Tour=require('./tour')

const reviewSchema=new mongoose.Schema({
  review: {
    type:String,
    required:[true,'Review cannot be empty']
  },
  rating: {
    type:Number,
    min:1,
    max:5
  },
  createdAt: {
    type:Date,
    default:Date.now()
  },
  tour:{
    type:mongoose.Schema.ObjectId,
    ref:'Tour',
    required:[true,'A review must belong to a tour']
  },
  user:{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    required:[true,'A review must belong to a user']
  }
},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true},
  id:false
});

reviewSchema.index({tour: 1,user:1},{unique:true})

reviewSchema.pre(/^find/,function(next) {
  // this.populate({
  //   path:'user',
  //   select:'name photo'
  // }).populate({
  //   path:'tour',
  //   select:'name -_id '
  // })
  this.populate({
    path:'user',
    select:'name photo'
  })
  next();
})

reviewSchema.statics.calcAverageRating=async function(tourId) {
  //this points to current model
  const stats=await this.aggregate([
    {$match:{tour:tourId}},
    {$group:{
        _id:'$tour',
        numRatings:{$sum:1},
        avgRating:{$avg:'$rating'}
      }
    },
  ]);
  // console.log(stats);
  if (stats.length>0) {
    await Tour.findByIdAndUpdate(tourId,
      {
        ratingQuantity: stats[0].numRatings,
        ratingsAverage: stats[0].avgRating
      })
  }else{
    await Tour.findByIdAndUpdate(tourId,
      {
        ratingQuantity: 0,
        ratingsAverage: 4.5
      })
  }
}
reviewSchema.post('save',async function(doc) {
  //this points to current review document
  await doc.constructor.calcAverageRating(this.tour)

})
//findByIdAndUpdate
//findByIdAndDelete
reviewSchema.pre(/^findOneAnd/,async function(next) {
  this.r =await this.findOne();
  // console.log(this.r);
  next();
})
reviewSchema.post(/^findOneAnd/,async function() {
  //await this.findOne does not work here, the query has already executed
  await this.r.constructor.calcAverageRating(this.r.tour)
})

const Review=mongoose.model('Review',reviewSchema);

module.exports=Review;