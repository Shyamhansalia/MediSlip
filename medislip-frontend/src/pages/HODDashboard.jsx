import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import { authAPI, clearSession, getSession, requestsAPI, saveSession } from '../services/api';

const HODDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const fallbackHodInfo = { employeeId: 'HOD001', name: 'Dr. John Smith', department: 'Computer Science' };
  const hodInfo = {
    ...(session || {}),
    ...(location.state?.hodInfo || {}),
  };
  const resolvedHodInfo = (hodInfo.employeeId || hodInfo.name || hodInfo.department)
    ? hodInfo
    : fallbackHodInfo;

  const [requests, setRequests] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorising, setAuthorising] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { initDashboard(); }, []);

  const initDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authAPI.getMe();
      const me = data?.user || {};

      if (me.role !== 'hod') {
        clearSession();
        setError('You are logged in as a non-HOD account. Please login with HOD credentials.');
        navigate('/login', { replace: true });
        return;
      }

      const token = localStorage.getItem('token');
      if (token) saveSession(token, me);
      await loadRequests();
    } catch (err) {
      clearSession();
      setError('Session expired or invalid. Please login again.');
      navigate('/login', { replace: true });
    } finally {
      setAuthorising(false);
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await requestsAPI.departmentRequests();
      setRequests(data.data || []);
    } catch (err) {
      setError('Failed to load requests: ' + err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await requestsAPI.approve(id);
      alert('Request approved!');
      loadRequests();
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    }
  };

  const openRejectModal = (request) => { setSelectedRequest(request); setShowRejectModal(true); setRejectionReason(''); };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { alert('Please provide a reason for rejection'); return; }
    try {
      await requestsAPI.reject(selectedRequest._id || selectedRequest.id, rejectionReason);
      setShowRejectModal(false); setSelectedRequest(null); setRejectionReason('');
      alert('Request rejected');
      loadRequests();
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    }
  };

  const pendingRequests = requests.filter((req) => req.status === 'Pending');
  const processedRequests = requests.filter((req) => req.status !== 'Pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <DashboardNavbar role="hod" routeState={{ hodInfo: resolvedHodInfo }} />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HOD Approval Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage medical requests for your department</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-xl font-bold text-green-600">{resolvedHodInfo.department}</p>
              <p className="text-sm text-gray-600 mt-2">{resolvedHodInfo.name}</p>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm mb-6">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-sm text-yellow-600 font-medium">Pending Requests</p>
            <p className="text-3xl font-bold text-yellow-800 mt-2">{pendingRequests.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-green-600 font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-800 mt-2">{requests.filter(r => r.status === 'Approved').length}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-sm text-red-600 font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-800 mt-2">{requests.filter(r => r.status === 'Rejected').length}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Requests ({pendingRequests.length})</h2>
          {(loading || authorising) ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">Loading requests...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRequests.map((request) => (
                <div key={request._id || request.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.studentName || request.name}</h3>
                      <p className="text-sm text-gray-600">ID: {request.studentId}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">{request.status}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><span className="font-medium text-gray-700">Department:</span> <span className="text-gray-600">{request.department}</span></p>
                    <p className="text-sm"><span className="font-medium text-gray-700">Preferred Date:</span> <span className="text-gray-600">{request.preferredDate || request.date}</span></p>
                    <p className="text-sm"><span className="font-medium text-gray-700">Submitted:</span> <span className="text-gray-600">{new Date(request.createdAt || request.submittedAt).toLocaleString()}</span></p>
                    <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                      <p className="text-sm text-gray-600">{request.reason}</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => handleApprove(request._id || request.id)} className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-all duration-200 font-medium hover:scale-105">Approve</button>
                    <button onClick={() => openRejectModal(request)} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-all duration-200 font-medium hover:scale-105">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && pendingRequests.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No pending requests at the moment</p>
              <p className="text-sm text-gray-500">Requests from {hodInfo.department} students will appear here</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Processed Requests ({processedRequests.length})</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {processedRequests.length === 0 ? (
              <div className="p-8 text-center"><p className="text-gray-600">No processed requests yet</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval ID</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedRequests.map((request) => (
                      <tr key={request._id || request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{request.studentName || request.name}</div>
                          <div className="text-sm text-gray-500">{request.studentId}</div>
                        </td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-600 max-w-xs truncate">{request.reason}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.preferredDate || request.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{request.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.approvalId || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Request</h3>
            <p className="text-sm text-gray-600 mb-4">Provide a reason for rejecting this medical request:</p>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4" rows="4"
              placeholder="Enter rejection reason..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
            <div className="flex space-x-3">
              <button onClick={() => { setShowRejectModal(false); setSelectedRequest(null); setRejectionReason(''); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 font-medium">Cancel</button>
              <button onClick={handleReject} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-medium">Reject Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;
