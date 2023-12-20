const RatingandReview = require('../Model/RatingReviewModel')
const Course = require('../Model/CourseModel')
const { default: mongoose } = require('mongoose')


exports.createRating = async (req, res) => {
    try {
        const userId = req.user.id // it gives string output
        const userIdObj = mongoose.Types.ObjectId(userId) // convert in object id
        const { rating, review, courseId } = req.body
        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: userIdObj,
        })

        if (!courseDetails) {
            return res.status(404).send({
                success: false,
                message: 'Student is not enrolled in the course'
            })
        }

        const alreadyReviewed = await RatingandReview.findOne({
            user: userIdObj,
            course: courseId
        })
        if (alreadyReviewed) {
            return res.status(403).send({
                success: false,
                message: 'Course is already reviewed'
            })
        }

        const createReviewRating = await RatingandReview.create({
            rating, review, course: courseId, user: userIdObj
        })

        const updateRatingReview = await Course.findByIdAndUpdate(
            { _id: courseId },
            { $push: { ratingAndReviews: courseDetails._id } },
            { new: true }
        )
        console.log(updateRatingReview)

        return res.status(200).json({
            success: true,
            message: "Rating and Review created Successfully",
            createReviewRating
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
            message: 'Failed in creating rating and review'
        })
    }
}

exports.getAverageRating = async (req, res) => {
    try {
        const courseId = req.body.courseId

        const result = await RatingandReview.aggregate([
            {
                $match: {
                    course: mongoose.Types.ObjectId(courseId)
                },
            },
            {
                $group: {
                    _id: null,
                    averageRatng: { $avg: '$rating' }
                }
            }
        ])

        if (result.length > 0) {

            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })

        }
        //if no rating/Review exist
        return res.status(200).json({
            success: true,
            message: 'Average Rating is 0, no ratings given till now',
            averageRating: 0,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingandReview.find({})
            .sort({ rating: 'desc' }) // this is descending order criteria
            .populate({
                path: 'user',
                select: firstName, lastName, email, image
            })
            .populate({
                path: 'course',
                select: 'courseName'
            })
            .exec()
        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
