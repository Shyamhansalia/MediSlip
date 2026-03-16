import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const HODLogin = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    if (!/^hod\.[a-z]+@charusat\.ac\.in$/.test(value)) {
      return 'Use format: hod.department@charusat.ac.in';
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

    const registeredHODs = JSON.parse(localStorage.getItem('registeredHODs') || '[]');
    const hod = registeredHODs.find((item) => item.employeeId === employeeId);

    if (hod && hod.password === password) {
      navigate('/hod-dashboard', {
        state: {
          hodInfo: {
            employeeId: hod.employeeId,
            name: hod.name,
            department: hod.department,
          },
        },
      });
      return;
    }

    alert('Invalid credentials. For demo, any Employee ID and password can continue.');
    navigate('/hod-dashboard', {
      state: {
        hodInfo: {
          employeeId,
          name: 'Demo HOD',
          department: 'Computer Science',
        },
      },
    });
  };

  return (
    <div className="auth-layout auth-ambient bg-gradient-to-br from-slate-100 via-emerald-100 to-teal-100">
      <Navbar />
      <main className="relative z-10 px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          <section className="auth-panel auth-float rounded-3xl bg-gradient-to-br from-emerald-600/15 to-teal-500/10 p-8 lg:p-10">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
              HOD Access
            </span>
            <h1 className="mt-6 text-3xl font-extrabold leading-tight text-slate-900">Review and approve department requests</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Sign in with your employee credentials to access pending requests, check history, and move approvals forward quickly.
            </p>
          </section>

          <section className="auth-panel auth-float rounded-3xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl font-extrabold text-slate-900">HOD Login</h2>
            <p className="mt-2 text-sm text-slate-600">Use your official role credentials.</p>

            <form className="mt-6 space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="employee-id" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Employee ID
                </label>
                <input
                  id="employee-id"
                  name="employeeId"
                  type="text"
                  required
                  className="auth-input block w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Enter your Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  HOD Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`auth-input block w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500 ${
                    emailError ? 'border-rose-500' : 'border-slate-300'
                  }`}
                  placeholder="hod.department@charusat.ac.in"
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
                  className="auth-input block w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-300/40 transition duration-200 hover:from-emerald-700 hover:to-teal-600"
              >
                Sign In
              </button>

              <div className="text-center text-sm text-slate-600">
                Do not have an account?{' '}
                <button type="button" onClick={() => navigate('/hod-register')} className="font-bold text-slate-900 hover:underline">
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

export default HODLogin;
