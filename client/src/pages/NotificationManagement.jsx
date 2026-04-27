import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createNotificationForAll, 
  createNotificationForSpecific,
  createNotificationForBatch,
  fetchAllNotifications 
} from '../store/features/notification/notificationSlice';
import { fetchAllBatches } from '../store/features/batch/batchSlice';
import { Bell, Send, Users, User, GraduationCap, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import DashboardLayout from '../components/DashboardLayout';

const NotificationManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, loading } = useSelector((state) => state.notification);
  const { batches } = useSelector((state) => state.batch);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [recipientType, setRecipientType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: [],
    batchId: '',
  });

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      dispatch(fetchAllNotifications());
    }
    dispatch(fetchAllBatches());
  }, [dispatch, user]);

  useEffect(() => {
    if (recipientType === 'specific') {
      fetchUsers();
    }
  }, [recipientType]);

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      setUsers(response.data.data || []);
    } catch (error) {}
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    try {
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
      };

      if (recipientType === 'all') {
        await dispatch(createNotificationForAll(notificationData)).unwrap();
        toast.success('Notification sent to all users');
      } else if (recipientType === 'specific') {
        if (selectedUsers.length === 0) {
          toast.error('Please select at least one recipient');
          return;
        }
        await dispatch(createNotificationForSpecific({
          ...notificationData,
          recipients: selectedUsers,
        })).unwrap();
        toast.success(`Notification sent to ${selectedUsers.length} user(s)`);
      } else if (recipientType === 'batch') {
        if (!formData.batchId) {
          toast.error('Please select a batch');
          return;
        }
        await dispatch(createNotificationForBatch({
          ...notificationData,
          batchId: formData.batchId,
        })).unwrap();
        toast.success('Notification sent to batch');
      }

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        recipients: [],
        batchId: '',
      });
      setSelectedUsers([]);
      setShowCreateForm(false);
      
      if (user?.role === 'Admin') {
        dispatch(fetchAllNotifications());
      }
    } catch (error) {
      toast.error(error || 'Failed to send notification');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
            <span className="truncate">Notification Management</span>
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Send notifications to users</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          {showCreateForm ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span className="hidden sm:inline">{showCreateForm ? 'Cancel' : 'Create Notification'}</span>
          <span className="sm:hidden">{showCreateForm ? 'Cancel' : 'Create'}</span>
        </button>
      </div>

      {/* Create Notification Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Create New Notification</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send To
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setRecipientType('all')}
                  className={`p-3 sm:p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                    recipientType === 'all'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="font-medium text-sm sm:text-base">All Users</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType('specific')}
                  className={`p-3 sm:p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                    recipientType === 'specific'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="font-medium text-sm sm:text-base">Specific Users</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType('batch')}
                  className={`p-3 sm:p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                    recipientType === 'batch'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="font-medium text-sm sm:text-base">Batch</span>
                </button>
              </div>
            </div>

            {/* Batch Selection */}
            {recipientType === 'batch' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batch
                </label>
                <select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                >
                  <option value="">Choose a batch</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} - {batch.department} ({batch.year})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User Selection */}
            {recipientType === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users ({selectedUsers.length} selected)
                </label>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                <div className="border border-gray-300 rounded-lg max-h-48 sm:max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user._id)}
                      className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 ${
                        selectedUsers.includes(user._id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="font-medium text-sm sm:text-base truncate">{user.name}</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => {}}
                          className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="info">Info</option>
                <option value="task">Task</option>
                <option value="announcement">Announcement</option>
                <option value="attendance">Attendance</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter notification title"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="Enter notification message"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notification History (Admin only) */}
      {user?.role === 'Admin' && !showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Recent Notifications</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm sm:text-base">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                    <h3 className="font-semibold text-base sm:text-lg">{notification.title}</h3>
                    <span className={`self-start px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                      notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                      notification.type === 'task' ? 'bg-yellow-100 text-yellow-800' :
                      notification.type === 'announcement' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">{notification.message}</p>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span>Sent by: {notification.sender?.name}</span>
                      <span>
                        To: {notification.recipientType === 'all' ? 'All Users' : 
                            notification.recipientType === 'specific' ? `${notification.recipients?.length} user(s)` :
                            'Batch'}
                      </span>
                    </div>
                    <span className="text-xs">{new Date(notification.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default NotificationManagement;
