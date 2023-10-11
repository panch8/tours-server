const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userController');
const authController = require('../controllers/authController');


router.post('/sign-up',authController.signUp);
router.post('/login', authController.logIn);
router.get('/logout', authController.logOut);
router.post('/forgot-password', authController.forgotPass);
router.patch('/reset-password/:token', authController.resetPass);

//from now only logged
router.use(authController.protect);

router.route('/me', userControllers.getMe, userControllers.getUser)
router.patch('/update-password', authController.updatePassword);
router.patch('/updateMe', userControllers.updateMe);
router.delete('/deleteMe', userControllers.deleteMe);


router.use(authController.restrict('admin'));
//user routes
router.route('/')
.get(userControllers.getAllUsers)


router.route('/:id')
.get(userControllers.getUser)
.patch(userControllers.updateUser)
.delete(userControllers.deleteUser);



module.exports = router;