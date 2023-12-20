
const { default: mongoose } = require('mongoose');
const { instance } = require('../Config/razorpay.js');
const Course = require('../Model/CourseModel.js');
const User = require('../Model/UserModel.js');
const mailSender = require('../utils/mailSender.js');
const crypto = require('crypto');

exports.capturePayment = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        // Validation -----------------------------
        if (!courseId) {
            return res.status(401).send({
                success: false,
                message: 'Please provide a valid course id',
            });
        }
        let course; // 
        try {
            course = await Course.findById(courseId)
            if (!course) {
                return res.status(401).send({
                    success: false,
                    message: 'Course is not present',
                });
            }
            const uid = mongoose.Types.ObjectId(userId)
            if (course.studentsEnrolled.includes(uid)) {
                return res.status(200).send({
                    success: false,
                    message: 'Student is already enrolled'
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).send({
                success: false,
                message: error.message,
            });
        }

        // Create Order ---------------------------------------------
        const amount = course.price
        const currency = 'INR'

        const options = {
            amount: amount * 100,
            currency,
            receipt: `Payment receipt ${Math.random(Date.now().toString)}`,
            notes: {
                courseId: courseId,
                userId: userId,
            },
        };

        try {
            // initiate the payment
            const paymentResponse = await instance.orders.create(options)
            console.log(paymentResponse)

            return res.status(200).send({
                success: true,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount
            })

        } catch (error) {
            console.log(error)
            res.json({
                success: false,
                message: 'Error in initiating payment order'
            })
        }


    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }

}

exports.verifySignature = async (req, res) => {
    try {
        const webHookSecret = '1234567890'
        const signature = req.headers['x-razorpay-signature']

        const shashum = crypto.createHmac('sha256', webHookSecret)
        shashum.update(JSON.stringify(req.body))
        const digest = shashum.digest('hex')

        if (signature === digest) {
            console.log('Payment is authorised')
        }

        const { courseId, userId } = req.body.payload.payment.entity.notes

        const enrolledCourse = await Course.findOneAndUpdate(
            { _id: courseId },
            { $push: { studentsEnrolled: userId } },
            { new: true }
        );
        if (!enrolledCourse) {
            return res.status(500).send({
                success: false,
                message: 'Course not found',
            });
        }
        const enrolledStudent = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { courses: courseId } },
            { new: true }
        );
        if (!enrolledStudent) {
            return res.status(500).send({
                success: false,
                message: 'Student not found',
            });
        }

        // Send enrollment email to the student
        const emailResponse = await mailSender(
            enrolledStudent.email,
            'Congratulation from StudyRelief',
            'Congratulation, you are onboarded into a new StudyRelief course'
        );


        res.status(200).send({
            success: true,
            message: 'Payment and enrollment completed successfully',
        });

    } catch (error) {
        console.error('Error verifying webhook signature:', error.message);
        return res.status(500).send('Error verifying webhook signature');
    }



}