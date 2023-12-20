const User = require('../Model/UserModel');
const OTP = require('../Model/OTPModel');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Profile = require('../Model/ProfileModel')
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const mailSender = require('../utils/mailSender')

// OTP generate karne wala function 
const generateUniqueOTP = () => {
    const otpLength = 6;
    const otpArray = [];

    for (let i = 0; i < otpLength; i++) {
        const digit = Math.floor(Math.random() * 10);
        otpArray.push(digit);
    }

    const otp = otpArray.join('');

    return otp;
};

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).send({
                success: false,
                message: 'User already registered'
            });
        }

        // generate OTP
        const otp = generateUniqueOTP();
        console.log('OTP generated: ', otp);

        // entry otp in database
        const otpPayload = { email, otp };
        const otpEntry = await OTP.create(otpPayload);
        console.log('OTP entry in database:', otpEntry);

        // Return success response
        return res.status(200).send({
            success: true,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        console.error('Error in sendOTP:', error);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

exports.signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp, contactNumber
        } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp || !accountType) {
            return res.status(403).json({
                success: false,
                message: "Fill all details"
            })
        }
        if (password !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "Password does not match"
            })
        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(401).json({
                success: false,
                message: "Email already exists"
            })
        }
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

        console.log("Otp in signup page is:", recentOtp[0]?.otp);

        if (recentOtp.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'OTP Not Found',
            });
        } else if (otp != recentOtp[0]?.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumer: null,
        });

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })
        console.log("Data created successfully")


        return res.status(200).json({
            success: true,
            message: 'User is registered Successfully',
            newUser,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registrered. Please try again",
        })
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email or Password empty',
            })
        }

        const user = await User.findOne({ email }).populate("additionalDetails").exec();
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Email not registered',
            })
        }
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                accountType : user.accountType,
                id : user._id
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            })
            user.token = token;
            user.password = undefined;


            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            return res.cookie("token", token, options).status(200).json({
                success: true,
                message: 'Logged in successfull',
                token,
                user
            })
        }

        else {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect',
            });
        }
    } catch (error) {
        console.error("Error occurred while updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        });
    }

}

// change password
exports.changepassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate that newPassword matches confirmPassword

        const user = await User.findOne({ _id: req.user.id }); // Assuming you have a middleware setting req.user

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found',
            });
        }

        if (await bcrypt.compare(oldPassword, user.password)) {
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
            await user.save();

            try {
                const emailResponse = await mailSender(
                    user.email,
                    passwordUpdated(
                         user.email,
                        `Password updated successfully for ${user.firstName} ${user.lastName}`
                    ), 
                    
                );
                console.log("Email sent successfully:", emailResponse.response);
            } catch (error) {
                // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
                console.error("Error occurred while sending email:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error occurred while sending email",
                    error: error.message,
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Password changed successfully',
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Old password is incorrect',
            });
        }
       
    } catch (error) {
        console.error("Error occurred while changing password:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while changing password",
            error: error.message,
        });
    }
};
