const express = require('express');
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const gobalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
const limiter = rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message: "Too many requests from this IP, Try again later"
})
//global middleware

//rate limiter
app.use('/api',limiter);
// req data limit
app.use(express.json({limit: '10kb'}));
//http headers with helmet
app.use(helmet());
//test middleware
app.use((req,res,next)=>{
    req.time = new Date().toISOString();
    next();
});
//mongo data sanitization.. removes $ and dot. to prevent NOSQL injection.  
app.use(mongoSanitize());
// xss prevention with xss-clean prevents html injection. 
app.use(xss());

// parameter pollution prevention with hpp..  except the ones in the whitelist the requests wont admit duplicated fields. 
app.use(hpp({
    whitelist:[
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

//specific middleware
app.use('/api/v1/tours/', toursRouter);
app.use('/api/v1/users/', usersRouter);
app.use('/api/v1/reviews/', reviewRouter);

app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} in this server`, 404))
})
///global Error handler middleware
app.use(gobalErrorHandler);

module.exports = app;

