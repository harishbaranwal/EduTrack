import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { QrCode, Users, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import ManualAttendance from './ManualAttendance';
import DashboardLayout from './DashboardLayout';
import Loader from './Loader';

const TeacherAttendance = () => {
  const [activeTab, setActiveTab] = useState('qr');
  const [currentClass, setCurrentClass] = useState(null);
  const [qrData, setQrData] = useState('');
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceList, setAttendanceList] = useState([]);

  // Check for current class
  const checkCurrentClass = async () => {
    try {
      const response = await API.get('/timetable/teacher/current-class');
      
      if (response.data.success) {
        setCurrentClass(response.data.data);
        setError('');
      } else {
        setCurrentClass(null);
        setError(response.data.message);
      }
    } catch (err) {
      setCurrentClass(null);
      // Check if it's a 404 (no current class)
      if (err.response?.status === 404) {
        setError(err.response?.data?.message || 'No class is currently scheduled');
      } else {
        setError(err.response?.data?.message || 'Failed to check current class');
      }
    }
  };

  // Generate QR code
  const generateQR = async () => {
    if (!currentClass) {
      toast.error('No current class found');
      return;
    }

    try {
      // Extract batchId - handle both object and string cases
      const batchId = typeof currentClass.batch === 'object' 
        ? currentClass.batch._id 
        : currentClass.batch;

      const response = await API.post('/attendance/qr/generate', {
        batchId: batchId,
        subject: currentClass.subject
      });

      if (response.data.success) {
        setQrData(response.data.data.qrData);
        toast.success('QR code generated successfully!');
        // Start polling for attendance updates
        startPollingAttendance();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate QR code';
      toast.error(errorMsg);
    }
  };

  // Fetch today's schedule
  const fetchTodaySchedule = async () => {
    try {
      const response = await API.get('/timetable/teacher/today');
      if (response.data.success) {
        // Backend returns data.classes which itself contains classes array
        const scheduleData = response.data.data;
        const classesArray = scheduleData.classes?.classes || scheduleData.classes || [];
        setTodaySchedule(classesArray);
      }
    } catch (err) {
      toast.error('Failed to fetch today\'s schedule');
    }
  };

  // Poll for attendance updates
  const startPollingAttendance = () => {
    const interval = setInterval(async () => {
      try {
        if (currentClass && currentClass.batch) {
          // Use the /class endpoint with proper query parameters
          const batchId = typeof currentClass.batch === 'object' 
            ? currentClass.batch._id 
            : currentClass.batch;
            
          const response = await API.get('/attendance/class', {
            params: {
              batchId: batchId,
              subject: currentClass.subject,
              date: currentClass.date || new Date().toISOString().split('T')[0]
            }
          });
          if (response.data.success) {
            setAttendanceList(response.data.data);
          }
        }
      } catch (err) {
        // Silently handle polling errors
      }
    }, 5000); // Poll every 5 seconds

    // Clean up interval after class ends
    setTimeout(() => {
      clearInterval(interval);
    }, 2 * 60 * 60 * 1000); // 2 hours max

    return () => clearInterval(interval);
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        checkCurrentClass(),
        fetchTodaySchedule()
      ]);
      setLoading(false);
    };

    initializeData();

    // Set up interval to check for current class every minute
    const interval = setInterval(checkCurrentClass, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <DashboardLayout>
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Teacher Attendance</h1>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('qr')}
              className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center space-x-2 ${
                activeTab === 'qr'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QR Code Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center space-x-2 ${
                activeTab === 'manual'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manual Attendance</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'qr' && (
            <div>
              {/* Current Class Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Current Class Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Current Class
                  </h2>
                  
                  {currentClass ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 mb-2">Active Class</p>
                        <p className="font-semibold text-lg">{currentClass.subject}</p>
                        <p className="text-gray-600">Batch: {currentClass.batch?.name || 'N/A'}</p>
                        <p className="text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {currentClass.startTime} - {currentClass.endTime}
                        </p>
                        <p className="text-gray-600">Room: {currentClass.room || 'TBA'}</p>
                      </div>
                      
                      <button
                        onClick={generateQR}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center space-x-2"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Generate QR Code for Attendance</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-600">{error || "No current class found. You can only generate QR codes during your scheduled class time."}</p>
                    </div>
                  )}
                </div>

                {/* QR Code Display */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    QR Code
                  </h2>
                  
                  {qrData ? (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                        <QRCode value={qrData} size={200} />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Students can scan this QR code to mark attendance
                      </p>
                      <p className="text-sm text-red-500 mt-1">
                        Valid until: {currentClass?.endTime}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <p>Generate QR code for current class</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
                
                {todaySchedule.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todaySchedule.map((classItem, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <h3 className="font-semibold">{classItem.subject}</h3>
                        <p className="text-gray-600">Batch: {classItem.batch?.name}</p>
                        <p className="text-gray-600">{classItem.startTime} - {classItem.endTime}</p>
                        <p className="text-gray-600">Room: {classItem.room || 'TBA'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No classes scheduled for today.</p>
                )}
              </div>

              {/* Attendance List */}
              {attendanceList && attendanceList.classAttendance && attendanceList.classAttendance.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Live Attendance Status</h2>
                  
                  {/* Statistics */}
                  {attendanceList.stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold">{attendanceList.stats.total}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600">Present</p>
                        <p className="text-2xl font-bold text-green-700">{attendanceList.stats.present}</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600">Absent</p>
                        <p className="text-2xl font-bold text-red-700">{attendanceList.stats.absent}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Not Marked</p>
                        <p className="text-2xl font-bold text-gray-700">{attendanceList.stats.notMarked}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Present Students */}
                    <div>
                      <h3 className="font-semibold text-green-600 mb-3">Present Students</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {attendanceList.classAttendance
                          .filter(item => item.status === 'Present')
                          .map((item, index) => (
                            <div key={index} className="bg-green-50 p-2 rounded flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <div>
                                  <span className="font-medium">{item.student.name}</span>
                                  <span className="text-xs text-gray-500 ml-2">({item.student.registrationNumber})</span>
                                </div>
                              </div>
                              {item.attendance?.markedAt && (
                                <span className="text-xs text-gray-500">
                                  {new Date(item.attendance.markedAt).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                          ))}
                        {attendanceList.classAttendance.filter(item => item.status === 'Present').length === 0 && (
                          <p className="text-gray-500 text-sm">No students marked present yet</p>
                        )}
                      </div>
                    </div>

                    {/* Absent/Not Marked Students */}
                    <div>
                      <h3 className="font-semibold text-red-600 mb-3">Absent/Not Marked Students</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {attendanceList.classAttendance
                          .filter(item => item.status !== 'Present')
                          .map((item, index) => (
                            <div key={index} className="bg-red-50 p-2 rounded flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              <div>
                                <span className="font-medium">{item.student.name}</span>
                                <span className="text-xs text-gray-500 ml-2">({item.student.registrationNumber})</span>
                                <span className="text-xs text-gray-600 ml-2">- {item.status}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div>
              <ManualAttendance />
            </div>
          )}
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default TeacherAttendance;