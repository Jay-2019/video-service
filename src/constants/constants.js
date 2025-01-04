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
};

const SUCCESS_MESSAGES = {
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
