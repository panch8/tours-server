const Tour = require('../model/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');



exports.getOverview =catchAsync(async(req,res,next)=>{
  // get all tourStats
  const tours = await Tour.find();

  res.status(200).render('overview',{
    title:'All tours',
    tours
  })
});


exports.getTour = catchAsync(async(req,res,next)=>{
// dont forget to populate reeviews. in the tour document. 
  const tour =await Tour.findOne ({ slug: req.params.tourSlug});
if(!tour){
//ATENTION TOO MUCH INFO to USER create a ERROR view and render that! 
  return next(new AppError('There is no tour with that name',404))
}

  res.status(200).render('tour',{
    title:tour.name,
    tour
  })
});

exports.getLoginForm = (req,res)=>{
  res.status(200).render('login',{
    title: 'Log into your account'
  });
};

