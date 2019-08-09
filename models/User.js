const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // build in node module


const UserSchema = new Schema({
    name: {
        type: String,
        required: [, 'Name field is required!']
    },
    email:{
        type: String,
        required: [true, 'Please provide valid email!'],
        unique: true,
        validate: [ validator.isEmail, 'Please provide a valid email!' ]
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    passwordConfirm : {
        type: String,
       // required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords do not match'
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    user_created_date: {
        type: Date,
        default: Date.now
    },
    photo: {
        type: String
    },
    role: {
        type:String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    active:{
        type: Boolean,
        default:true,
        select:false
    }
});



// pre-save hook
UserSchema.pre('save', async function(next) {

    if(!this.isModified('password')) return next();

    // encrypt password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt);
        this.passwordConfirm = undefined;
        next();
})

UserSchema.pre('save', async function (next) {
    if(!this.isModified('password')  || this.isNew ) return next();

    this.passwordChangedAt = Date.now() - 2000;
    next();
})
// check password
UserSchema.methods.checkPassword = async function( inputPassword, userPassword ) {
    return await bcrypt.compare(inputPassword, userPassword);
}

// changed password
UserSchema.methods.passwordRecentlyChanged = function(JWTTimestamp) {
    if(this.passwordChangedAt){
        const passwordChangedAtTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        return passwordChangedAtTimeStamp >= JWTTimestamp;
    }
    return false;
}

// password reset
UserSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');


    this.passwordResetExpires = Date.now() + 10*(1000*60) // user has 10 minutes to reset password.

    return resetToken;
}

// query middleware 
    // UserSchema.pre(/^find/, function(next) {
    //     this.find({ active:{$ne:false} })
    //     next();
    // })



module.exports = User = mongoose.model('User',UserSchema);
