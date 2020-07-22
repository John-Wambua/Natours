const Tour=require('../models/tour');
const AppError=require('../utils/appError')
const catchAsync=require('../utils/catchAsync')
const {deleteOne,updateOne,createOne,getOne,getAll}=require('../controllers/handlerFactory')

exports.getAllTours=getAll(Tour,'tours');
exports.getTour=getOne(Tour,'tour',{path:'reviews',select:'-__v '})
exports.createTour=createOne(Tour,'tour')
exports.updateTour=updateOne(Tour,'tour')
exports.deleteTour=deleteOne(Tour,'tour')


exports.getTourStats=catchAsync(async (req,res,next)=>{
  const stats=await Tour.aggregate([
    { $match:{ratingsAverage:{$gte:4.5}} },
    {
      $group:{
        _id: {$toUpper: '$difficulty' },
        // _id:'$ratingsAverage',
        numTours:{$sum: 1},
        numRatings:{$sum:'$ratingQuantity'},
        avgRating: {$avg: '$ratingsAverage'},
        avgPrice:{$avg: '$price'},
        minPrice:{$min:'$price'},
        maxPrice:{$max:'$price'},
      },
    },
    { $sort:{avgPrice: -1 } },
  ])
  res.status(200).json({
    status:"success",
    data:{
      stats
    }
  })

})
exports.getMonthlyPlan=catchAsync(async (req,res,next)=>{
  const year=req.params.year*1;

  const plan=await Tour.aggregate([
    {
      $unwind:'$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours:{$push:'$name'}
      },
    },
    { $addFields:{month:'$_id'} },
    {
      $project:{
        _id:0,
      }
    },
    { $sort:{numTourStarts:-1} },

  ])
  res.status(200).json({
    status:"success",
    results:plan.length,
    data:{
      plan
    }
  })
})

///tours-within/:distance/center/:latlng/unit/:unit
exports.getToursWithin=catchAsync(async (req,res,next)=>{
  const {distance, latlng, unit}=req.params;
  const[lat,lng]=latlng.split(',');

  const radius=unit==='miles'?distance/3963.2: distance/6378.1
  if (!lat||!lng) return next(new AppError(new Error('Please provide your latitude and longitude in the format lat,lng'),400));
  const tours=await Tour.find({startLocation: {$geoWithin:{$centerSphere:[[lng,lat],radius]}}});
  console.log(distance,lat,lng,unit);

  res.status(200).json({
    status:'success',
    results:tours.length,
    data:{
      tours
    }
  })
})
exports.getDistances=catchAsync(async (req,res,next)=>{
  const {latlng, unit}=req.params;
  const[lat,lng]=latlng.split(',');

  const multiplier=unit==='miles'? 0.000621371 : 0.001;

  if (!lat||!lng) return next(new AppError(new Error('Please provide your latitude and longitude in the format lat,lng'),400));
  const distances=await Tour.aggregate([
    {
      $geoNear:{
        near:{
          type:'Point',
          coordinates:[lng*1, lat*1]
        },
        distanceField:'distance',
        distanceMultiplier:multiplier
      }
    },
    {
      $project:{
        distance:1,
        name:1
      }
    }
  ])
  res.status(200).json({
    status:'success',
    data:{
      data:distances
    }
  })
})
