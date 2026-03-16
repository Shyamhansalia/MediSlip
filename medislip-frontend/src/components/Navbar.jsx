import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-sm">🏥</span>
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight">
              Medi<span className="text-blue-500">Slip</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Sign In
            </Link>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
