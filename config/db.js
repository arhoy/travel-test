const mongoose = require('mongoose');

// DB Config get DB keys
const db = require('./keys').mongoURI;

const connectDB = async () => {
    try {
        await mongoose.connect(db,{
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
    console.log('Mongo connected!');
    } catch (error) {
        console.error('There as a db connection error',error.message);
        process.exit(1);
    }
}

module.exports = connectDB;