const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/keys').jwtSecret;
const AppError = require('../utils/appError');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify tokens
  try {
    // verify token
    const decoded = jwt.verify(token, jwtSecret);
  
    // verify user exists
    const user = await User.findById(decoded.id).select('name role');

    if(!user){
      return next(new AppError('User and token mismatch!', 401));
    }

    // check if user changed password after token issued
    if(user.passwordRecentlyChanged(decoded.iat) ) {
      return next( new AppError('Password was recently changed',401));
    }
 
    // data to send back in request from auth middleware
    req.user = user
    // grant access to protected route.
    next();

  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
