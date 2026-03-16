import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerify from './pages/OTPVerify';
import StudentForm from './pages/StudentForm';
import HODDashboard from './pages/HODDashboard';
import MedicalSlip from './pages/MedicalSlip';
import HospitalVerification from './pages/HospitalVerification';
import StudentProfile from './pages/StudentProfile';
import HODProfile from './pages/HODProfile';
import HospitalProfile from './pages/HospitalProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerify />} />
        <Route path="/student-dashboard" element={<StudentForm />} />
        <Route path="/hod-dashboard" element={<HODDashboard />} />
        <Route path="/slip" element={<MedicalSlip />} />
        <Route path="/hospital-verify" element={<HospitalVerification />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/hod-profile" element={<HODProfile />} />
        <Route path="/hospital-profile" element={<HospitalProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
