const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);

/**
 * Check if the file size is within the allowed limits.
 * @param {number} size - The size of the file in bytes.
 * @param {number} maxFileSize - The maximum allowed file size in bytes.
 * @returns {boolean} - True if the file size is valid, otherwise false.
 */
const validateVideoSize = (size, maxFileSize) => {
    return size <= maxFileSize;
};

/**
 * Check if the video duration is within the allowed limits.
 * @param {number} duration - The duration of the video in seconds.
 * @param {number} minDuration - The minimum allowed duration in seconds.
 * @param {number} maxDuration - The maximum allowed duration in seconds.
 * @returns {boolean} - True if the duration is valid, otherwise false.
 */
const validateVideoDuration = (duration, minDuration, maxDuration) => {
    return duration >= minDuration && duration <= maxDuration;
};

/**
 * Get the duration of a video file.
 * @param {string} filePath - The path to the video file.
 * @returns {Promise<number>} - The duration of the video in seconds.
 */
const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            resolve(metadata.format.duration);
        });
    });
};

module.exports = {
    validateVideoSize,
    validateVideoDuration,
    getVideoDuration
};