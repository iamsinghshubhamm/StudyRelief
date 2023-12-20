const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender')

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    expiresAfterSeconds: 300, // Set expiration time to 5 minutes (300 seconds)
});

async function sendVerificationEmail(email, otp) {
    try {
          const mailResponse = await mailSender(email, 'Verification email from StudyRelief', otp)
          console.log('Email sent successfullt')
    } catch (error) {
        console.log('Error in getting OTP', error)
    }
}

OTPSchema.pre('save', async function(next){
    await sendVerificationEmail(this.email, this.otp)
    next()
})

module.exports = mongoose.model('OTP', OTPSchema);
