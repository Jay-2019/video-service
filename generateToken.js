require('dotenv').config();
const jwt = require('jsonwebtoken');

const payload = {
userId: process.env.USER_ID,
role: process.env.USER_ROLE
};

const secret = process.env.JWT_SECRET;

const options = {
//   expiresIn: '1h',
  algorithm: process.env.JWT_ALGORITHM
};

const token = jwt.sign(payload, secret, options);
console.log('Generated JWT Token:', token);