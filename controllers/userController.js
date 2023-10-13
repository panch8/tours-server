'use strict'
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

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

// const multerStorage = multer.diskStorage({
//     destination:(req, file,cb)=>{
//         cb(null,'./public/img/users')},
//     filename:(req,file,cb)=>{ 
//         cb(null,`user-${req.user.id}-${Date.now()}.jpg`)}
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('File must be an image',403),false)
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
    });


    //multer middleware
exports.uploadFile = upload.single('photo');


//sharp middleware
exports.reSizeConfigFile = (req,res,next)=>{
    if(!req.file)return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`)
    next();
};
 

exports.updateMe = catchAsync(async(req,res,next)=>{
      // send error if try to update password
      if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for updating password, please use /update-password',400))
      };
    const filteredObj = filterReqBody(req.body, 'name', 'email');
    if(req.file){filteredObj.photo = req.file.filename;}

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