const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(authController.protect);

router.route('/checkout-session/:tourId')
.get(bookingController.getCheckoutSession);

router.use(authController.restrict('admin', 'lead-guide'))

router.route('/')
.get(bookingController.getAllBookings)
.post(bookingController.createBooking);

router.route('/:id')
.get(bookingController.getOneBooking)
.patch(bookingController.updateBooking)
.delete(bookingController.deleteBooking)


module.exports = router;