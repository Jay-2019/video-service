module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error for debugging purposes (could be enhanced with a logging library)
    console.error(err);

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};