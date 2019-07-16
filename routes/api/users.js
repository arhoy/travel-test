const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// import the User Model
const User = require('../../models/User');


// route:       GET api/users
// description: Register a user
// access     : Public 
router.post(
    '/',
    [
        check('name','Name is required').not().isEmpty(),
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email'),
        check('password','Please enter a password 8 characters or more')
                .isLength({min:6,max:25})
                .withMessage('Password must be between 8 and 25 characters!')
                // .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, 'i')
                // .withMessage('Password must include one lowercase character, one uppercase character, a number, and a special character.')
    ],
    async (req,res)=> {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        const { name, email, password } = req.body;
        try {

            let user = await User.findOne({email}); 

            if(user){
                return res.status(400).json({errors: [{msg: 'This user/email already exists!'}] })
            }

            user = new User({
                name,
                email,
                password
            })

            // encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password,salt);

            // save user to db
            await user.save();

            // impliment jwt for accessing protected routes
            const payload = {
                user: {
                  id: user.id
                }
              };
        
              jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                  if (err) throw err;

                  // success! return token
                  res.json({ token });

                }
              );
        
        } catch (error) {
            res.status(500).send('server error');
        }
    }
)


module.exports = router;