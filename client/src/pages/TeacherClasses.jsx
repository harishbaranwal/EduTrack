import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import timetableAPI from '../store/features/timetable/timetableAPI';
import batchAPI from '../store/features/batch/batchAPI';
import Loader from '../components/Loader';
import DashboardLayout from '../components/DashboardLayout';

const TeacherClasses = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, today, upcoming

  const fetchTeacherClasses = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await timetableAPI.getTeacherTimetable();
      
      if (response.success) {
        // Extract classes from the timetable data structure
        const timetableData = response.data || [];
        // Backend returns data with nested classes structure
        const allClasses = timetableData.length > 0 && timetableData[0].classes 
          ? (timetableData[0].classes.classes || timetableData[0].classes)
          : [];
        setClasses(allClasses);
      } else {
        setError(response.message || 'Failed to fetch classes');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchTeacherClasses();
    }
  }, [user, fetchTeacherClasses]);

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const isTimeInRange = (startTime, endTime, currentTime) => {
    const start = startTime.split(':').map(Number);
    const end = endTime.split(':').map(Number);
    const current = currentTime.split(':').map(Number);
    
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    const currentMinutes = current[0] * 60 + current[1];
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const getClassStatus = (classItem, day) => {
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTime();
    
    // Defensive checks for required properties
    if (!classItem || !classItem.startTime || !classItem.endTime) {
      return { status: 'unknown', color: 'bg-gray-100 text-gray-800' };
    }
    
    if (day !== currentDay) {
      return { status: 'scheduled', color: 'bg-gray-100 text-gray-800' };
    }
    
    try {
      if (isTimeInRange(classItem.startTime, classItem.endTime, currentTime)) {
        return { status: 'ongoing', color: 'bg-green-100 text-green-800' };
      }
      
      const now = new Date();
      const classStart = new Date();
      const [hours, minutes] = classItem.startTime.split(':');
      classStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (now > classStart) {
        return { status: 'completed', color: 'bg-blue-100 text-blue-800' };
      }
      
      return { status: 'upcoming', color: 'bg-yellow-100 text-yellow-800' };
    } catch (error) {
      return { status: 'unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const filterClasses = () => {
    if (!classes.length) return [];
    
    const currentDay = getCurrentDay();
    
    let filteredClasses = [];
    
    // classes is a flat array of class objects, not timetables with schedules
    classes.forEach(classItem => {
      // Defensive check for classItem
      if (!classItem || !classItem.day) {
        return;
      }
      
      const classWithMetadata = {
        ...classItem,
        status: getClassStatus(classItem, classItem.day)
      };
      
      if (filter === 'today' && classItem.day === currentDay) {
        filteredClasses.push(classWithMetadata);
      } else if (filter === 'upcoming') {
        try {
          if (!classItem.startTime) return;
          
          const now = new Date();
          const classStart = new Date();
          const [hours, minutes] = classItem.startTime.split(':');
          classStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          if ((classItem.day === currentDay && now < classStart) || 
              (classItem.day !== currentDay && ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(classItem.day) > ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(currentDay))) {
            filteredClasses.push(classWithMetadata);
          }
        } catch (error) {
          // Skip processing for classes with errors
        }
      } else if (filter === 'all') {
        filteredClasses.push(classWithMetadata);
      }
    });
    
    return filteredClasses.sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayComparison !== 0) return dayComparison;
      
      return a.startTime.localeCompare(b.startTime);
    });
  };

  const handleGenerateQR = () => {
    // Navigate to attendance page where QR generation is handled
    navigate('/teacher/attendance');
    toast.success('Redirecting to attendance page for QR generation');
  };

  const handleViewDetails = async (classItem) => {
    try {
      // Navigate to students page with batch filter
      if (classItem.batch?._id) {
        navigate(`/teacher/students?batch=${classItem.batch._id}`);
      } else {
        toast.error('Batch information not available');
      }
    } catch (error) {
      toast.error('Failed to view details');
    }
  };

  if (loading) return <Loader />;

  const filteredClasses = filterClasses();

  return (
    <DashboardLayout>
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Classes</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage and track your assigned classes</p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3">
        {[
          { key: 'all', label: 'All Classes', icon: BookOpen },
          { key: 'today', label: 'Today', icon: Calendar },
          { key: 'upcoming', label: 'Upcoming', icon: Clock }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              filter === key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{key === 'all' ? 'All' : key === 'today' ? 'Today' : 'Later'}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-red-800 font-medium text-sm sm:text-base">Error</p>
            <p className="text-red-600 text-sm overflow-wrap-anywhere">{error}</p>
          </div>
        </div>
      )}

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-500 text-sm sm:text-base px-4">
            {filter === 'today' ? 'No classes scheduled for today' : 
             filter === 'upcoming' ? 'No upcoming classes' : 
             'No classes assigned to you yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClasses.map((classItem, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-indigo-500">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                    {classItem.subject}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {classItem.batch?.name || 'Unknown Batch'}
                  </p>
                </div>
                <span className={`shrink-0 ml-2 px-2 py-1 rounded-full text-xs font-medium ${classItem.status.color}`}>
                  {classItem.status.status}
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 shrink-0" />
                  <span className="font-medium">{classItem.day}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 shrink-0" />
                  <span>{classItem.startTime} - {classItem.endTime}</span>
                </div>

                {classItem.room && (
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">Room: {classItem.room}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 shrink-0" />
                  <span>{classItem.batch?.studentCount || 0} Students</span>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  {classItem.status.status === 'ongoing' && (
                    <button 
                      onClick={handleGenerateQR}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Generate QR</span>
                      <span className="sm:hidden">QR Code</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleViewDetails(classItem)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default TeacherClasses;