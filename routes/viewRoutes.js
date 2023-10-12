const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');


const router = express.Router();


router.get('/',authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:tourSlug',authController.isLoggedIn, viewController.getTour);

router.get('/login',authController.isLoggedIn, viewController.getLoginForm);
router.get('/me',authController.protect, viewController.getAccount);


//deprecated due to use of API call in client side.
// router.post('/change-user-data',authController.protect, viewController.submitUserData)

module.exports = router;
