import API from '../../../utils/api';

// Timetable API endpoints
const timetableAPI = {
  // Create timetable
  createTimetable: async (timetableData) => {
    const response = await API.post('/timetable', timetableData);
    return response.data;
  },

  // Get all timetables
  getAllTimetables: async () => {
    const response = await API.get('/timetable');
    return response.data;
  },

  // Get timetable by ID
  getTimetableById: async (timetableId) => {
    const response = await API.get(`/timetable/${timetableId}`);
    return response.data;
  },

  // Get timetable by batch
  getTimetableByBatch: async (batchId) => {
    const response = await API.get(`/timetable/batch/${batchId}/weekly`);
    return response.data;
  },

  // Get teacher timetable (uses authenticated user)
  getTeacherTimetable: async () => {
    const response = await API.get('/timetable/teacher/weekly');
    return response.data;
  },

  // Get teacher's today schedule (uses authenticated user)
  getTeacherTodaySchedule: async () => {
    const response = await API.get('/timetable/teacher/today');
    return response.data;
  },

  // Update timetable
  updateTimetable: async (timetableId, timetableData) => {
    const response = await API.put(`/timetable/${timetableId}`, timetableData);
    return response.data;
  },

  // Delete timetable
  deleteTimetable: async (timetableId) => {
    const response = await API.delete(`/timetable/${timetableId}`);
    return response.data;
  },

  // Add class to timetable
  addClass: async (timetableId, classData) => {
    const response = await API.post(`/timetable/${timetableId}/classes`, classData);
    return response.data;
  },

  // Update class in timetable
  updateClass: async (timetableId, day, classIndex, classData) => {
    const response = await API.put(`/timetable/${timetableId}/classes`, {
      day,
      classIndex,
      ...classData,
    });
    return response.data;
  },

  // Delete class from timetable
  deleteClass: async (timetableId, day, classIndex) => {
    const response = await API.delete(`/timetable/${timetableId}/classes`, {
      data: { day, classIndex },
    });
    return response.data;
  },
};

export default timetableAPI;
