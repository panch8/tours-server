const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema =new mongoose.Schema ({
    review: {
        type:String,
        required: [true, 'Review can not be empty!']
        },
    rating: {
        type:Number,
        min: 1,
        max: 5,
        default:3    
    },
    createdAt: {
        type:Date,
        default: Date.now()
        },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Reviews must to have author ']
    }

},{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

// create a compuond index to prevent duplicated review of same user in same tour

reviewSchema.index({ tour:1, user:1},{ unique: true});
//creat a static methed to create agregation  pipeline in order to fetch every review. 


reviewSchema.statics.calcAvgAndQuantity = async function(tourId){
   const stats =await this.aggregate([
        {
            $match:{tour: tourId}
        },
        {
            $group:{
                _id:'tour',
                nRatings: {$sum:1},
                avgRating: {$avg:'$rating'}
            }
        }
    ]);
    if(stats.length>0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingQuantity: stats[0].nRatings,
            ratingsAverage: stats[0].avgRating
        })

    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingQuantity: 0,
            ratingsAverage: 4.5
        })
        
    }
};

// calling this post save hook for creating reviews. 
reviewSchema.post('save', function(){
    this.constructor.calcAvgAndQuantity(this.tour);
});
reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path:'tour',
    //     select: 'name'})
        this.populate({
        path:'user',
        select: 'name photo'
    })
    next();
});

// adding post hook for update and delete review 
reviewSchema.post(/^findOneAnd/,async function(review){
  if(review){
      await  review.constructor.calcAvgAndQuantity(review.tour);
  }
});

const Review = mongoose.model('Review', reviewSchema);


module.exports = Review;