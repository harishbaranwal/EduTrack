import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { login, devLogin, clearError } from '../store/features/auth/authSlice';
import showToast from '../utils/toast';
import Loader from '../components/Loader';
import { BrainCircuit, ArrowLeft, Zap } from 'lucide-react';

const LOGOUT_MARKER_KEY = 'edutrack_logout_marker';
const IS_DEV = import.meta.env.DEV;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [devEmail, setDevEmail] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const getDashboardRoute = (role) => {
    const normalizedRole = role?.toLowerCase();
    if (normalizedRole === 'admin') return '/admin';
    if (normalizedRole === 'teacher') return '/teacher';
    if (normalizedRole === 'student') return '/student';
    return '/home';
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardRoute(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      showToast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showToast.error('Please fill in all fields');
      return;
    }
    localStorage.removeItem(LOGOUT_MARKER_KEY);
    dispatch(login(formData));
  };

  // Dev-only: Quick switch by email (no password needed)
  const handleDevLogin = (email) => {
    localStorage.removeItem(LOGOUT_MARKER_KEY);
    dispatch(devLogin(email));
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 sm:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h2 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Sign in to EduTrack</p>
        </div>

        {/* DEV QUICK SWITCH PANEL */}
        {IS_DEV && (
          <div className="bg-amber-50 border-2 border-amber-300 border-dashed p-4 sm:p-5 rounded-2xl shadow-sm mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800">Dev Quick Switch</h3>
              <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">DEV ONLY</span>
            </div>
            <p className="text-xs text-amber-700 mb-3">
              Switch roles instantly — no password needed, no rate limits.
            </p>

            {/* Custom email input */}
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                placeholder="Enter any user email..."
                className="flex-1 px-3 py-2 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
              <button
                onClick={() => devEmail && handleDevLogin(devEmail)}
                disabled={!devEmail || loading}
                className="px-3 py-2 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Switch
              </button>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-md">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-3 py-2.5 sm:py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full px-3 py-2.5 sm:py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4 sm:mt-6">
          <Link
            to="/home"
            className="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
