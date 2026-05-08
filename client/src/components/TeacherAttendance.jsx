import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { QrCode, Users, Calendar, Clock, MapPin, MapPinOff } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import ManualAttendance from './ManualAttendance';
import DashboardLayout from './DashboardLayout';
import Loader from './Loader';

const TeacherAttendance = () => {
  const [activeTab, setActiveTab] = useState('qr');
  const [currentClass, setCurrentClass] = useState(null);
  const [qrData, setQrData] = useState('');
  const [qrIntervalId, setQrIntervalId] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceList, setAttendanceList] = useState([]);
  const [locationSharing, setLocationSharing] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState(null);
  const lastPresentRef = useRef(null);

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
      if (err.response?.status === 404) {
        setError(err.response?.data?.message || 'No class is currently scheduled');
      } else {
        setError(err.response?.data?.message || 'Failed to check current class');
      }
    }
  };

  // Toggle location sharing
  const toggleLocationSharing = async () => {
    if (locationSharing) {
      // Stop sharing
      try {
        await API.post('/attendance/teacher/location/stop');
        if (locationWatchId !== null) {
          navigator.geolocation.clearWatch(locationWatchId);
          setLocationWatchId(null);
        }
        setLocationSharing(false);
        toast.success('Location sharing stopped');
      } catch (err) {
        toast.error('Failed to stop location sharing');
      }
    } else {
      // Start sharing - continuously update teacher location
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported');
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            await API.post('/attendance/teacher/location', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            if (!locationSharing) {
              setLocationSharing(true);
              toast.success('Location sharing started. Students can now verify their location.');
            }
          } catch (err) {
            // Silently handle update errors
          }
        },
        (error) => {
          toast.error('Location error: ' + error.message);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );

      setLocationWatchId(watchId);
      setLocationSharing(true);
    }
  };

  // Generate QR code
  const generateQR = async () => {
    if (!currentClass) {
      toast.error('No current class found');
      return;
    }

    try {
      return new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const batchId = typeof currentClass.batch === 'object' 
                ? currentClass.batch._id 
                : currentClass.batch;

              try {
                const response = await API.post('/attendance/qr/generate', {
                  batchId: batchId,
                  subject: currentClass.subject,
                  latitude: latitude,
                  longitude: longitude
                });

                if (response.data.success) {
                  const tokenData = response.data.data?.qrData;
                  if (!tokenData || tokenData.trim() === '') {
                    toast.error('Server returned empty QR token. Please try again.');
                    resolve();
                    return;
                  }
                  setQrData(tokenData);
                  toast.success('QR code generated successfully!');
                  startPollingAttendance();
                  if (qrIntervalId) clearInterval(qrIntervalId);
                  const id = setInterval(() => generateQR(), 30000);
                  setQrIntervalId(id);
                } else {
                  toast.error(response.data.message || 'Failed to generate QR');
                }
                resolve();
              } catch (err) {
                const errorMsg = err.response?.data?.message || 'Failed to generate QR code';
                toast.error(errorMsg);
                resolve();
              }
            },
            (error) => {
              toast.error('Could not get your location. Please enable location access and try again.');
              resolve();
            }
          );
        } else {
          toast.error('Geolocation is not supported by your browser');
          resolve();
        }
      });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Fetch today's schedule
  const fetchTodaySchedule = async () => {
    try {
      const response = await API.get('/timetable/teacher/today');
      if (response.data.success) {
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
            const data = response.data.data;
            const newPresent = data.stats?.present ?? 0;
            const lastPresent = lastPresentRef.current;
            if (lastPresent !== null && newPresent > lastPresent) {
              const diff = newPresent - lastPresent;
              toast.success(`${diff} student${diff > 1 ? 's' : ''} marked present`);
            }
            lastPresentRef.current = newPresent;
            setAttendanceList(data);
          }
        }
      } catch (err) {
        // Silently handle polling errors
      }
    }, 5000);

    setTimeout(() => { clearInterval(interval); }, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([checkCurrentClass(), fetchTodaySchedule()]);
      setLoading(false);
    };
    initializeData();
    const interval = setInterval(checkCurrentClass, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (qrIntervalId) clearInterval(qrIntervalId);
    };
  }, [qrIntervalId]);

  // Cleanup location watch on unmount
  useEffect(() => {
    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [locationWatchId]);

  if (loading) return <Loader />;

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
              <span>QR + Location Attendance</span>
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
              {/* Location Sharing Toggle */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      {locationSharing ? <MapPin className="w-5 h-5 text-green-600" /> : <MapPinOff className="w-5 h-5 text-gray-400" />}
                      Location Sharing
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {locationSharing 
                        ? 'Your location is being shared. Students can verify their proximity.'
                        : 'Enable location sharing so students can verify they are near you.'}
                    </p>
                  </div>
                  <button
                    onClick={toggleLocationSharing}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      locationSharing
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {locationSharing ? 'Stop Sharing' : 'Start Sharing'}
                  </button>
                </div>
              </div>

              {/* Current Class Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                      
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700">
                          ⏰ QR codes can only be generated within the first <strong>20 minutes</strong> of class start ({currentClass.startTime}). 
                          Each QR refreshes every 30 seconds.
                        </p>
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
                        Students must first verify location, then scan this QR code
                      </p>
                      <p className="text-sm text-red-500 mt-1">
                        Valid for 30 seconds • Refreshes automatically
                      </p>
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700 font-mono">
                        <strong>QR Code:</strong> {qrData}
                      </div>
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