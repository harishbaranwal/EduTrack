import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';
import API from '../utils/api';
import showToast from '../utils/toast';
import Loader from './Loader';

const ManualAttendance = () => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const { user } = useSelector(state => state.auth);

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Not Marked':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Define all useCallback functions first
  const fetchBatches = useCallback(async () => {
    try {
      const response = await API.get('/batches/teacher-batches');
      if (response.data.success) {
        setBatches(response.data.data);
      }
    } catch {
      showToast.error('Failed to fetch batches');
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await API.get(`/timetable/batch/${selectedBatch}/subjects`);
      if (response.data.success) {
        const allSubjects = response.data.data;
        
        const teacherSubjects = allSubjects.filter(subject => {
          // Convert both to string for comparison
          const subjectTeacherId = subject.teacherId?.toString();
          const userId = user.id?.toString();
          return user.role === 'Admin' || subjectTeacherId === userId;
        });
        
        setSubjects(teacherSubjects);
      }
    } catch (error) {
      showToast.error('Failed to fetch subjects');
    }
  }, [selectedBatch, user.role, user.id]);

  const fetchStudentsAndAttendance = useCallback(async () => {
    if (!selectedBatch || !selectedSubject || !selectedDate) return;

    setLoading(true);
    try {
      // Fetch class attendance
      const response = await API.get('/attendance/class', {
        params: {
          batchId: selectedBatch,
          subject: selectedSubject,
          date: selectedDate,
        }
      });

      if (response.data.success) {
        const { classAttendance } = response.data.data;
        setStudents(classAttendance);

        // Initialize attendance data
        const initialData = {};
        classAttendance.forEach(item => {
          initialData[item.student._id] = {
            status: item.attendance?.status || 'Not Marked',
            isModified: false,
          };
        });
        setAttendanceData(initialData);
      }
    } catch (error) {
      showToast.error('Failed to fetch students and attendance');
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, selectedSubject, selectedDate]);

  useEffect(() => {
    if (user) {
      fetchBatches();
    }
  }, [user, fetchBatches]);

  useEffect(() => {
    if (selectedBatch) {
      fetchSubjects();
    }
  }, [selectedBatch, fetchSubjects]);

  // Fetch students when batch and subject are selected
  useEffect(() => {
    if (selectedBatch && selectedSubject) {
      fetchStudentsAndAttendance();
    }
  }, [selectedBatch, selectedSubject, selectedDate, fetchStudentsAndAttendance]);

  const markAllPresent = async () => {
    setSubmitting(true);
    try {
      const attendanceList = students.map(item => ({
        studentId: item.student._id,
        status: 'Present',
        remarks: '', // No remarks
      }));

      const response = await API.post('/attendance/manual/bulk', {
        batchId: selectedBatch,
        subject: selectedSubject,
        date: selectedDate,
        attendanceList,
      });

      if (response.data.success) {
        showToast.success('All students marked present');
        fetchStudentsAndAttendance(); // Refresh data
      }
    } catch (error) {
      showToast.error('Failed to mark all present');} finally {
      setSubmitting(false);
    }
  };

  const markAllAbsent = async () => {
    setSubmitting(true);
    try {
      const attendanceList = students.map(item => ({
        studentId: item.student._id,
        status: 'Absent',
        remarks: '', // No remarks
      }));

      const response = await API.post('/attendance/manual/bulk', {
        batchId: selectedBatch,
        subject: selectedSubject,
        date: selectedDate,
        attendanceList,
      });

      if (response.data.success) {
        showToast.success('All students marked absent');
        fetchStudentsAndAttendance(); // Refresh data
      }
    } catch (error) {
      showToast.error('Failed to mark all absent');} finally {
      setSubmitting(false);
    }
  };

  // Function for instant attendance updates from dropdown
  const handleInstantAttendanceUpdate = async (studentId, status) => {
    if (status === 'Not Marked') {
      // Just update local state for "Not Marked" - don't save to backend
      setAttendanceData(prev => ({
        ...prev,
        [studentId]: {
          status: 'Not Marked',
          isModified: false,
        }
      }));
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.post('/attendance/manual', {
        studentId,
        batchId: selectedBatch,
        subject: selectedSubject,
        date: selectedDate,
        status,
        remarks: '', // No remarks needed
      });

      if (response.data.success) {
        showToast.success('Attendance updated successfully');
        // Update local state
        setAttendanceData(prev => ({
          ...prev,
          [studentId]: {
            status: status,
            isModified: false,
          }
        }));
        // Refresh the data to get updated attendance
        fetchStudentsAndAttendance();
      }
    } catch (error) {
      showToast.error('Failed to update attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await API.get('/attendance/history', {
        params: {
          batchId: selectedBatch,
          subject: selectedSubject,
          startDate: new Date(new Date(selectedDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: selectedDate,
        }
      });

      if (response.data.success) {
        setAttendanceHistory(response.data.data.attendance);
        setShowHistory(true);
      }
    } catch (error) {
      showToast.error('Failed to fetch attendance history');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800">Manual Attendance Management</h2>
          <p className="text-gray-600 mt-1">Mark and modify student attendance manually</p>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Batch</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedBatch}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject, index) => (
                  <option key={`${subject.name}-${index}`} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchAttendanceHistory}
                disabled={!selectedBatch || !selectedSubject}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:bg-gray-300 transition duration-200"
              >
                View History
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {students.length > 0 && (
            <div className="flex gap-4 mb-6">
              <button
                onClick={markAllPresent}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
              >
                Mark All Present
              </button>
              <button
                onClick={markAllAbsent}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
              >
                Mark All Absent
              </button>
            </div>
          )}

          {/* Students List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader text="Loading students..." />
            </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mark Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((item) => {
                    const student = item.student;
                    const currentAttendance = attendanceData[student._id] || {};
                    
                    return (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.registrationNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
                            {item.status}
                          </span>
                          {item.attendance?.method && (
                            <div className="text-xs text-gray-500 mt-1">
                              via {item.attendance.method}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={currentAttendance.status || item.status || 'Not Marked'}
                            onChange={(e) => handleInstantAttendanceUpdate(student._id, e.target.value)}
                            disabled={submitting}
                            className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              submitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="Not Marked">Not Marked</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : selectedBatch && selectedSubject ? (
            <div className="text-center py-8 text-gray-500">
              <p>No students found for the selected batch and subject.</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Please select a batch and subject to view students.</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl m-4 max-h-[80vh] overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {attendanceHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marked By</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceHistory.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {record.user.name}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {record.method}
                            {record.modifiedAt && (
                              <div className="text-xs text-orange-600">Modified</div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {record.markedBy?.name} ({record.markedBy?.role})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No attendance history found for the selected criteria.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualAttendance;
