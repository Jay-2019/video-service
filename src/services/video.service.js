const ffmpeg = require('fluent-ffmpeg');
const { ERROR_MESSAGES } = require("../constants/constants");

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);


module.exports = {
};
