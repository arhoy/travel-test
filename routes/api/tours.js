const express = require('express');

const router = express.Router();

const { check, validationResult } = require('express-validator');

// import middleware
const auth = require('../../middleware/auth');
const restrictTo = require('../../middleware/restrictTo');

// import models
const Tour = require('../../models/Tour');
const User = require('../../models/User');


// Async Trick to get rid of the try catch statements
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// Type         :   GET
// Route        :   /api/tours/top-5-tours
// Description  :   Get all top 5 tours
// Access       :   Public - anyone can access.
router.get('/top-5-tours', catchAsync (async (req, res, next) => {

        let query = Tour.find({
            ratingsAverage: {$gte: 4.8}
        });

        query.limit(5).sort('-ratingsAverage -price').select('name price difficulty summary ratingsAverage');
        const tour = await query;
        res.json(tour)
    
}));

// Name         :   Create a new Tour
// Type         :   POST
// Route        :   api/tours
// Description  :   Add a tour
// Access       :   Only admin user can add a tour. 
router.post('/', auth, restrictTo('admin','lead-guide'), async (req, res, next) => {
        try {
            // create new tour from the req.body.
            const tour = await Tour.create(req.body);
            res.json(tour);
        } catch (error) {
            next(error);
        }     
})

// name         :   `Delete a tour`
// Type         :   DELETE
// Route        :   /api/tours/:id
// Description  :   DELETE a tour from Tour model
// Access       :   Only admin user can add delete a tour. 
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if(!user.admin) {
            res.json({msg:'Access denied'});
        }

        // delete the tour
        const tour = await Tour.findByIdAndDelete(req.params.id);
        if(!tour) return res.json({msg: 'Tour not found!'});

        // return response
        res.json({msg:'Tour was deleted from the db'});
    } catch (error) {
        console.error('There as an error with the `Delete a tour` route ', error);
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
        res.status(400).json({msg: `There as an error with the get /api/tours route`,error})
    }
})

// Name             :   Tour By ID
// Type             :   GET
// Route            :   api/tours/:id
// Description      :   Get tour by id
// Access           :   PUBLIC anyone can see stats
router.get('/:id', async (req, res, next) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if(!tour) throw new AppError(`Could not find Tour Id: ${req.params.id}`, 404);
        res.json(tour);
    } catch (error) {
        next(error);
    }
})

// Type             :   GET
// Route            :   api/tours/tour-stats
// Description      :   Get the tours stats
// Access           :   PUBLIC anyone can see stats
router.get('/tour-stats', async (req,res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gt: 4.5 } }
            },
            {
                $group: { 
                    _id: {
                        d:'$difficulty',
                        // averageRatings: '$ratingsAverage'
                    },
                    numTours:       { $sum  :1 },
                    numRatings:     { $sum  :'$ratingsQuantity' },
                    avgRating:      { $avg  :'$ratingsAverage' },
                    avgPrice:       { $avg  :'$price' },
                    minPrice:       { $min  :'$price' },
                    maxPrice:       { $max  :'$price' }
                }
            },
            {
                $sort: {
                    avgPrice: 1
                }
            }
                

        ])
        res.json(stats);
    } catch (error) {
        res.status(500).json({msg:`Error in get request /tour-stats, ${error}`})
    }
})

// Type             :   GET
// Route            :   api/tours/monthly-plan/:year
// Description      :   Get the most popular tour months
// Access           :   PUBLIC anyone can see stats
router.get('/monthly-plan/:year', async (req,res) => {
    try {
        const year = req.params.year *1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: { 
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lt:  new Date(`${year+1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: {
                         $month: '$startDates'
                    },
                    countTours: {$sum: 1},
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { 
                    month: '$_id' 
                }
            },
            {
                $sort:{
                    month: 1
                }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $limit: 10
            },
            {
                $addFields: {
                    month: {
                        $let: {
                            vars: {
                                monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep','Oct','Nov','Dec']
                            },
                            in: {
                                $arrayElemAt: ['$$monthsInString', '$month']
                            }
                        }
                    }
                }
            }

        ]);

        res.json({dataItems: plan.length, data: plan });
    } catch (error) {
        
    }
})


module.exports = router;