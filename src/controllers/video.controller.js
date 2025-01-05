const { Video } = require('../models');
const path = require('path');
const fs = require('fs');
const handleError = require('../utils/errorHandler');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS_CODE, VIDEO_STATUS } = require('../constants/constants');
const { getVideoDuration, validateVideoDuration, validateVideoSize } = require('../utils/fileUtils');
const { trimVideo, mergeVideos } = require('../services/video.service');

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

const trimVideoClip = async (req, res) => {
    try {
        const { videoId, startTime, endTime } = req.body;

        if (!videoId || startTime === undefined || endTime === undefined) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: 'videoId, startTime, and endTime are required fields.' });
        }

        if (isNaN(Number(startTime)) || isNaN(Number(endTime))) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: 'startTime and endTime must be valid numbers.' });
        }

        const video = await Video.findOne({ where: { id: videoId } });
        if (!video) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ error: ERROR_MESSAGES.VIDEO_NOT_FOUND });
        }

        if (startTime >= endTime || startTime < 0 || endTime > video.duration) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: `startTime must be less than endTime. | startTime must be greater than or equal to 0. |  endTime must be less than or equal to the video duration (${video.duration} seconds).` });
        }

        const trimmedDuration = endTime - startTime;
        const minimumVideoDuration = process.env.MIN_VIDEO_DURATION;
        if (trimmedDuration < minimumVideoDuration) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: `Trimmed duration (${trimmedDuration} seconds) is less than the minimum allowed duration (${minimumVideoDuration} seconds).` });
        }

        const outputPath = path.join(__dirname, '../../assets/videos', `trimmed-${Date.now()}-${video.fileName}`);
        await trimVideo(video.filePath, startTime, endTime, outputPath);

        const newDuration = await getVideoDuration(outputPath);
        const newSize = fs.statSync(outputPath).size;

        const trimmedVideo = await Video.create({
            fileName: path.basename(outputPath),
            filePath: outputPath,
            mimeType: video.mimeType,
            size: newSize,
            duration: newDuration,
            encoding: video.encoding,
            status: VIDEO_STATUS.ACTIVE
        });

        return res.status(HTTP_STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.VIDEO_TRIMMED, video: trimmedVideo });
    } catch (error) {
        handleError(res, error);
    }
};

const mergeVideoClips = async (req, res) => {
    try {
        const { videoIds, outputFileName } = req.body;

        if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: ERROR_MESSAGES.INVALID_VIDEO_IDS });
        }

        if (videoIds.length < 2) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: ERROR_MESSAGES.MINIMUM_VIDEO_IDS_REQUIRED });
        }

        if (!outputFileName) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: ERROR_MESSAGES.OUTPUT_FILE_NAME_REQUIRED });
        }

        const outputFileNameWithExtension = outputFileName.endsWith('.mp4') ? outputFileName : `${outputFileName}.mp4`;

        const videos = await Video.findAll({ where: { id: videoIds } });
        if (videos.length !== videoIds.length) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ error: ERROR_MESSAGES.ONE_OR_MORE_VIDEO_NOT_FOUND });
        }

        const videoPaths = videos.map(video => video.filePath);
        const outputPath = path.join(__dirname, '../../assets/videos', `merged-${Date.now()}-${outputFileNameWithExtension}`);

        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Verify all input videos exist
        for (const videoPath of videoPaths) {
            if (!fs.existsSync(videoPath)) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
                    error: `${ERROR_MESSAGES.INPUT_FILE_NOT_FOUND}: ${videoPath}` 
                });
            }
        }

        const mergedPath = await mergeVideos(videoPaths, outputPath);

        if (!fs.existsSync(mergedPath)) {
            throw new Error(ERROR_MESSAGES.MERGE_FILE_ERROR);
        }

        const newDuration = await getVideoDuration(mergedPath);
        const newSize = fs.statSync(mergedPath).size;

        const mergedVideo = await Video.create({
            fileName: path.basename(mergedPath),
            filePath: mergedPath,
            mimeType: videos[0].mimeType,
            size: newSize,
            duration: newDuration,
            encoding: videos[0].encoding,
            status: VIDEO_STATUS.ACTIVE
        });

        return res.status(HTTP_STATUS_CODE.OK).json({ 
            message: SUCCESS_MESSAGES.VIDEO_MERGED, 
            video: mergedVideo 
        });
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
    uploadVideo,
    trimVideoClip,
    mergeVideoClips
};