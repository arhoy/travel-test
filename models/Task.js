const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TaskSchema = new Schema({
    text: {
        type: String,
        require:true,
        minlength: 1,
        maxlength:255
    },
    completed : {
        type:Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'not completed'
    },
    task_created_date: {
        type: Date,
        default: Date.now
    },
    created_user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = Task = mongoose.model('tasks',TaskSchema);
