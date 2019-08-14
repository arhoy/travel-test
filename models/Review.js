const mongoose = require('mongoose');
const Tour = require('./Tour');
const Schema = mongoose.Schema;


const ReviewSchema = new Schema({
    description:{
        type:String,
        required: [true, 'Review must not be empty'],
        trim: true,
        maxlength: [300, 'Your review must be less than 300 characters'],
        minlength: [10, 'Your review must be 10 or more characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be one between 1 and 5 stars'],
        max: [5, 'Rating must be one between 1 and 5 stars']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required: [ true, 'Review must belong to a user' ]
    },
    tour: {
        type: Schema.Types.ObjectId,
        ref:'Tour',
        required: [ true, 'Review must belong to a tour' ]
    }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
}
)

// Calculate the average Ratings
ReviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {  
                _id: '$tour',
                numRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    await Tour.findByIdAndUpdate(tourId,{ 
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].numRatings
        })
}

// DOCUMENT MIDDLEWARE -- runs before .save() and .create() // pre save hooks
ReviewSchema.post('save', function() {
    // point to model that created the document
    this.constructor.calcAverageRatings(this.tour);
})

// Need to still recalculate the average ratings when updating or deleting a review.
// Since the Post Save hook only works on Save and Create
// findByIdAndUpate, findByIdAndDelete
ReviewSchema.post(/^findOneAnd/, async function(doc) {
    await doc.constructor.calcAverageRatings(doc.tour);
})

// No Duplicate reviews. One review per user for a given tour
ReviewSchema.index({tour: 1, user: 1}, {unique: true});

// Populate users info in the reviews 
ReviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select:'name photo'
    })
    next();
});

module.exports = Review = mongoose.model('Review', ReviewSchema);