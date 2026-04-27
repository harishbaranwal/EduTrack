import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarDays } from 'lucide-react';
import { fetchTimetableByBatch, fetchTeacherTimetable } from '../store/features/timetable/timetableSlice';
import { fetchAllBatches } from '../store/features/batch/batchSlice';
import Loader from '../components/Loader';
import { getDayName } from '../utils/dateUtils';
import DashboardLayout from '../components/DashboardLayout';

const Timetable = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { timetables, loading, error } = useSelector((state) => state.timetable);
  const { batches } = useSelector((state) => state.batch);
  const [selectedBatch, setSelectedBatch] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Helper function to format 24-hour time to 12-hour format for display
  const formatTimeDisplay = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${hour12}:${minutes} ${period}`;
  };

  useEffect(() => {
    if (user?.role === 'Teacher') {
      dispatch(fetchTeacherTimetable());
    } else if (user?.role === 'Admin') {
      dispatch(fetchAllBatches());
    } else if (user?.role === 'Student' && user?.batch?._id) {
      dispatch(fetchTimetableByBatch(user.batch._id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (selectedBatch && user?.role === 'Admin') {
      dispatch(fetchTimetableByBatch(selectedBatch));
    }
  }, [selectedBatch, dispatch, user?.role]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Timetable</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => {
                if (user?.role === 'Teacher') {
                  dispatch(fetchTeacherTimetable());
                } else if (selectedBatch) {
                  dispatch(fetchTimetableByBatch(selectedBatch));
                } else if (user?.batch?._id) {
                  dispatch(fetchTimetableByBatch(user.batch._id));
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getTimetableForDay = (day) => {
    if (!timetables || timetables.length === 0) {
      return [];
    }
    
    const timetable = timetables[0];
    if (!timetable?.classes) {
      return [];
    }

    const dayClasses = timetable.classes
      .filter((cls) => cls.dayOfWeek === day || cls.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    return dayClasses;
  };

  const getClassAtTime = (day, time) => {
    const classes = getTimetableForDay(day);
    return classes.find((cls) => cls.startTime === time);
  };

  if (loading) {
    return <Loader fullScreen text="Loading timetable..." />;
  }

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">View your weekly class schedule</p>
        </div>

        {/* Batch Selection for Admin */}
        {user?.role === 'admin' && (
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full sm:w-64 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">Select a batch...</option>
              {batches?.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current Day Highlight */}
        <div className="mb-4 sm:mb-6 bg-indigo-50 border-l-4 border-indigo-500 p-3 sm:p-4 rounded-lg">
          <p className="text-indigo-900 font-semibold text-sm sm:text-base">
            Today is {getDayName(new Date())}
          </p>
        </div>

        {/* Mobile View - Day Cards */}
        <div className="lg:hidden space-y-4">
          {daysOfWeek.map((day) => {
            const dayClasses = Array.isArray(timetables) ? timetables.filter(t => t.day === day) : [];
            return (
              <div key={day} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`px-4 py-3 font-medium text-sm ${
                  getDayName(new Date()) === day
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'bg-gray-50 text-gray-700'
                }`}>
                  {day}
                </div>
                <div className="p-4">
                  {dayClasses.length > 0 ? (
                    <div className="space-y-3">
                      {dayClasses.map((timetableEntry, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{timetableEntry.subject}</h4>
                            <span className="text-xs text-gray-500">
                              {formatTimeDisplay(timetableEntry.startTime)} - {formatTimeDisplay(timetableEntry.endTime)}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            {timetableEntry.teacher && (
                              <p> {timetableEntry.teacher.name}</p>
                            )}
                            {timetableEntry.room && (
                              <p> Room {timetableEntry.room}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No classes scheduled</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Time
                  </th>
                  {daysOfWeek.map((day) => (
                    <th
                      key={day}
                      className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                        getDayName(new Date()) === day
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      {formatTimeDisplay(time)}
                    </td>
                    {daysOfWeek.map((day) => {
                      const classData = getClassAtTime(day, time);
                      const isToday = getDayName(new Date()) === day;

                      return (
                        <td
                          key={`${day}-${time}`}
                          className={`px-6 py-4 text-sm ${isToday ? 'bg-indigo-50' : ''}`}
                        >
                          {classData ? (
                            <div className="bg-indigo-100 border-l-4 border-indigo-500 p-3 rounded-lg hover:shadow-md transition-shadow">
                              <p className="font-semibold text-indigo-900">
                                {classData?.subject || 'Subject'}
                              </p>
                              <p className="text-xs text-indigo-700 mt-1">
                                {classData.teacher?.name || 'Teacher'}
                              </p>
                              <p className="text-xs text-indigo-600 mt-1">
                                {formatTimeDisplay(classData.startTime)} - {formatTimeDisplay(classData.endTime)}
                              </p>
                              <p className="text-xs text-indigo-600">
                                {classData.room || 'Room TBA'}
                              </p>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-center">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Timetable Message */}
        {(!timetables || timetables.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center mt-4 sm:mt-6">
            <CalendarDays className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">No Timetable Available</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 px-2">
              {user?.role === 'admin' && !selectedBatch
                ? 'Please select a batch to view the timetable.'
                : 'No timetable has been created yet.'}
            </p>
          </div>
        )}

        {/* Legend - Mobile Responsive */}
        <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Legend</h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-indigo-100 border-l-4 border-indigo-500 rounded shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-700">Scheduled Class</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-indigo-50 rounded shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-700">Today's Column</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default Timetable;
