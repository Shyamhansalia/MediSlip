const express = require('express');
const router = express.Router();
const { protect, authorise } = require('../middleware/auth');
const {
  createRequest,
  getMyRequests,
  getRequestById,
  getDepartmentRequests,
  approveRequest,
  rejectRequest,
  verifyByApprovalId,
  confirmVerification,
  getDepartmentStats,
} = require('../controllers/requestController');

// ── Student ───────────────────────────────────────────────────────────────────
router.post('/',       protect, authorise('student'),  createRequest);
router.get('/my',      protect, authorise('student'),  getMyRequests);

// ── HOD ───────────────────────────────────────────────────────────────────────
router.get('/department', protect, authorise('hod'), getDepartmentRequests);
router.get('/stats',      protect, authorise('hod'), getDepartmentStats);
router.put('/:id/approve', protect, authorise('hod'), approveRequest);
router.put('/:id/reject',  protect, authorise('hod'), rejectRequest);

// ── Hospital ──────────────────────────────────────────────────────────────────
router.get('/verify/student/:studentId', protect, authorise('hospital'), require('../controllers/requestController').verifyByStudentId);
router.get('/verify/:approvalId',         protect, authorise('hospital'), verifyByApprovalId);
router.put('/verify/:approvalId/confirm', protect, authorise('hospital'), confirmVerification);

// ── Shared (student sees own, others see all) ─────────────────────────────────
router.get('/:id', protect, getRequestById);

module.exports = router;
