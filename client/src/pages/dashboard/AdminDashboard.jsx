import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, BookOpen, Calendar, TrendingUp, UserCheck, 
  UserX, CheckCircle, BarChart3 
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import dashboardAPI from '../../store/features/dashboard/dashboardAPI';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    users: { total: 0, students: 0, teachers: 0, admins: 0 },
    batches: { total: 0, active: 0 },
    classes: { today: 0, active: 0 },
    attendance: { today: 0, present: 0, absent: 0, percentage: 0 },
    recentNotifications: [],
    attendanceTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await dashboardAPI.getAdminDashboard();
        if (response.success) {
          setStats(prevStats => ({
            ...prevStats,
            ...response.data,
            recentNotifications: response.data.recentNotifications || [],
            attendanceTrends: response.data.attendanceTrends || []
          }));
        } else {
          setError(response.message || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>}
        </div>
        <div className="shrink-0 ml-2">
          <div className="p-2 sm:p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            {React.cloneElement(icon, { className: "w-5 h-5 sm:w-6 sm:h-6", style: { color } })}
          </div>
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ notification }) => {
    return (
      <div className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg">
        <div className="shrink-0 mt-0.5">
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{notification.title}</p>
          <p className="text-xs text-gray-500 truncate">{new Date(notification.createdAt).toLocaleString()}</p>
        </div>
      </div>
    );
  };

  const renderDashboardContent = () => (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Total Students"
          value={stats.users?.students || 0}
          icon={<Users />}
          color="#3B82F6"
          subtitle="Active enrollments"
        />
        <StatCard
          title="Total Teachers"
          value={stats.users?.teachers || 0}
          icon={<BookOpen />}
          color="#10B981"
          subtitle="Faculty members"
        />
        <StatCard
          title="Total Batches"
          value={stats.batches?.total || 0}
          icon={<Calendar />}
          color="#F59E0B"
          subtitle="Active batches"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.attendance?.percentage || 0}%`}
          icon={<TrendingUp />}
          color="#8B5CF6"
          subtitle={`${stats.attendance?.present || 0}/${stats.attendance?.today || 0} students`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Attendance Overview */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Today's Attendance Overview</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <span className="text-sm sm:text-base font-medium text-green-900">Present</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-green-900">{stats.attendance?.present || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <UserX className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                <span className="text-sm sm:text-base font-medium text-red-900">Absent</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-red-900">{stats.attendance?.absent || 0}</span>
            </div>
            <div className="mt-3 sm:mt-4 bg-gray-200 rounded-full h-3 sm:h-4">
              <div 
                className="h-3 sm:h-4 rounded-full bg-green-500" 
                style={{ width: `${stats.attendance?.percentage || 0}%` }}
              ></div>
            </div>
            <p className="text-center text-xs sm:text-sm text-gray-600">
              {stats.attendance?.percentage || 0}% attendance rate today
            </p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activities</h3>
          <div className="space-y-2 sm:space-y-3">
            {stats.recentNotifications?.length > 0 ? (
              stats.recentNotifications.slice(0, 6).map((notification, index) => (
                <ActivityItem key={notification._id || index} notification={notification} />
              ))
            ) : (
              <div className="text-center py-4 sm:py-6">
                <p className="text-gray-500 text-xs sm:text-sm">No recent activities</p>
              </div>
            )}
          </div>
          <button className="w-full mt-3 sm:mt-4 px-4 py-2 text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
            View All Activities
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-left">
            <div className="flex items-center space-x-3 sm:block sm:space-x-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 sm:mb-2 shrink-0" />
              <span className="block text-sm sm:text-base font-medium text-blue-800">Manage Users</span>
            </div>
          </button>
          <button className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left">
            <div className="flex items-center space-x-3 sm:block sm:space-x-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 sm:mb-2 shrink-0" />
              <span className="block text-sm sm:text-base font-medium text-green-800">Manage Batches</span>
            </div>
          </button>
          <button className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors text-left">
            <div className="flex items-center space-x-3 sm:block sm:space-x-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 sm:mb-2 shrink-0" />
              <span className="block text-sm sm:text-base font-medium text-yellow-800">View Timetables</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm border-b rounded-lg mb-6">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600 truncate">
                Welcome back, {user?.name || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 sm:h-6 lg:h-8 bg-gray-300 rounded mb-3 sm:mb-4 lg:mb-6 w-3/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 sm:h-24 lg:h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <div className="h-64 sm:h-72 bg-gray-300 rounded"></div>
            <div className="h-64 sm:h-72 bg-gray-300 rounded"></div>
          </div>
        </div>
        ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center mx-1 sm:mx-0">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-xs sm:text-sm lg:text-base text-red-600 mb-4 px-2 hyphens-auto">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm lg:text-base"
            >
              Retry
            </button>
          </div>
        ) : (
          renderDashboardContent()
        )}
    </DashboardLayout>
  );
};

export default AdminDashboard;