const nodemailer = require('nodemailer');
const emailUsername = require('../config/keys').emailUsername;
const emailPassword = require('../config/keys').emailPassword;
const emailHost = require('../config/keys').emailHost;
const emailPort = require('../config/keys').emailPort;



const sendEmail = async options => {
    // Create transporter

    const transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        auth: {
            user: emailUsername,
            pass: emailPassword
        }
    })

    // define the email options
    const mailOptions = {
        from: 'Alex Hoy <hoy06.a@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }
  
    // send email
    await transporter.sendMail(mailOptions);
    
}

module.exports = sendEmail;