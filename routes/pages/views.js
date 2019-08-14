const express = require('express');
const router = express.Router();

const Tour = require('../../models/Tour');
const loginAction = require('../api/auth')

// name         :   Home Page
// Type         :   GET
// Route        :   /
// Description  :   This is the Natours home page
// Access       :   Public
  router.get('/', async (req, res) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
      title: 'All Tours',
      tours
  
    });
  })

// name         :   Specific Tour Page
// Type         :   GET
// Route        :   /tour/:slug
// Description  :   This is the Natours home page
// Access       :   Public
  router.get('/tour/:slug', async ( req, res ) => {
    const slug = req.params.slug;
    const tour = await Tour.findOne({ slug })
        .populate('reviews')
        .populate('guides',['name','guide','email','role','photo'])

    res.status(200).render('tour', {
      title: slug,
      tour
    })
  })

  // name       :   Login Page
// Type         :   GET
// Route        :   /login
// Description  :   Render the login page
// Access       :   Public
router.get('/login', async ( req, res ) => {


  res.status(200).render('login', {
    title: 'Login Page'
  })
})

module.exports = router;