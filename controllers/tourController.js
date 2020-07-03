const { Tour ,validate}=require('../models/tour');


exports.getAllTours=(req,res)=>{

  /**1. FILTERING**/
  const queryObj= { ...req.query };
  const excludedFields=['page','sort','limit','fields'];

  excludedFields.forEach(el=>{
    delete queryObj[el];
  });
  // console.log(queryObj);
  /**2. ADVANCED FILTERING**/
//{ difficulty: 'difficult', duration: { gte: '4' } }
  let queryStr=JSON.stringify(queryObj)
  queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)
  // console.log(JSON.parse(queryStr));
//{ difficulty: 'difficult', duration: { '$gte': '4' } }

  let query=Tour.find(JSON.parse(queryStr));

  /**3. SORTING**/
  if (req.query.sort){
    //Allow sorting by multiple parameters separated by comma
    const sortBy=req.query.sort.split(',').join(' ');
    console.log(sortBy);
    query=query.sort(sortBy );
    //sort('price duration')
  }else{
    query=query.sort({createdAt:-1});
  }

  /**4. FIELD LIMITING**/
  if (req.query.fields){
    const fields=req.query.fields.split(',').join(' ');
      query=query.select(fields);
  }else{
    query=query.select('-__v');
  }

  /**4. PAGINATION**/
  //page =2 && limit=10 1-10,page1, 11-20, page2,
  const page=req.query.page *1||1;//convert to number
  const limit=req.query.limit *1||100;
  const skip=(page-1)*limit;

  query=query.skip(skip).limit(limit)
  // if (req.query.page){
  //   Tour.countDocuments({},(err,numTours)=>{
  //     if (err) return res.status(500).json({ status:"failed", message:err });
  //     if (skip>=numTours)  return  new Error('error');
  //   })
  // }
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
