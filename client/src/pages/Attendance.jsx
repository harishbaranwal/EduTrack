import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  markAttendanceQR, 
  verifyLocation,
  fetchStudentAttendance, 
  fetchTodayClasses,
  resetLocationVerification,
} from '../store/features/attendence/attendanceSlice';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import QRScanner from '../components/QRScanner';
import ManualAttendance from '../components/ManualAttendance';
import showToast from '../utils/toast';
import { formatDate, formatTime } from '../utils/dateUtils';
import { QrCode, MapPin, Calendar, CheckCircle, Clock, BookOpen, Users, ShieldCheck, Scan } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const Attendance = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(
    user?.role === 'Student' ? 'mark' : 
    (user?.role === 'Teacher' || user?.role === 'Admin') ? 'manual' : 'history'
  );
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [fingerprintId, setFingerprintId] = useState(null);

  const dispatch = useDispatch();
  const { attendanceList, todayClasses, loading, locationVerified, verifiedClassInfo } = useSelector((state) => state.attendance);

  // Initialize FingerprintJS on mount
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprintId(result.visitorId);
      } catch (err) {
        // Fallback to localStorage UUID if FingerprintJS fails
        const key = 'edutrack_device_id';
        let id = localStorage.getItem(key);
        if (!id) {
          id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
          localStorage.setItem(key, id);
        }
        setFingerprintId(id);
      }
    };
    initFingerprint();
  }, []);

  useEffect(() => {
    if (user?._id && user?.role === 'Student') {
      dispatch(fetchStudentAttendance({}));
      dispatch(fetchTodayClasses());
    }
  }, [dispatch, user]);

  // Stage 1: Verify location against teacher
  const handleVerifyLocation = (classItem) => {
    setSelectedClass(classItem);
    setLocationLoading(true);
    dispatch(resetLocationVerification());

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            subject: classItem.subject,
            batchId: classItem.batchId || todayClasses[0]?.batchId,
          };

          dispatch(verifyLocation(locationData)).then((result) => {
            setLocationLoading(false);
            if (result.type?.includes('fulfilled')) {
              showToast.success('Location verified! Now scan the QR code.');
            } else {
              const errMsg = result.payload || 'Location verification failed';
              showToast.error(typeof errMsg === 'object' ? errMsg.message || JSON.stringify(errMsg) : errMsg);
            }
          });
        },
        (error) => {
          setLocationLoading(false);
          showToast.error('Failed to get location: ' + error.message);
        }
      );
    } else {
      setLocationLoading(false);
      showToast.error('Geolocation is not supported by this browser');
    }
  };

  // Stage 2: Scan QR and submit attendance
  const handleQRSuccess = async (qrData) => {
    try {
      if (!qrData || qrData.trim() === '') {
        showToast.error('QR code scan failed. Please try again.');
        return;
      }

      setShowQRScanner(false);
      setSubmittingAttendance(true);

      const attendanceData = {
        qrData: qrData,
        latitude: 0, // Location already verified in stage 1
        longitude: 0,
        deviceId: fingerprintId,
      };

      // Re-capture location for the actual attendance record
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        attendanceData.latitude = position.coords.latitude;
        attendanceData.longitude = position.coords.longitude;
      }

      const result = await dispatch(markAttendanceQR(attendanceData));
      if (result.type?.includes('fulfilled')) {
        const serverMessage = result.payload?.message || 'Attendance marked successfully!';
        showToast.success(serverMessage);
        dispatch(resetLocationVerification());
        setSelectedClass(null);
        dispatch(fetchStudentAttendance({}));
        dispatch(fetchTodayClasses());
      } else {
        const errMsg = result.payload || result.error?.message || 'Failed to mark attendance';
        const display = result.payload && typeof result.payload === 'object'
          ? (result.payload.message || JSON.stringify(result.payload))
          : errMsg;
        showToast.error(display);
      }
    } catch {
      showToast.error('Failed to mark attendance');
    } finally {
      setSubmittingAttendance(false);
    }
  };

  // Helper to check if a class is active right now (from 10 mins before start to the end time)
  const isClassCurrent = (classItem) => {
    if (!classItem.startTime || !classItem.endTime) return false;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    // Support parsing formats like "10:00" or "10:00 AM"
    const parseTime = (timeStr) => {
      let [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const startMins = parseTime(classItem.startTime);
    const endMins = parseTime(classItem.endTime);
    
    return currentMins >= (startMins - 10) && currentMins <= endMins;
  };

  const currentClasses = todayClasses.filter(isClassCurrent);
  const otherClasses = todayClasses.filter(c => !isClassCurrent(c));

  if (loading) return <Loader />;

  return (
    <DashboardLayout>
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Attendance</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide -mb-px">
              {user?.role === 'Student' && (
                <button
                  onClick={() => setActiveTab('mark')}
                  className={`py-3 sm:py-4 px-4 sm:px-6 font-medium text-xs sm:text-sm border-b-2 whitespace-nowrap shrink-0 ${
                    activeTab === 'mark'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">Mark Attendance</span>
                  <span className="sm:hidden">Mark</span>
                </button>
              )}
              
              {(user?.role === 'Teacher' || user?.role === 'Admin') && (
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`py-3 sm:py-4 px-4 sm:px-6 font-medium text-xs sm:text-sm border-b-2 whitespace-nowrap shrink-0 ${
                    activeTab === 'manual'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Manual Attendance</span>
                  <span className="sm:hidden">Manual</span>
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 sm:py-4 px-4 sm:px-6 font-medium text-xs sm:text-sm border-b-2 whitespace-nowrap shrink-0 ${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="hidden sm:inline">
                  {user?.role === 'Student' ? 'Attendance History' : 'Attendance Records'}
                </span>
                <span className="sm:hidden">History</span>
              </button>
            </nav>
          </div>

          <div className="p-3 sm:p-4 lg:p-6">
            {activeTab === 'mark' && user?.role === 'Student' && (
              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Two-Stage Attendance Flow */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Two-Stage Attendance Verification
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    Step 1: Verify your location near teacher → Step 2: Scan QR code
                  </p>

                  {/* Steps Progress */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      locationVerified ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      <MapPin className="w-4 h-4" />
                      Step 1: Location
                      {locationVerified && <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300" />
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      locationVerified ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Scan className="w-4 h-4" />
                      Step 2: QR Scan
                    </div>
                  </div>

                  {/* Stage info based on state */}
                  {!locationVerified ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700 mb-3">
                        📍 Select a class below and verify your location. Your teacher must have location sharing enabled.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-700 mb-3">
                        ✅ Location verified for <strong>{verifiedClassInfo?.subject}</strong>! 
                        You are {verifiedClassInfo?.distanceFromTeacher}m from your teacher. Now scan the QR code.
                      </p>
                      <button
                        onClick={() => setShowQRScanner(true)}
                        disabled={submittingAttendance}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-5 h-5" />
                        {submittingAttendance ? 'Submitting...' : 'Scan QR Code Now'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Today's Classes */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Today's Classes</h3>
                  {todayClasses.length > 0 ? (
                    <div className="space-y-6">
                      {/* Current Active Classes */}
                      {currentClasses.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-indigo-700 uppercase tracking-wider mb-3">Current / Upcoming Class</h4>
                          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                            {currentClasses.map((classItem, index) => (
                              <div key={`current-${index}`} className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
                                <div className="flex justify-between items-start gap-3 mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{classItem.subject}</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">{classItem.teacher?.name || 'Teacher TBA'}</p>
                                  </div>
                                  <div className="text-right text-xs sm:text-sm text-gray-500">
                                    <div>{classItem.startTime} - {classItem.endTime}</div>
                                    {classItem.classroom && <div>{classItem.classroom}</div>}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleVerifyLocation(classItem)}
                                  disabled={locationLoading || locationVerified}
                                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                    locationVerified && selectedClass?.subject === classItem.subject
                                      ? 'bg-green-100 text-green-700 cursor-default'
                                      : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                                  }`}
                                >
                                  <MapPin className="w-4 h-4" />
                                  {locationLoading && selectedClass?.subject === classItem.subject
                                    ? 'Verifying...'
                                    : locationVerified && selectedClass?.subject === classItem.subject
                                    ? '✓ Location Verified'
                                    : 'Verify Location for This Class'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other Classes */}
                      {otherClasses.length > 0 && (
                        <div>
                          {currentClasses.length > 0 && (
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Other Classes Today</h4>
                          )}
                          <div className="grid gap-3 sm:grid-cols-2">
                            {otherClasses.map((classItem, index) => (
                              <div key={`other-${index}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-start gap-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{classItem.subject}</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">{classItem.teacher?.name || 'Teacher TBA'}</p>
                                  </div>
                                  <div className="text-right text-xs sm:text-sm text-gray-500">
                                    <div>{classItem.startTime} - {classItem.endTime}</div>
                                    {classItem.classroom && <div>{classItem.classroom}</div>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No classes available for attendance today</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'manual' && (user?.role === 'Teacher' || user?.role === 'Admin') && (
              <div>
                <ManualAttendance />
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Your Attendance History</h3>
                {attendanceList && attendanceList.length > 0 ? (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceList.map((attendance) => (
                          <tr key={attendance._id}>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(attendance.markedAt)}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {attendance.subject}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(attendance.markedAt)}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                attendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                                attendance.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {attendance.status}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                                attendance.method === 'QR_Scan+Location' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {attendance.method === 'QR_Scan+Location' ? '📱 QR + 📍 Location' : attendance.method}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="sm:hidden space-y-3">
                      {attendanceList.map((attendance) => (
                        <div key={attendance._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{attendance.subject}</h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              attendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                              attendance.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {attendance.status}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 shrink-0" />
                              <span>{formatDate(attendance.markedAt)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 shrink-0" />
                              <span>{formatTime(attendance.markedAt)}</span>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                attendance.method === 'QR_Scan+Location' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {attendance.method === 'QR_Scan+Location' ? '📱 QR + 📍 Location' : attendance.method}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg">No attendance records found</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Start marking your attendance to see history here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <Modal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        title="Scan QR Code"
        size="max-w-md"
      >
        <QRScanner onSuccess={handleQRSuccess} />
      </Modal>
    </div>
    </DashboardLayout>
  );
};

export default Attendance;