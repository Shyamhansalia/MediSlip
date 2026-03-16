const mongoose = require('mongoose');

const medicalRequestSchema = new mongoose.Schema(
  {
    // ── Student who submitted ─────────────────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },

    // ── Request details ───────────────────────────────────────────────────────
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    date: {
      type: String,          // "YYYY-MM-DD" string (as entered by student)
      required: [true, 'Date is required'],
    },

    // ── Status lifecycle ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },

    // ── HOD approval / rejection ──────────────────────────────────────────────
    approvalId: {
      type: String,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedByName: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },

    // ── Hospital verification ─────────────────────────────────────────────────
    verifiedByHospital: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedByHospitalId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
medicalRequestSchema.index({ student: 1, createdAt: -1 });
medicalRequestSchema.index({ department: 1, status: 1 });
medicalRequestSchema.index({ approvalId: 1 });

module.exports = mongoose.model('MedicalRequest', medicalRequestSchema);
