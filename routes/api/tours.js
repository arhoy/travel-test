const express = require('express');

const router = express.Router();

const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');

const Tour = require('../../models/Tour');

// Type         :   GET
// Route        :   /api/tours/top-5-tours
// Description  :   Get all top 5 tours
// Access       :   Public - anyone can access.
router.get('/top-5-tours', async (req,res) => {
    try {
        let query = Tour.find({
            ratingsAverage: {$gte: 4.8}
        });
        query.limit(5).sort('-ratingsAverage -price').select('name price difficulty summary ratingsAverage');
        const tour = await query;
        res.json(tour)
    } catch (error) {
        res.status(400).json({msg: `There as an error with the /api/tours/top-5-tours route`,error})
    }
})


// Type         :   GET
// Route        :   /api/tours
// Description  :   Get all the tours
// Access       :   Public - anyone can access.
router.get('/', async (req, res) => {
    try {
        // BUILD QUERY
        const queryObj = {...req.query}
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach( el => delete queryObj[el] );

       // Greater and Less than :
            let queryString = JSON.stringify(queryObj);
            // replace gte, gt, lte, lt => $gte, $gt, $lte, $lt
            queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);


        let query = Tour.find(JSON.parse(queryString));

        // Sorting
        if( req.query.sort ) {
            const sortBy = req.query.sort.split(',').join(' ');
             query.sort(sortBy);
        } else {
            query.sort('createdAt');
        }
   
        // Field limits
        if( req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query.select(fields);
            
        } else {
            query.select('-__v');
        }

        // Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;

        const skip = (page - 1) * limit ;
        if( req.query.page ) {
            const numTours = await Tour.countDocuments();
            if( skip >= numTours) {
                throw new Error('This page does not exist!');
            }
        }

        query.skip(skip).limit(limit);

        // * FINALY EXECUTE QUERY *
        const tour = await query;
        // send back tours array.
        res.json(tour)


    } catch (error) {
        res.status(400).json({msg: `There as an error with the /api/tours route`,error})
    }
})


module.exports = router;