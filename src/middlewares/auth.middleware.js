const jwt = require('jsonwebtoken');
const { ERROR_MESSAGES, HTTP_STATUS_CODE } = require('../constants/constants');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, { algorithms: [process.env.JWT_ALGORITHM] }, (err, decoded) => {
    if (err) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    }
    req.user = decoded;
    next();
  });
};

module.exports = { authenticate };