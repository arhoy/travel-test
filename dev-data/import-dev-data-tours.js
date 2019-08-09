
const mongoose = require('mongoose');

// to read the json file tours.json
const fs = require('fs')
// DB Config get DB keys
const db = require('../config/keys').mongoURI;

// the Tour model
const Tour = require('../models/Tour');

const connectDB = async () => {
    try {
        await mongoose.connect(db,{
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
    console.log('Mongo connected!: This is the import data file');
    } catch (error) {
        console.error('There as a db connection error: This is the import data file',error.message);
        process.exit(1);
    }
}

connectDB();

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync('dev-data/tours.json','utf-8'));

// IMPORT DATA INTO DB
    // will import an array of json objects and store to the Tour db
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('data load success!');
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

// DELETE ALL THE DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('All documents was deleted');
    } catch (error) {
        console.log(error)
    }
    process.exit();
}

// simple command line run this file only using: node dev-data/import-dev-data-tours with flag --import, --delete. see below
if(process.argv[2] === '--import'){
    importData()
}

if(process.argv[2] === '--delete'){
    deleteData();
}

console.log(process.argv)