const { Video, ShareableLink } = require('../models');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../redis/connection');
const handleError = require('../utils/errorHandler');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS_CODE, VIDEO_STATUS } = require('../constants/constants');
const { getVideoDuration, validateVideoDuration, validateVideoSize } = require('../utils/fileUtils');
const { trimVideo, mergeVideos } = require('../services/video.service');
const { SHAREABLE_LINK_TTL } = process.env;

/**
 * Uploads a video file and saves its metadata.
 * @async
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @returns {Promise<Express.Response>} JSON response with message and video object
 * 
 * Steps:
 * 1. Validate file existence
 * 2. Get video duration
 * 3. Validate video size and duration
 * 4. Create video record in database
 * 5. Return success response
 */
const uploadVideo = async (req, res) => {
    try {
        const { file } = req;

        if (!file) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: ERROR_MESSAGES.FILE_REQUIRED });
        }

        const duration = await getVideoDuration(file.path);

        const validationErrors = validateVideo(file, duration);
        if (validationErrors.length) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ errors: validationErrors });
        }

        const video = await createVideoRecord(file, duration);

        return res.status(HTTP_STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.VIDEO_UPLOADED, video });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Creates a video record in the database.
 * @param {Object} file - Uploaded file object
 * @param {number} duration - Duration of the video in seconds
 * @returns {Promise<Video>} Created video record
 */
const createVideoRecord = async (file, duration) => {
    return await Video.create({
        fileName: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
        duration,
        encoding: file.encoding,
        status: VIDEO_STATUS.ACTIVE
    });
};

/**
 * Trims a video to the specified start and end times.
 * @async
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @returns {Promise<Express.Response>} JSON response with message and trimmed video object
 * 
 * Steps:
 * 1. Validate request parameters
 * 2. Find video in database
 * 3. Calculate trim times
 * 4. Trim video using ffmpeg
 * 5. Save new video metadata
 * 6. Return success response
 */
const trimVideoClip = async (req, res) => {
    try {
        const { videoId, startTime, endTime } = req.body;

        const validation = validateTrimRequest(videoId, startTime, endTime);
        if (!validation.valid) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: validation.error });
        }

        const video = await Video.findOne({ where: { id: videoId } });
        if (!video) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ error: ERROR_MESSAGES.VIDEO_NOT_FOUND });
        }

        const { start, end } = getTrimTimes(startTime, endTime, video.duration);
        const outputPath = await trimVideoFile(video, start, end);

        const trimmedVideo = await createVideoRecord({
            filename: path.basename(outputPath),
            path: outputPath,
            mimetype: video.mimeType,
            size: fs.statSync(outputPath).size,
            encoding: video.encoding
        }, await getVideoDuration(outputPath));

        return res.status(HTTP_STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.VIDEO_TRIMMED, video: trimmedVideo });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Validates the trim request parameters.
 * @param {string} videoId - ID of the video to trim
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @returns {Object} Validation result
 */
const validateTrimRequest = (videoId, startTime, endTime) => {
    if (!videoId) {
        return { valid: false, error: ERROR_MESSAGES.VIDEO_ID_REQUIRED };
    }

    if (!startTime && !endTime) {
        return { valid: false, error: ERROR_MESSAGES.START_OR_END_TIME_REQUIRED };
    }

    if (startTime && isNaN(Number(startTime))) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_START_TIME };
    }

    if (endTime && isNaN(Number(endTime))) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_END_TIME };
    }

    return { valid: true };
};

/**
 * Calculates the trim times based on the provided start and end times.
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @param {number} videoDuration - Duration of the video in seconds
 * @returns {Object} Trim times
 * @throws {Error} If the trim times are invalid
 */
const getTrimTimes = (startTime, endTime, videoDuration) => {
    let start = startTime ? Number(startTime) : 0;
    let end = endTime ? Number(endTime) : videoDuration;

    if (start >= end || start < 0 || end > videoDuration) {
        throw new Error(`startTime must be less than endTime. | startTime must be greater than or equal to 0. | endTime must be less than or equal to the video duration (${videoDuration} seconds).`);
    }

    return { start, end };
};

/**
 * Trims and saves the video to the specified output path.
 * @param {Video} video - Video object
 * @param {number} start - Start time in seconds
 * @param {number} end - End time in seconds
 * @returns {Promise<string>} Output path of the trimmed video
 */
const trimVideoFile = async (video, start, end) => {
    const outputPath = path.join(__dirname, '../../assets/videos', `trimmed-${Date.now()}-${video.fileName}`);
    await trimVideo(video.filePath, start, end, outputPath);
    return outputPath;
};

/**
 * Merges multiple video clips into a single video file.
 * @async
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @returns {Promise<Express.Response>} JSON response with message and merged video object
 * 
 * Steps:
 * 1. Validate request parameters
 * 2. Find videos in database
 * 3. Verify all input videos exist
 * 4. Merge videos using ffmpeg
 * 5. Save new video metadata
 * 6. Return success response
 */
const mergeVideoClips = async (req, res) => {
    try {
        const { videoIds, outputFileName } = req.body;

        const validationErrors = validateMergeRequest(videoIds, outputFileName);
        if (validationErrors.length) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ errors: validationErrors });
        }

        const videos = await Video.findAll({ where: { id: videoIds } });
        if (videos.length !== videoIds.length) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ error: ERROR_MESSAGES.ONE_OR_MORE_VIDEO_NOT_FOUND });
        }

        const outputPath = await mergeVideoFiles(videos, outputFileName);

        const mergedVideo = await createVideoRecord({
            filename: path.basename(outputPath),
            path: outputPath,
            mimetype: videos[0].mimeType,
            size: fs.statSync(outputPath).size,
            encoding: videos[0].encoding
        }, await getVideoDuration(outputPath));

        return res.status(HTTP_STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.VIDEO_MERGED, video: mergedVideo });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Validates the merge request parameters.
 * @param {Array<number>} videoIds - Array of video IDs to merge
 * @param {string} outputFileName - Output file name
 * @returns {Array<string>} List of validation errors
 */
const validateMergeRequest = (videoIds, outputFileName) => {
    const errors = [];

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
        errors.push(ERROR_MESSAGES.INVALID_VIDEO_IDS);
    }

    if (videoIds.length < 2) {
        errors.push(ERROR_MESSAGES.MINIMUM_VIDEO_IDS_REQUIRED);
    }

    if (!outputFileName) {
        errors.push(ERROR_MESSAGES.OUTPUT_FILE_NAME_REQUIRED);
    }

    return errors;
};

/**
 * Merges and saves the videos to the specified output path.
 * @param {Array<Video>} videos - Array of video objects
 * @param {string} outputFileName - Output file name
 * @returns {Promise<string>} Output path of the merged video
 */
const mergeVideoFiles = async (videos, outputFileName) => {
    const videoPaths = videos.map(video => video.filePath);
    const outputFileNameWithExtension = outputFileName.endsWith('.mp4') ? outputFileName : `${outputFileName}.mp4`;
    const outputPath = path.join(__dirname, '../../assets/videos', `merged-${Date.now()}-${outputFileNameWithExtension}`);

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Verify all input videos exist
    for (const videoPath of videoPaths) {
        if (!fs.existsSync(videoPath)) {
            throw new Error(`${ERROR_MESSAGES.INPUT_FILE_NOT_FOUND}: ${videoPath}`);
        }
    }

    await mergeVideos(videoPaths, outputPath);
    return outputPath;
};

/**
 * Generates a shareable link for a video with a time-based expiry.
 * @async
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @returns {Promise<Express.Response>} JSON response with message and shareable link
 * 
 * Steps:
 * 1. Find video in database
 * 2. Generate unique link ID
 * 3. Store link ID and video ID in Redis with TTL
 * 4. Save shareable link in database
 * 5. Return success response with shareable link
 */
const generateShareableLink = async (req, res) => {
    try {
        const { videoId } = req.params;

        const video = await Video.findOne({ where: { id: videoId } });
        if (!video) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ error: ERROR_MESSAGES.VIDEO_NOT_FOUND });
        }

        const shareableLink = await createShareableLink(req, videoId);

        return res.status(HTTP_STATUS_CODE.OK).json({ message: SUCCESS_MESSAGES.SHARE_LINK_CREATED, link: shareableLink });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Creates a shareable link for a video.
 * @param {Express.Request} req - Express request object
 * @param {number} videoId - ID of the video
 * @returns {Promise<string>} Shareable link
 */
const createShareableLink = async (req, videoId) => {
    const linkId = uuidv4();
    const shareableLink = `${req.protocol}://${req.get('host')}/api/videos/share/${linkId}`;

    await redisClient.set(linkId, videoId, { EX: SHAREABLE_LINK_TTL });
    await ShareableLink.create({ linkId, videoId, ttl: SHAREABLE_LINK_TTL });

    return shareableLink;
};

/**
 * Accesses a video using a shareable link.
 * @async
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @returns {Promise<Express.Response>} JSON response with video object
 * 
 * Steps:
 * 1. Retrieve video ID from Redis using link ID
 * 2. Find video in database
 * 3. Return success response with video object
 */
const accessShareableLink = async (req, res) => {
    try {
        const { linkId } = req.params;
        const videoId = await redisClient.get(linkId);
  
        if (!videoId) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ error: ERROR_MESSAGES.SHARE_LINK_EXPIRED });
        }
  
        const video = await Video.findOne({ where: { id: videoId } });
        if (!video) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ error: ERROR_MESSAGES.VIDEO_NOT_FOUND });
        }
  
        return res.status(HTTP_STATUS_CODE.OK).json({ video });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Validates the video file and its duration.
 * @param {Object} file - Uploaded file object
 * @param {number} duration - Duration of the video in seconds
 * @returns {Array<string>} List of validation errors
 */
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
    mergeVideoClips,
    generateShareableLink,
    accessShareableLink
};