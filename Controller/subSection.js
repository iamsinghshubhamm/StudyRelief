const Section = require('../Model/SectionModel')
const SubSection = require('../Model/SubSectionModel')
const {imageUploadCloudinary} = require('../utils/imageUpload')

exports.createSubSection = async (req,res) =>{
    try {
        const {sectionId,title, timeDuration, description } = req.body;

        const video = req.files.video;

        if(!sectionId || !title || !description || !video) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        const uploadDetails = await imageUploadCloudinary(video, process.env.FOLDER_NAME);
      

        const newSubSection = await SubSection.create({
            title,
            timeDuration,
            description,
            videoUrl: uploadDetails.secure_url
        })

        const updatedSection = await Section.findByIdAndUpdate(sectionId, { $push: {subSection: newSubSection._id}},{new:true}).populate("subSection");

        return res.status(200).json({
            success:true,
            message:'SubSection created successfully',
            updatedSection
        })   
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create SubSection',
            error: error.message,
        })
    }
}