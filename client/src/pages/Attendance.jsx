import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  markAttendanceQR, 
  markAttendanceLocation, 
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
  const [attendanceMethod, setAttendanceMethod] = useState('qr'); // 'qr' or 'location'
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // Location-based state
  const [selectedClass, setSelectedClass] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const dispatch = useDispatch();
  const { attendanceList, todayClasses, loading } = useSelector((state) => state.attendance);

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

  const handleQRSuccess = async (qrData) => {
    try {
      const attendanceData = { qrData };
      
      const result = await dispatch(markAttendanceQR(attendanceData));
      if (result.type.includes('fulfilled')) {
        showToast.success('Attendance marked successfully via QR scan');
        setShowQRScanner(false);
        // Refresh data
        dispatch(fetchStudentAttendance({}));
        dispatch(fetchTodayClasses());
      }
    } catch {
      showToast.error('Failed to mark attendance');
    }
  };

  const handleLocationAttendance = async () => {
    if (!selectedClass) {
      showToast.error('Please select a class');
      return;
    }
    
    if (!location) {
      showToast.error('Please capture your location first');
      return;
    }

    const attendanceData = {
      subject: selectedClass.subject,
      batchId: user.batch._id, // Assuming user has batch info
      date: new Date().toISOString().split('T')[0],
      location: location,
    };

    const result = await dispatch(markAttendanceLocation(attendanceData));
    if (result.type.includes('fulfilled')) {
      showToast.success('Attendance marked successfully using location');
      setSelectedClass(null);
      setLocation(null);
      // Refresh data
      dispatch(fetchStudentAttendance({}));
      dispatch(fetchTodayClasses());
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
              <div className="max-w-4xl mx-auto">
                {/* Method Selection */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    Choose Attendance Method
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {/* QR Code Method */}
                    <div 
                      onClick={() => setAttendanceMethod('qr')}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        attendanceMethod === 'qr'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <QrCode className={`w-6 h-6 sm:w-8 sm:h-8 ${attendanceMethod === 'qr' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm sm:text-base text-gray-800">QR Code Scan</h4>
                          <p className="text-xs sm:text-sm text-gray-600">Scan QR code displayed by teacher</p>
                        </div>
                      </div>
                    </div>

                    {/* Location Method */}
                    <div 
                      onClick={() => setAttendanceMethod('location')}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        attendanceMethod === 'location'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className={`w-6 h-6 sm:w-8 sm:h-8 ${attendanceMethod === 'location' ? 'text-green-600' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm sm:text-base text-gray-800">Location Based</h4>
                          <p className="text-xs sm:text-sm text-gray-600">Mark attendance using your location</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                {attendanceMethod === 'qr' && (
                  <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                      <QrCode className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                      QR Code Attendance
                    </h3>
                    
                    <div className="text-center">
                      <button
                        onClick={() => setShowQRScanner(true)}
                        className="bg-blue-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 mx-auto text-sm sm:text-base w-full sm:w-auto"
                      >
                        <QrCode size={20} className="sm:w-6 sm:h-6" />
                        <span>Open QR Scanner</span>
                      </button>
                      <p className="text-sm text-gray-600 mt-4">
                        Ask your teacher to display the QR code and scan it to mark your attendance
                      </p>
                    </div>
                  </div>
                )}

                {/* Location Section */}
                {attendanceMethod === 'location' && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <MapPin className="w-6 h-6 mr-2 text-green-600" />
                      Location-Based Attendance
                    </h3>

                    {/* Today's Classes */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">Select a class for today:</h4>
                      {todayClasses.length > 0 ? (
                        <div className="grid gap-3">
                          {todayClasses.map((classItem, index) => (
                            <div
                              key={index}
                              onClick={() => setSelectedClass(classItem)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedClass?.subject === classItem.subject
                                  ? 'border-green-500 bg-white'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <BookOpen className="w-5 h-5 text-gray-400" />
                                  <div>
                                    <h5 className="font-medium text-gray-800">{classItem.subject}</h5>
                                    <p className="text-sm text-gray-600">
                                      {classItem.teacher?.name || 'Teacher TBA'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {classItem.startTime} - {classItem.endTime}
                                  </div>
                                  {classItem.classroom && (
                                    <p className="text-xs text-gray-400">{classItem.classroom}</p>
                                  )}
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

                    {/* Location and Submit */}
                    {selectedClass && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-700">Current Location:</span>
                          <button
                            onClick={getLocation}
                            disabled={locationLoading}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              location
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                            }`}
                          >
                            {locationLoading ? 'Getting Location...' : location ? '✓ Location Captured' : 'Capture Location'}
                          </button>
                        </div>

                        {location && (
                          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-sm">
                            <p className="text-green-800">
                              📍 Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={handleLocationAttendance}
                          disabled={!location || loading}
                          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium"
                        >
                          {loading ? 'Marking Attendance...' : 'Mark Attendance'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {attendance.method === 'QR_Scan' ? '📱 QR Scan' : 
                                 attendance.method === 'Location' ? '📍 Location' : attendance.method}
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
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {attendance.method === 'QR_Scan' ? '📱 QR Scan' : 
                                 attendance.method === 'Location' ? '📍 Location' : attendance.method}
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
