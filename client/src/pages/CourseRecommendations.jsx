import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Star, Clock, ExternalLink, Target, Heart, TrendingUp, Edit } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import DashboardLayout from '../components/DashboardLayout';

const CourseRecommendations = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    interests: [],
    careerGoals: [],
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCourseRecommendations();
    if (user) {
      setProfileData({
        interests: user.interests || [],
        careerGoals: user.careerGoals || [],
      });
    }
  }, [user]);

  const fetchCourseRecommendations = async () => {
    try {
      setLoading(true);
      const response = await API.get('/recommendations/courses');
      setRecommendations(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch course recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Validate career goals limit
    if (profileData.careerGoals.length > 2) {
      toast.error('You can select maximum 2 career goals');
      return;
    }

    try {
      await API.put('/users/profile', {
        interests: profileData.interests,
        careerGoals: profileData.careerGoals,
      });
      toast.success('Profile updated successfully');
      setShowProfileModal(false);
      fetchCourseRecommendations();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddInterest = (interest) => {
    if (!profileData.interests.includes(interest)) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, interest],
      });
    }
  };

  const handleRemoveInterest = (interest) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter((i) => i !== interest),
    });
  };

  const handleAddCareerGoal = (goal) => {
    if (profileData.careerGoals.length >= 2) {
      toast.error('You can select maximum 2 career goals');
      return;
    }
    if (!profileData.careerGoals.includes(goal)) {
      setProfileData({
        ...profileData,
        careerGoals: [...profileData.careerGoals, goal],
      });
    }
  };

  const handleRemoveCareerGoal = (goal) => {
    setProfileData({
      ...profileData,
      careerGoals: profileData.careerGoals.filter((g) => g !== goal),
    });
  };

  const allCourses = recommendations
    ? [
        ...recommendations.recommendations.careerBased,
        ...recommendations.recommendations.interestBased,
        ...recommendations.recommendations.popularCourses,
      ]
    : [];

  const filteredCourses =
    selectedCategory === 'all'
      ? allCourses
      : selectedCategory === 'career'
      ? recommendations?.recommendations.careerBased || []
      : selectedCategory === 'interest'
      ? recommendations?.recommendations.interestBased || []
      : recommendations?.recommendations.popularCourses || [];

  const predefinedInterests = [
    'Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Artificial Intelligence',
    'Cloud Computing',
    'DevOps',
    'Cybersecurity',
    'UI Design',
    'UX Design',
    'Database',
    'Business',
    'Leadership',
    'Communication',
  ];

  const predefinedCareerGoals = [
    'Software Developer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Mobile App Developer',
    'Data Scientist',
    'Machine Learning Engineer',
    'AI Engineer',
    'DevOps Engineer',
    'Cloud Architect',
    'Cybersecurity Analyst',
    'UI/UX Designer',
    'Product Manager',
    'Business Analyst',
    'Entrepreneur',
  ];

  if (loading) {
    return <Loader fullScreen text="Loading course recommendations..." />;
  }

  return (
    <DashboardLayout>
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 mb-2">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 shrink-0" />
              <span className="truncate">Course Recommendations</span>
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
              Personalized course recommendations based on your interests and career goals
            </p>
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap shrink-0 w-full sm:w-auto justify-center"
          >
            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Update Preferences</span>
            <span className="sm:hidden">Preferences</span>
          </button>
        </div>

        {/* User Profile Summary */}
        {recommendations && (
          <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6 border border-blue-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
                  Your Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.user.interests.length > 0 ? (
                    recommendations.user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No interests added yet</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
                  Career Goals
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.user.careerGoals.length > 0 ? (
                    recommendations.user.careerGoals.map((goal, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm"
                      >
                        {goal}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs sm:text-sm">No career goals added yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 sm:px-4 py-2 font-medium border-b-2 transition-colors text-xs sm:text-sm whitespace-nowrap shrink-0 ${
            selectedCategory === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          All Courses ({allCourses.length})
        </button>
        <button
          onClick={() => setSelectedCategory('career')}
          className={`px-3 sm:px-4 py-2 font-medium border-b-2 transition-colors text-xs sm:text-sm whitespace-nowrap shrink-0 ${
            selectedCategory === 'career'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Career Based ({recommendations?.recommendations.careerBased.length || 0})
        </button>
        <button
          onClick={() => setSelectedCategory('interest')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedCategory === 'interest'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Interest Based ({recommendations?.recommendations.interestBased.length || 0})
        </button>
        <button
          onClick={() => setSelectedCategory('popular')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedCategory === 'popular'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Popular Courses ({recommendations?.recommendations.popularCourses.length || 0})
        </button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCourses.map((course, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200"
          >
            {/* Course Header */}
            <div className="bg-linear-to-r from-blue-500 to-purple-600 p-3 sm:p-4 text-white">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-sm sm:text-base lg:text-lg flex-1 leading-tight">{course.title}</h3>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded shrink-0 ml-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs sm:text-sm font-semibold">{course.rating}</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm opacity-90">{course.platform}</p>
            </div>

            {/* Course Body */}
            <div className="p-3 sm:p-4">
              <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-3">{course.description}</p>

              <div className="space-y-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span className="font-medium">Level:</span>
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span className="font-medium">Duration:</span>
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                {course.skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
                {course.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{course.skills.length - 3} more
                  </span>
                )}
              </div>

              {/* Reason Tag */}
              {course.reason && (
                <div className="mb-3 sm:mb-4">
                  <span className="inline-block px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {course.reason}
                  </span>
                </div>
              )}

              {/* CTA Button */}
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm"
              >
                View Course
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg mb-2">No courses found in this category</p>
          <p className="text-gray-500 text-sm">
            Try updating your interests and career goals to get personalized recommendations
          </p>
        </div>
      )}

      {/* Profile Update Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Update Your Preferences"
        size="max-w-3xl"
      >
        <form onSubmit={handleUpdateProfile}>
          {/* Interests Section */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Select Your Interests</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {profileData.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    X
                  </button>
                </span>
              ))}
            </div>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {predefinedInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleAddInterest(interest)}
                    disabled={profileData.interests.includes(interest)}
                    className={`px-3 py-1 text-sm rounded ${
                      profileData.interests.includes(interest)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Career Goals Section */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">
              Select Your Career Goals (Maximum 2)
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {profileData.careerGoals.map((goal, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                >
                  {goal}
                  <button
                    type="button"
                    onClick={() => handleRemoveCareerGoal(goal)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {predefinedCareerGoals.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleAddCareerGoal(goal)}
                    disabled={
                      profileData.careerGoals.includes(goal) ||
                      profileData.careerGoals.length >= 2
                    }
                    className={`px-3 py-1 text-sm rounded ${
                      profileData.careerGoals.includes(goal) ||
                      profileData.careerGoals.length >= 2
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
    </DashboardLayout>
  );
};

export default CourseRecommendations;
