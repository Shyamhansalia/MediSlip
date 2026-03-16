const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role:     { type: String, enum: ['student', 'hod', 'hospital'], required: true },

    // Student
    studentId:  { type: String, unique: true, sparse: true },
    department: { type: String, trim: true },
    semester:   { type: String },

    // HOD
    employeeId: { type: String, unique: true, sparse: true },

    // Hospital
    hospitalId:   { type: String, unique: true, sparse: true },
    hospitalName: { type: String, trim: true },

    // Verification
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
