const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const signToken = require('../helpers/signToken');

// MIDDLEWARE
const auth = require('../../middleware/auth');
const restrictTo = require('../../middleware/restrictTo');
const AppError = require('../../utils/appError.js');
const sendEmail = require('../../utils/email');
const filterObj = require('../helpers/filterObj');

// import the User Model
const User = require('../../models/User');


// Type         :   POST
// Route        :   api/users
// Description  :   Route to register a user. To create admin user, change in mongoose
// Access       :   Anyone can register.
router.post(
    '/',
    [
        check('name','Name is required').not().isEmpty(),
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email'),
        check('password','Please enter a password 6 characters or more')
                .isLength({min:6,max:25})
                .withMessage('Password must be between 6 and 25 characters!')
                // .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, 'i')
                // .withMessage('Password must include one lowercase character, one uppercase character, a number, and a special character.')
    ],
    async (req, res)=> {
      
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }

        const { name, email, password, passwordConfirm } = req.body;

        try {

            let user = await User.findOne({email}); 

            if(user){
                return res.status(400).json({errors: [{msg: 'This user/email already exists!'}] })
            }
         
            user = new User({
                name,
                email,
                password,
                passwordConfirm
            })
  
    
            // save user to db, check password in User.js model
            await user.save();
    
            // impliment jwt for accessing protected routes
            const token = signToken(user.id);
            // send back token
            res.json({token});
        
        } catch (error) {
            console.error('The error is ' , error.message)
            res.status(500).send('server error');
        }
    }
)

// Type         :   GET
// Route        :   api/users
// Description  :   Get all users from the database
// Access       :   Only admin user can do this
router.get('/', auth, restrictTo('admin','lead-guide'), async (req, res) => {
    try {
        const users = await User.find({active: {$ne:false}}).select('_id name email role');
        res.json(users);
    

    } catch (error) {
        console.error('There was an error', error);
        res.status(500).send('server error');
    }
});

// Name         :   Get me
// Type         :   GET
// Route        :   api/users/me
// Description  :   Get info for the current logged in user
// Access       :   Only logged in user can access his info
router.get('/me', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-id');
        // return current user info
        res.json(user)
    } catch (error) {
        console.error(error);
        return next( new AppError('Not able to get user', 500) );
    }
})

// Name         :   Forgot my password
// Type         :   POST
// Route        :   api/users/forgotPassword
// Description  :   User forgot their password
// Access       :   Send reset password to email
router.post('/forgotPassword', async (req, res, next) => {
    try {
     const { email } = req.body;
   
     const user = await User.findOne({email});
     if(!user) {
         return next( new AppError('There is no user with this email', 404) );
     }

     // generate random reset token
     const resetToken = user.createPasswordResetToken();

     await user.save({ validateBeforeSave: false });
     // send it to user email
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

        try {

            await sendEmail({
                email: user.email,
                subject: 'Your password reset token',
                message
            })
        
            res.json({ msg:`Reset email sent!`})
        } catch(error){
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({validateBeforeSave: false});
            return next( new AppError('There is an error sending this email, please try again later', 500) );
        }
 
    } catch (error) {
        console.error('There was an error', error);
        res.status(500).send('server error');
    }
})

// Name         :   Reset password
// Type         :   PATCH
// Route        :   api/users/resetPassword/:token
// Description  :   Link provided in user email, token encrypted. 
// Access       :   Link provided in user email
router.patch('/resetPassword/:token', async (req, res, next) => {
    try {
        // get the hashed password for the user
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        if(!user) {
            return next(new AppError('The reset token expired or is not valid anymore', 400));
        }

        const { password, passwordConfirm } = req.body; 
        user.password = password;
        user.passwordConfirm = passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        // save updated user into db
        await user.save();

        // log user in, send jwt
        const token = signToken(user.id);
        res.json({token});

    } catch (error) {
        console.error('There was an error', error);
        return next( new AppError('There was a server error',500))
    }

})

// Name         :   Update Password / Change Password
// Type         :   PATCH
// Route        :   api/users/updatePassword
// Description  :   User wants to update their password.
// Access       :   Must be logged in.
router.patch('/updatePassword', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');
        if(!user){
            return next( new AppError('User not found', 404));
        }
        // grab user input fields
        const { currentPassword, newPassword, newPasswordConfirm } = req.body;

        // compare password in database with the user input (current password)
        const passwordValid = await user.checkPassword(currentPassword,user.password);
        if(!passwordValid) return next (new AppError('Incorrect, please enter your current password',401));

        // update the user password
        user.password = newPassword;
        user.passwordConfirm = newPasswordConfirm;
        
        // check password is updated.
        if(user.password === currentPassword) return next( new AppError('Please enter a new password',400));

        // save in db
        await user.save();

        // impliment jwt for accessing protected routes
        const token = signToken(user.id);

        // send back token
        res.json({token});

    } catch (error) {
        console.error('There was an error', error);
        return next( new AppError('There was a server error',500))
    }
})

// Name         :   Update Me
// Type         :   PATCH
// Route        :   api/users/updateme
// Description  :   User wants to update their user inf
// Access       :   Must be logged in.
router.patch('/updateMe', auth, async (req, res, next) => {
    try {
        const {name, email, photo, password, passwordConfirm} = req.body;
        if( password || passwordConfirm ) return next( new AppError('Cannot update password here, please see /updateMyPassWord',400));

        // update user doc: user can only update name and email
        const filteredBody = filterObj(req.body,'name', 'email');


        const user = await User.findByIdAndUpdate(
            req.user.id,
            filteredBody,
            {
                new:true,
                runValidators:true
            }
        )
    
        res.json({user})
    } catch (error) {
        console.error('There was an error', error);
        return next( new AppError('There was a server error',500))
    }
})

// Name         :   inactivate account
// Type         :   
// Route        :   api/users/inactivateMe
// Description  :   User wants to inactivate their profile. Your profile will no longer be visible, but can always reactivate.
// Access       :   Must be logged in.
router.patch('/inactivateMe', auth, async (req, res, next) => {
    try {
         // 'Delete user from data by setting to inactive'
    
       const user =  await User.findByIdAndUpdate(
            req.user.id,
            {$set: {active:false} },
            {new: true }
        )
    res.json({msg:user})
    } catch (error) {
        return next( new AppError('User does not exist or has been deleted',400));
    }

})

router.delete('/deleteMe', auth, async (req, res) => {
    try {
        await User.findOneAndRemove({_id: req.user.id})
        res.json({msg: 'User has been successfully deleted!'});
    } catch (error) {
        return next( new AppError('User does not exist or has been deleted',400));
    }
})

module.exports = router;