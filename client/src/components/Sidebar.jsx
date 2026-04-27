import { Link, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Calendar, 
  CalendarDays, 
  TrendingUp, 
  Bell, 
  BookOpen, 
  CheckCircle, 
  MapPin, 
  Lightbulb,
  UserCheck,
  Home,
  Award,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Batches', path: '/admin/batches', icon: GraduationCap },
    { name: 'Attendance', path: '/admin/attendance', icon: CheckCircle },
    { name: 'Timetable', path: '/admin/timetable', icon: CalendarDays },
    { name: 'Send Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'My Notifications', path: '/admin/my-notifications', icon: Bell },
  ];

  const teacherLinks = [
    { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
    { name: 'My Classes', path: '/teacher/classes', icon: BookOpen },
    { name: 'Attendance', path: '/teacher/attendance', icon: CheckCircle },
    { name: 'Timetable', path: '/teacher/timetable', icon: CalendarDays },
    { name: 'Students', path: '/teacher/students', icon: UserCheck },
    { name: 'Send Notifications', path: '/teacher/notifications', icon: Bell },
    { name: 'My Notifications', path: '/teacher/my-notifications', icon: Bell },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/student/attendance', icon: CheckCircle },
    { name: 'Timetable', path: '/student/timetable', icon: CalendarDays },
    // { name: 'Recommendations', path: '/student/recommendations', icon: Lightbulb },
    { name: 'Recommended Courses', path: '/student/courses', icon: Award },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'Admin':
        return adminLinks;
      case 'Teacher':
        return teacherLinks;
      case 'Student':
        return studentLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="bg-white shadow-md border-r border-gray-200 h-full w-full flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-indigo-600">Navigation</h2>
            <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role} Panel</p>
          </div>
          {/* Close button only shows on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={() => {
                    // Close sidebar only on mobile when onClose is provided
                    if (onClose) {
                      onClose();
                    }
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                  }`}
                >
                  <IconComponent className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/"
          onClick={() => {
            // Close sidebar only on mobile when onClose is provided
            if (onClose) {
              onClose();
            }
          }}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 w-full"
        >
          <Home className="h-5 w-5 shrink-0" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
