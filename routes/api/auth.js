const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');

const { check, validationResult } = require('express-validator');
const signToken = require('../helpers/signToken');

const User = require('../../models/User');

// @route    GET api/auth
// @desc     Test route
// @access   Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// name         :   Login User
// Type         :   POST
// Route        :   api/auth
// Description  :   Log user in and send token
// Access       :   User must be registered. 
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
 
    try {
      
      let user = await User.findOne({ email }).select('+password +active');
   
      // user does not exist or password is not correct.
      if (!user || !(await user.checkPassword(password, user.password)) ) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      if(user.active === false) {
          return res.json({msg:'You account was inactivated, please go to /reactive to reactive your account.'})
      }

      // impliment jwt for accessing protected routes
      const token = signToken(user.id);
        // send back token
        res.json({token});

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// name         :   Login User
// Type         :   PATCH
// Route        :   api/auth/reactivate
// Description  :   Log user in and send token
// Access       :   User must be registered. 
router.post(
  '/reactivate',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
 
    try {
      
      let user = await User.findOne({ email }).select('+password +active');
    
      // user does not exist or password is not correct.
      if (!user || !(await user.checkPassword(password, user.password)) ) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      if(user.active !== false) {
          return res.json({msg:'Please got to login route. /login'})
      }
    
      // impliment jwt for accessing protected routes
      const token = signToken(user.id);

      user.active = true
      await user.save({ validateBeforeSave: false });
        // send back token
      res.json({token});

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
