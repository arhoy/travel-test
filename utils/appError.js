class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.showErrorInProd = true
  
        Error.captureStackTrace(this, AppError);
    }
}
module.exports = AppError;