import { Fragment, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import { getSession, requestsAPI } from '../services/api';

const HospitalVerification = () => {
  const location = useLocation();
  const session = getSession();
  const hospitalInfo = location.state?.hospitalInfo || session || { hospitalId: 'HSP001', email: '' };
  const [studentId, setStudentId] = useState('');
  const [result, setResult] = useState(null);
  const [approvedRecord, setApprovedRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [verifyingApprovalId, setVerifyingApprovalId] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'found' | 'not-found' | 'not-approved' | 'expired' | 'loading'
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleVerify = async () => {
    const trimmed = studentId.trim();
    if (!trimmed) {
      setStatus('not-found');
      setMessage('Please enter a Student ID.');
      setResult(null);
      setApprovedRecord(null);
      setRecords([]);
      return;
    }

    setStatus('loading');
    try {
      const data = await requestsAPI.verify(trimmed);
      const allRecords = data.records || (data.data ? [data.data] : []);
      const latestRecord = data.latest || allRecords[0] || null;
      const latestApprovedRecord = data.latestApproved || allRecords.find((record) => record.status === 'Approved') || null;
      const latestValidApprovedRecord = data.latestValidApproved || allRecords.find((record) => record.status === 'Approved' && record.isValidNow) || null;

      setRecords(allRecords);
      setResult(latestRecord);
      setApprovedRecord(latestValidApprovedRecord);

      if (!latestRecord) {
        setStatus('not-found');
        setMessage(`No medical slip record found for Student ID "${trimmed}".`);
      } else if (latestValidApprovedRecord) {
        setStatus('found');
        setMessage('');
      } else if (latestApprovedRecord && latestApprovedRecord.isExpired) {
        setStatus('expired');
        setMessage(`Latest approved slip expired on ${formatDateTime(latestApprovedRecord.validUntil)}. Validity is only 7 days from approval.`);
      } else {
        setStatus('not-approved');
        setMessage(`Latest request for "${trimmed}" is "${latestRecord.status}".`);
      }
    } catch (err) {
      setStatus('not-found');
      setMessage(err.message || `No record found for "${trimmed}".`);
      setResult(null);
      setApprovedRecord(null);
      setRecords([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleVerify();
  };

  const handleClear = () => {
    setStudentId('');
    setResult(null);
    setApprovedRecord(null);
    setRecords([]);
    setExpandedRecordId(null);
    setVerifyingApprovalId('');
    setStatus('idle');
    setMessage('');
    inputRef.current?.focus();
  };

  const handleConfirmVerification = async () => {
    if (!approvedRecord?.approvalId) return;

    setVerifyingApprovalId(approvedRecord.approvalId);
    try {
      const data = await requestsAPI.confirmVerification(approvedRecord.approvalId);
      const updated = data.request;
      if (!updated) return;

      setApprovedRecord(updated);
      setResult((prev) => (prev?._id === updated._id ? updated : prev));
      setRecords((prev) => prev.map((record) => (record._id === updated._id ? updated : record)));
    } catch (err) {
      setMessage(err.message || 'Failed to mark slip as verified.');
      setStatus('not-found');
    } finally {
      setVerifyingApprovalId('');
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="auth-layout auth-ambient min-h-screen bg-gradient-to-br from-slate-100 via-cyan-100 to-teal-100">
      <DashboardNavbar role="hospital" routeState={{ hospitalInfo }} />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <section className="auth-panel auth-float rounded-3xl p-6 sm:p-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Hospital Verification</p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Verify approved medical slips</h1>
              <p className="mt-2 text-sm text-slate-600">Search by Student ID to validate approval status and details instantly.</p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
              <p className="font-bold">{hospitalInfo.hospitalId}</p>
              <p className="text-xs text-cyan-700">Hospital Panel</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <label htmlFor="student-id" className="mb-2 block text-sm font-semibold text-slate-700">
              Student ID
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="student-id"
                ref={inputRef}
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter Student ID (e.g. CS22A001)"
                className="auth-input w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
              />
              <button
                onClick={handleVerify}
                disabled={status === 'loading'}
                className="rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:from-cyan-700 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'loading' ? 'Checking...' : 'Verify'}
              </button>
              {status !== 'idle' && status !== 'loading' && (
                <button
                  onClick={handleClear}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {(status === 'not-found' || status === 'not-approved' || status === 'expired') && (
          <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em]">
              {status === 'not-found' ? 'No Record Found' : status === 'expired' ? 'Slip Validity Over' : 'Request Not Approved'}
            </p>
            <p className="mt-2 text-sm">{message}</p>
          </section>
        )}

        {status !== 'idle' && result && (
          <section
            className={`mt-6 rounded-2xl border p-5 ${
              result.status === 'Approved'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : result.status === 'Rejected'
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            <p className="text-sm font-extrabold uppercase tracking-[0.14em]">Latest Request Status: {result.status}</p>
            <p className="mt-2 text-sm">
              Latest submission: {formatDateTime(result.createdAt)} {result.rejectionReason ? `| Rejection reason: ${result.rejectionReason}` : ''}
            </p>
          </section>
        )}

        {approvedRecord && (
          <section className="auth-panel mt-6 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Approved Slip Details</p>
            <h3 className="mt-1 text-xl font-extrabold text-emerald-900">Status: Valid</h3>
            <p className="mt-2 text-sm text-emerald-800">
              This slip is approved by HOD and can be accepted by the hospital for verification.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Student</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{approvedRecord.studentName || '-'}</p>
                <p className="text-sm text-slate-700">{approvedRecord.studentId || '-'}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Department</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{approvedRecord.department || '-'}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approved By HOD</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{approvedRecord.approvedByName || '-'}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approval ID</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{approvedRecord.approvalId || '-'}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approved On</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(approvedRecord.approvedAt)}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Valid Till</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(approvedRecord.validUntil)}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Hospital Verification</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {approvedRecord.verifiedByHospital ? 'Already Verified' : 'Pending Verification'}
                </p>
                <p className="text-xs text-slate-600">{approvedRecord.verifiedAt ? `On ${formatDateTime(approvedRecord.verifiedAt)}` : ''}</p>
              </div>
            </div>

            {!approvedRecord.verifiedByHospital && (
              <div className="mt-5">
                <button
                  onClick={handleConfirmVerification}
                  disabled={verifyingApprovalId === approvedRecord.approvalId}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:from-emerald-700 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {verifyingApprovalId === approvedRecord.approvalId ? 'Saving...' : 'Mark as Verified'}
                </button>
              </div>
            )}
          </section>
        )}

        {records.length > 0 && (
          <section className="auth-panel mt-6 overflow-hidden rounded-3xl">
            <div className="border-b border-slate-200 bg-white/70 px-6 py-4 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Student Request History</p>
              <h3 className="mt-1 text-lg font-extrabold text-slate-900">All medical records ({records.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-500">Submitted</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500">Reason</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500">Approval ID</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500">Hospital Verification</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {records.map((record) => (
                    <Fragment key={record._id}>
                      <tr key={record._id}>
                        <td className="px-4 py-3 text-slate-700">{formatDateTime(record.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              record.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : record.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{record.reason || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{record.approvalId || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{record.verifiedByHospital ? 'Verified' : 'Not Verified'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedRecordId((prev) => (prev === record._id ? null : record._id))}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            {expandedRecordId === record._id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      {expandedRecordId === record._id && (
                        <tr>
                          <td colSpan={7} className="bg-slate-50 px-4 py-4">
                            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
                              <p><span className="font-semibold text-slate-900">Student:</span> {record.studentName || '-'} ({record.studentId || '-'})</p>
                              <p><span className="font-semibold text-slate-900">Department:</span> {record.department || '-'}</p>
                              <p><span className="font-semibold text-slate-900">Request Date:</span> {formatDateTime(record.date)}</p>
                              <p><span className="font-semibold text-slate-900">Approved By HOD:</span> {record.approvedByName || '-'}</p>
                              <p><span className="font-semibold text-slate-900">Approved At:</span> {formatDateTime(record.approvedAt)}</p>
                              <p><span className="font-semibold text-slate-900">Valid Till:</span> {formatDateTime(record.validUntil)}</p>
                              <p><span className="font-semibold text-slate-900">Validity Status:</span> {record.status === 'Approved' ? (record.isValidNow ? 'Valid' : 'Expired') : '-'}</p>
                              <p><span className="font-semibold text-slate-900">Rejected At:</span> {formatDateTime(record.rejectedAt)}</p>
                              <p><span className="font-semibold text-slate-900">Rejection Reason:</span> {record.rejectionReason || '-'}</p>
                              <p><span className="font-semibold text-slate-900">Verified At:</span> {formatDateTime(record.verifiedAt)}</p>
                              <p><span className="font-semibold text-slate-900">Hospital ID:</span> {record.verifiedByHospitalId || '-'}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {status === 'idle' && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Enter a Student ID and click Verify to check medical slip approval.
          </p>
        )}
      </main>
    </div>
  );
};

export default HospitalVerification;
