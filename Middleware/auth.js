const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../Model/UserModel')


// auth
exports.auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.body.token || req.header('Authorization').replace('Bearer ', '');


            if (!token) {
                return res.status(401).send({
                    success: false,
                    message: 'Token is missing'
                });
            }
            

        //    verify the token 
        try {
            const decode = await jwt.verify(token, process.env.JWT_SECRET)
            console.log(decode)
            req.user = decode
        } catch (error) {
            return res.status(401).send({
                success: false,
                message: 'Token is invalid'
            })
        }
        next()
    } catch (error) {
        return res.status(401).send({
            success: false,
            message: 'Something went wrong while validating token'
        })
    }
}

exports.isStudent = async (req, res, next) => {

    try {
        if (req.user.accountType !== 'Student') {
            return res.status(401).send({
                success: false,
                message: 'This is protected route for Student'
            })
        }
        next()

    } catch (error) {
        return res.status(401).send({
            success: false,
            message: 'User role cannot be varified, please try again'
        })
    }
}


exports.isInstructor = async (req, res, next) => {

    try {
        if (req.user.accountType !== 'Instructor') {
            return res.status(401).send({
                success: false,
                message: 'This is protected route for Instructor'
            })
        }
        next()

    } catch (error) {
        return res.status(401).send({
            success: false,
            message: 'User role cannot be varified, please try again'
        })
    }
}


exports.isAdmin = async (req, res, next) => {
    console.log(req.user.accounType)

    try {
        if (req.user.accountType !== 'Admin') {
            return res.status(401).send({
                success: false,
                message: 'This is protected route for Admin'
            })
        }
        next()

    } catch (error) {
        return res.status(401).send({
            success: false,
            message: 'User role cannot be varified, please try again'
        })
    }
}