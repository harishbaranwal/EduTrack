import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Clock, Zap, CheckCircle2, BookOpen, Calendar, Link as LinkIcon, Star } from 'lucide-react';
import {
  fetchRecommendations,
  updateTaskStatus,
  submitTaskFeedback,
} from '../store/features/tasks/taskSlice';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import showToast from '../utils/toast';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import DashboardLayout from '../components/DashboardLayout';

const Recommendations = () => {
  const dispatch = useDispatch();
  const { tasks: recommendations, loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchRecommendations({ studentId: user.id, filters: {} }));
    }
  }, [dispatch, user?.id]);

  const handleStatusUpdate = async (taskId, status) => {
    const result = await dispatch(updateTaskStatus({ recommendationId: taskId, status }));
    if (result.type.includes('fulfilled')) {
      showToast.success(`Task marked as ${status}`);
      if (user?.id) {
        dispatch(fetchRecommendations({ studentId: user.id, filters: {} }));
      }
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      showToast.error('Please provide feedback');
      return;
    }

    const result = await dispatch(
      submitTaskFeedback({
        recommendationId: selectedTask._id,
        feedbackData: {
          feedback,
          rating,
        },
      })
    );

    if (result.type.includes('fulfilled')) {
      showToast.success('Feedback submitted successfully');
      setShowFeedbackModal(false);
      setSelectedTask(null);
      setFeedback('');
      setRating(0);
      if (user?.id) {
        dispatch(fetchRecommendations({ studentId: user.id, filters: {} }));
      }
    }
  };

  const filteredRecommendations = recommendations?.filter((rec) => {
    if (filter === 'all') return true;
    return rec.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !recommendations) {
    return <Loader fullScreen text="Loading recommendations..." />;
  }

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Recommendations</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Personalized learning recommendations based on your attendance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{recommendations?.length || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-indigo-100 rounded-full shrink-0">
                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {recommendations?.filter((r) => r.status === 'pending').length || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-full shrink-0">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {recommendations?.filter((r) => r.status === 'in-progress').length || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full shrink-0">
                <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {recommendations?.filter((r) => r.status === 'completed').length || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-full shrink-0">
                <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                filter === 'pending'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                filter === 'in-progress'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                filter === 'completed'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredRecommendations && filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((recommendation) => (
              <div
                key={recommendation._id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 ${
                  getStatusColor(recommendation.status).split(' ')[2]
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{recommendation.title}</h3>
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full self-start ${getStatusColor(
                            recommendation.status
                          )}`}
                        >
                          {recommendation.status}
                        </span>
                      </div>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full self-start ${getPriorityColor(
                          recommendation.priority
                        )}`}
                      >
                        {recommendation.priority} priority
                      </span>
                      <p className="text-gray-600 mb-3 text-sm sm:text-base">{recommendation.description}</p>

                      {/* Metadata */}
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1 shrink-0" />
                          <span className="truncate">{recommendation.subject?.name || 'Subject'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 shrink-0" />
                          <span>Created {getRelativeTime(recommendation.createdAt)}</span>
                        </div>
                        {recommendation.dueDate && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 shrink-0" />
                            <span>Due {formatDate(recommendation.dueDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Resources */}
                      {recommendation.resources && recommendation.resources.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Resources:</p>
                          <div className="flex flex-wrap gap-2">
                            {recommendation.resources.map((resource, index) => (
                              <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 sm:px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-xs sm:text-sm flex items-center"
                              >
                                <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 shrink-0" />
                                <span className="truncate">{resource.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                    {recommendation.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(recommendation._id, 'in-progress')}
                        className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Start Working
                      </button>
                    )}
                    {recommendation.status === 'in-progress' && (
                      <button
                        onClick={() => handleStatusUpdate(recommendation._id, 'completed')}
                        className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Mark Complete
                      </button>
                    )}
                    {recommendation.status === 'completed' && !recommendation.feedback && (
                      <button
                        onClick={() => {
                          setSelectedTask(recommendation);
                          setShowFeedbackModal(true);
                        }}
                        className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Submit Feedback
                      </button>
                    )}
                    {recommendation.feedback && (
                      <span className="px-3 sm:px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        ✓ Feedback Submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No recommendations</h3>
              <p className="mt-2 text-sm text-gray-500">
                {filter === 'all'
                  ? 'Keep attending classes regularly to receive personalized recommendations!'
                  : `No ${filter} recommendations at the moment.`}
              </p>
            </div>
          )}
        </div>

        {/* Feedback Modal */}
        <Modal
          isOpen={showFeedbackModal && !!selectedTask}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedTask(null);
            setFeedback('');
            setRating(0);
          }}
          title="Submit Feedback"
          size="max-w-md"
        >
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback *</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Share your experience with this recommendation..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedTask(null);
                  setFeedback('');
                  setRating(0);
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
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default Recommendations;
