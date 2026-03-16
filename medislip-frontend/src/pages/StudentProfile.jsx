import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI, clearSession, getSession, saveSession } from '../services/api';

const StudentProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();

  const fallbackStudentInfo = {
    studentId: 'S001',
    name: 'Demo Student',
    email: 'student@college.edu',
    department: 'Computer Science',
  };

  const initialProfile = {
    ...(session || {}),
    ...(location.state?.studentInfo || {}),
  };

  const resolvedInitialProfile = (initialProfile.studentId || initialProfile.name || initialProfile.department)
    ? initialProfile
    : fallbackStudentInfo;

  const [profile, setProfile] = useState(resolvedInitialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    semester: resolvedInitialProfile.semester || '',
  });

  const semesterOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await authAPI.getMe();
        const latest = data?.user || {};
        const merged = { ...resolvedInitialProfile, ...latest };
        setProfile(merged);
        setFormData({
          semester: merged.semester || '',
        });
        const token = localStorage.getItem('token');
        if (token) saveSession(token, merged);
      } catch (err) {
        setError(err.message || 'Failed to load latest profile');
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startEditing = () => {
    setIsEditing(true);
    setError('');
    setMessage('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
    setMessage('');
    setFormData({
      semester: profile.semester || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const data = await authAPI.updateMe({
        semester: formData.semester,
      });
      const updated = data?.user || {};
      const merged = { ...profile, ...updated };
      setProfile(merged);
      setFormData({
        semester: merged.semester || '',
      });
      const token = localStorage.getItem('token');
      if (token) saveSession(token, merged);
      setMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, value }) => (
    <div className="flex flex-col gap-1 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-base font-medium text-gray-800">{value || '-'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/student-dashboard', { state: { studentInfo: profile } })}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center mx-auto mb-3">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            <span className="mt-1 inline-block bg-blue-400/40 text-white text-xs font-semibold px-3 py-1 rounded-full">Student</span>
          </div>

          <div className="px-6 py-4">
            {error && <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
            {message && <div className="mb-3 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg">{message}</div>}

            <Field label="Student ID" value={profile.studentId} />
            <Field label="Email" value={profile.email} />

            <Field label="Department" value={profile.department} />

            {isEditing ? (
              <div className="flex flex-col gap-1 py-3 border-b border-gray-100">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            ) : (
              <Field label="Semester" value={profile.semester ? `Semester ${profile.semester}` : '-'} />
            )}

            <Field label="Role" value="Student" />
          </div>

          <div className="px-6 pb-6">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={cancelEditing}
                  type="button"
                  className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                onClick={startEditing}
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold py-3 rounded-xl transition-all duration-200 mb-3"
              >
                Edit Semester
              </button>
            )}

            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold py-3 rounded-xl transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
