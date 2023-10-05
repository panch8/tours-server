const Tour = require('./model/tourModel');
const fs = require('fs');
const User = require('./model/userModel');
const Review = require('./model/reviewModel');


const importData = async ()=>{
    try {
    const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours.json`));
    const users = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/users.json`));
    const reviews = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`));
    await Tour.create(tours);
    await User.create(users, {validateBeforeSave: false});
    await Review.create(reviews);
    console.log('Files uploaded seccessfully');
    process.exit();
    } catch (error) {
        console.log(error);
    }
};

const deleteData = async ()=>{
    try {
       await Tour.deleteMany();
       await User.deleteMany();
       await Review.deleteMany();
       console.log('data successfully deleted');
       process.exit();
    } catch (error) {
        console.log(error);
    }
}


if(process.argv[2]=== "--import"){
     importData();
     
}
if(process.argv[2] === "--delete"){
     deleteData();

}
