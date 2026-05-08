import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  markAttendanceQR, 
  fetchStudentAttendance, 
  fetchTodayClasses 
} from '../store/features/attendence/attendanceSlice';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import QRScanner from '../components/QRScanner';
import ManualAttendance from '../components/ManualAttendance';
import showToast from '../utils/toast';
import { formatDate, formatTime } from '../utils/dateUtils';
import { QrCode, MapPin, Calendar, CheckCircle, Clock, BookOpen, Users } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const Attendance = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(
    user?.role === 'Student' ? 'mark' : 
    (user?.role === 'Teacher' || user?.role === 'Admin') ? 'manual' : 'history'
  );
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  const dispatch = useDispatch();
  const { attendanceList, todayClasses, loading } = useSelector((state) => state.attendance);

  // Ensure a persistent deviceId exists for this browser/device
  const getOrCreateDeviceId = () => {
    const key = 'edutrack_device_id';
    let id = localStorage.getItem(key);
    if (!id) {
      // simple UUID v4
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      localStorage.setItem(key, id);
    }
    return id;
  };

  useEffect(() => {
    if (user?._id && user?.role === 'Student') {
      dispatch(fetchStudentAttendance({}));
      dispatch(fetchTodayClasses());
    }
  }, [dispatch, user]);

  const getLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationLoading(false);
          showToast.success('Location captured successfully');

          if (qrData) {
            submitCombinedAttendance(qrData, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
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

  const submitCombinedAttendance = async (capturedQrData = qrData, capturedLocation = location) => {
    if (!capturedQrData || capturedQrData.trim() === '') {
      showToast.error('Please scan the QR code first');
      return;
    }

    if (!capturedLocation) {
      showToast.error('Please capture your location first');
      return;
    }

    try {
      setSubmittingAttendance(true);
      const attendanceData = {
        qrData: capturedQrData,  // Send short QR code, server will resolve from cache
        latitude: capturedLocation.latitude,
        longitude: capturedLocation.longitude,
        deviceId: getOrCreateDeviceId(),
      };

      const result = await dispatch(markAttendanceQR(attendanceData));
      if (result.type && result.type.includes('fulfilled')) {
        const serverMessage = result.payload?.message || 'Attendance marked successfully using QR and location';
        showToast.success(serverMessage);
        setShowQRScanner(false);
        setQrData(null);
        setLocation(null);
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

  const handleQRSuccess = async (qrData) => {
    try {
      // Validate scanned data is not empty
      if (!qrData || qrData.trim() === '') {
        showToast.error('QR code scan failed. Please try again.');
        return;
      }
      
      setQrData(qrData);
      setShowQRScanner(false);

      // Auto-submit attendance immediately when QR is scanned
      if (location) {
        await submitCombinedAttendance(qrData, location);
      } else {
        showToast.error('Please capture your location first');
      }
    } catch {
      showToast.error('Failed to mark attendance');
    }
  };

  if (loading) return <Loader />;

  return (
    <DashboardLayout>
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Attendance</h1>

        {/* Tabs - Mobile Responsive */}
        <div className="bg-white rounded-lg shadow-md mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide -mb-px">
              {/* Show "Mark Attendance" tab only for students */}
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
              
              {/* Show "Manual Attendance" tab only for teachers */}
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
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Mark Attendance with QR + Location
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Both checks are required. Capture your location and scan the class QR code, then submit.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className={`rounded-lg border p-4 ${qrData ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base mb-1">QR Code</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {qrData ? 'QR code captured successfully.' : 'Scan the QR code shown by your teacher.'}
                      </p>
                    </div>
                    <div className={`rounded-lg border p-4 ${location ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base mb-1">Location</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {location ? `Captured at ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'Capture your current location to verify campus presence.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mt-4">
                    <button
                      onClick={getLocation}
                      disabled={locationLoading || submittingAttendance}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-5 h-5" />
                      {locationLoading ? 'Getting Location...' : location ? '✓ Location Captured' : 'Capture Location'}
                    </button>
                    
                    {location && (
                      <button
                        onClick={() => setShowQRScanner(true)}
                        disabled={submittingAttendance}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-5 h-5" />
                        {qrData ? 'Rescan QR Code' : 'Scan QR Code'}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span>📍 Step 1:</span> Capture your location<br />
                      <span>📱 Step 2:</span> Scan the QR code shown by your teacher<br />
                      Attendance will be marked automatically once verified.
                    </p>
                  </div>

                </div>

                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Today's Classes</h3>
                  {todayClasses.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {todayClasses.map((classItem, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
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
                                attendance.method === 'QR_Scan' ? 'bg-blue-100 text-blue-800' :
                                attendance.method === 'Location' ? 'bg-green-100 text-green-800' :
                                attendance.method === 'QR_Scan+Location' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {attendance.method === 'QR_Scan' ? '📱 QR Scan' : 
                                 attendance.method === 'Location' ? '📍 Location' : 
                                 attendance.method === 'QR_Scan+Location' ? '📱 QR + 📍 Location' : attendance.method}
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
                                attendance.method === 'QR_Scan' ? 'bg-blue-100 text-blue-800' :
                                attendance.method === 'Location' ? 'bg-green-100 text-green-800' :
                                attendance.method === 'QR_Scan+Location' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {attendance.method === 'QR_Scan' ? '📱 QR Scan' : 
                                 attendance.method === 'Location' ? '📍 Location' : 
                                 attendance.method === 'QR_Scan+Location' ? '📱 QR + 📍 Location' : attendance.method}
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

// thia is a Comment;