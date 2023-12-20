const Cloudinary = require('cloudinary').v2;

// Initialize Cloudinary
Cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

exports.imageUploadCloudinary = async (file, folder, height, quality) => {
    const options = { folder };

    if (height) {
        options.height = height;
    }

    if (quality) {
        options.quality = quality;
    }

    options.resource_type = 'auto';

    try {
        const result = await Cloudinary.uploader.upload(file.tempFilePath, options);
        return result;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error; // Rethrow the error to be handled by the calling function
    }
};
