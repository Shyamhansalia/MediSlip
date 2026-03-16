import { useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getSession } from '../services/api';

const HospitalProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const hospitalInfo =
    location.state?.hospitalInfo || session || { hospitalId: 'HSP001', email: 'hospital@hosp.com' };

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  const Field = ({ label, value }) => (
    <div className="rounded-xl border border-slate-200/80 bg-white/70 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value || '-'}</p>
    </div>
  );

  return (
    <div className="auth-layout auth-ambient min-h-screen bg-gradient-to-br from-slate-100 via-cyan-100 to-teal-100">
      <main className="relative z-10 px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate('/hospital-verify', { state: { hospitalInfo } })}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Verification Panel
          </button>

          <section className="auth-panel auth-float overflow-hidden rounded-3xl">
            <div className="bg-gradient-to-r from-cyan-700 to-teal-600 px-7 py-8 text-white sm:px-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">Hospital Account</p>
                  <h1 className="mt-2 text-2xl font-extrabold">{hospitalInfo.hospitalId}</h1>
                  <p className="mt-2 text-sm text-cyan-100">Profile and access details for verification operations.</p>
                </div>
                <span className="rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]">
                  Active
                </span>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
              <Field label="Hospital ID" value={hospitalInfo.hospitalId} />
              <Field label="Email Address" value={hospitalInfo.email} />
              <Field label="Role" value="Hospital" />
            </div>

            <div className="border-t border-slate-200 bg-white/80 px-6 py-5 sm:px-8">
              <button
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100 sm:w-auto sm:min-w-48"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HospitalProfile;
