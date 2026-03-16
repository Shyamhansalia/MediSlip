import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';


const MedicalSlip = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const application = location.state?.application || {
    studentId: 'S001',
    name: 'John Doe',
    status: 'Approved',
    approvalId: 'APP001'
  };
  const studentName = application.name || application.studentName || 'N/A';

  const handlePrint = () => {
    window.print();
    console.log('Printing medical slip...');
  };

  const handleBack = () => {
    navigate('/student-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-all duration-200 font-medium transform hover:scale-105"
          >
            Print Slip
          </button>
        </div>

        {/* Medical Slip */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              🏥 COLLEGE HOSPITAL
            </h1>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Medical Approval Slip
            </h2>
            <p className="text-sm text-gray-600">Digital Medical Record</p>
          </div>

          {/* Approval Status */}
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6 text-center">
            <p className="text-green-800 font-bold text-lg">✓ APPROVED</p>
            <p className="text-green-700 text-sm mt-1">
              This student has been approved for medical treatment
            </p>
          </div>

          {/* Student Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Student ID</p>
                <p className="text-lg font-semibold text-gray-900">{application.studentId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approval ID</p>
                <p className="text-lg font-semibold text-gray-900">{application.approvalId}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{studentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Issue Date</p>
                <p className="text-lg text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Valid Until</p>
                <p className="text-lg text-gray-900">
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Instructions for Student
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Present this slip at the college hospital reception</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Hospital staff will verify using the Hospital Panel and Student ID</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Carry your student ID card for additional verification</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>This slip is valid for 7 days from the issue date</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Free medical service available for enrolled students only</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-300">
            <p className="text-sm text-gray-600">
              This is a digitally generated medical slip. No signature required.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              For queries, contact: hospital@college.edu | +91-1234567890
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
          <button
            onClick={handleBack}
            className="bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-all duration-200 font-medium transform hover:scale-105"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-all duration-200 font-medium transform hover:scale-105"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalSlip;
