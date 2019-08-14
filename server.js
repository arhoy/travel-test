//updated my packages!
const express = require('express');

const connectDB = require('./config/db');
const path = require('path');
const pug = require('pug');

const app = express();

app.set('view engine', 'pug');
app.set('views',path.join(__dirname,'views'));

// serving up the static files, not using anything in CLIENT REACT
app.use(express.static(path.join(__dirname,'public')));

const AppError = require('./utils/appError');
const globalErrorHandler = require('./routes/api/error');

// connect db
connectDB();

// Init MiddleWare for put and post requests.
app.use(express.json({extended:false}));



// Define the routes
app.use('/api/tasks', require('./routes/api/tasks'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/tours', require('./routes/api/tours'));
app.use('/api/reviews', require('./routes/api/reviews'));

// Rendering the pages
app.use('/', require('./routes/pages/views.js'));

// 404 route
app.all('*', ( req, res, next ) => {

  next(new AppError( `Requested route: ${req.originalUrl} not found!`, 404));
})

// ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));
  
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
  }
  
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


  // UNHANDLED REJECTIONS
  process.on('unhandledRejection', err => {
    console.log(err.name, err.message, 'Unhandled Rejection error!');
    process.exit(1);
  })