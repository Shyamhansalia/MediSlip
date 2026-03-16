import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authAPI } from '../services/api';

const detectRole = (email) => {
  const e = email.toLowerCase();
  if (e.includes('@hospital') || e.includes('hospital.') || e.includes('@hosp')) return 'hospital';
  if (e.includes('@hod') || e.includes('hod.') || e.includes('faculty') || e.includes('staff') || e.includes('prof.') || e.includes('dr.')) return 'hod';
  return 'student';
};

const roleConfig = {
  student: {
    label: 'Student',
    idField: 'studentId',
    idLabel: 'Student ID',
    idPlaceholder: 'e.g. CS2024001',
    dashboard: '/student-dashboard',
    stateKey: 'studentInfo',
    ring: 'focus:ring-sky-500 focus:border-sky-500',
    button: 'from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600',
    chip: 'bg-sky-100 text-sky-800 border-sky-200',
    bg: 'from-slate-100 via-sky-100 to-cyan-100',
    tip: 'Use your CHARUSAT student email: id@charusat.edu.in',
  },
  hod: {
    label: 'HOD / Faculty',
    idField: 'employeeId',
    idLabel: 'Employee ID',
    idPlaceholder: 'e.g. EMP001',
    dashboard: '/hod-dashboard',
    stateKey: 'hodInfo',
    ring: 'focus:ring-emerald-500 focus:border-emerald-500',
    button: 'from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600',
    chip: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bg: 'from-slate-100 via-emerald-100 to-teal-100',
    tip: 'HOD role detected. Official institute email recommended.',
  },
  hospital: {
    label: 'Hospital Staff',
    idField: 'hospitalId',
    idLabel: 'Hospital ID',
    idPlaceholder: 'e.g. HSP001',
    dashboard: '/hospital-verify',
    stateKey: 'hospitalInfo',
    ring: 'focus:ring-amber-500 focus:border-amber-500',
    button: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    chip: 'bg-amber-100 text-amber-800 border-amber-200',
    bg: 'from-slate-100 via-amber-100 to-orange-100',
    tip: 'Hospital role detected. Use your assigned staff email.',
  },
};

const departments = [
  'Artificial Intelligence and Machine Learning',
  'Civil Engineering',
  'Computer Engineering',
  'Computer Science and Engineering',
  'Electrical Engineering',
  'Electronics and Communication Engineering',
  'Information Technology',
  'Mechanical Engineering',
];

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    department: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    semester: '',
    employeeId: '',
    hospitalId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') setRole(value.includes('@') ? detectRole(value) : null);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    const r = role || 'student';
    if (r !== 'hospital') {
      if (!formData.name.trim()) errs.name = 'Name is required';
      if (!formData.department) errs.department = 'Department is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (r === 'student' && !formData.email.endsWith('@charusat.edu.in')) {
      errs.email = 'Only CHARUSAT student email IDs are allowed (e.g. id@charusat.edu.in)';
    }
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (r === 'student') {
      if (!formData.studentId.trim()) errs.studentId = 'Student ID is required';
      if (!formData.semester) errs.semester = 'Semester is required';
    } else if (r === 'hod') {
      if (!formData.employeeId.trim()) errs.employeeId = 'Employee ID is required';
    } else if (r === 'hospital') {
      if (!formData.hospitalId.trim()) errs.hospitalId = 'Hospital ID is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');

    const r = role || 'student';
    const cfg = roleConfig[r];
    try {
      const payload = {
        role: r,
        email: formData.email,
        password: formData.password,
        [cfg.idField]: formData[cfg.idField],
        ...(r !== 'hospital' && { name: formData.name, department: formData.department }),
        ...(r === 'student' && { semester: formData.semester }),
      };

      await authAPI.register(payload);

      const routeStatePayload = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        semester: formData.semester,
        role: r,
        studentId: formData.studentId,
        employeeId: formData.employeeId,
        hospitalId: formData.hospitalId,
      };

      navigate('/verify-otp', {
        state: {
          email: formData.email,
          purpose: 'register',
          redirectTo: cfg.dashboard,
          routeState: { [cfg.stateKey]: routeStatePayload },
        },
      });
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const r = role || 'student';
  const cfg = roleConfig[r];
  const showFields = formData.email.includes('@');
  const inputClass = (field) => `auth-input w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 ${cfg.ring} ${errors[field] ? 'border-rose-500' : 'border-slate-300'}`;

  return (
    <div className={`auth-layout auth-ambient bg-gradient-to-br ${cfg.bg}`}>
      <Navbar />
      <main className="relative z-10 px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <section className="auth-panel auth-float rounded-3xl p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Create your MediSlip account</h1>
                <p className="mt-2 text-sm text-slate-600">Role is detected automatically from your email and mapped to the right workflow.</p>
              </div>
              {role && <span className={`inline-flex rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${cfg.chip}`}>{cfg.label}</span>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {apiError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{apiError}</div>}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass('email')}
                  placeholder="Enter your email to detect role"
                />
                {errors.email ? (
                  <p className="mt-1.5 text-xs text-rose-600">{errors.email}</p>
                ) : (
                  formData.email && <p className="mt-1.5 text-xs text-slate-500">{cfg.tip}</p>
                )}
              </div>

              {showFields && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {r !== 'hospital' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass('name')} placeholder="Enter full name" />
                      {errors.name && <p className="mt-1.5 text-xs text-rose-600">{errors.name}</p>}
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">{cfg.idLabel}</label>
                    <input type="text" name={cfg.idField} value={formData[cfg.idField]} onChange={handleChange} className={inputClass(cfg.idField)} placeholder={cfg.idPlaceholder} />
                    {errors[cfg.idField] && <p className="mt-1.5 text-xs text-rose-600">{errors[cfg.idField]}</p>}
                  </div>

                  {r !== 'hospital' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Department</label>
                      <select name="department" value={formData.department} onChange={handleChange} className={inputClass('department')}>
                        <option value="">Select Department</option>
                        {departments.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                      {errors.department && <p className="mt-1.5 text-xs text-rose-600">{errors.department}</p>}
                    </div>
                  )}

                  {r === 'student' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Semester</label>
                      <select name="semester" value={formData.semester} onChange={handleChange} className={inputClass('semester')}>
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                          <option key={semester} value={semester}>
                            Semester {semester}
                          </option>
                        ))}
                      </select>
                      {errors.semester && <p className="mt-1.5 text-xs text-rose-600">{errors.semester}</p>}
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass('password')} placeholder="Minimum 6 characters" />
                    {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass('confirmPassword')} placeholder="Confirm password" />
                    {errors.confirmPassword && <p className="mt-1.5 text-xs text-rose-600">{errors.confirmPassword}</p>}
                  </div>
                </div>
              )}

              {showFields && (
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-xl bg-gradient-to-r px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-300/40 transition duration-200 ${cfg.button} disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {loading ? 'Sending OTP...' : `Register as ${cfg.label}`}
                </button>
              )}

              <div className="text-center text-sm text-slate-600">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/login')} className="font-bold text-slate-900 hover:underline">
                  Login here
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Register;
