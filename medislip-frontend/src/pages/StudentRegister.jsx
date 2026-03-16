import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

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

const StudentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    department: '',
    semester: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@charusat.edu.in')) {
      newErrors.email = 'Only CHARUSAT student email IDs are allowed (e.g. id@charusat.edu.in)';
    }
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const registeredStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
    const exists = registeredStudents.find((student) => student.studentId === formData.studentId);
    if (exists) {
      alert('Student ID already registered. Please use a different ID.');
      return;
    }

    registeredStudents.push({
      studentId: formData.studentId,
      name: formData.name,
      email: formData.email,
      department: formData.department,
      semester: formData.semester,
      password: formData.password,
    });
    localStorage.setItem('registeredStudents', JSON.stringify(registeredStudents));
    alert('Registration successful. Please login to continue.');
    navigate('/student-login');
  };

  const inputClass = (field) =>
    `auth-input w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500 ${
      errors[field] ? 'border-rose-500' : 'border-slate-300'
    }`;

  return (
    <div className="auth-layout auth-ambient bg-gradient-to-br from-slate-100 via-sky-100 to-cyan-100">
      <Navbar />
      <main className="relative z-10 px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <section className="auth-panel auth-float rounded-3xl p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Student Registration</h1>
                <p className="mt-2 text-sm text-slate-600">Create your account to access medical slip services and approval tracking.</p>
              </div>
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-800">
                Student Onboarding
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="studentId" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Student ID
                  </label>
                  <input type="text" id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} className={inputClass('studentId')} placeholder="Enter Student ID" />
                  {errors.studentId && <p className="mt-1.5 text-xs text-rose-600">{errors.studentId}</p>}
                </div>

                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass('name')} placeholder="Enter full name" />
                  {errors.name && <p className="mt-1.5 text-xs text-rose-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass('email')} placeholder="id@charusat.edu.in" />
                  {errors.email ? <p className="mt-1.5 text-xs text-rose-600">{errors.email}</p> : <p className="mt-1.5 text-xs text-slate-500">Must be a CHARUSAT email: id@charusat.edu.in</p>}
                </div>

                <div>
                  <label htmlFor="department" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Department
                  </label>
                  <select id="department" name="department" value={formData.department} onChange={handleChange} className={inputClass('department')}>
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="mt-1.5 text-xs text-rose-600">{errors.department}</p>}
                </div>

                <div>
                  <label htmlFor="semester" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Semester
                  </label>
                  <select id="semester" name="semester" value={formData.semester} onChange={handleChange} className={inputClass('semester')}>
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    ))}
                  </select>
                  {errors.semester && <p className="mt-1.5 text-xs text-rose-600">{errors.semester}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={inputClass('password')} placeholder="Minimum 6 characters" />
                  {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass('confirmPassword')}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <p className="mt-1.5 text-xs text-rose-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-300/40 transition duration-200 hover:from-sky-700 hover:to-cyan-600"
              >
                Register
              </button>

              <div className="text-center text-sm text-slate-600">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/student-login')} className="font-bold text-slate-900 hover:underline">
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

export default StudentRegister;
