const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true
    },
    courseDescription: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    whatYouWillLearn: {
        type: String
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section',
        }
    ],
    tag: {
        type: [String],
        required : true
    },
    price : {
        type : String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    thumbnail : {
        type : String,
        required : true
    },
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }],
    ratingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rating',
        }
    ],
    instructions : {
        type : String
    },
    status : {
        type : String,
        enum : ['Drafts', 'Published']
    }

})

module.exports = mongoose.model('Course', courseSchema)