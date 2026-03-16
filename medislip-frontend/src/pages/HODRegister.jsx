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

const HODRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    department: '',
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
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^hod\.[a-z]+@charusat\.ac\.in$/.test(formData.email)) {
      newErrors.email = 'Use official HOD email format: hod.department@charusat.ac.in';
    }
    if (!formData.department) newErrors.department = 'Department is required';
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

    const registeredHODs = JSON.parse(localStorage.getItem('registeredHODs') || '[]');
    const exists = registeredHODs.find((hod) => hod.employeeId === formData.employeeId);
    if (exists) {
      alert('Employee ID already registered. Please use a different ID.');
      return;
    }

    registeredHODs.push({
      employeeId: formData.employeeId,
      name: formData.name,
      email: formData.email,
      department: formData.department,
      password: formData.password,
    });
    localStorage.setItem('registeredHODs', JSON.stringify(registeredHODs));
    alert('Registration successful. Please login to continue.');
    navigate('/hod-login');
  };

  const inputClass = (field) =>
    `auth-input w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500 ${
      errors[field] ? 'border-rose-500' : 'border-slate-300'
    }`;

  return (
    <div className="auth-layout auth-ambient bg-gradient-to-br from-slate-100 via-emerald-100 to-teal-100">
      <Navbar />
      <main className="relative z-10 px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <section className="auth-panel auth-float rounded-3xl p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">HOD Registration</h1>
                <p className="mt-2 text-sm text-slate-600">Create your HOD account to manage and approve department submissions.</p>
              </div>
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                Faculty Onboarding
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="employeeId" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Employee ID
                  </label>
                  <input type="text" id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} className={inputClass('employeeId')} placeholder="Enter Employee ID" />
                  {errors.employeeId && <p className="mt-1.5 text-xs text-rose-600">{errors.employeeId}</p>}
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
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass('email')} placeholder="hod.department@charusat.ac.in" />
                  {errors.email ? <p className="mt-1.5 text-xs text-rose-600">{errors.email}</p> : <p className="mt-1.5 text-xs text-slate-500">Must follow HOD format: hod.department@charusat.ac.in</p>}
                </div>

                <div className="md:col-span-2">
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
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-300/40 transition duration-200 hover:from-emerald-700 hover:to-teal-600"
              >
                Register as HOD
              </button>

              <div className="text-center text-sm text-slate-600">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/hod-login')} className="font-bold text-slate-900 hover:underline">
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

export default HODRegister;
