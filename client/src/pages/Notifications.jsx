import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Info, CheckCircle, AlertTriangle, XCircle, Bell, Check, Trash2 } from 'lucide-react';
import {
  fetchUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../store/features/notification/notificationSlice';
import Loader from '../components/Loader';
import { getRelativeTime, formatDateTime } from '../utils/dateUtils';
import showToast from '../utils/toast';
import DashboardLayout from '../components/DashboardLayout';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notification);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    dispatch(fetchUserNotifications());
  }, [dispatch]);

  const handleMarkAsRead = async (id) => {
    const result = await dispatch(markAsRead(id));
    if (result.type.includes('fulfilled')) {
      showToast.success('Notification marked as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await dispatch(markAllAsRead());
    if (result.type.includes('fulfilled')) {
      showToast.success('All notifications marked as read');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      const result = await dispatch(deleteNotification(id));
      if (result.type.includes('fulfilled')) {
        showToast.success('Notification deleted');
      }
    }
  };

  const filteredNotifications = notifications?.filter((notification) => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-500';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="h-6 w-6" />;
      case 'success':
        return <CheckCircle className="h-6 w-6" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6" />;
      case 'error':
        return <XCircle className="h-6 w-6" />;
      default:
        return <Bell className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader text="Loading notifications..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Stay updated with all your notifications</p>
        </div>

        {/* Filter and Actions */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            {/* Filter Tabs */}
            <div className="flex space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap shrink-0 ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap shrink-0 ${
                  filter === 'unread'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap shrink-0 ${
                  filter === 'read'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Read
              </button>
            </div>

            {/* Mark All as Read Button */}
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 sm:px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium transition-colors text-xs sm:text-sm w-full sm:w-auto"
            >
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredNotifications && filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
                  !notification.read ? 'border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className={`p-2 sm:p-3 rounded-full shrink-0 ${getTypeColor(notification.type)}`}>
                        <div className="w-4 h-4 sm:w-6 sm:h-6">
                          {getTypeIcon(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full mt-1">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-3 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                          <span>{getRelativeTime(notification.createdAt)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-xs">{formatDateTime(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 ml-2 sm:ml-4 shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-1.5 sm:p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
              <Bell className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">No notifications</h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 px-2">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : filter === 'read'
                  ? 'No read notifications yet.'
                  : "You don't have any notifications yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
