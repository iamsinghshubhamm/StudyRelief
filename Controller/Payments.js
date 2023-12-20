const { instance } = require('../Config/razorpay.js');
const Course = require('../Model/CourseModel.js');
const User = require('../Model/UserModel.js');
const mailSender = require('../utils/mailSender.js');
const crypto = require('crypto');

exports.capturePayment = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        // Validation
        if (!courseId) {
            return res.status(401).send({
                success: false,
                message: 'Please provide a valid course id',
            });
        }

        // Check if the student is already enrolled
        const uid = new mongoose.Types.ObjectId(userId);
        if (Course.studentsEnrolled.includes(uid)) {
            return res.status(200).send({
                success: false,
                message: 'Student is already enrolled',
            });
        }

        // Fetch course details
        let course;
        try {
            course = await Course.findById(courseId);
            if (!course) {
                return res.status(401).send({
                    success: false,
                    message: 'Course is not present',
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                success: false,
                message: error.message,
            });
        }

        const amount = course.price;
        const currency = 'INR';

        const options = {
            amount: amount * 100,
            currency,
            receipt: Math.random(Date.now().toString),
            notes: {
                courseId: courseId,
                userId: userId,
            },
        };

        try {
            // Intiate payment using Razorpay
            const paymentResponse = instance.orders.create(options);

            res.status(200).send({
                success: true,
                message: 'Payment created successfully',
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                success: false,
                message: 'Could not initiate order',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

// Verify signature of Razorpay and server
exports.verifySignature = async (req, res) => {
    const webHookSecret = '12345678';
    const signature = req.headers['x-razorpay-signature'];

    try {
        // Verify the webhook signature using Razorpay SDK
        const isValidSignature = instance.webhook.verifySignature(
            req.rawBody, // rawBody contains the request body
            signature,
            webHookSecret
        );

        if (isValidSignature) {
            // Signature is valid
            console.log('Webhook signature verified successfully');
        } else {
            // Signature is invalid
            console.log('Webhook signature verification failed');
            return res.status(400).send('Webhook signature verification failed');
        }

        // Extract courseId and userId from webhook payload
        const { courseId, userId } = req.body.payload.payment.entity.notes;

        // Enroll the user in the course
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

        // Update user's enrolled courses
        const enrolledStudent = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { courses: courseId } },
            { new: true }
        );

        // Send enrollment email to the student
        const emailResponse = await mailSender(
            enrolledStudent.email,
            'Congratulation from StudyRelief',
            'Congratulation, you are onboarded into a new StudyRelief course'
        );

        console.log(enrolledCourse);
        console.log(enrolledStudent);

        res.status(200).send({
            success: true,
            message: 'Payment and enrollment completed successfully',
        });
    } catch (error) {
        console.error('Error verifying webhook signature:', error.message);
        return res.status(500).send('Error verifying webhook signature');
    }
};
