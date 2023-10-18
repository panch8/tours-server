const Tour = require('../model/tourModel');
const Booking = require('../model/bookingModel');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET);


module.exports.getCheckoutSession = catchAsync(async(req,res,next)=>{
  const tour = await Tour.findById(req.params.tourId);
  if(!tour) return next(new AppError('No tour with tha id', 404));
  try {
    const session = await stripe.checkout.sessions.create({
      success_url: `${req.protocol}://${req.get('host')}/my-tours`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      line_items: [
        {
          price_data:{
            currency: 'usd',
            product_data:{
              name:`${tour.name}`,
              description: `${tour.summary}`,
              images:[`https://fran-tours-54d8a602e684.herokuapp.com/img/tours/${tour.imageCover}`]
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
      client_reference_id: req.params.tourId,
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

// module.exports.createBookingCheckout = catchAsync(async(req,res,next)=>{
//   const { tour, user, price}= req.query;
//   if(!tour && !user && !price)return next();

//   await Booking.create({tour, user, price});

//   res.redirect(req.originalUrl.split('?')[0])
// });

const createBookingCheckout =async session =>{
  console.log(session);
  const tour = session.client_reference_id;
  const user = (await User.findOne({email:session.customer_email})).id;
  const price = session.line_items.price_data.unit_amount / 100;

  await Booking.create({tour, user, price});
};

module.exports.webhookCheckout = catchAsync(async(req,res,next)=>{
  let event = req.body;
  if(process.env.STRIPE_WEBHOOK_SECRET){
    const signature = req.headers['stripe-signature'];
    try {
      event = await stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (error) {
      console.log(`⚠️  Webhook signature verification failed.`, error.message);
      return res.sendStatus(400);
    }
  }
  if(event.type === 'webhook.checkout.completed'){

    await createBookingCheckout(event.data.object);
  }

  res.status(200).json({
    status: 'received'
  })
  next();
});

module.exports.getAllBookings = factory.getAll(Booking);

module.exports.createBooking = factory.createOne(Booking);
module.exports.getOneBooking = factory.getOne(Booking);
module.exports.updateBooking = factory.updateOne(Booking);
module.exports.deleteBooking = factory.deleteOne(Booking);


