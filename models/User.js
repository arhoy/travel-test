const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength:8
    },
    user_created_date: {
        type: Date,
        default: Date.now
    },
    tasks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'tasks'
        }
    ] 
        
    
})

module.exports = User = mongoose.model('users',UserSchema);
