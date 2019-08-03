const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');
const validator = require('validator');

const TourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'Tour name must be less than 40 characters'],
        minlength: [10, 'Tour name must be 10 or more characters']
    },
    slug: String,
    duration: {
        type: Number,
        required:[true, 'Tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour Must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
          values: ['easy', 'medium', 'difficult'],
          message: 'Difficulty is either: easy, medium, difficult'
        }
      },
      ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
      },
      ratingsQuantity: {
        type: Number,
        default: 0
      },
      price: {
        type: Number,
        required: [true, 'A tour must have a price']
      },
      priceDiscount: {
        type: Number,
        validate: {
          validator: function(val) {
            // this only points to current doc on NEW document creation
            return val < this.price;
          },
          message: 'Discount price ({VALUE}) should be below regular price'
        }
      },
      summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
      },
      description: {
        type: String,
        trim: true
      },
      imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
      },
      images: [String],
      createdAt: {
        type: Date,
        default: Date.now(),
        select: false
      },
      startDates: [Date],
      secretTour: {
        type: Boolean,
        default: false
      },
      startLocation: {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      },
      locations: [
        {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: [Number],
          address: String,
          description: String,
          day: Number
        }
      ],
      guides: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ],
      secretTour: {
        type: Boolean,
        default: false
      }
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}
);

TourSchema.virtual('durationWeeks').get( function(){
  return this.duration / 7 ;
} )

TourSchema.virtual('customerPrice').get( function() {
  return (this.price *1.07).toFixed(2);
} )

// DOCUMENT MIDDLEWARE -- runs before .save() and .create() // pre save hooks
TourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

// QUERY MIDDLEWARE
TourSchema.pre(/^find/, function(next) {
  this.find({ secretTour:{ $ne: true } })
  this.start = Date.now();
  next();
})


TourSchema.post(/^find/, function(doc, next) {
  console.log(`The query took ${Date.now() - this.start} ms to complete`)
  next();
})

//AGGREGATION MIDDLEWARE
TourSchema.pre(/^aggregate/, function(next) {
  this.pipeline().unshift( { $match: { secretTour: { $ne : true } } });
  next();
})
module.exports = Tour = mongoose.model('tours',TourSchema);