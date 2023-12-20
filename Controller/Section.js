const Section = require('../Model/SectionModel')
const Course = require('../Model/CourseModel')

exports.createSection = async (req, res) => {
    try {
        const { courseId, sectionName } = req.body;

        if (!courseId || !sectionName) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        const newSection = await Section.create({ sectionName });

        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            $push: {
                courseContent: newSection._id
            }
        }, { new: true })
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection"
                }
            });

        return res.status(200).json({
            success: true,
            message: 'Section created successfully',
            newSection,
            updatedCourse
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create Section',
            error: error.message,
        })
    }
}
exports.updateSection = async (req, res) => {
    try {
        const { sectionName, sectionId } = req.body;

        if (!sectionId || !sectionName) {
            return res.status(401).send({
                success: false,
                message: 'Please provide section ID and name for updating'
            });
        }

        // Find and update the section
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName: sectionName },
            { new: true } // Return the updated section
        );

        if (!updatedSection) {
            return res.status(404).send({
                success: false,
                message: 'No section found with the provided ID'
            });
        }

        // Update the section name in associated courses' courseContent array
        const updatedCourse = await Course.findOneAndUpdate(
            { 'courseContent._id': sectionId },
            { $set: { 'courseContent.$.sectionName': sectionName } },
            { new: true }
        );


        return res.status(200).json({
            success: true,
            message: 'Section updated successfully',
            updatedSection,
            updatedCourses
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update Section',
            error: error.message,
        });
    }
};


exports.deleteSection = async (req, res) => {
    try {
        const { sectionId } = req.params; // Assuming you get sectionId from the request parameters

        if (!sectionId) {
            return res.status(401).send({
                success: false,
                message: 'Please provide section ID for deletion'
            });
        }

        // Find and delete the section
        const deletedSection = await Section.findByIdAndDelete(sectionId);

        if (!deletedSection) {
            return res.status(404).send({
                success: false,
                message: 'No section found with the provided ID'
            });
        }

        // Remove the section ID from associated courses' courseContent array
        const updatedCourse = await Course.findOneAndUpdate(
            { 'courseContent': sectionId },
            { $pull: { 'courseContent': sectionId } },
            { new: true }
        );


        return res.status(200).json({
            success: true,
            message: 'Section deleted successfully',
            deletedSection,
            updatedCourses
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete Section',
            error: error.message,
        });
    }
};
