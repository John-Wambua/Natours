const Tour=require('../models/tour');
const catchAsync=require('../utils/catchAsync');

exports.getOverview=catchAsync(async (req,res,next)=>{
  // 1) Get tour data from collection
  const tours=await Tour.find();
  // 2) Build Template
  // 3) Render template
  res.status(200).render('overview',{
    title:'All Tours',
    tours
  });
})
exports.getTour=catchAsync(async (req,res)=>{
  const tour=await Tour.findOne({slug:req.params.slug}).populate({
    path:'reviews',
    fields:'review rating user'
  })
  res.status(200).render('tour',{
    title:tour.name,
    tour
  });

})