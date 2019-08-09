const jwtSecret = require('../../config/keys').jwtSecret
const JwtExpiresIn = require('../../config/keys').JwtExpiresIn
const jwt = require('jsonwebtoken');

module.exports = signToken = id => {
    return jwt.sign(
        {id},
        jwtSecret,
        {expiresIn: JwtExpiresIn}
    )
}