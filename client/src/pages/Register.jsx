import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { register, clearError } from '../store/features/auth/authSlice';
import showToast from '../utils/toast';
import Loader from '../components/Loader';
import { ArrowLeft, BrainCircuit } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent, registrationEmail } = useSelector((state) => state.auth);

  useEffect(() => {
    if (otpSent && registrationEmail) {
      showToast.success('OTP sent to your email');
      navigate('/verify-otp');
    }
  }, [otpSent, registrationEmail, navigate]);

  useEffect(() => {
    if (error) {
      showToast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      showToast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      showToast.error('Password must be at least 8 characters long');
      return;
    }

    // Extract confirmPassword to prevent sending it to server
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...registerData } = formData;
    dispatch(register(registerData));
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-6 sm:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 sm:mt-4">
            Create Account
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Join EduTrack
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-lg">
        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Sign in
              </Link>
            </p>
          </div>
        </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4 sm:mt-6 flex justify-center items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium">
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <Link to="/home" className="text-xs sm:text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
