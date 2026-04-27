import { useState, useEffect } from 'react';
import { X, ChevronDown, Lightbulb, Target, Award } from 'lucide-react';
import showToast from '../../utils/toast';
import studentProfileOptions from '../../assets/data/studentProfileOptions.json';

const StudentProfileDetails = ({ profileData, setProfileData }) => {
  // Dropdown states
  const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
  const [showCareerGoalsDropdown, setShowCareerGoalsDropdown] = useState(false);
  const [showStrengthsDropdown, setShowStrengthsDropdown] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowInterestsDropdown(false);
        setShowCareerGoalsDropdown(false);
        setShowStrengthsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-select handlers
  const handleToggleItem = (field, item) => {
    setProfileData((prev) => {
      const currentItems = prev[field];
      const isSelected = currentItems.includes(item);

      // If deselecting, just remove it
      if (isSelected) {
        return {
          ...prev,
          [field]: currentItems.filter((i) => i !== item),
        };
      }

      // If selecting, check limits
      if (field === 'careerGoals' && currentItems.length >= 2) {
        showToast.error('You can select maximum 2 career goals');
        return prev;
      }

      // Add the item
      return {
        ...prev,
        [field]: [...currentItems, item],
      };
    });
  };

  const handleRemoveItem = (field, item) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: prev[field].filter((i) => i !== item),
    }));
  };

  return (
    <div className="border-t-2 border-gray-100 pt-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Award className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Student Profile Details</h3>
      </div>

      {/* Interests Multi-Select */}
      <div className="relative dropdown-container">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Lightbulb className="w-4 h-4 text-blue-600" />
          Interests *
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowInterestsDropdown(!showInterestsDropdown)}
            className="w-full px-4 py-3 text-left border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between hover:border-blue-400 transition-all"
          >
            <span className="text-gray-700 font-medium">
              {profileData.interests.length > 0
                ? `${profileData.interests.length} interest${profileData.interests.length > 1 ? 's' : ''} selected`
                : 'Select your interests'}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${showInterestsDropdown ? 'rotate-180' : ''}`}
            />
          </button>
          {showInterestsDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blue-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {studentProfileOptions.interests.map((interest) => (
                <label
                  key={interest}
                  className="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={profileData.interests.includes(interest)}
                    onChange={() => handleToggleItem('interests', interest)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{interest}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {profileData.interests.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-200 transition-colors"
            >
              {interest}
              <button
                type="button"
                onClick={() => handleRemoveItem('interests', interest)}
                className="hover:text-blue-900 p-0.5 hover:bg-blue-200 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <Lightbulb className="w-3 h-3" />
          Select your academic and technical interests
        </p>
      </div>

      {/* Career Goals Multi-Select */}
      <div className="relative dropdown-container">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Target className="w-4 h-4 text-green-600" />
          Career Goals * (Max 2)
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCareerGoalsDropdown(!showCareerGoalsDropdown)}
            className="w-full px-4 py-3 text-left border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white flex items-center justify-between hover:border-green-400 transition-all"
          >
            <span className="text-gray-700 font-medium">
              {profileData.careerGoals.length > 0
                ? `${profileData.careerGoals.length}/2 goal${profileData.careerGoals.length > 1 ? 's' : ''} selected`
                : 'Select up to 2 career goals'}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${showCareerGoalsDropdown ? 'rotate-180' : ''}`}
            />
          </button>
          {showCareerGoalsDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-green-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {studentProfileOptions.careerGoals.map((goal) => {
                const isSelected = profileData.careerGoals.includes(goal);
                const isDisabled = !isSelected && profileData.careerGoals.length >= 2;

                return (
                  <label
                    key={goal}
                    className={`flex items-center px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0 ${
                      isDisabled ? 'cursor-not-allowed opacity-50 bg-gray-50' : 'cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleItem('careerGoals', goal)}
                      disabled={isDisabled}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {profileData.careerGoals.map((goal) => (
            <span
              key={goal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium border border-green-200 hover:bg-green-200 transition-colors"
            >
              {goal}
              <button
                type="button"
                onClick={() => handleRemoveItem('careerGoals', goal)}
                className="hover:text-green-900 p-0.5 hover:bg-green-200 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <Target className="w-3 h-3" />
          Select your career aspirations (maximum 2)
        </p>
      </div>

      {/* Strengths Multi-Select */}
      <div className="relative dropdown-container">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Award className="w-4 h-4 text-purple-600" />
          Strengths *
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStrengthsDropdown(!showStrengthsDropdown)}
            className="w-full px-4 py-3 text-left border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white flex items-center justify-between hover:border-purple-400 transition-all"
          >
            <span className="text-gray-700 font-medium">
              {profileData.strengths.length > 0
                ? `${profileData.strengths.length} strength${profileData.strengths.length > 1 ? 's' : ''} selected`
                : 'Select your strengths'}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${showStrengthsDropdown ? 'rotate-180' : ''}`}
            />
          </button>
          {showStrengthsDropdown && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-purple-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {studentProfileOptions.strengths.map((strength) => (
                <label
                  key={strength}
                  className="flex items-center px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={profileData.strengths.includes(strength)}
                    onChange={() => handleToggleItem('strengths', strength)}
                    className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{strength}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {profileData.strengths.map((strength) => (
            <span
              key={strength}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium border border-purple-200 hover:bg-purple-200 transition-colors"
            >
              {strength}
              <button
                type="button"
                onClick={() => handleRemoveItem('strengths', strength)}
                className="hover:text-purple-900 p-0.5 hover:bg-purple-200 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <Award className="w-3 h-3" />
          Select your key skills and strengths
        </p>
      </div>
    </div>
  );
};

export default StudentProfileDetails;
