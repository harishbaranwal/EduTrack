import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, 
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Phone,
  GraduationCap,
  AlertCircle,
  Download,
  TrendingUp
} from 'lucide-react';
import userAPI from '../store/features/user/userAPI';
import batchAPI from '../store/features/batch/batchAPI';
import Loader from '../components/Loader';
import DashboardLayout from '../components/DashboardLayout';

const TeacherStudents = () => {
  const { user } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const batchResponse = await batchAPI.getTeacherBatches();
      if (batchResponse.success) {
        const teacherBatches = batchResponse.data;
        setBatches(teacherBatches);
        
        const allStudents = [];
        for (const batch of teacherBatches) {
          try {
            const studentResponse = await userAPI.getStudentsByBatch(batch._id);
            if (studentResponse.success) {
              const studentsWithBatch = studentResponse.data.map(student => ({
                ...student,
                batchInfo: batch
              }));
              allStudents.push(...studentsWithBatch);
            }
          } catch (error) {
          }
        }
        setStudents(allStudents);
      } else {
        setError(batchResponse.message || 'Failed to fetch batches');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedStudents = () => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBatch = selectedBatch === '' || student.batchInfo?._id === selectedBatch;
      
      return matchesSearch && matchesBatch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'registrationNumber':
          return (a.registrationNumber || '').localeCompare(b.registrationNumber || '');
        case 'attendance':
          return (b.attendancePercentage || 0) - (a.attendancePercentage || 0);
        default:
          return 0;
      }
    });
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const exportStudentList = () => {
    const csvContent = [
      ['Name', 'Registration Number', 'Email', 'Phone', 'Batch', 'Attendance %'].join(','),
      ...filteredAndSortedStudents().map(student => [
        student.name || '',
        student.registrationNumber || '',
        student.email || '',
        student.phone || '',
        student.batchInfo?.name || '',
        student.attendancePercentage || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <Loader />;

  const filteredStudents = filteredAndSortedStudents();

  return (
    <DashboardLayout>
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Students</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage students from your assigned batches</p>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-red-800 font-medium text-sm sm:text-base">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mr-2 sm:mr-3 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Batches</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{batches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center">
            <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mr-2 sm:mr-3 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Good Attendance</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {students.filter(s => (s.attendancePercentage || 0) >= 75).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center">
            <UserX className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mr-2 sm:mr-3 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Low Attendance</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {students.filter(s => (s.attendancePercentage || 0) < 60).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Batch Filter */}
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>{batch.name}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="name">Sort by Name</option>
              <option value="registrationNumber">Sort by Registration</option>
              <option value="attendance">Sort by Attendance</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={exportStudentList}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              <span>Export List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500 text-sm sm:text-base">
            {searchTerm || selectedBatch ? 'Try adjusting your search or filter criteria' : 'No students assigned to your batches yet'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.registrationNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.batchInfo?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          {student.email && (
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              <span className="truncate max-w-[150px]">{student.email}</span>
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center mt-1">
                              <Phone className="w-3 h-3 mr-1" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAttendanceColor(student.attendancePercentage || 0)}`}>
                            {student.attendancePercentage || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            {filteredStudents.map((student) => (
              <div key={student._id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="shrink-0 h-10 w-10 sm:h-12 sm:w-12">
                      <div className="h-full w-full rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-sm sm:text-base font-medium text-white">
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{student.registrationNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAttendanceColor(student.attendancePercentage || 0)}`}>
                    {student.attendancePercentage || 0}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                    <span className="truncate">{student.batchInfo?.name || 'N/A'}</span>
                  </div>
                  
                  {student.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}
                  
                  {student.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button className="text-indigo-600 hover:text-indigo-900 flex items-center text-sm font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
    </DashboardLayout>
  );
};

export default TeacherStudents;