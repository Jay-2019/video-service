const { ERROR_MESSAGES, HTTP_STATUS_CODE } = require('../constants/constants');

const authenticate = (req, res, next) => {
  const token = req.headers['Authorization'];

  if (token === process.env.API_TOKEN) {
    next();
  } else {
    res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
  }
};

module.exports = { authenticate };