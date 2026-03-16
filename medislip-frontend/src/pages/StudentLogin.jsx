import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const StudentLogin = () => {
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    if (!value.endsWith('@charusat.edu.in')) {
      return 'Only CHARUSAT student email IDs are allowed (e.g. id@charusat.edu.in)';
    }
    return '';
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError('');

    const registeredStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
    const student = registeredStudents.find((item) => item.studentId === studentId);

    if (student && student.password === password) {
      navigate('/student-dashboard', {
        state: {
          studentInfo: {
            studentId: student.studentId,
            name: student.name,
            department: student.department,
          },
        },
      });
      return;
    }

    alert('Invalid credentials. For demo, any Student ID and password can continue.');
    navigate('/student-dashboard', {
      state: {
        studentInfo: {
          studentId,
          name: 'Demo Student',
          department: 'Computer Science',
        },
      },
    });
  };

  return (
    <div className="auth-layout auth-ambient bg-gradient-to-br from-slate-100 via-sky-100 to-cyan-100">
      <Navbar />
      <main className="relative z-10 px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          <section className="auth-panel auth-float rounded-3xl bg-gradient-to-br from-sky-600/15 to-cyan-500/10 p-8 lg:p-10">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-800">
              Student Access
            </span>
            <h1 className="mt-6 text-3xl font-extrabold leading-tight text-slate-900">Continue your medical request workflow</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Log in with your Student ID and CHARUSAT email to submit requests, track approvals, and manage your slip history.
            </p>
          </section>

          <section className="auth-panel auth-float rounded-3xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl font-extrabold text-slate-900">Student Login</h2>
            <p className="mt-2 text-sm text-slate-600">Use your registered credentials to continue.</p>

            <form className="mt-6 space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="student-id" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Student ID
                </label>
                <input
                  id="student-id"
                  name="studentId"
                  type="text"
                  required
                  className="auth-input block w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500"
                  placeholder="Enter your Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`auth-input block w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500 ${
                    emailError ? 'border-rose-500' : 'border-slate-300'
                  }`}
                  placeholder="id@charusat.edu.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                />
                {emailError && <p className="mt-1.5 text-xs text-rose-600">{emailError}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="auth-input block w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-300/40 transition duration-200 hover:from-sky-700 hover:to-cyan-600"
              >
                Sign In
              </button>

              <div className="text-center text-sm text-slate-600">
                Do not have an account?{' '}
                <button type="button" onClick={() => navigate('/student-register')} className="font-bold text-slate-900 hover:underline">
                  Register here
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentLogin;
