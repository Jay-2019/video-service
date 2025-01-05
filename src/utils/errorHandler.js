const { HTTP_STATUS_CODE } = require("../constants/constants");

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