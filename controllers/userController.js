'use strict'
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterReqBody = (body, ...allowedKeys) =>{
    const newObj = {};
    Object.keys(body).forEach((el)=>{
        if(allowedKeys.includes(el)){
            newObj[el]= body[el];
        }
    })
    return newObj;
};
//USERS HANDLERS//
exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);


exports.updateMe = catchAsync(async(req,res,next)=>{
      // send error if try to update password
      if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for updating password, please use /update-password',400))
      };
    const filteredObj = filterReqBody(req.body, 'name', 'email')
    // update user data
    const updatedUser =await User.findByIdAndUpdate(req.user.id,filteredObj,{runValidators: true, new: true});
    res.status(200).json({
        status:'success',
        data:{
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active: false})

    res.status(204).json({
        status:'success',
        data: null
    })

});