'use strict'

const Tour = require(`../model/tourModel`);
const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apiFeatures');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');


//HANDLERS//

//// ALIAS MIDDLEWARES ////
exports.aliasTopTours = (req,res,next)=>{
  req.query.limit = '5';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  req.query.sort = '-ratingsAverage, price';
  next();
};


exports.tourStats = async (req,res, next)=>{
   try {
    const stats = await Tour.aggregate([
        {
            $group: {
                _id:null,
                numTours: { $sum: 1},
                numRatings: {$sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage'},
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        results: stats.length,
        stats,
    })
   } catch (error) {
    res.status(404).json({
        status: 'fail',
        message:`${error}`
    })
   }
};

exports.monthlyPlan = catchAsync(async (req,res, next)=>{
     const year = req.params.year *1;
     const plan = await Tour.aggregate([
        {
            $unwind:"$startDates"
        },
        {
            $match:{
                startDates:{ 
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{
                _id: { $month: '$startDates'},
                numToursMonth: { $sum: 1},
                tours: { $push: '$name'}
            }
        },
        {
            $addFields:{
                month: '$_id'
            }
        },
        {
            $project: {_id:0}
        },
        {
            $sort: {
                numToursMonth: -1 
            }
        }
     ]);

     res.status(200).json({
         status: 'success',
         results: plan.length,
         plan,
     })

 });

 exports.getGeoWithin = catchAsync(async(req,res,next)=>{
    const { distance, latlng, unit } = req.params;
    const [ lat, lng ] = latlng.split(',');
    const radius = unit === 'mi'? distance/3963: distance/6371;
  if(!lat || !lng){
    return next(new AppError('Please provide latitude and longitud in the format lat,lng',404));
  };
    const tours =  await Tour.find({
        startLocation:{$geoWithin:{ $centerSphere: [[lng,lat],radius]}}
    })
    
    
    if(!tours){
        return next(new AppError('No tours found in this query', 404))
    }
    res.status(200).json({
        status:'success',
        results: tours.length,
        data:{
            data:tours
        }
    })
 });


 //'/distances/:latlng/unit/:unit'

 exports.getDistances = catchAsync(async(req,res,next)=>{
    const { latlng, unit } = req.params;
    const [ lat, lng ] = latlng.split(',');
    // const radius = unit === 'mi'? distance/3963: distance/6371;
  if(!lat || !lng){
    return next(new AppError('Please provide latitude and longitud in the format lat,lng',404));
  };
  const multiplier = unit === 'mi'? 0.000621371 : 0.0001; 
  const distances = await Tour.aggregate([
    {
        $geoNear:{
            distanceField: 'distance',
            distanceMultiplier: multiplier,
            near:{
                type:'Point',
                coordinates:[lng*1,lat*1]
            }
        }
    },
    {
        $project:{
            distance:1,
            name:1
        }
    }
  ]);

    res.status(200).json({
        status:'success',
        data:{
            data:distances
        }
    })
 });

/// update many photos. 
//not directly stored to disk because resize needed. 
const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb) =>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('Uploaded files must be Photos', 403));
    }
};
const upload = multer({
    storage: multerStorage, 
    fileFilter: multerFilter
});

exports.uploadFiles = upload.fields([
    {
        name: "imageCover",
        maxCount: 1
    },
    {
        name: "images",
        maxCount: 3
    }
]);

exports.resizeAndConfigPhotos = catchAsync(async(req,res,next)=>{
    if(!req.files.imageCover && !req.files.images)return next();
    //for writting in database
    req.body.imageCover = `tour-${req.params.id}-cover.jpeg`;
    req.body.images = [];

    if(req.files.imageCover){
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/tour-${req.params.id}-cover.jpeg`);

    };
    if(req.files.images){
       await Promise.all(req.files.images.map(async(el,i)=>{
            
           await sharp(el.buffer)
            .resize(2000,1333)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/tour-${req.params.id}-${i+1}.jpeg`);

            req.body.images.push(`tour-${req.params.id}-${i+1}.jpeg`)
        }))
    };
  
    next();
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour,{path: 'reviews'})
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);