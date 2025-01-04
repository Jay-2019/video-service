const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);


const trimVideo = (videoPath, startTime, endTime, outputPath) => {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(startTime)
        .setDuration(endTime - startTime)
        .output(outputPath)
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(err);
        })
        .run();
    });
};

module.exports = {
    trimVideo
};
