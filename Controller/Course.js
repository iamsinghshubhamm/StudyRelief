const Course = require('../Model/CourseModel')
const Category = require('../Model/CategoryModel')
const User = require('../Model/UserModel')
const { imageUploadCloudinary } = require('../utils/imageUpload')

exports.createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, whatWillYouLearn, price, category, tag } = req.body;   // taking all input from form data if you send a own simage too in database withh this 

        const thumbnail = req.files.thumbnailImage;
        console.log("Thumbnail in course creation is", thumbnail)
        if (!courseName || !courseDescription || !whatWillYouLearn || !price || !category || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        const instructorId = req.user.id

        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: 'Category Details not found',
            });
        }
        const thumbnailImage = await imageUploadCloudinary(thumbnail, process.env.FOLDER_NAME)
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            whatWillYouLearn,
            price,
            thumbnail: thumbnailImage.secure_url,
            category: categoryDetails._id,
            instructor: instructorId,
            tag,

        })
        await Category.findByIdAndUpdate(category, {
            $push: { courses: newCourse._id }
        })
        await User.findByIdAndUpdate(instructorId, {
            $push: {
                courses: newCourse._id
            }
        })

        return res.status(200).json({
            success: true,
            message: 'Course created successfully',
            newCourse
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create Course',
            error: error.message,
        })
    }
}

exports.getallCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnrolled: true,
        }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message: 'Data for all courses fetched successfully',
           allCourses
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to show all Courses',
            error: error.message,
        })
    }
}

// getCourseDetails

exports.getallCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        // find course details
        const courseDetails = await Course.findById({ _id: courseId })
            .populate(
                {
                    path: 'instructor',
                    populate: {
                        path: 'additionalDetails'
                    }

                }
            )
            .populate('category')
            .populate('ratingAndReviews')
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection'
                }
            })
            .exec()

        if (!courseDetails) {
            return res.status(400).send({
                success: false,
                message: `Could not find the course ${courseId}`
            })
        }

        return res.status(200).send({
            success: false,
            message: 'Course details fetched successfully',
            data: courseDetails,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: 'Error in getting course Details '
        })
    }
}
