const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');


exports.deleteOne = Model => catchAsync(async (req,res, next)=>{    
    const doc = await Model.findByIdAndDelete(req.params.id)
    
    if(!doc){
        return next(new AppError('No document found with that id', 404));
    }
    
    //send response
    res.status(204).json({
        status:"success",
        data:null
    });

});

exports.updateOne = Model => catchAsync(async (req,res, next)=>{
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id,req.body,{
        runValidators:true,
        new: true
    })

    if(!updatedDoc){
        return next(new AppError('No document found with that id', 404));
    }
    //SEND RESPONSE 
    res.status(200).json({
        status:"success",
        data:{
            data: updatedDoc
        }
    })
});

exports.createOne = Model => catchAsync(async (req,res, next)=>{
    const doc = await Model.create(req.body);

    if(!doc){
        return next(new AppError('No document found with that id', 404));
    }

    res.status(201).json({
        status: "success",
        data: {
           data: doc
        }
    });
});


exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next)=>{
    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);
    const doc = await query;
    
    //guard claus
   if(!doc){
       //calling next ( with error as argument)
       return next(new AppError("No doc found for tha id", 404));
   }
   
    res.status(200).json({
       status: "success",
       data: {
        data: doc
       },
     })
});

exports.getAll = Model => catchAsync(async (req,res, next)=>{
    //to allow nested GET reviews on tour (hack)
    let filter = {};
    if(req.params.tourId){filter = {tour: req.params.tourId}};
    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

    const docs = await features.query;

    res.status(200).json({
        status: 'success',
        results: docs.length,
        docs,
    })

});