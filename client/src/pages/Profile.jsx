import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  User,
  Shield,
  Calendar,
  CheckCircle,
  Target,
  Lightbulb,
  Award,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { updateProfile } from "../store/features/auth/authSlice";
import showToast from "../utils/toast";
import Loader from "../components/Loader";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";
import StudentProfileDetails from "../components/profile/StudentProfileDetails";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile"); // profile, password
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    interests: [],
    careerGoals: [],
    strengths: [],
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        registrationNumber: user.registrationNumber || "",
        interests: Array.isArray(user.interests)
          ? user.interests
          : user.interests
          ? user.interests.split(",").map((i) => i.trim())
          : [],
        careerGoals: Array.isArray(user.careerGoals)
          ? user.careerGoals
          : user.careerGoals
          ? user.careerGoals.split(",").map((g) => g.trim())
          : [],
        strengths: user.strengths || [],
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.name) {
      showToast.error("Name is required");
      return;
    }

    // Only send fields that can be updated
    const updateData = {
      name: profileData.name,
    };

    // Add student-specific fields only if user is a student
    if (user?.role === "Student") {
      updateData.interests = profileData.interests;
      updateData.careerGoals = profileData.careerGoals;
      updateData.strengths = profileData.strengths;
      // Registration number is auto-generated, not editable
    }

    const result = await dispatch(updateProfile(updateData));
    if (result.type.includes("fulfilled")) {
      showToast.success("Profile updated successfully");
    }
  };

  if (loading) {
    return <Loader fullScreen text="Updating profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 mb-3 sm:mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Manage your account settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="px-4 sm:px-8 py-6">
            {/* Profile Header - Left Aligned */}
            <div className="flex items-center gap-4 sm:gap-6 mb-6">
              {/* Avatar */}
              <div className="h-20 w-20 sm:h-20 sm:w-20 shrink-0 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              {/* Name, Email and Badge */}
              <div className="flex flex-col">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {user?.name}
                </h2>
                <p className="text-sm text-gray-600 mb-2">{user?.email}</p>

                {/* Verified Badge */}
                {user?.accountVerified && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full w-fit">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">
                      Verified Account
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase">Role</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {user?.role}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase">
                    Account Created
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 font-mono">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase">User Id</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {user?._id}
                </p>
              </div>
            </div>

            {/* Student Profile Overview - Display before tabs */}
            {user?.role === "Student" &&
              (profileData.interests.length > 0 ||
                profileData.careerGoals.length > 0 ||
                profileData.strengths.length > 0) && (
                <div className="bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 mb-6 border border-indigo-100">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    My Profile Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Career Goals */}
                    {profileData.careerGoals.length > 0 && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Target className="w-5 h-5 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">
                            Career Goals
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {profileData.careerGoals.map((goal) => (
                            <div key={goal} className="flex items-start gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                              <span className="text-sm text-gray-700">
                                {goal}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interests */}
                    {profileData.interests.length > 0 && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Lightbulb className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">
                            Interests
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {profileData.interests.map((interest) => (
                            <span
                              key={interest}
                              className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths */}
                    {profileData.strengths.length > 0 && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Award className="w-5 h-5 text-purple-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">
                            Strengths
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {profileData.strengths.map((strength) => (
                            <span
                              key={strength}
                              className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium border border-purple-200"
                            >
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`py-4 px-2 border-b-2 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "profile"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`py-4 px-2 border-b-2 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "password"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Change Password
                </button>
              </nav>
            </div>

            {/* Profile Information Tab */}
            {activeTab === "profile" && (
              <form
                onSubmit={handleProfileSubmit}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Registration Number/UID - Auto-generated, Read-only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {user?.role === "Student" ? "Registration Number" : "UID"}
                    </label>
                    <input
                      type="text"
                      value={
                        profileData.registrationNumber || "Not assigned yet"
                      }
                      disabled
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-mono uppercase cursor-not-allowed text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user?.role}
                      disabled
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 capitalize cursor-not-allowed text-sm sm:text-base"
                    />
                  </div>
                </div>

                {user?.batch && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch
                    </label>
                    <input
                      type="text"
                      value={
                        typeof user.batch === "object"
                          ? user.batch.name || "N/A"
                          : user.batch
                      }
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                )}

                {/* Student-Specific Fields */}
                {user?.role === "Student" && (
                  <StudentProfileDetails
                    profileData={profileData}
                    setProfileData={setProfileData}
                  />
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && <ChangePasswordForm />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
