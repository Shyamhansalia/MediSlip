import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authAPI, saveSession } from '../services/api';

const roleConfig = {
  student: {
    label: 'Student Portal',
    idField: 'studentId',
    idLabel: 'Student ID',
    idPlaceholder: 'Enter your Student ID',
    dashboard: '/student-dashboard',
    stateKey: 'studentInfo',
    ring: 'focus:ring-sky-500 focus:border-sky-500',
    button: 'from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600',
    chip: 'bg-sky-100 text-sky-800 border-sky-200',
    bg: 'from-slate-100 via-sky-100 to-cyan-100',
    accent: 'from-sky-600/15 to-cyan-500/10',
  },
  hod: {
    label: 'HOD / Faculty Portal',
    idField: 'employeeId',
    idLabel: 'Employee ID',
    idPlaceholder: 'Enter your Employee ID',
    dashboard: '/hod-dashboard',
    stateKey: 'hodInfo',
    ring: 'focus:ring-emerald-500 focus:border-emerald-500',
    button: 'from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600',
    chip: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bg: 'from-slate-100 via-emerald-100 to-teal-100',
    accent: 'from-emerald-600/15 to-teal-500/10',
  },
  hospital: {
    label: 'Hospital Staff Portal',
    idField: 'hospitalId',
    idLabel: 'Hospital ID',
    idPlaceholder: 'Enter your Hospital ID',
    dashboard: '/hospital-verify',
    stateKey: 'hospitalInfo',
    ring: 'focus:ring-amber-500 focus:border-amber-500',
    button: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    chip: 'bg-amber-100 text-amber-800 border-amber-200',
    bg: 'from-slate-100 via-amber-100 to-orange-100',
    accent: 'from-amber-500/20 to-orange-500/10',
  },
};

const Login = () => {
  const [role, setRole] = useState('student');
  const [idValue, setIdValue] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotRole, setForgotRole] = useState('student');
  const [forgotIdValue, setForgotIdValue] = useState('');
  const [forgotStep, setForgotStep] = useState('request'); // request | reset
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cfg = roleConfig[role];
    const cleanedIdValue = idValue.trim();
    if (!cleanedIdValue) {
      setError(`${cfg.idLabel} is required.`);
      setLoading(false);
      return;
    }

    try {
      const data = await authAPI.login({ password, role, [cfg.idField]: cleanedIdValue });
      saveSession(data.token, data.user);

      const userRole = data?.user?.role || role;
      const nextCfg = roleConfig[userRole] || cfg;
      navigate(nextCfg.dashboard, {
        state: { [nextCfg.stateKey]: data?.user || { role: userRole } },
        replace: true,
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const cfg = roleConfig[role];
  const forgotCfg = roleConfig[forgotRole];

  const openForgotPassword = () => {
    setShowForgot(true);
    setForgotRole(role);
    setForgotIdValue(idValue.trim());
    setForgotStep('request');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotMessage('');
  };

  const handleSendForgotOtp = async () => {
    const cleanedForgotId = forgotIdValue.trim();
    if (!cleanedForgotId) {
      setForgotError(`${forgotCfg.idLabel} is required.`);
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');
    try {
      const data = await authAPI.sendForgotPasswordOTP({
        role: forgotRole,
        [forgotCfg.idField]: cleanedForgotId,
      });
      setForgotStep('reset');
      setForgotMessage(data.message || 'OTP sent to your registered email.');
    } catch (err) {
      setForgotError(err.message || 'Failed to send OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const cleanedForgotId = forgotIdValue.trim();
    if (!cleanedForgotId) {
      setForgotError(`${forgotCfg.idLabel} is required.`);
      return;
    }
    if (!forgotOtp.trim()) {
      setForgotError('OTP is required.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');
    try {
      const data = await authAPI.resetPassword({
        role: forgotRole,
        [forgotCfg.idField]: cleanedForgotId,
        otp: forgotOtp.trim(),
        newPassword,
      });
      setForgotMessage(data.message || 'Password reset successful.');
      setShowForgot(false);
      setPassword('');
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className={`auth-layout auth-ambient bg-gradient-to-br ${cfg.bg}`}>
      <Navbar />
      <main className="relative z-10 px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-2">
          <section className={`auth-panel auth-float rounded-3xl bg-gradient-to-br ${cfg.accent} p-8 lg:p-10`}>
            <p className={`inline-flex rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${cfg.chip}`}>
              Secure Access
            </p>
            <h1 className="mt-6 text-3xl font-extrabold leading-tight text-slate-900 lg:text-4xl">
              Welcome back to MediSlip
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Continue with your verified institute credentials to manage approvals, review medical slips, and stay synced with your department workflows.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-slate-700">
              <p className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3">Fast review queue with role-specific dashboard routing.</p>
              <p className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3">Centralized records for students, HODs, and hospital staff.</p>
              <p className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3">Session-secure sign in with OTP-enabled registration flow.</p>
            </div>
          </section>

          <section className="auth-panel auth-float rounded-3xl p-6 sm:p-8 lg:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Sign In</h2>
              <p className="mt-2 text-sm text-slate-600">Choose your role and continue with your password.</p>
              <span className={`mt-4 inline-flex rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${cfg.chip}`}>
                {cfg.label}
              </span>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
              {forgotMessage && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{forgotMessage}</div>}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Login As</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setIdValue('');
                    setError('');
                  }}
                  className={`auth-input block w-full px-3 py-3 text-sm text-slate-900 ${cfg.ring}`}
                >
                  <option value="student">Student</option>
                  <option value="hod">HOD / Faculty</option>
                  <option value="hospital">Hospital Staff</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">{cfg.idLabel}</label>
                <input
                  type="text"
                  required
                  value={idValue}
                  onChange={(e) => setIdValue(e.target.value)}
                  className={`auth-input block w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 ${cfg.ring}`}
                  placeholder={cfg.idPlaceholder}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`auth-input block w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 ${cfg.ring}`}
                  placeholder="Enter your password"
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-xs font-bold text-slate-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {showForgot && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-extrabold text-slate-900">Reset Password via OTP</p>

                  {forgotError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{forgotError}</div>}

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Role</label>
                    <select
                      value={forgotRole}
                      onChange={(e) => {
                        setForgotRole(e.target.value);
                        setForgotIdValue('');
                        setForgotError('');
                      }}
                      className="auth-input block w-full px-3 py-2.5 text-sm text-slate-900"
                    >
                      <option value="student">Student</option>
                      <option value="hod">HOD / Faculty</option>
                      <option value="hospital">Hospital Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">{forgotCfg.idLabel}</label>
                    <input
                      type="text"
                      value={forgotIdValue}
                      onChange={(e) => setForgotIdValue(e.target.value)}
                      className="auth-input block w-full px-3 py-2.5 text-sm text-slate-900"
                      placeholder={forgotCfg.idPlaceholder}
                    />
                  </div>

                  {forgotStep === 'reset' && (
                    <>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">OTP</label>
                        <input
                          type="text"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value)}
                          className="auth-input block w-full px-3 py-2.5 text-sm text-slate-900"
                          placeholder="Enter 6-digit OTP"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="auth-input block w-full px-3 py-2.5 text-sm text-slate-900"
                          placeholder="Minimum 6 characters"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="auth-input block w-full px-3 py-2.5 text-sm text-slate-900"
                          placeholder="Re-enter new password"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    {forgotStep === 'request' ? (
                      <button
                        type="button"
                        onClick={handleSendForgotOtp}
                        disabled={forgotLoading}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                      >
                        {forgotLoading ? 'Sending...' : 'Send OTP'}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleSendForgotOtp}
                          disabled={forgotLoading}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-60"
                        >
                          {forgotLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                        <button
                          type="button"
                          onClick={handleResetPassword}
                          disabled={forgotLoading}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                        >
                          {forgotLoading ? 'Updating...' : 'Reset Password'}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(false);
                        setForgotError('');
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl bg-gradient-to-r px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-300/40 transition duration-200 ${cfg.button} disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {loading ? 'Checking credentials...' : `Sign In to ${cfg.label}`}
              </button>

              <div className="text-center text-sm text-slate-600">
                Need a new account?{' '}
                <button type="button" onClick={() => navigate('/register')} className="font-bold text-slate-900 hover:underline">
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

export default Login;
