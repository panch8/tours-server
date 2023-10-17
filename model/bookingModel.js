const mongoose = require("mongoose");
const Tour = require("./tourModel");
const User  = require("./userModel");
const { ObjectId } = require("mongodb");


const bookingSchema = new mongoose.Schema({
  tour:{
    type: mongoose.Schema.ObjectId,
    ref:'Tour',
    required:[ true, 'Booking must belong to a tour']
  },
  user:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong a user']
  },
  paymentMethod:String,
  price:{
    type: Number,
    required: [true,'Booking must have a price']
  },
  createdAt: {
    type:Date,
    default: Date.now()
  },
  paid:{
    type:Boolean,
    default: true
  }

});

bookingSchema.pre(/^find/, function(next){
  this.populate('tour');
  this.populate('user');
  next();
})

const Booking = mongoose.model('booking',bookingSchema);

module.exports = Booking;