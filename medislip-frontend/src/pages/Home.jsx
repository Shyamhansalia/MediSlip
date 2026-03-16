import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const features = [
  { icon: '📋', title: 'Digital Medical Slips', desc: 'Students submit medical leave requests online — no paper forms, no queues.' },
  { icon: '✅', title: 'HOD Approval', desc: 'Department heads review and approve slips instantly from their dashboard.' },
  { icon: '🏥', title: 'Hospital Verification', desc: 'Hospital staff verify any approved slip in seconds using the Student ID.' },
  { icon: '🗂️', title: 'Centralized Slip Records', desc: 'All requests are stored in one place for easy tracking, review history, and audits.' },
  { icon: '⚡', title: 'Live Status Tracking', desc: 'Students see if their slip is Pending, Approved, or Rejected in real time.' },
  { icon: '📱', title: 'Works Everywhere', desc: 'Fully responsive — use it on phone, tablet, or desktop with ease.' },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🏥 College Hospital Medical Slip System
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Medical Slips,{' '}
            <span className="text-blue-500">Gone Digital</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
            A simple system connecting students, HODs, and hospital staff — from slip submission to final verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors text-base shadow-md"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-7 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-base"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white border-t border-gray-100 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: '🎓', role: 'Student', action: 'Submits a medical slip request with their details and reason.' },
              { icon: '👨‍💼', role: 'HOD', action: 'Reviews the request and approves or rejects it with remarks.' },
              { icon: '🏥', role: 'Hospital', action: 'Verifies the approved slip by looking up the Student ID.' },
            ].map((s, i) => (
              <div key={s.role} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-2xl mb-3 border-2 border-blue-100">
                  {s.icon}
                </div>
                <div className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Step {i + 1} · {s.role}</div>
                <p className="text-gray-500 text-sm">{s.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-100">
        MediSlip — College Hospital Medical Slip Management System
      </footer>
    </div>
  );
};

export default Home;
