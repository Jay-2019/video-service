const { Video } = require('../models');
const handleError = require('../utils/errorHandler');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS_CODE, VIDEO_STATUS } = require('../constants/constants');
const { getVideoDuration, validateVideoDuration, validateVideoSize } = require('../utils/fileUtils');

const uploadVideo = async (req, res) => {
    try {
        const { file } = req;

        if (!file) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: 'No file uploaded' });
        }

        const duration = await getVideoDuration(file.path);

        const validationErrors = validateVideo(file, duration);
        if (validationErrors.length) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ errors: validationErrors });
        }

        const video = await Video.create({
          fileName: file.filename,
          filePath: file.path,
          mimeType: file.mimetype,
          size: file.size,
          duration,
          encoding: file.encoding,
          status: VIDEO_STATUS.ACTIVE
        });

        return res.status(HTTP_STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.VIDEO_UPLOADED, video });
    } catch (error) {
        handleError(res, error);
    }
};

const validateVideo = (file, duration) => {
    const errors = [];

    if (!validateVideoSize(file.size, process.env.MAX_VIDEO_FILE_SIZE)) {
        errors.push(ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    if (!validateVideoDuration(duration, process.env.MIN_VIDEO_DURATION, process.env.MAX_VIDEO_DURATION)) {
        errors.push(ERROR_MESSAGES.INVALID_DURATION);
    }
    
    return errors;
};

module.exports = {
    uploadVideo
};