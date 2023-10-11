const AppError = require("../utils/appError");

const handleCastErrorDB = err =>{
    const message = `Invalid ${err.path}: ${err.value}`;
   return new AppError(message, 400)
};

const handleDuplicatedfieldDB = err=>{
    const message = `Cannot create, the specified key: "${err.keyValue.name}" already exists`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err =>{
    let { errors } = err;
    errors = Object.values(errors).map(el=>el.message); 
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message,400);

};

const handleJWTError = () => new AppError('Error with credentials, please Login', 401);

const handleJWTExpiredError = () => new AppError('Token expired, please log in again', 401);

const sendErrorDev = (err,req, res)=>{
    //for API requests
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack
        })
        
    }

    // for rendered view requests. 
    console.error(err);
    return res.status(err.statusCode).render('error',{
        title: 'Something went wrong',
        msg: err.message
    })

};

const sendErrorProd = (err, req, res)=>{
    if(req.originalUrl.startsWith('/api')){
        // isOperational, trusted error send it to client
        if(err.isOperational){
        res.status(err.statusCode).json({
        status: err.status,
        message: err.message
        })

        }else { 
            //// unexpected error dont want to leak info to client. 
            // log error to console
            console.error('ERROR', err);
            // send generic message
            res.status(500).json({
                status: 'error',
                message: "something went very wrong!"
            })
        }
        return
}else{
    //rendered views response
    if(err.isOperational){
        res.status(err.statusCode).render('error',{
        title: 'Something went wrong',
        msg: err.message
        })

        }else { 
            //// unexpected error dont want to leak info to client. 
            // log error to console
            console.error('ERROR', err);
            // send generic message
            res.status(500).render('error',{
                title: 'something went very wrong!',
                msg: " Please try again or contact support"
            })
        }
}
};


module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,req,res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = {...err};
        error.message = err.message;
        
        if(err.name === 'CastError'){
           error = handleCastErrorDB(error);
        }
        if(err.code === 11000){
            error = handleDuplicatedfieldDB(error);
        }
        if(err.name === 'ValidationError'){
            error = handleValidationErrorDB(error);
        }
        if(err.name === 'JsonWebTokenError') error = handleJWTError();
        if(err.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error, req, res);
    }

    
};