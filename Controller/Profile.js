const Profile = require('../Model/ProfileModel');
const User = require('../Model/UserModel');
const { imageUploadCloudinary } = require('../utils/imageUpload');
const Course = require('../Model/CourseModel');
const { default: mongoose } = require('mongoose');

exports.updateProfile = async (req, res) => {
    try {
        const { gender, dateOfBirth, about, contactNumber } = req.body;
        const userId = req.user.id;

        const userDetail = await User.findById(userId);

        if (!userDetail) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const profileId = userDetail.additionalDetails;

        if (!profileId) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found for the user',
            });
        }

        const profileDetails = await Profile.findById(profileId);

        if (!profileDetails) {
            return res.status(404).json({
                success: false,
                message: 'Profile details not found',
            });
        }

        profileDetails.dateOfBirth = dateOfBirth || null;
        profileDetails.about = about || null;
        profileDetails.gender = gender || null;
        profileDetails.contactNumber = contactNumber || null;

        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profileDetails
        });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};




// exports.deleteAccount = async (req, res) => {
//     try {
//         const userId = req.user.id;

//         // Authentication check
//         if (!userId) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Unauthorized access',
//             });
//         }

//         // Fetch user details
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found',
//             });
//         }

//         // Fetch associated data (e.g., profile, courses)
//         const profile = await Profile.findById(user.additionalDetails);

//         // Delete associated data
//         if (profile) {
//             await profile.remove();
//         }
//         // Delete user account
//         await user.remove();

//         return res.status(200).json({
//             success: true,
//             message: 'Account deleted successfully',
//         });
//     } catch (error) {
//         console.error('Error in deleteAccount:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Internal Server Error',
//             error: error.message,
//         });
//     }
// };

exports.deleteAccount = async (req, res) => {
    try {
      const id = req.user.id
      console.log(id)
      const user = await User.findById({ _id: id })
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }
      // Delete Assosiated Profile with the User
      await Profile.findByIdAndDelete({
        _id: new mongoose.Types.ObjectId(user.additionalDetails)
      })
      for (const courseId of user.courses) {
        await Course.findByIdAndUpdate(
          courseId,
          { $pull: { studentsEnroled: id } },
          { new: true }
        )
      }
      // Now Delete User
      await User.findByIdAndDelete({ _id: id })
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      })
      await CourseProgress.deleteMany({ userId: id })
    } catch (error) {
      console.log(error)
      res
        .status(500)
        .json({ success: false, message: "User Cannot be deleted successfully", error : error.message })
    }
  }
  

exports.getallUserDetails = async (req, res) => {
    try {
        const userId = req.user.id
        if (!userId) {
            return res.status(401).send({
                success: false,
                message: 'No user found '
            })
        }
        const userDetails = await User.findById(userId).populate('additionalDetails').exec()
        if (!userDetails) {
            return res.status(401).send({
                success: false,
                message: 'No userDetails found '
            })
        }
        return res.status(200).send({
            success: true,
            message: 'Fetched all user details successfully',
            userDetails
        })
    } catch (error) {
        console.error('Error in getting user details:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}


exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await imageUploadCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }