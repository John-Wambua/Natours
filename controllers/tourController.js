const { Tour ,validate}=require('../models/tour');


exports.getAllTours=(req,res)=>{

  const queryObj= { ...req.query };
  const excludedFields=['page','sort','limit','fields'];

  excludedFields.forEach(el=>{
    delete queryObj[el];
  });
  // console.log(queryObj);
//{ difficulty: 'difficult', duration: { gte: '4' } }
  let queryStr=JSON.stringify(queryObj)
  queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)
  // console.log(JSON.parse(queryStr));
//{ difficulty: 'difficult', duration: { '$gte': '4' } }

  let query=Tour.find(JSON.parse(queryStr));

  if (req.query.sort){
    //Allow sorting by multiple parameters separated by comma
    const sortBy=req.query.sort.split(',').join(' ');
    console.log(sortBy);
    query=query.sort(sortBy );
    //sort('price duration')
  }else{
    query=query.sort({createdAt:-1});
  }
  query.exec((err,tours)=>{
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
