const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

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

const getVideoMetadata = (videoPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            resolve(metadata);
        });
    });
};

const mergeVideos = async (videoPaths, outputPath) => {
  return new Promise(async (resolve, reject) => {
      try {
          // Get metadata for all videos
          const metadataList = await Promise.all(
              videoPaths.map(path => getVideoMetadata(path))
          );

          // Find maximum dimensions and frame rate
          const maxWidth = Math.max(
              ...metadataList.map(metadata => metadata.streams[0].width)
          );
          const maxHeight = Math.max(
              ...metadataList.map(metadata => metadata.streams[0].height)
          );
          
          const command = ffmpeg();

          // Add inputs
          videoPaths.forEach(videoPath => {
              command.input(videoPath);
          });

          // Create filter complex command with scale and fps filters
          const filterComplex = videoPaths.map((_, index) => 
              `[${index}:v]scale=${maxWidth}:${maxHeight},setsar=1:1[v${index}];` +
              `[${index}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a${index}];`
          ).join('');

          // Add concat filter
          const streamInputs = videoPaths.map((_, index) => 
              `[v${index}][a${index}]`
          ).join('');
          
          const finalFilter = filterComplex + 
              `${streamInputs}concat=n=${videoPaths.length}:v=1:a=1[outv][outa]`;

          // Ensure output directory exists
          const outputDir = path.dirname(outputPath);
          if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
          }

          command
              .complexFilter(finalFilter)
              .outputOptions([
                  '-map [outv]',
                  '-map [outa]',
                  '-c:v libx264',
                  '-c:a aac',
                  '-vsync 2'
              ])
              .output(outputPath)
              .on('start', (commandLine) => {})
              .on('progress', (progress) => {})
              .on('end', () => { 
                resolve(outputPath);
              })
              .on('error', (err) => {
                reject(err);
              })
              .run();
      } catch (error) {
          reject(error);
      }
  });
};

module.exports = {
    trimVideo,
    mergeVideos
};
