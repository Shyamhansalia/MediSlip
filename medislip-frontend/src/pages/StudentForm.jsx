import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import { requestsAPI, getSession } from '../services/api';

const StudentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const fallbackStudentInfo = { studentId: 'S001', name: 'Student', department: 'Computer Science' };
  const studentInfo = {
    ...(session || {}),
    ...(location.state?.studentInfo || {}),
  };
  const resolvedStudentInfo = (studentInfo.studentId || studentInfo.name || studentInfo.department)
    ? studentInfo
    : fallbackStudentInfo;

  const [formData, setFormData] = useState({ reason: '', date: '' });
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadMyApplications(); }, []);

  const loadMyApplications = async () => {
    setFetching(true);
    try {
      const data = await requestsAPI.myRequests();
      setMyApplications(data.data || []);
    } catch (err) {
      setError('Failed to load applications: ' + err.message);
    } finally { setFetching(false); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await requestsAPI.submit({ reason: formData.reason, preferredDate: formData.date });
      setFormData({ reason: '', date: '' });
      alert('Medical request submitted successfully!');
      loadMyApplications();
    } catch (err) {
      setError('Failed to submit: ' + err.message);
    } finally { setLoading(false); }
  };

  const viewSlip = (app) => {
    if (app.status === 'Approved') navigate('/slip', { state: { application: app } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <DashboardNavbar role="student" routeState={{ studentInfo: resolvedStudentInfo }} />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><p className="text-sm text-gray-600">Student ID</p><p className="text-lg font-semibold text-gray-900">{resolvedStudentInfo.studentId}</p></div>
            <div><p className="text-sm text-gray-600">Name</p><p className="text-lg font-semibold text-gray-900">{resolvedStudentInfo.name}</p></div>
            <div><p className="text-sm text-gray-600">Department</p><p className="text-lg font-semibold text-gray-900">{resolvedStudentInfo.department}</p></div>
          </div>
        </div>
        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm mb-6">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Medical Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Medical Leave <span className="text-red-500">*</span></label>
                <textarea id="reason" name="reason" rows="4" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.reason} onChange={handleChange} placeholder="Describe your medical concern in detail..."></textarea>
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date <span className="text-red-500">*</span></label>
                <input type="date" id="date" name="date" required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.date} onChange={handleChange} />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800"><strong>Note:</strong> Your request will be sent to the HOD of {resolvedStudentInfo.department} department for approval.</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-all duration-200 hover:scale-105 font-medium disabled:opacity-60">
                {loading ? 'Submitting...' : `Submit Request to ${resolvedStudentInfo.department} HOD`}
              </button>
            </form>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Applications ({myApplications.length})</h2>
            {fetching ? (
              <div className="text-center py-8 text-gray-500">Loading applications...</div>
            ) : myApplications.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="mt-2 text-gray-600">No applications submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {myApplications.map((app) => (
                  <div key={app._id || app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Request #{(app._id || app.id || '').toString().slice(-6)}</p>
                        <p className="text-sm text-gray-600">Department: {app.department}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p><strong>Reason:</strong> {app.reason}</p>
                      <p><strong>Date:</strong> {app.preferredDate || app.date}</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(app.createdAt || app.submittedAt).toLocaleString()}</p>
                    </div>
                    {app.status === 'Approved' && (
                      <div className="mt-3">
                        <p className="text-sm text-green-700 font-semibold mb-2">✓ Approval ID: {app.approvalId}</p>
                        <button onClick={() => viewSlip(app)} className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-all duration-200 text-sm font-medium">
                          View Medical Slip
                        </button>
                      </div>
                    )}
                    {app.status === 'Rejected' && app.rejectionReason && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-sm text-red-800"><strong>Reason:</strong> {app.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
