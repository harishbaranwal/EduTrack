import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { logout } from '../store/features/auth/authSlice';
import { fetchUserNotifications, fetchUnreadCount, markAsRead } from '../store/features/notification/notificationSlice';
import showToast from '../utils/toast';
import { getRelativeTime } from '../utils/dateUtils';
import { Bell, User, LogOut, ChevronDown, BrainCircuit, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications = [], unreadCount = 0 } = useSelector((state) => state.notification || {});

  useEffect(() => {
    if (user) {
      // Fetch notifications with error handling
      dispatch(fetchUnreadCount()).catch((err) => {});
      dispatch(fetchUserNotifications({ limit: 5 })).catch((err) => {});
    }
  }, [dispatch, user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    const result = await dispatch(logout());
    if (result.type.includes('fulfilled')) {
      showToast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const handleNotificationClick = (notification) => {
    try {
      if (notification && !notification.read && notification._id) {
        dispatch(markAsRead(notification._id)).catch((err) => {});
      }
      setShowNotifications(false);
    } catch (error) {setShowNotifications(false);
    }
  };

  const getDashboardRoute = () => {
    if (!user) {
      return '/home';
    }
    const routes = {
      admin: '/admin',
      teacher: '/teacher',
      student: '/student',
    };
    const userRole = user.role?.toLowerCase();
    const route = routes[userRole] || '/home';
    return route;
  };

  const getNotificationsRoute = () => {
    if (!user) {
      return '/home';
    }
    const routes = {
      admin: '/admin/my-notifications',
      teacher: '/teacher/my-notifications',
      student: '/student/notifications',
    };
    const userRole = user.role?.toLowerCase();
    return routes[userRole] || '/home';
  };

  return (
  <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/40 bg-white/85 supports-backdrop-filter:backdrop-blur-2xl shadow-sm">
      <div className="absolute inset-0 bg-linear-to-r from-indigo-50/80 via-white/70 to-purple-50/80 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-linear-to-br from-indigo-500/40 via-purple-500/30 to-sky-400/40 blur-lg group-hover:opacity-90 opacity-70 transition-opacity" />
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BrainCircuit className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-gray-900 leading-none">EduTrack</span>
              <span className="text-[10px] sm:text-xs text-gray-500 tracking-wide uppercase hidden xs:block">Smart Learning Suite</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            <a
              href="#features"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Features
            </a>
            <a href="#about" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              About
            </a>
            <Link to="/contact" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              Contact
            </Link>
            {/* Show Dashboard only when user is logged in */}
            {user && (
              <Link
                to={getDashboardRoute()}
                className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side - Conditional rendering based on login status */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              // Logged in: Show Notifications and User Profile
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfile(false);
                      setShowMobileMenu(false);
                    }}
                    className="relative p-1.5 sm:p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg transition-colors"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 max-h-[calc(100vh-5rem)] overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-gray-500">{unreadCount} unread</span>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications && notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <p className="text-sm font-medium text-gray-900 flex-1">{notification.title || 'Notification'}</p>
                                {!notification.read && (
                                  <span className="ml-2 h-2 w-2 bg-blue-600 rounded-full shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message || 'No message'}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.createdAt ? getRelativeTime(notification.createdAt) : 'Just now'}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>No notifications</p>
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-2 border-t border-gray-200">
                        <Link
                          to={getNotificationsRoute()}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium block text-center"
                          onClick={() => setShowNotifications(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setShowProfile(!showProfile);
                      setShowNotifications(false);
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 hidden xs:block" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <p className="text-xs text-indigo-600 mt-1 capitalize">{user?.role}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfile(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>
                      <div className="border-t border-gray-200 mt-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button - Only for logged in users */}
                <button
                  onClick={() => {
                    setShowMobileMenu(!showMobileMenu);
                    setShowNotifications(false);
                    setShowProfile(false);
                  }}
                  className="md:hidden p-1.5 sm:p-2 text-gray-600 hover:text-indigo-600 focus:outline-none rounded-lg transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            ) : (
              // Not logged in: Show Login and Register buttons
              <>
                <div className="hidden sm:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 sm:px-6 py-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors text-sm sm:text-base"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-sm text-sm sm:text-base"
                  >
                    Get Started
                  </Link>
                </div>
                
                {/* Mobile Menu Button - For non-logged in users */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="sm:hidden p-1.5 text-gray-600 hover:text-indigo-600 focus:outline-none rounded-lg transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3 animate-fade-in">
            <a
              href="#features"
              className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-lg font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Features
            </a>
            <a
              href="#about"
              className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-lg font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              About
            </a>
            <Link
              to="/contact"
              className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-lg font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Contact
            </Link>
            {user && (
              <Link
                to={getDashboardRoute()}
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-lg font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Dashboard
              </Link>
            )}
            
            {/* Mobile Auth Buttons - Only show when not logged in */}
            {!user && (
              <div className="px-4 pt-2 space-y-2 border-t border-gray-200 mt-3">
                <Link
                  to="/login"
                  className="block w-full text-center px-6 py-2.5 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors rounded-lg border border-indigo-200"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;