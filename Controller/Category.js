const Category = require('../Model/CategoryModel')

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body

        if (!name || !description) {
            return res.status(401).json({
                success: false,
                message: "Tag name or description not available"
            })
        }

        const newCategory = await Category.create({
            name: name,
            description: description
        })

        if (!newCategory) {
            return res.status(401).json({
                success: false,
                message: "Error in pushing new category to db"
            })
        }

        return res.status(200).json({
            success: true,
            message: " Category created successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// get all category 

exports.getallCategory = async (req, res) => {
    try {
        const showAllCategory = await Category.find({}, { name: true, description: true })
        return res.status(200).json({
            success: true,
            message: "All Category received",
            data: showAllCategory
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.categoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: 'courses',
                match: { status: 'Published' },
                populate: 'ratingAndReviews'
            })
            .exec()

        if (!selectedCategory) {
            return res.status(403).send({
                success: false,
                message: 'Date not found'
            })
        }
        const differentCategories = await Category.find({ _id: { $ne: categoryId } })
            .populate('courses')
            .exec()

        const selectedCategoryCourses = selectedCategory.courses
        const sortedCourses = selectedCategoryCourses.sort((a, b) => {
            const studentsEnrolledA = a.studentsEnrolled ? a.studentsEnrolled.length : 0;
            const studentsEnrolledB = b.studentsEnrolled ? b.studentsEnrolled.length : 0;
            return studentsEnrolledB - studentsEnrolledA

        })
        const mostPopularCourses = sortedCourses.slice(0, 5)
        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
                mostPopularCourses
            },
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}