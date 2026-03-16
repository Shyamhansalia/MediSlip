import { Link, useNavigate } from 'react-router-dom';

/**
 * DashboardNavbar — shared navbar for all three panels.
 *
 * Props:
 *  role        : 'student' | 'hod' | 'hospital'
 *  routeState  : the state object to pass through to the profile route
 *                e.g. { studentInfo: {...} }
 */
const roleTheme = {
  student: {
    profilePath: '/student-profile',
    color: 'blue',
    avatarBg: 'bg-blue-100',
    avatarText: 'text-blue-600',
    ring: 'ring-blue-300',
    dot: 'bg-blue-500',
  },
  hod: {
    profilePath: '/hod-profile',
    color: 'green',
    avatarBg: 'bg-green-100',
    avatarText: 'text-green-600',
    ring: 'ring-green-300',
    dot: 'bg-green-500',
  },
  hospital: {
    profilePath: '/hospital-profile',
    color: 'cyan',
    avatarBg: 'bg-cyan-100',
    avatarText: 'text-cyan-700',
    ring: 'ring-cyan-300',
    dot: 'bg-cyan-500',
  },
};

const DashboardNavbar = ({ role = 'student', routeState = {} }) => {
  const navigate = useNavigate();
  const theme = roleTheme[role];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-sm">🏥</span>
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight">
              Medi<span className="text-blue-500">Slip</span>
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Profile Icon Button */}
            <button
              onClick={() => navigate(theme.profilePath, { state: routeState })}
              title="View Profile"
              className={`relative w-9 h-9 rounded-full ${theme.avatarBg} ${theme.avatarText} flex items-center justify-center ring-2 ${theme.ring} hover:scale-110 transition-all duration-200 shadow-sm`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {/* Online dot */}
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${theme.dot} border-2 border-white rounded-full`} />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
