'use strict'

const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt  = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');




const signToken = id => jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES});

const createSendToken = (user, statusCode, res) =>{
  const token = signToken(user._id);
  const cookieOpt = {
    expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000), 
    httpOnly: true
  };
  if(process.env.NODE_ENV === 'production'){
    cookieOpt.secure = true
  };

  res.cookie('jwt',token,cookieOpt);

  res.status(statusCode).json({
      status: 'success'
  })
};

exports.protect = catchAsync(async(req,res,next)=>{
  //protected route, only logged users. 
  //check if token exist
  let token;

  //check cookies with cookie parser.
  if(!token){
    if(req.cookies && req.cookies.jwt){
      token = req.cookies.jwt;
    }
  }

  //////BEARER TOKEN AUTHORIZATIOON LOGIC
  if(!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
  }
  if(!token){
    //////// cookie AUTHORIZATION LOGIC
    if(req.headers.cookie && req.headers.cookie.startsWith('jwt')){
      token = req.headers.cookie.split('=')[1];
    }
  }

  if(!token){
    return next(new AppError('Authorization token not found, Please login.', 400))
  }

  if(token === 'LoggedOut'){
    return next(new AppError('Please login.', 403))
  };
  //verify token integrity
  const payload = jwt.verify(token,process.env.JWT_SECRET);

  //check if user still exist
  const currentUser = await User.findById(payload.id);
  if(!currentUser){
    return next(new AppError('User does not exist', 401))
  }

  // check if password hasn't been changed since token was signed
 if(await currentUser.changePasswordAfter(payload.iat)){
  return next(new AppError('Password has been changed please login again',401))
 }
 req.user = currentUser;
 res.locals.user = currentUser;
  next()
});

exports.isLoggedIn = async(req,res,next)=>{
  //check if token exist only in cookies. OINLY FOR RENDER VIEWS
  let token;
//////// cookie AUTHORIZATION LOGIC
  if(req.headers.cookie && req.headers.cookie.startsWith('jwt')){
      token = req.headers.cookie.split('=')[1];
    }
  //check cookies with cookie parser.
  if(!token){
    if(req.cookies && req.cookies.jwt){
      token = req.cookies.jwt;
    }
  }

  if(!token){
    return next();
  }
  try {
      //verify token integrity
    const payload = jwt.verify(token,process.env.JWT_SECRET);

    //check if user still exist
    const currentUser = await User.findById(payload.id);
    if(!currentUser){
    return next();
    }

      // check if password hasn't been changed since token was signed
    if(await currentUser.changePasswordAfter(payload.iat)){
      return next();
    }
    res.locals.user = currentUser;
      next()
  } catch (error) {
    next()
  }
  
};


exports.restrict = (...roles)=>{
  return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
      return next(new AppError('You do not have permissions to make this request', 403))
    }
    next();
  }
}

exports.signUp = catchAsync(async (req,res,next)=>{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email, 
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser,201,res);
     
});


exports.logIn = catchAsync(async (req,res,next)=>{
    const { email, password } =req.body;
    //check if  fields exist
  if(!email || !password){
    return next(new AppError('Please provide email and password', 400));
  }

  // check if user exist and password is correct
  const user = await User.findOne({email}).select('+password');
  // const correct = await user.correctPassword(password, user.password);

  if(!user || !(await user.correctPassword(password, user.password))){
      return next(new AppError('The provided credentials are not correct, try again', 401))
  }else{
    createSendToken(user,200,res);  
  }
});

exports.logOut = (req,res)=>{
 
  const cookieOpt = {
    expires: new Date(Date.now()+ 6000), 
    httpOnly: true
  };
 

  res.cookie('jwt','LoggedOut',cookieOpt);
  res.status(200).json({
    status: 'success'
  })

};

exports.forgotPass = catchAsync(async(req,res,next) =>{
    const email = req.body.email;
    let currentUser = await User.findOne({email});
    if(!currentUser){
      return next(new AppError('The requested email does not exit, Please sign up',404))
    };
    const resetToken = currentUser.createResetPassToken();
    await currentUser.save({validateBeforeSave: false});

    //email reset token to user. 
    const resetURL = `${req.protocol}://${req.get('host')}/${req.baseUrl}/reset-password/${resetToken}`;

    const mail = {
      email,
      subject: "Your Natours Reset Password Action",
      message: `Dear costumer, we've received your request to reset your password, This is the reset URl please send your nww password among this URL ${resetURL}`
    };

    try {
      await sendEmail(mail);
      res.status(200).json({
        status:"success"
        
      })
      
    } catch (error) {
      currentUser.resetPassToken = undefined;
      currentUser.resetPassTokenExpires = undefined;
      
      await currentUser.save({validateBeforeSave: false});
      return next(new AppError(`something wnet wrong while sending email ${error}`,500))
    }



});

exports.resetPass = catchAsync(async(req,res,next)=>{
  const { token } = req.params;
  const newPassword = req.body.password;
  
  if(!token){
    return next(new AppError('Bad request no token submitted',400))
  };

  const hashedToken = crypto
  .createHash('sha256')
  .update(token)
  .digest('hex');
// find user by token

const currentUser = await User.findOne({
  resetPassToken: hashedToken,
  resetPassTokenExpires: {$gt: Date.now()}});


  // const currentUser = await User.findOne({email:req.body.email});

  if(!currentUser){
    return next(new AppError('Bad token or expired one, please try again',404))
  };

  currentUser.password = newPassword;
  currentUser.passwordConfirm = req.body.passwordConfirm;
  currentUser.resetPassToken = undefined;
  currentUser.resetPassTokenExpires = undefined;
 

  await currentUser.save();

  createSendToken(currentUser,200,res);

});


exports.updatePassword = catchAsync(async(req,res,next)=>{
  //get user from the collection
  //add protect middleware fn to route
  const currentUser = await User.findById(req.user.id).select('+password');

  // check if posted password is correct
  if(!(await currentUser.correctPassword(req.body.password,currentUser.password))){
    return next(new AppError('Submitted passsword is not correct', 401))
  };
  
  // if so update password
  currentUser.password = req.body.newPassword;
  currentUser.passwordConfirm = req.body.newPasswordConfirm;
  

  await currentUser.save();
  //login user with new JWT
  createSendToken(currentUser,200,res);
  
});