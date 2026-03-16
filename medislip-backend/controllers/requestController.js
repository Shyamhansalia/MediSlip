const { nanoid } = require('nanoid');
const asyncHandler = require('../utils/asyncHandler');
const MedicalRequest = require('../models/MedicalRequest');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const SLIP_VALIDITY_DAYS = 7;

const formatDate = (value) => {
  if (!value) return 'N/A';
  const asDate = new Date(value);
  if (!Number.isNaN(asDate.getTime())) {
    return asDate.toISOString().split('T')[0];
  }
  return String(value);
};

const getValidityMeta = (request) => {
  if (request.status !== 'Approved' || !request.approvedAt) {
    return { validUntil: null, isValidNow: false, isExpired: false };
  }

  const approvedAt = new Date(request.approvedAt);
  const validUntil = new Date(approvedAt);
  validUntil.setDate(validUntil.getDate() + SLIP_VALIDITY_DAYS);
  const isValidNow = new Date() <= validUntil;

  return { validUntil, isValidNow, isExpired: !isValidNow };
};

const notifyHodOnNewRequest = async (request) => {
  const hods = await User.find({
    role: 'hod',
    department: request.department,
    isVerified: true,
    isActive: true,
  }).select('name email');

  if (!hods.length) return;

  const subject = `New Medical Request - ${request.studentName} (${request.studentId})`;
  const requestDate = formatDate(request.date);

  await Promise.all(
    hods
      .filter((hod) => hod.email)
      .map((hod) =>
        sendEmail({
          to: hod.email,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color:#1f2937;">New student medical request submitted</h2>
              <p>Dear ${hod.name || 'HOD'},</p>
              <p>A new request has been submitted in your department and is waiting for review.</p>
              <ul>
                <li><strong>Student Name:</strong> ${request.studentName}</li>
                <li><strong>Student ID:</strong> ${request.studentId}</li>
                <li><strong>Department:</strong> ${request.department}</li>
                <li><strong>Date:</strong> ${requestDate}</li>
                <li><strong>Reason:</strong> ${request.reason}</li>
              </ul>
              <p>Please log in to MediSlip to approve or reject this request.</p>
            </div>
          `,
        })
      )
  );
};

const notifyStudentOnDecision = async ({ request, decision, rejectionReason }) => {
  const student = await User.findById(request.student).select('name email');
  if (!student || !student.email) return;

  const approved = decision === 'Approved';
  const subject = approved
    ? `Medical Request Approved - ${request.studentId}`
    : `Medical Request Rejected - ${request.studentId}`;

  const actionDate = approved ? formatDate(request.approvedAt) : formatDate(request.rejectedAt);

  const decisionDetails = approved
    ? `<li><strong>Approval ID:</strong> ${request.approvalId}</li>`
    : `<li><strong>Rejection Reason:</strong> ${rejectionReason}</li>`;

  await sendEmail({
    to: student.email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#1f2937;">Your medical request has been ${decision.toLowerCase()}</h2>
        <p>Dear ${student.name || request.studentName || 'Student'},</p>
        <p>Your request status has been updated by the HOD.</p>
        <ul>
          <li><strong>Status:</strong> ${decision}</li>
          <li><strong>Request Date:</strong> ${formatDate(request.date)}</li>
          <li><strong>Department:</strong> ${request.department}</li>
          ${decisionDetails}
          <li><strong>Updated On:</strong> ${actionDate}</li>
        </ul>
        ${
          approved
            ? '<p>Please keep your Approval ID safe for hospital verification.</p>'
            : '<p>You can submit a new request with corrected details if needed.</p>'
        }
      </div>
    `,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// @route  POST /api/requests
// @desc   Student submits a new medical leave request
// @access Private (student)
const createRequest = asyncHandler(async (req, res) => {
  const { reason, date, preferredDate } = req.body;
  const resolvedDate = date || preferredDate;

  if (!reason || !resolvedDate) {
    return res.status(400).json({ success: false, message: 'reason and date are required' });
  }

  const { _id, studentId, name, department } = req.user;

  if (!studentId) {
    return res.status(400).json({ success: false, message: 'Only students can create requests' });
  }

  const request = await MedicalRequest.create({
    student: _id,
    studentId,
    studentName: name,
    department,
    reason,
    date: resolvedDate,
  });

  try {
    await notifyHodOnNewRequest(request);
  } catch (err) {
    console.error('Failed to send HOD notification email:', err.message);
  }

  res.status(201).json({ success: true, message: 'Request submitted', request });
});

// @route  GET /api/requests/my
// @desc   Student fetches their own requests
// @access Private (student)
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await MedicalRequest.find({ student: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: requests.length, data: requests });
});

// @route  GET /api/requests/:id
// @desc   Get a single request by ID (student sees own; HOD/hospital see all)
// @access Private
const getRequestById = asyncHandler(async (req, res) => {
  const request = await MedicalRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  // Students can only view their own requests
  if (req.user.role === 'student' && String(request.student) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, request });
});

// ─────────────────────────────────────────────────────────────────────────────
// HOD ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// @route  GET /api/requests/department
// @desc   HOD fetches all requests for their department
// @access Private (hod)
const getDepartmentRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;   // optional ?status=Pending|Approved|Rejected

  const filter = { department: req.user.department };
  if (status) filter.status = status;

  const requests = await MedicalRequest.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: requests.length, data: requests });
});

// @route  PUT /api/requests/:id/approve
// @desc   HOD approves a medical request
// @access Private (hod)
const approveRequest = asyncHandler(async (req, res) => {
  const request = await MedicalRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  // HOD can only action requests in their own department
  if (request.department !== req.user.department) {
    return res.status(403).json({ success: false, message: 'Request belongs to a different department' });
  }
  if (request.status !== 'Pending') {
    return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
  }

  // Generate unique approval ID: APP + 8 random chars
  const approvalId = `APP${nanoid(8).toUpperCase()}`;

  request.status = 'Approved';
  request.approvalId = approvalId;
  request.approvedBy = req.user._id;
  request.approvedByName = req.user.name;
  request.approvedAt = new Date();

  await request.save();

  try {
    await notifyStudentOnDecision({ request, decision: 'Approved' });
  } catch (err) {
    console.error('Failed to send student approval email:', err.message);
  }

  res.json({
    success: true,
    message: `Request approved! Approval ID: ${approvalId}`,
    request,
  });
});

// @route  PUT /api/requests/:id/reject
// @desc   HOD rejects a medical request
// @access Private (hod)
const rejectRequest = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason || !rejectionReason.trim()) {
    return res.status(400).json({ success: false, message: 'Rejection reason is required' });
  }

  const request = await MedicalRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  if (request.department !== req.user.department) {
    return res.status(403).json({ success: false, message: 'Request belongs to a different department' });
  }
  if (request.status !== 'Pending') {
    return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
  }

  request.status = 'Rejected';
  request.rejectionReason = rejectionReason;
  request.rejectedAt = new Date();

  await request.save();

  try {
    await notifyStudentOnDecision({
      request,
      decision: 'Rejected',
      rejectionReason: request.rejectionReason,
    });
  } catch (err) {
    console.error('Failed to send student rejection email:', err.message);
  }

  res.json({ success: true, message: 'Request rejected', request });
});

// ─────────────────────────────────────────────────────────────────────────────
// HOSPITAL ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// @route  GET /api/requests/verify/:approvalId
// @desc   Hospital verifies a medical slip by approval ID
// @access Private (hospital)
const verifyByApprovalId = asyncHandler(async (req, res) => {
  const { approvalId } = req.params;

  const request = await MedicalRequest.findOne({ approvalId }).populate('approvedBy', 'name');
  if (!request) {
    return res.status(404).json({ success: false, message: 'No approved slip found for this Approval ID' });
  }

  if (request.status !== 'Approved') {
    return res.status(400).json({ success: false, message: `Slip status is: ${request.status}` });
  }

  const validity = getValidityMeta(request);
  if (!validity.isValidNow) {
    return res.status(400).json({
      success: false,
      message: `Slip is no longer valid. Validity ended on ${formatDate(validity.validUntil)}.`,
    });
  }

  res.json({
    success: true,
    message: 'Valid medical slip',
    slip: {
      approvalId: request.approvalId,
      studentName: request.studentName,
      studentId: request.studentId,
      department: request.department,
      reason: request.reason,
      date: request.date,
      approvedByName: request.approvedByName || request.approvedBy?.name || null,
      approvedAt: request.approvedAt,
      validUntil: validity.validUntil,
      isValidNow: validity.isValidNow,
      verifiedByHospital: request.verifiedByHospital,
    },
  });
});

// @route  PUT /api/requests/verify/:approvalId/confirm
// @desc   Hospital marks the slip as physically verified
// @access Private (hospital)
const confirmVerification = asyncHandler(async (req, res) => {
  const { approvalId } = req.params;

  const request = await MedicalRequest.findOne({ approvalId });
  if (!request) {
    return res.status(404).json({ success: false, message: 'Slip not found' });
  }
  if (request.status !== 'Approved') {
    return res.status(400).json({ success: false, message: `Slip status is: ${request.status}` });
  }

  const validity = getValidityMeta(request);
  if (!validity.isValidNow) {
    return res.status(400).json({
      success: false,
      message: `Slip is no longer valid. Validity ended on ${formatDate(validity.validUntil)}.`,
    });
  }

  request.verifiedByHospital = true;
  request.verifiedAt = new Date();
  request.verifiedByHospitalId = req.user.hospitalId;

  await request.save();

  res.json({ success: true, message: 'Slip marked as verified by hospital', request });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN / GENERAL
// ─────────────────────────────────────────────────────────────────────────────

// @route  GET /api/requests/stats
// @desc   HOD – summary stats for their department
// @access Private (hod)
const getDepartmentStats = asyncHandler(async (req, res) => {
  const dept = req.user.department;

  const [total, pending, approved, rejected] = await Promise.all([
    MedicalRequest.countDocuments({ department: dept }),
    MedicalRequest.countDocuments({ department: dept, status: 'Pending' }),
    MedicalRequest.countDocuments({ department: dept, status: 'Approved' }),
    MedicalRequest.countDocuments({ department: dept, status: 'Rejected' }),
  ]);

  res.json({ success: true, stats: { total, pending, approved, rejected } });
});

module.exports = {
  createRequest,
  getMyRequests,
  getRequestById,
  getDepartmentRequests,
  approveRequest,
  rejectRequest,
  verifyByApprovalId,
  confirmVerification,
  getDepartmentStats,
};

// @route  GET /api/requests/verify/student/:studentId
// @desc   Hospital verifies by student ID (finds most recent approved request)
// @access Private (hospital)
const verifyByStudentId = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const requests = await MedicalRequest.find({ studentId })
    .populate('approvedBy', 'name')
    .sort({ createdAt: -1 });

  if (!requests.length) {
    return res.status(404).json({ success: false, message: `No record found for Student ID "${studentId}"` });
  }

  const normalized = requests.map((request) => {
    const record = request.toObject();
    if (!record.approvedByName && request.approvedBy?.name) {
      record.approvedByName = request.approvedBy.name;
    }
    const validity = getValidityMeta(record);
    record.validUntil = validity.validUntil;
    record.isValidNow = validity.isValidNow;
    record.isExpired = validity.isExpired;
    return record;
  });

  const latest = normalized[0];
  const latestApproved = normalized.find((record) => record.status === 'Approved') || null;
  const latestValidApproved = normalized.find((record) => record.status === 'Approved' && record.isValidNow) || null;

  res.json({
    success: true,
    data: latest,
    latest,
    latestApproved,
    latestValidApproved,
    records: normalized,
  });
});

module.exports.verifyByStudentId = verifyByStudentId;
