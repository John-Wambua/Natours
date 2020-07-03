const { Tour ,validate}=require('../models/tour');


exports.getAllTours=(req,res)=>{

  Tour.find({},(err,tours)=>{
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
