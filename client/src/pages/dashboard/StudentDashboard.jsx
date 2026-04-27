import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { 
  Calendar, BookOpen, Clock, TrendingUp, UserCheck, 
  AlertCircle, CheckCircle, Target, Award, User, Check
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import dashboardAPI from '../../store/features/dashboard/dashboardAPI';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    attendance: { percentage: 0, total: 0, present: 0, absent: 0 },
    sessions: { total: 0, attended: 0, missed: 0 },
    batch: { name: '', currentSemester: '' },
    upcomingClasses: [],
    recentNotifications: [],
    thisWeekAttendance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await dashboardAPI.getStudentDashboard();
        if (response.success) {
          setStats(prevStats => ({
            ...prevStats,
            ...response.data,
            thisWeekAttendance: response.data.thisWeekAttendance || [],
            upcomingClasses: response.data.upcomingClasses || [],
            recentNotifications: response.data.recentNotifications || []
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
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 sm:p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          {React.cloneElement(icon, { className: "w-5 h-5 sm:w-6 sm:h-6", style: { color } })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-300 rounded mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 sm:h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const ClassCard = ({ classItem }) => (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{classItem.subject}</h4>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {classItem.startTime} - {classItem.endTime}
        </span>
      </div>
      <div className="space-y-1 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center">
          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          <span>{classItem.teacher || 'TBD'}</span>
        </div>
        <div className="flex items-center">
          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          <span>Room: {classItem.room || 'TBD'}</span>
        </div>
      </div>
    </div>
  );

  const AttendanceDay = ({ day }) => (
    <div className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border ${
      day.isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
    }`}>
      <span className="text-xs font-medium text-gray-600 mb-1 sm:mb-2">{day.day}</span>
      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
        day.status === 'Present' ? 'bg-green-100 text-green-600' : 
        day.status === 'Absent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
      }`}>
        {day.status === 'Present' ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
      </div>
      <span className="text-xs text-gray-500 mt-1">{day.date}</span>
      {day.isToday && <span className="text-xs text-blue-600 font-medium">Today</span>}
    </div>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back, {user?.name}</p>
        <p className="text-xs sm:text-sm text-gray-500">Batch: {stats.batch?.name || user?.batch?.name || 'N/A'}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendance?.percentage || 0}%`}
          icon={<TrendingUp />}
          color="#10B981"
          subtitle="This semester"
        />
        <StatCard
          title="Classes Attended"
          value={`${stats.sessions?.attended || 0}/${stats.sessions?.total || 0}`}
          icon={<UserCheck />}
          color="#3B82F6"
          subtitle="Total classes"
        />
        <StatCard
          title="Missed Classes"
          value={stats.sessions?.missed || 0}
          icon={<AlertCircle />}
          color="#EF4444"
          subtitle="This semester"
        />
        <StatCard
          title="Current Batch"
          value={stats.batch?.name || 'N/A'}
          icon={<Award />}
          color="#8B5CF6"
          subtitle={user.batch?.department || 'Active'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* This Week's Attendance & Upcoming Classes */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* This Week's Attendance */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">This Week's Attendance</h3>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {(stats.thisWeekAttendance || []).map((day, index) => (
                <AttendanceDay key={index} day={day} />
              ))}
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Today's Classes</h3>
            <div className="grid gap-3 sm:gap-4">
              {stats.upcomingClasses?.length > 0 ? (
                stats.upcomingClasses.map((classItem) => (
                  <ClassCard key={classItem.id} classItem={classItem} />
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No classes scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Attendance Progress */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Attendance Goal</h3>
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (stats.attendance?.percentage || 0) / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">{stats.attendance?.percentage || 0}%</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Target: 90% | Current: {stats.attendance?.percentage || 0}%
              </p>
              <div className="mt-3 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 flex items-center">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {(stats.attendance?.percentage || 0) >= 90 
                    ? `You're ${((stats.attendance?.percentage || 0) - 90).toFixed(1)}% above target!`
                    : `${(90 - (stats.attendance?.percentage || 0)).toFixed(1)}% more to reach target`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/student/timetable')}
                className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-1" />
                <span className="block font-medium text-blue-800 text-sm sm:text-base">View Timetable</span>
                <span className="text-xs text-blue-600">Check your schedule</span>
              </button>
              <button 
                onClick={() => navigate('/student/attendance')}
                className="w-full p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mb-1" />
                <span className="block font-medium text-green-800 text-sm sm:text-base">Attendance Record</span>
                <span className="text-xs text-green-600">View attendance Record</span>
              </button>
              <button 
                onClick={() => navigate('/student/courses')}
                className="w-full p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mb-1" />
                <span className="block font-medium text-purple-800 text-sm sm:text-base">Recommendations</span>
                <span className="text-xs text-purple-600">Personalized tips</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;