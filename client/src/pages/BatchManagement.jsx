import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, BookOpen, Calendar, Edit2, Trash2, FolderOpen } from 'lucide-react';
import {
  fetchAllBatches,
  fetchBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  fetchBatchStudents,
  addStudentsToBatch,
  removeStudentFromBatch,
} from '../store/features/batch/batchSlice';
import { fetchAllUsers } from '../store/features/user/userSlice';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import showToast from '../utils/toast';
import { formatDate } from '../utils/dateUtils';
import DashboardLayout from '../components/DashboardLayout';

const BatchManagement = () => {
  const dispatch = useDispatch();
  const { batches, currentBatch, students: batchStudents, loading } = useSelector((state) => state.batch);
  const { users } = useSelector((state) => state.user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [batchData, setBatchData] = useState({
    name: '',
    year: new Date().getFullYear(),
    semester: 1,
    department: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    dispatch(fetchAllBatches());
    dispatch(fetchAllUsers()); // Fetch users to get available students
  }, [dispatch]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    const result = await dispatch(createBatch(batchData));
    if (result.type.includes('fulfilled')) {
      showToast.success('Batch created successfully');
      setShowCreateModal(false);
      setBatchData({
        name: '',
        year: new Date().getFullYear(),
        semester: 1,
        department: '',
        startDate: '',
        endDate: '',
      });
      dispatch(fetchAllBatches());
    }
  };

  const handleEdit = async (batch) => {
    await dispatch(fetchBatchById(batch._id));
    setBatchData({
      name: batch.name,
      year: batch.year,
      semester: batch.semester,
      department: batch.department || '',
      startDate: batch.startDate ? batch.startDate.split('T')[0] : '',
      endDate: batch.endDate ? batch.endDate.split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const handleUpdateBatch = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      updateBatch({
        batchId: currentBatch._id,
        batchData,
      })
    );
    if (result.type.includes('fulfilled')) {
      showToast.success('Batch updated successfully');
      setShowEditModal(false);
      dispatch(fetchAllBatches());
    }
  };

  const handleDelete = async (batchId, batchName) => {
    if (window.confirm(`Are you sure you want to delete batch "${batchName}"?`)) {
      const result = await dispatch(deleteBatch(batchId));
      if (result.type.includes('fulfilled')) {
        showToast.success('Batch deleted successfully');
        dispatch(fetchAllBatches());
      }
    }
  };

  const handleViewStudents = async (batch) => {
    setSelectedBatch(batch);
    await dispatch(fetchBatchStudents(batch._id));
    setShowStudentsModal(true);
  };

  const handleEnrollStudents = (batch) => {
    setSelectedBatch(batch);
    setSelectedStudents([]);
    setShowEnrollModal(true);
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleConfirmEnrollment = async () => {
    if (selectedStudents.length === 0) {
      showToast.error('Please select at least one student');
      return;
    }

    const result = await dispatch(addStudentsToBatch({
      batchId: selectedBatch._id,
      studentIds: selectedStudents,
    }));

    if (result.type.includes('fulfilled')) {
      showToast.success(`${selectedStudents.length} student(s) enrolled successfully`);
      setShowEnrollModal(false);
      setSelectedStudents([]);
      setSelectedBatch(null);
      dispatch(fetchAllBatches());
    }
  };

  const handleRemoveStudent = async (batchId, studentId) => {
    if (window.confirm('Are you sure you want to remove this student from the batch?')) {
      const result = await dispatch(removeStudentFromBatch({ batchId, studentId }));
      if (result.type.includes('fulfilled')) {
        showToast.success('Student removed successfully');
        dispatch(fetchBatchStudents(batchId)); // Refresh student list
        dispatch(fetchAllBatches()); // Refresh batch data
      }
    }
  };

  if (loading && !batches) {
    return <Loader fullScreen text="Loading batches..." />;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Batch Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage all batches in the system</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium transition-colors text-sm sm:text-base"
          >
            + Create Batch
          </button>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {batches && batches.length > 0 ? (
            batches.map((batch) => (
              <div
                key={batch._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="bg-linear-to-r from-indigo-600 to-purple-600 h-2"></div>
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{batch.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{batch.department || 'No Department'}</p>
                    </div>
                    <span className="ml-2 px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-800 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap">
                      {batch.year}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 shrink-0" />
                      <span>{batch.students?.length || 0} Students</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 shrink-0" />
                      <span>Semester {batch.semester}</span>
                    </div>
                    <div className="flex items-start text-xs sm:text-sm text-gray-600">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 shrink-0 mt-0.5" />
                      <span className="break-all">
                        {batch.startDate ? formatDate(batch.startDate) : 'Not set'} -{' '}
                        {batch.endDate ? formatDate(batch.endDate) : 'Not set'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex gap-2 flex-1">
                      <button
                        onClick={() => handleViewStudents(batch)}
                        className="flex-1 px-2 sm:px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium transition-colors text-xs sm:text-sm"
                      >
                        View Students
                      </button>
                      <button
                        onClick={() => handleEnrollStudents(batch)}
                        className="flex-1 px-2 sm:px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors text-xs sm:text-sm"
                      >
                        Enroll Students
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(batch)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(batch._id, batch.name)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
              <FolderOpen className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">No batches found</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by creating a new batch.</p>
            </div>
          )}
        </div>

        {/* Create/Edit Batch Modal */}
        <Modal
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setBatchData({
              name: '',
              year: new Date().getFullYear(),
              semester: 1,
              department: '',
              startDate: '',
              endDate: '',
            });
          }}
          title={showCreateModal ? 'Create New Batch' : 'Edit Batch'}
          size="max-w-md"
        >
          <form
            onSubmit={showCreateModal ? handleCreateBatch : handleUpdateBatch}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name *</label>
              <input
                type="text"
                value={batchData.name}
                onChange={(e) => setBatchData({ ...batchData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter BatcH Name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  value={batchData.year}
                  onChange={(e) => setBatchData({ ...batchData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min="2000"
                  max="2100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                <select
                  value={batchData.semester}
                  onChange={(e) => setBatchData({ ...batchData, semester: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <input
                type="text"
                value={batchData.department}
                onChange={(e) => setBatchData({ ...batchData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter Department Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={batchData.startDate}
                  onChange={(e) => setBatchData({ ...batchData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={batchData.endDate}
                  onChange={(e) => setBatchData({ ...batchData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setBatchData({
                    name: '',
                    year: new Date().getFullYear(),
                    semester: 1,
                    department: '',
                    startDate: '',
                    endDate: '',
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : showCreateModal ? 'Create Batch' : 'Update Batch'}
              </button>
            </div>
          </form>
        </Modal>

        {/* View Students Modal */}
        <Modal
          isOpen={showStudentsModal}
          onClose={() => setShowStudentsModal(false)}
          title="Batch Students"
          size="max-w-2xl"
        >
          <div className="overflow-y-auto max-h-[60vh]">
            {batchStudents && batchStudents.length > 0 ? (
              <div className="space-y-3">
                {batchStudents.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(selectedBatch._id, student._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No students in this batch</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowStudentsModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </Modal>

        {/* Enroll Students Modal */}
        <Modal
          isOpen={showEnrollModal && !!selectedBatch}
          onClose={() => {
            setShowEnrollModal(false);
            setSelectedStudents([]);
            setSelectedBatch(null);
          }}
          title={`Enroll Students in ${selectedBatch?.name || ''}`}
          size="max-w-3xl"
        >
          <p className="text-sm text-gray-600 mb-4">
            Select students to enroll in this batch
          </p>
          <div className="overflow-y-auto max-h-[60vh]">
            {users && users.length > 0 ? (
              <div className="space-y-3">
                {users
                  .filter(user => user.role === 'Student')
                  .filter(user => !selectedBatch?.students?.some(s => s._id === user._id))
                  .map((student) => (
                    <div
                      key={student._id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer ${
                        selectedStudents.includes(student._id)
                          ? 'bg-indigo-50 border-2 border-indigo-200'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                      onClick={() => handleStudentSelection(student._id)}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                          <p className="text-xs text-gray-400">Student ID: {student.registrationNumber || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleStudentSelection(student._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No available students to enroll</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedStudents.length} student(s) selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedStudents([]);
                  setSelectedBatch(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEnrollment}
                disabled={selectedStudents.length === 0 || loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enrolling...' : `Enroll ${selectedStudents.length} Student(s)`}
              </button>
            </div>
          </div>
        </Modal>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default BatchManagement;
