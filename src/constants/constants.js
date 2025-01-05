const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access.",
  FILE_TOO_LARGE: "File size exceeds the maximum limit.",
  INVALID_DURATION: "Video duration must be between 5 and 25 seconds.",
  TRIM_ERROR: "Error occurred while trimming the video.",
  MERGE_ERROR: "Error occurred while merging the videos.",
  SHARE_LINK_EXPIRED: "The share link has expired.",
  VIDEO_NOT_FOUND: "Video not found.",
  INVALID_REQUEST: "Invalid request parameters.",
  INTERNAL_SERVER_ERROR: "Internal server error.",
  INVALID_FILE_TYPE: "Invalid file type. Only video files are allowed.",
  ONE_OR_MORE_VIDEO_NOT_FOUND: "One or more videos not found.",
  INVALID_VIDEO_IDS: "videoIds must be a non-empty array.",
  OUTPUT_FILE_NAME_REQUIRED: "outputFileName is required.",
  INPUT_FILE_NOT_FOUND: "Input video file not found",
  MERGE_FILE_ERROR: "Failed to create merged video file",
  MINIMUM_VIDEO_IDS_REQUIRED: "At least two video IDs are required to merge.",
  VIDEO_ID_REQUIRED: "videoId is a required field.",
  START_OR_END_TIME_REQUIRED: "At least one of startTime or endTime must be provided.",
  INVALID_START_TIME: "startTime must be a valid number.",
  INVALID_END_TIME: "endTime must be a valid number.",
};

const SUCCESS_MESSAGES = {
  VIDEO_UPLOADED: "Video uploaded successfully.",
  VIDEO_TRIMMED: "Video trimmed successfully.",
  VIDEO_MERGED: "Videos merged successfully.",
  SHARE_LINK_CREATED: "Shareable link created successfully."
};

const VIDEO_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

module.exports = {
  HTTP_STATUS_CODE,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VIDEO_STATUS
};
