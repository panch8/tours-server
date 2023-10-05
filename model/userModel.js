const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto  = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please tell us your name!'],
    },
    email:{
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowerCase: true,
        validate: [validator.isEmail, 'You must provide a valid Email address']
    },
    photo:String,
    role:{
        type:String,
        enum:['admin','user','guide','lead-guide'],
        default:'user'
    }
    ,
    password:{
        type: String,
        required: [true,'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm:{
        type: String,
        required: [true,'Please confirm your password'],
        validate: {
            //custom validator, THSI IS ONLY VALID with SAVE method or CREATE. atention when updating  
            validator: function(passC){  
               return passC === this.password;
            },
            message: 'Confirm password do not match with the provided one.'
        }

    },
    passwordChangedAt: Date,
    resetPassToken: String,
    resetPassTokenExpires: Date,
    active:{
        type:Boolean,
        default: true,
        select: false
    }
});

//pre hook to encryppt password
userSchema.pre('save', async function(next){
    //only run encryption when pass modified
    if(!this.isModified('password'))return next();
   
   const salt = bcrypt.genSaltSync(12);
   this.password = await bcrypt.hash(this.password,salt);
   // delete passwordConfirm after encryption   
   this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/,function(next){
    this.find({active: {$ne: false}})
    next();
})

//custom instance methods... available in every instance of the model.. in every document. 
userSchema.methods.correctPassword = async function(candidatePass, hashPass){
    return await bcrypt.compare(candidatePass, hashPass)
};


userSchema.methods.changePasswordAfter  = function(iat){
    if(this.passwordChangedAt){
        return parseInt(this.passwordChangedAt.getTime()/1000,10)>iat
    }
    return false
};

userSchema.methods.createResetPassToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPassToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    this.resetPassTokenExpires = Date.now() + 5 * 60 * 1000;

    return resetToken;
};



const User = mongoose.model('User', userSchema);

module.exports = User


