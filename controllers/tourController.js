const { Tour ,validate}=require('../models/tour');
const APIFeatures=require('../utils/apiFeatures')


exports.getAllTours=(req,res)=>{


  //EXECUTE QUERY
  const features=new APIFeatures(Tour.find(),req.query);
  features
    .filter()
    .sort()
    .limitFields()
    .paginate();

  features.query.exec((err,tours)=>{
    if (err) return res.status(500).json({
      status:"failed",
      message:err
    });
    if (!tours) return res.status(404).send('No tours found');

    res.status(200).json({
      status:"success",
      results:tours.length,
      data:{
        tours
      },
    })
  })

};

exports.createTour=(req,res)=>{
  
  const {error}=validate(req.body);

  if (error) return res.status(400).json({ status:"failed", message:error.message });

  Tour.create(req.body,(err,result)=>{
    if (err) return res.status(500).json({status:"failed",message:err});
    res.status(200).json({
      status:"success",
      data: {
        tour:result
      }
    })
  })


};
exports.getTour=(req,res)=>{
  const tourId=req.params.id;

  Tour.findById(tourId,(err,tour)=>{
    if (err) return res.status(500).json({status:"failed",message:err});
    res.json({
      status:"Success",
      data:{
        tour
      }
    })
  })
};
exports.updateTour=(req,res)=>{
  const tourId=req.params.id;

  const {error}=validate(req.body);

  if (error)  return res.status(400).json({status:"failed",message:error.message})


  Tour.findByIdAndUpdate(tourId,req.body,{new:true,useFindAndModify:false,runValidators:true},(err,result)=>{
    if (err) return res.status(500).json({status:"failed",message:err});

    res.status(200).json({
      status:"success",
      data:{
        tour:result
      }
    })
  })
};
exports.deleteTour=(req,res)=>{
  const tourId=req.params.id;
  Tour.findByIdAndDelete(tourId,(err)=>{
    if (err) return  res.status(500).json({status:"failed",message:err});

    res.status(204).json({
      status:"success",
      data:null
    })
  })
}

exports.getTourStats=(req,res)=>{
  Tour.aggregate([
    {
      $match:{ratingsAverage:{$gte:4.5}}
    },
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
    {
      $sort:{avgPrice: -1 }
    },
    // {
    //   $match: {_id:{$ne:'EASY'}}
    // }
  ])
    .exec((err,stats)=>{
      if (err) return res.status(500).json({status:"failed",message:err});
      res.status(200).json({
        status:"success",
        data:{
          stats
        }
      })
    })
}
exports.getMonthlyPlan=(req,res)=>{
  const year=req.params.year*1;

  Tour.aggregate([
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
    {
      $addFields:{month:'$_id'}
    },
    {
      $project:{
        _id:0,
      }
    },
    {
      $sort:{numTourStarts:-1}
    },
    // {
    //   $limit:6,
    // }

  ]).exec((err,plan)=>{
    if (err) return res.status(500).json({status:"failed",message:err});
    res.status(200).json({
      status:"success",
      results:plan.length,
      data:{
        plan
      }
    })
  })
}
