const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  sendOTP,
  verifyOTP,
  sendForgotPasswordOTP,
  resetPassword,
  getMe,
  updateMe,
} = require('../controllers/authController');

router.post('/register',    register);
router.post('/login',       login);
router.post('/send-otp',    sendOTP);
router.post('/verify-otp',  verifyOTP);
router.post('/forgot-password/send-otp', sendForgotPasswordOTP);
router.post('/forgot-password/reset',    resetPassword);
router.get('/me',           protect, getMe);
router.put('/me',           protect, updateMe);

module.exports = router;
