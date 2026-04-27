import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import batchAPI from '../store/features/batch/batchAPI';
import userAPI from '../store/features/user/userAPI';
import timetableAPI from '../store/features/timetable/timetableAPI';
import DashboardLayout from '../components/DashboardLayout';
import showToast from '../utils/toast';

const TimetableManagement = () => {
  const dispatch = useDispatch();
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [timetables, setTimetables] = useState([]);
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Form state for creating/editing classes
  const [classForm, setClassForm] = useState({
    subject: '',
    teacher: '',
    startTime: '',
    endTime: '',
    room: '',
  });

  const [classes, setClasses] = useState([]);

  // Fetch batches
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await batchAPI.getAllBatches();
      if (data.success) {
        setBatches(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch batches');
      }
    } catch (err) {setError('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getUsersByRole('Teacher');
      if (data.success) {
        setTeachers(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch teachers');
      }
    } catch (err) {setError('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch timetables
  const fetchTimetables = async () => {
    try {
      const data = await timetableAPI.getAllTimetables();
      if (data.success) {
        // Filter by batch and day if selected
        let filteredTimetables = data.data;
        if (selectedBatch) {
          filteredTimetables = filteredTimetables.filter(tt => 
            (tt.batch._id || tt.batch) === selectedBatch
          );
        }
        if (selectedDay) {
          filteredTimetables = filteredTimetables.filter(tt => tt.day === selectedDay);
        }
        
        setTimetables(filteredTimetables);
        if (filteredTimetables.length > 0) {
          setCurrentTimetable(filteredTimetables[0]);
          setClasses(filteredTimetables[0].classes || []);
        } else {
          setCurrentTimetable(null);
          setClasses([]);
        }
      }
    } catch (err) {}
  };

  // Add class to current schedule
  const addClass = () => {
    if (!classForm.subject || !classForm.teacher || !classForm.startTime || !classForm.endTime) {
      setError('Please fill all required fields');
      return;
    }

    // Validate time format and logic
    if (classForm.startTime >= classForm.endTime) {
      setError('End time must be after start time');
      return;
    }

    // Check for time conflicts
    const hasConflict = classes.some(cls => {
      const newStart = classForm.startTime;
      const newEnd = classForm.endTime;
      const existingStart = cls.startTime;
      const existingEnd = cls.endTime;

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (hasConflict) {
      setError('Time conflict with existing class');
      return;
    }

    const newClass = {
      ...classForm,
      id: Date.now(), // Temporary ID for frontend
    };

    setClasses([...classes, newClass]);
    setClassForm({
      subject: '',
      teacher: '',
      startTime: '',
      endTime: '',
      room: '',
    });
    setError('');
  };

  // Remove class from schedule
  const removeClass = (index) => {
    const updatedClasses = classes.filter((_, i) => i !== index);
    setClasses(updatedClasses);
  };

  // Save timetable
  const saveTimetable = async () => {
    if (!selectedBatch || !selectedDay || classes.length === 0) {
      setError('Please select batch, day and add at least one class');
      return;
    }

    setLoading(true);
    try {
      const timetableData = {
        batch: selectedBatch,
        day: selectedDay,
        classes: classes.map(cls => ({
          subject: cls.subject,
          teacher: cls.teacher,
          startTime: cls.startTime,
          endTime: cls.endTime,
          room: cls.room,
        })),
      };

      let data;
      if (currentTimetable) {
        // Update existing timetable
        data = await timetableAPI.updateTimetable(currentTimetable._id, timetableData);
      } else {
        // Create new timetable
        data = await timetableAPI.createTimetable(timetableData);
      }

      if (data.success) {
        showToast.success(currentTimetable ? 'Timetable updated successfully!' : 'Timetable created successfully!');
        setShowCreateForm(false);
        setShowEditForm(false);
        fetchTimetables();
        setError('');
      } else {
        setError(data.message || 'Failed to save timetable');
      }
    } catch (err) {
      setError('Failed to save timetable');} finally {
      setLoading(false);
    }
  };

  // Delete timetable
  const deleteTimetable = async (timetableId) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) {
      return;
    }

    setLoading(true);
    try {
      const data = await timetableAPI.deleteTimetable(timetableId);
      if (data.success) {
        showToast.success('Timetable deleted successfully!');
        fetchTimetables();
        setError('');
      } else {
        setError(data.message || 'Failed to delete timetable');
      }
    } catch (err) {
      setError('Failed to delete timetable');} finally {
      setLoading(false);
    }
  };

  // Start creating new timetable
  const startCreateTimetable = () => {
    setCurrentTimetable(null);
    setClasses([]);
    setShowCreateForm(true);
    setShowEditForm(false);
    setError('');
  };

  // Start editing existing timetable
  const startEditTimetable = (timetable) => {
    setCurrentTimetable(timetable);
    setClasses(timetable.classes || []);
    setSelectedBatch(timetable.batch._id);
    setSelectedDay(timetable.day);
    setShowEditForm(true);
    setShowCreateForm(false);
    setError('');
  };

  // Get teacher name by ID
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  // Get batch name by ID
  const getBatchName = (batchId) => {
    if (!batchId) return 'No Batch Selected';
    if (batches.length === 0) return 'Loading...';
    
    const batch = batches.find(b => b._id === batchId);
    return batch ? batch.name : 'Unknown Batch';
  };

  useEffect(() => {
    fetchBatches();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedBatch && selectedDay) {
      fetchTimetables();
    }
  }, [selectedBatch, selectedDay]);

  return (
    <DashboardLayout>
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Timetable Management</h1>
        <button
          onClick={startCreateTimetable}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 text-sm sm:text-base"
        >
          Create New Timetable
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <p className="text-red-700 font-medium text-sm sm:text-base">❌ {error}</p>
            <button
              onClick={() => {
                setError('');
                fetchBatches();
                fetchTeachers();
              }}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Filter Timetables</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">
                {batches.length === 0 ? 'Loading batches...' : 'Select a batch'}
              </option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>
                  {batch.name} - {batch.department} ({batch.year})
                </option>
              ))}
            </select>
            {batches.length === 0 && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {loading ? 'Loading batches...' : 'No batches found'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Day
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || showEditForm) && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {showCreateForm ? 'Create New Timetable' : 'Edit Timetable'}
          </h2>

          {/* Batch and Day Selection for Create */}
          {showCreateForm && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch *
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                >
                  <option value="">Select a batch</option>
                  {batches.map(batch => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} - {batch.department} ({batch.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day *
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Add Class Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Add Class</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={classForm.subject}
                  onChange={(e) => setClassForm({...classForm, subject: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subject name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher *
                </label>
                <select
                  value={classForm.teacher}
                  onChange={(e) => setClassForm({...classForm, teacher: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={classForm.startTime}
                  onChange={(e) => setClassForm({...classForm, startTime: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={classForm.endTime}
                  onChange={(e) => setClassForm({...classForm, endTime: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  value={classForm.room}
                  onChange={(e) => setClassForm({...classForm, room: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Room number"
                />
              </div>
            </div>

            <button
              onClick={addClass}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 mb-6"
            >
              Add Class
            </button>
          </div>

          {/* Classes List */}
          {classes.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Classes Schedule</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-left">Teacher</th>
                      <th className="px-4 py-2 text-left">Room</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((cls, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{cls.startTime} - {cls.endTime}</td>
                        <td className="px-4 py-2">{cls.subject}</td>
                        <td className="px-4 py-2">{getTeacherName(cls.teacher)}</td>
                        <td className="px-4 py-2">{cls.room || 'TBA'}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => removeClass(index)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition duration-200"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setShowEditForm(false);
                setClasses([]);
                setError('');
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={saveTimetable}
              disabled={loading || classes.length === 0}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (showCreateForm ? 'Create Timetable' : 'Update Timetable')}
            </button>
          </div>
        </div>
      )}

      {/* Existing Timetables */}
      {!showCreateForm && !showEditForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Timetables</h2>
          
          {selectedBatch && selectedDay ? (
            currentTimetable ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      {getBatchName(currentTimetable.batch._id || currentTimetable.batch)} - {currentTimetable.day}
                    </h3>
                    <p className="text-gray-600">
                      {currentTimetable.classes?.length || 0} classes scheduled
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => startEditTimetable(currentTimetable)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTimetable(currentTimetable._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {currentTimetable.classes && currentTimetable.classes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Time</th>
                          <th className="px-4 py-2 text-left">Subject</th>
                          <th className="px-4 py-2 text-left">Teacher</th>
                          <th className="px-4 py-2 text-left">Room</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTimetable.classes
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((cls, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{cls.startTime} - {cls.endTime}</td>
                            <td className="px-4 py-2">{cls.subject}</td>
                            <td className="px-4 py-2">
                              {cls.teacher?.name || getTeacherName(cls.teacher)}
                            </td>
                            <td className="px-4 py-2">{cls.room || 'TBA'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No classes scheduled for this day.</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No timetable found for {getBatchName(selectedBatch)} on {selectedDay}
                </p>
                <button
                  onClick={startCreateTimetable}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  Create Timetable for This Day
                </button>
              </div>
            )
          ) : (
            <p className="text-gray-600 text-center py-8">
              Please select a batch and day to view or create timetables.
            </p>
          )}
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default TimetableManagement;