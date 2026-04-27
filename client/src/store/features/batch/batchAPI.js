import API from '../../../utils/api';

// Batch API endpoints
const batchAPI = {
  // Get all batches
  getAllBatches: async () => {
    const response = await API.get('/batches');
    return response.data;
  },

  // Get batch by ID
  getBatchById: async (batchId) => {
    const response = await API.get(`/batches/${batchId}`);
    return response.data;
  },

  // Create new batch
  createBatch: async (batchData) => {
    const response = await API.post('/batches', batchData);
    return response.data;
  },

  // Update batch
  updateBatch: async (batchId, batchData) => {
    const response = await API.put(`/batches/${batchId}`, batchData);
    return response.data;
  },

  // Delete batch
  deleteBatch: async (batchId) => {
    const response = await API.delete(`/batches/${batchId}`);
    return response.data;
  },

  // Add students to batch
  addStudentsToBatch: async (batchId, studentIds) => {
    const response = await API.post(`/batches/${batchId}/students`, { studentIds });
    return response.data;
  },

  // Add single student to batch (legacy support)
  addStudent: async (batchId, studentId) => {
    const response = await API.post(`/batches/${batchId}/students`, { studentIds: [studentId] });
    return response.data;
  },

  // Remove student from batch
  removeStudent: async (batchId, studentId) => {
    const response = await API.delete(`/batches/${batchId}/students/${studentId}`);
    return response.data;
  },

  // Get batch students
  getBatchStudents: async (batchId) => {
    const response = await API.get(`/batches/${batchId}/students`);
    return response.data;
  },

  // Add subject to batch
  addSubject: async (batchId, subject) => {
    const response = await API.post(`/batches/${batchId}/subjects`, { subject });
    return response.data;
  },

  // Remove subject from batch
  removeSubject: async (batchId, subject) => {
    const response = await API.delete(`/batches/${batchId}/subjects/${subject}`);
    return response.data;
  },

  // Get teacher's assigned batches
  getTeacherBatches: async () => {
    const response = await API.get('/batches/teacher-batches');
    return response.data;
  },
};

export default batchAPI;
