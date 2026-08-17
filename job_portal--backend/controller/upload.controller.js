const { uploadToCloudinary } = require('../utils/cloudinary');
const HTTP_STATUS = require('../constants/httpStatusCodes');

const handleUpload = async (req, res) => {
    try {
        const { image, folder } = req.body;
        if (!image) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: "false",
                message: "No image payload provided."
            });
        }

        const url = await uploadToCloudinary(image, folder || 'job_portal');
        res.status(HTTP_STATUS.OK).json({
            status: "true",
            message: "Image uploaded successfully",
            url: url
        });
    } catch (err) {
        console.error('Cloudinary Upload Error:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "false",
            message: "Failed to upload image to Cloudinary",
            error: err.message
        });
    }
};

module.exports = { handleUpload };
