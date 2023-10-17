const express = require('express');
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const gobalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

//settup view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//global middleware to serve static files. 

app.use(express.static(path.join(__dirname, 'public')));

//http headers with helmet
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
    directives: {
    defaultSrc: ["'self'", 'https:', 'http:','data:', 'ws:'],
    baseUri: ["'self'"],
    fontSrc: ["'self'", 'https:','http:', 'data:'],
    scriptSrc: [
    "'self'",
    'https:',
    'http:',
    'blob:'],
    styleSrc: ["'self'", 'https:', 'http:','unsafe-inline']
    }
    })
   );

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}


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
app.use(express.urlencoded({
    limit:'10kb',
    extended: true
}));
app.use(cookieParser());

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

// rendering basee template in root route.
app.use('/', viewRouter);
//specific middleware
app.use('/api/v1/tours/', toursRouter);
app.use('/api/v1/users/', usersRouter);
app.use('/api/v1/bookings/', bookingRouter);
app.use('/api/v1/reviews/', reviewRouter);

app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} in this server`, 404))
})
///global Error handler middleware
app.use(gobalErrorHandler);

module.exports = app;

