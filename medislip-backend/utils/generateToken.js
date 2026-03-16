const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user.
 * @param {string} id - MongoDB ObjectId as string
 * @param {string} role - 'student' | 'hod' | 'hospital'
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { generateToken };
