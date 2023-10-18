const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const Booking = require('../model/bookingModel');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.alerts =  (req,res,next)=>{
  const { alert } = req.query;
  if(alert){
    res.locals.alert = alert;
  }
  next();
}

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

exports.getAccount = catchAsync( async(req,res,next)=>{
  const user =await User.findOne(req.user._id);

  
  if(!user){
    return next(new AppError('Requested user not found', 404));
  }

  res.status(200).render('account',{
    title: `${user.name}`,
    user
  })
});

exports.getMyTours = catchAsync(async(req,res,next)=>{
  //addd API FEATURES> 

  const bookings = await Booking.find({user:req.user.id});
  
  
  // VARIANT A:
  const tours = await Promise.all(bookings.map(async el=>{
    return await Tour.findById(el.tour)
  }))

  //VARIANT B:
  //atentions this variant does not display duplicated bookings. 

  // const toursIds = bookings.map(el => el.tour);
  // const tours = await Tour.find({_id:{$in: toursIds}})

  res.status(200).render('overview',{
    title: 'My booked tours',
    tours
  })
});


exports.getSubmitNewPassForm = (req,res,next)=>{
  const token = req.params.resetToken
  // const resetURL = `${req.protocol}://${req.get('host')}/${req.baseUrl}/reset-password/${resetToken}`;
  res.status(200).render('submitNewPass',{
    title: "Submit New Password",
    token
  })
};


///server side exmple of updating data... DEPRECATED
// exports.submitUserData = catchAsync(async(req,res,next)=>{
//   console.log(req.user);
//   const updatedUser = await User.findByIdAndUpdate(req.user._id,{
//     name:req.body.name,
//     email:req.body.email
//     },{ 
//     new: true,
//     runValidators: true
//   })
//   if(updatedUser){
//     res.status(200).render('account',{
//       title: updatedUser.name,
//       user: updatedUser
//     })
//   }else{
//     return next(new AppError('Something went wrong pease try again.',400))}
// });