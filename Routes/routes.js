const express = require('express')
const router = express.Router()

// import controller
const { sendOTP, signUp, login, changepassword } = require('../Controller/Auth')
const { resetPassword, resetPasswordToken } = require('../Controller/ResetPassword')
// const {auth} = require('../Middleware/auth')


// profile
const { updateProfile, deleteAccount, getallUserDetails, updateDisplayPicture } = require('../Controller/Profile')


// course
const { getallCourseDetails, getallCourses, createCourse } = require('../Controller/Course')
const { categoryPageDetails, createCategory, getallCategory } = require('../Controller/Category')
const { createSection, updateSection, deleteSection } = require('../Controller/Section')
const { createSubSection } = require('../Controller/subSection')
const { createRating, getAllRating, getAverageRating } = require('../Controller/RatingandReview')
const { auth, isAdmin, isInstructor } = require('../Middleware/auth')

// auth routes ------------
router.post('/login', login)
router.post('/signup', signUp)
router.post('/sendotp', sendOTP)
router.post('/changepassword', auth, changepassword)
router.post('/reset-password-token', resetPasswordToken)
router.post('/reset-password', resetPassword)

// profile
router.put('/updateprofile', auth, updateProfile)
router.delete('/deleteaccount',auth, deleteAccount)
router.get('/getallUserdetails', auth, getallUserDetails)
router.post('/updatedisplaypicture', auth, updateDisplayPicture)

// Course
router.get('/getallcoursedetails', getallCourseDetails)
router.get('/getallcourses', getallCourses)
router.post('/createcourse', auth, isInstructor, createCourse);


// Category
router.get('/categorypagedetails', categoryPageDetails)
router.post('/createcategory', auth, isAdmin, createCategory)
router.get('/getallcategory', getallCategory)


// Section  
router.post('/createsection', auth, isInstructor, createSection)
router.put('/updatesection', auth, isInstructor, updateSection)
router.delete('/deletesection', auth, isInstructor, deleteSection)

// Sub Section
router.post('/createsubsection', auth, isInstructor, createSubSection)

router.post('/createrating', createRating)
router.get('/getallrating', getAllRating)
router.get('/getaveragerating', getAverageRating)

module.exports = router





