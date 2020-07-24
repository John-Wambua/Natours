const sharp=require('sharp')
const multer=require('multer')
const Tour=require('../models/tour');
const AppError=require('../utils/appError')
const catchAsync=require('../utils/catchAsync')
const {deleteOne,updateOne,createOne,getOne,getAll}=require('../controllers/handlerFactory')


const multerStorage=multer.memoryStorage();

const multerFilter=(req,file,cb)=>{
  //Check if uploaded file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  }else{
    cb(new AppError('Not an image! Please upload only images',400),false);
  }
}

const upload = multer({
  storage:multerStorage,
  fileFilter:multerFilter
})

exports.uploadTourImages=upload.fields([
  {
    name:'imageCover',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount:3
  }
]);
exports.resizeTourImages=catchAsync(async (req,res,next)=>{
  if (!req.files.imageCover|| !req.files.images) return next();

  //1) cover image
  req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/tours/${req.body.imageCover}`)

  //1) cover image
  req.body.images=[];
  await Promise.all(
    req.files.images.map(async (file,i)=>{
      const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename)
    })
  );

  next();
})


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
