const Tour = require('../model/tourModel');
const Booking = require('../model/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET);


module.exports.getCheckoutSession = catchAsync(async(req,res,next)=>{
  const tour = await Tour.findById(req.params.tourId);
  if(!tour) return next(new AppError('No tour with tha id', 404));
  try {
    const session = await stripe.checkout.sessions.create({
      success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      line_items: [
        {
          price_data:{
            currency: 'usd',
            product_data:{
              name:`${tour.name}`,
              description: `${tour.summary}`,
              images:['https://media.licdn.com/dms/image/D4D03AQGEasrLY_KboA/profile-displayphoto-shrink_800_800/0/1690651469840?e=1703116800&v=beta&t=L3LOXCcJCKbk9bZVlp8_Ar87sEeBvBwhO-8pd9VXK_U']
            },
            unit_amount: tour.price*100,
            tax_behavior: 'exclusive'
          },
          quantity:1,
          adjustable_quantity:{
            enabled: true,
            maximum: `${tour.maxGroupSize}`
          },  
        }
      ],
      mode: 'payment',
      client_reference_id: req.user.email,
      customer_email: req.user.email
    });
    
  res.status(200).json({
    status:"success",
    data: session
  })
    
  } catch (error) {
    return next(new AppError('smthing during checkout session, try again', 500));
  }



});

module.exports.createBookingCheckout = catchAsync(async(req,res,next)=>{
  const { tour, user, price}= req.query;
  if(!tour && !user && !price)return next();

  await Booking.create({tour, user, price});

  res.redirect(req.originalUrl.split('?')[0])
});

module.exports.getAllBookings = factory.getAll(Booking);

module.exports.createBooking = factory.createOne(Booking);
module.exports.getOneBooking = factory.getOne(Booking);
module.exports.updateBooking = factory.updateOne(Booking);
module.exports.deleteBooking = factory.deleteOne(Booking);


