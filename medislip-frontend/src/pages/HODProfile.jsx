import { useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getSession } from '../services/api';

const HODProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const hodInfo = location.state?.hodInfo || session || { employeeId: 'HOD001', name: 'Dr. Demo HOD', email: 'hod@college.edu', department: 'Computer Science' };

  const handleLogout = () => { clearSession(); window.location.href = '/login'; };

  const Field = ({ label, value }) => (
    <div className="flex flex-col gap-1 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-base font-medium text-gray-800">{value || '—'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/hod-dashboard', { state: { hodInfo } })} className="flex items-center gap-2 text-green-600 hover:text-green-800 font-medium mb-6 group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </button>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center mx-auto mb-3"><span className="text-4xl">👨‍🏫</span></div>
            <h2 className="text-xl font-bold text-white">{hodInfo.name}</h2>
            <span className="mt-1 inline-block bg-green-400/40 text-white text-xs font-semibold px-3 py-1 rounded-full">HOD / Admin</span>
          </div>
          <div className="px-6 py-4">
            <Field label="Name" value={hodInfo.name} />
            <Field label="Employee ID" value={hodInfo.employeeId} />
            <Field label="Email" value={hodInfo.email} />
            <Field label="Department" value={hodInfo.department} />
            <Field label="Role" value="HOD / Admin" />
          </div>
          <div className="px-6 pb-6">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold py-3 rounded-xl transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODProfile;
