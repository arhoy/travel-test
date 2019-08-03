const AppError = require('../../utils/appError');

const handleCastErrorDb = err => {
    const message = `Invalid ${err.path} for ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicatesError = err => {
    let value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    value = value.replace(/\\/g, " ")
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationError = err => {
    const message = err.message;
    return new AppError(message, 400);

}

module.exports = (err,req,res,next) => {

    err.statusCode = err.statusCode || 500;

    // DEVELOPMENT ERRORS
    if(process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            name: err.name,
            msg: err.message,
            stack: err.stack
        })
    } else { 
    // PRODUCTION ERRORS
  
        // console.error('There was a serious error ', err);
            let error = { ...err };
            error.message = err.message;


            if (error.name === 'CastError') error = handleCastErrorDb(error);
            if(error.code === 11000) error = handleDuplicatesError(error);
            if( error.name === 'ValidationError') error = handleValidationError(error);

        
            res.status(err.statusCode).json({
                msg: error.showErrorInProd ?  error.message : 'Error with the request!'
            })
        
    }    
}
