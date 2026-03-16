const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const caseInsensitiveExact = (value) => new RegExp(`^${escapeRegex(String(value || '').trim())}$`, 'i');
const idFieldMap = {
  student: 'studentId',
  hod: 'employeeId',
  hospital: 'hospitalId',
};

const getRoleAndIdFromBody = (body = {}) => {
  const { role, studentId, employeeId, hospitalId } = body;
  const idValueMap = { studentId, employeeId, hospitalId };
  const idField = idFieldMap[role];
  const idValue = String(idValueMap[idField] || '').trim();
  return { role, idField, idValue };
};

const findUserByRoleAndId = async (role, idField, idValue) => {
  if (!role || !idField || !idValue) return null;
  return User.findOne({ role, [idField]: caseInsensitiveExact(idValue) }).select('+password');
};

const otpEmailHTML = (otp, purpose) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #2563eb; margin: 0;">MediSlip</h1>
      <p style="color: #6b7280; margin: 4px 0 0;">College Hospital Medical Slip System</p>
    </div>
    <h2 style="color: #111827; text-align: center;">Your OTP Code</h2>
    <p style="color: #374151; text-align: center;">Use this OTP to ${purpose === 'register' ? 'verify your registration' : 'login to your account'}:</p>
    <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
      <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #2563eb;">${otp}</span>
    </div>
    <p style="color: #6b7280; text-align: center; font-size: 14px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #9ca3af; text-align: center; font-size: 12px;">If you didn't request this, please ignore this email.</p>
  </div>
`;

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department || undefined,
  semester: user.semester || undefined,
  studentId: user.studentId || undefined,
  employeeId: user.employeeId || undefined,
  hospitalId: user.hospitalId || undefined,
  hospitalName: user.hospitalName || undefined,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

const handleOtpDispatchFailure = async ({ email, purpose, otp, err, res, failureMessage }) => {
  console.error(`Email error [${purpose}] for ${email}:`, err.message);

  if (process.env.NODE_ENV === 'development') {
    return res.status(200).json({
      success: true,
      message: `Email failed in development mode. Use OTP ${otp} for testing.`,
      requiresOTP: true,
      devOtp: otp,
    });
  }

  await OTP.deleteMany({ email, purpose });
  return res.status(500).json({ success: false, message: failureMessage });
};

const sendOTP = asyncHandler(async (req, res) => {
  const { email, purpose = 'register', userData } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return res.status(400).json({ success: false, message: 'Email is required' });

  if (purpose === 'login') {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });
  }

  if (purpose === 'register') {
    const existing = await User.findOne({ email: normalizedEmail, isVerified: true });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  await OTP.deleteMany({ email: normalizedEmail, purpose });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.create({ email: normalizedEmail, otp, userData, purpose, expiresAt });

  try {
    await sendEmail({
      to: normalizedEmail,
      subject: `MediSlip OTP: ${otp}`,
      html: otpEmailHTML(otp, purpose),
    });
    res.json({ success: true, message: `OTP sent to ${normalizedEmail}` });
  } catch (err) {
    return handleOtpDispatchFailure({
      email: normalizedEmail,
      purpose,
      otp,
      err,
      res,
      failureMessage: 'Failed to send OTP email. Check your email config.',
    });
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, purpose = 'register' } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

  const record = await OTP.findOne({ email: normalizedEmail, purpose });
  if (!record) return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
  if (new Date() > record.expiresAt) {
    await OTP.deleteOne({ _id: record._id });
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
  }

  await OTP.deleteOne({ _id: record._id });

  if (purpose === 'login') {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const token = generateToken(user._id, user.role);
    return res.json({ success: true, message: 'Login successful', token, user: safeUser(user) });
  }

  const data = record.userData;
  if (!data) return res.status(400).json({ success: false, message: 'Registration data missing. Please register again.' });

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing && existing.isVerified) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  let user;
  if (existing) {
    Object.assign(existing, data, { isVerified: true });
    user = await existing.save();
  } else {
    user = await User.create({ ...data, email: normalizedEmail, isVerified: true });
  }

  const token = generateToken(user._id, user.role);
  res.status(201).json({ success: true, message: 'Registration successful', token, user: safeUser(user) });
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, studentId, department, employeeId, hospitalId, hospitalName, semester } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password || !role) {
    return res.status(400).json({ success: false, message: 'email, password, and role are required' });
  }
  if (!['student', 'hod', 'hospital'].includes(role)) {
    return res.status(400).json({ success: false, message: 'role must be student, hod, or hospital' });
  }
  if (role !== 'hospital' && !name) {
    return res.status(400).json({ success: false, message: 'name is required' });
  }
  if (role === 'student' && (!studentId || !department)) {
    return res.status(400).json({ success: false, message: 'studentId and department are required for students' });
  }
  if (role === 'hod' && (!employeeId || !department)) {
    return res.status(400).json({ success: false, message: 'employeeId and department are required for HOD' });
  }
  if (role === 'hospital' && !hospitalId) {
    return res.status(400).json({ success: false, message: 'hospitalId is required for hospital staff' });
  }

  const existing = await User.findOne({ email: normalizedEmail, isVerified: true });
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

  const userData = { name, password, role, studentId, department, employeeId, hospitalId, hospitalName, semester };

  await OTP.deleteMany({ email: normalizedEmail, purpose: 'register' });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await OTP.create({ email: normalizedEmail, otp, userData, purpose: 'register', expiresAt });

  try {
    await sendEmail({ to: normalizedEmail, subject: `MediSlip OTP: ${otp}`, html: otpEmailHTML(otp, 'register') });
    res.json({ success: true, message: `OTP sent to ${normalizedEmail}. Please verify to complete registration.`, requiresOTP: true });
  } catch (err) {
    return handleOtpDispatchFailure({
      email: normalizedEmail,
      purpose: 'register',
      otp,
      err,
      res,
      failureMessage: 'Failed to send OTP. Please check email configuration.',
    });
  }
});

const login = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { role, idField, idValue } = getRoleAndIdFromBody(req.body);

  if (!role || !password) {
    return res.status(400).json({ success: false, message: 'Role and password are required' });
  }

  if (!['student', 'hod', 'hospital'].includes(role)) {
    return res.status(400).json({ success: false, message: 'role must be student, hod, or hospital' });
  }

  if (!idValue) {
    return res.status(400).json({ success: false, message: `${idField} is required` });
  }

  const user = await findUserByRoleAndId(role, idField, idValue);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid ID or password' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid ID or password' });

  if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated' });

  const token = generateToken(user._id, user.role);
  res.json({ success: true, message: 'Login successful', token, user: safeUser(user) });
});

const sendForgotPasswordOTP = asyncHandler(async (req, res) => {
  const { role, idField, idValue } = getRoleAndIdFromBody(req.body);
  if (!role || !['student', 'hod', 'hospital'].includes(role)) {
    return res.status(400).json({ success: false, message: 'role must be student, hod, or hospital' });
  }
  if (!idValue) {
    return res.status(400).json({ success: false, message: `${idField} is required` });
  }

  const user = await findUserByRoleAndId(role, idField, idValue);
  if (!user) return res.status(404).json({ success: false, message: 'No account found for provided role and ID' });
  if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated' });

  const email = normalizeEmail(user.email);
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.deleteMany({ email, purpose: 'reset-password' });
  await OTP.create({
    email,
    otp,
    purpose: 'reset-password',
    expiresAt,
    userData: { role, idField, idValue: String(idValue) },
  });

  try {
    await sendEmail({
      to: email,
      subject: `MediSlip Password Reset OTP: ${otp}`,
      html: otpEmailHTML(otp, 'login').replace('login to your account', 'reset your password'),
    });
    return res.json({ success: true, message: `OTP sent to ${email}` });
  } catch (err) {
    return handleOtpDispatchFailure({
      email,
      purpose: 'reset-password',
      otp,
      err,
      res,
      failureMessage: 'Failed to send password reset OTP email. Check your email config.',
    });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;
  const { role, idField, idValue } = getRoleAndIdFromBody(req.body);

  if (!role || !['student', 'hod', 'hospital'].includes(role)) {
    return res.status(400).json({ success: false, message: 'role must be student, hod, or hospital' });
  }
  if (!idValue) {
    return res.status(400).json({ success: false, message: `${idField} is required` });
  }
  if (!otp || !String(otp).trim()) {
    return res.status(400).json({ success: false, message: 'OTP is required' });
  }
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const user = await findUserByRoleAndId(role, idField, idValue);
  if (!user) return res.status(404).json({ success: false, message: 'No account found for provided role and ID' });

  const email = normalizeEmail(user.email);
  const record = await OTP.findOne({ email, purpose: 'reset-password' });
  if (!record) return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
  if (new Date() > record.expiresAt) {
    await OTP.deleteOne({ _id: record._id });
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== String(otp).trim()) {
    return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
  }

  user.password = String(newPassword);
  await user.save();
  await OTP.deleteMany({ email, purpose: 'reset-password' });

  res.json({ success: true, message: 'Password reset successful. Please login with your new password.' });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: safeUser(req.user) });
});

const updateMe = asyncHandler(async (req, res) => {
  const { semester } = req.body;

  if (semester !== undefined) {
    if (req.user.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Only students can update semester' });
    }
    const nextSemester = String(semester).trim();
    if (nextSemester && !/^(?:[1-9]|1[0-2])$/.test(nextSemester)) {
      return res.status(400).json({ success: false, message: 'Semester must be between 1 and 12' });
    }
    req.user.semester = nextSemester || undefined;
  }

  await req.user.save();
  res.json({ success: true, message: 'Profile updated', user: safeUser(req.user) });
});

module.exports = { register, login, sendOTP, verifyOTP, sendForgotPasswordOTP, resetPassword, getMe, updateMe };
