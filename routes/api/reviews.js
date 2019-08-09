const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const AppError = require('../../utils/appError');
const Review = require('../../models/Review');

// Name         :   Get All Reviews
// Type         :   GET
// Route        :   api/reviews
// Description  :   Route to get all the reviews
// Access       :   Anyone can see all the reviews
router.get('/', async (req, res, next)=> {
    try {
        const reviews = await Review.find()
            .populate({
                path:'tour',
                select:'name'
            })
            .populate('user',['name','photo']);

        res.json({
            status:'success',
            items: reviews.length,
            data: reviews
        })
    } catch (error) {
        console.error(error);
        next( new AppError('There was an error with this request',500));
    }

})

// Name         :   Get All Reviews for a specific tour
// Type         :   GET
// Route        :   api/reviews/:tourId
// Description  :   Route to get all the reviews for a specific tourId
// Access       :   Public
router.get('/:tourId', async (req, res, next) => {
    try {
        const reviews = await Review.find({tour: req.params.tourId});
        res.json({
            status:'success',
            items: reviews.length,
            data: reviews
        })
    } catch (error) {
        next( new AppError('${error}',500)); 
    }
})


// Name         :   Create new review
// Type         :   POST
// Route        :   api/reviews/:tour
// Description  :   User creates new review for specific tour id
// Access       :   Any one logged in can create a review
router.post('/:tourId', auth, async (req, res, next)=> {
    try {
        const { description, rating } = req.body;
        const review = await new Review({
            user: req.user.id,
            tour: req.params.tourId,
            description,
            rating
        })

        // save and return the review
        await review.save();
        res.json(review);
    } catch (error) {
        console.error(error);
        next( new AppError(`${error}`,500));  
    }
})


// Name         :   Update Review
// Type         :   PATCH
// Route        :   api/reviews/:reviewId
// Description  :   Update the review, note we are using reviewId
// Access       :   Only review author can update.
router.patch('/:reviewId', auth, async (req, res, next) => {
    try {
        const { rating, description } = req.body; 
        const review = await Review.findOneAndUpdate(
            {
                _id: req.params.reviewId,
                user: req.user.id.toString(),
            },
            {
                rating,
                description
            },
            {
                new:true,
                runValidators:true
            }
        )

        // return review
        res.json(review);
    } catch (error) {
        console.error(error);
        next (new AppError(`There was an error with request`,500));
    }
})

// Name         :   Delete Review
// Type         :   DELETE
// Route        :   api/reviews/:reviewId
// Description  :   DELETE the review, note we are using reviewId
// Access       :   Only review author can update.
        // router.delete('/:reviewId', auth, async (req, res, next) => {
        //     try {
        //         const { rating, description } = req.body;
        //         const review = await Review.findByIdAndUpdate(req.params.reviewId,{
        //             rating,
        //             description
        //         },
        //         {
        //             new:true,
        //             runValidators:true
        //         });
        //         // return review
        //         res.json(review);
        //     } catch (error) {
        //         console.error(error);
        //         next (new AppError(`${error}`,500));
        //     }
        // })

module.exports = router;