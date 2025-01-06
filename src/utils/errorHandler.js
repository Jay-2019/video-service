const { HTTP_STATUS_CODE, ERROR_MESSAGES } = require("../constants/constants");

/**
 * Handles errors and sends appropriate response.
 * @param {Express.Response} res - Express response object
 * @param {Error} err - Error object
 */
const handleError = (res, err) => {
    const statusCode = err.statusCode || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
    const message = err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

    // Log the error for debugging purposes (could be enhanced with a logging library)
    console.error(err);

    res.status(statusCode).json({
        message,
    });
};

module.exports = handleError;