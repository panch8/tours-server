const express = require('express');

const tourControllers = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();


//tour routes
//every GET verb is urrently available, but other verbs are actually protected and restrictered.
router.route('/get-top5-cheap').get(tourControllers.aliasTopTours, tourControllers.getAllTours);
router.route('/tour-stats').get(tourControllers.tourStats);

//nested route for highly referenced fields.
//already protected in review router.
router.use('/:tourId/reviews', reviewRouter);

router.route('/monthly-plan/:year')
.get(authController.protect, 
    authController.restrict('guide','lead-guide','admin'), 
    tourControllers.monthlyPlan);

router.route('/tours-within/:distance/centre/:latlng/unit/:unit')
.get(tourControllers.getGeoWithin);

router.route('/distances/:latlng/unit/:unit')
.get(tourControllers.getDistances);

router.route('/')
.get(tourControllers.getAllTours)
.post(authController.protect, 
      authController.restrict('admin','lead-guide'), 
      tourControllers.createTour);

router.route('/:id')
.get(tourControllers.getTour)
.patch(authController.protect,  
       authController.restrict('admin','lead-guide'),
       tourControllers.uploadFiles,
       tourControllers.resizeAndConfigPhotos, 
       tourControllers.updateTour)
.delete(
    authController.protect, 
    authController.restrict('admin','lead-guide'), 
    tourControllers.deleteTour);

module.exports = router;