const express = require('express');
const router = express.Router({ mergeParams: true});
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');


//every review route is protected but some of them are restricted.
router.use(authController.protect);
router.route('/')
.get(reviewController.getAllReviews)
.post(
    authController.restrict('user'), 
    reviewController.setTourUserIds,
    reviewController.createReview)


router.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrict('user', 'admin'), reviewController.updateReview)
.delete(authController.restrict('user', 'admin'),reviewController.deleteReview)


module.exports = router;
