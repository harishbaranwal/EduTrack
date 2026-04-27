import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Calendar, Users, Clock, BookOpen, 
  UserCheck 
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import dashboardAPI from '../../store/features/dashboard/dashboardAPI';

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    batches: { total: 0, assigned: 0 },
    todayClasses: { total: 0, classes: [] },
    statistics: { totalClasses: 0, assignedBatches: 0, subjectsTeaching: 0 },
    students: { total: 0 },
    attendance: { percentage: 0, todayClasses: [] },
    assignedBatches: [],
    recentAttendance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await dashboardAPI.getTeacherDashboard();
        if (response.success) {
          setStats(prevStats => ({
            ...prevStats,
            ...response.data,
            todayClasses: response.data.todayClasses || { total: 0, classes: [] },
            assignedBatches: response.data.assignedBatches || [],
            recentAttendance: response.data.recentAttendance || []
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

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Welcome, {user?.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Here's your teaching overview for today</p>
          </div>
        </div>
      </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Assigned Batches"
            value={stats.statistics?.assignedBatches || 0}
            icon={<BookOpen />}
            color="#3B82F6"
            subtitle="Currently teaching"
          />
          <StatCard
            title="Today's Classes"
            value={stats.todayClasses?.total || 0}
            icon={<Calendar />}
            color="#10B981"
            subtitle={`${stats.todayClasses?.classes?.length || 0} scheduled`}
          />
          <StatCard
            title="Total Students"
            value={stats.students?.total || 0}
            icon={<Users />}
            color="#F59E0B"
            subtitle="Across all batches"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendance?.percentage || 0}%`}
            icon={<UserCheck />}
            color="#8B5CF6"
            subtitle="Overall average"
          />
        </div>

        {/* Today's Classes */}
        {stats.todayClasses?.classes?.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Today's Classes</h3>
            <div className="space-y-3 sm:space-y-4">
              {stats.todayClasses.classes.map((classItem, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg shadow-sm space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{classItem.subject}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{classItem.batchName}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right ml-13 sm:ml-0">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {classItem.startTime} - {classItem.endTime}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">{classItem.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Attendance */}
        {stats.recentAttendance?.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Attendance</h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">Date</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">Subject</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm hidden sm:table-cell">Batch</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">Present</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm hidden sm:table-cell">Total</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentAttendance.map((record, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 text-xs sm:text-sm">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 text-xs sm:text-sm">
                            <div className="font-medium">{record.subject}</div>
                            <div className="text-xs text-gray-600 sm:hidden">{record.batchName}</div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm hidden sm:table-cell">{record.batchName}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {record.presentCount}
                              <span className="sm:hidden">/{record.totalStudents}</span>
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm hidden sm:table-cell">{record.totalStudents}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {record.attendanceRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
};

export default TeacherDashboard;