const mongoose = require('mongoose');
require('dotenv').config({path:`${__dirname}/../config.env`});

const DB = process.env.DB_HOST.replace('<password>',process.env.DB_PASSWORD);

mongoose.connect(DB).then(()=>{
    console.log('DB connected succesfully');
});


const tourSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,  "Tour must have a name"],
        unique:true,
       
    },
    ratingsAverage: {
        type: Number,
        max: [5,'Max value should be below 5'],
        min:[1,'Min value should be above 1.0'],
        set: val=> Math.round(val *10)/10 //round value to just one decimal   
     },
    ratingQuantity: {
        type:Number,
        default: 0
    },
    duration: Number,
    price: {
        type: Number,
        required: [true, "Tour must have a price"]
    },
    maxGroupSize:Number,
    difficulty:String,
    summary:{
        type:String, 
        required: [true, "Tour must have a summary"]},
    description:String,
    imageCover: {
        type: String,
        required: [true, "Tour must have a cover photo"]
    },
    images:[String],
    createdAt:{
        type:Date,
        default: Date.now(),
        select: false // this is to hide information driectly from schema
    },
    startDates:[Date],
    // start:{
    //     type: Number,
    //     default:0
    // },
    secretTour: {
        type:Boolean,
        default: false
    },
    startLocation:{
        type:{
            type:String,
            default: 'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address: String,
        description: String
    },
    locations: [
        {
            type:{
                type:String,
                default: 'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address: String,
            description: String 
        }
    ],
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
})

/// Virtual properties/// 
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/ 7;
});

//// Virtual Populate.. to avoid child referencing of the reviews! 
tourSchema.virtual('reviews',{
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',   
})

/// Document Middleware /// works for save() and create() methods
// has acess to the object before creation.
//documennt middleware to embed a document inside anotherone
// tourSchema.pre('save',async function(next){
//     const guidePromises = this.guides.map(async (id)=>{
//         return await User.findById(id)
//     })
//     this.guides = await Promise.all(guidePromises);
//     next();
// })



/////// PRE SAVE //////
// tourSchema.pre('save', function(){
//     this.start = Date.now()
//     console.log(this);
// })

/////// POST SAVE //////
// tourSchema.post('save',function(doc,next){
//     console.log(`Time from pre to post methods is: ${this.start- Date.now()}`)
// })

/// query middleware/// works before and after query methods. like find. 

/////pre find hoooks has access to the query itself before excecution

tourSchema.pre(/^find/, function(next){
    //find only public tours
    this.find({secretTour: { $ne: true}});
    next();
});

//prequery method to populate document with references. 

tourSchema.pre(/^find/,function(next){
    //populate every find method with the references
    this.populate({
        path:'guides',
        select: 'name email'});
    next();
})

//// POSt find hook has acces to the document itself. 


//to enhance a search create indexes, but atention they consume lots of resources and space. 

tourSchema.index({ price: 1, ratingsAverage: -1});
tourSchema.index({ startLocation:'2dsphere'});

const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour 

