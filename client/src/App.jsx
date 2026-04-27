import { Routes, Route, Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import useAuth from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

// Components
import Sidebar from "./components/Sidebar";

// Pages
import Home from "./pages/Home";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";

// Dashboard Pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";

// Other Pages
import Attendance from "./pages/Attendance";
import TeacherAttendance from "./components/TeacherAttendance";
import TeacherClasses from "./pages/TeacherClasses";
import TeacherStudents from "./pages/TeacherStudents";
import TimetableManagement from "./pages/TimetableManagement";
import Timetable from "./pages/Timetable";
import Notifications from "./pages/Notifications";
import NotificationManagement from "./pages/NotificationManagement";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import BatchManagement from "./pages/BatchManagement";
import Recommendations from "./pages/Recommendations";
import CourseRecommendations from "./pages/CourseRecommendations";
import Contact from "./pages/Contact";
import Chatbot from "./components/Chatbot";

import "./index.css";

function Layout({ children }) {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Routes that don't need layout (auth pages and dashboard pages that have their own DashboardLayout)
  const noLayoutRoutes = [
    "/",
    "/login",
    "/register",
    "/verify-otp",
    "/home",
    "/contact",
    "/unauthorized",
    "/profile",
  ];
  const dashboardRoutes = ["/admin", "/teacher", "/student"]; // Routes that use DashboardLayout

  const shouldShowLayout =
    !noLayoutRoutes.includes(location.pathname) &&
    user &&
    !dashboardRoutes.some((route) => location.pathname.startsWith(route));

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-1 bg-white">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
      {/* <Footer /> */}
    </div>
  );
}

function AppContent() {
  const { initialized } = useAuth();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const publicRoutes = ["/", "/home", "/login", "/register", "/verify-otp"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (!initialized && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent animate-spin"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/batches"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <BatchManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/timetable"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <TimetableManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <NotificationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/my-notifications"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/attendance"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/classes"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/timetable"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Timetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/notifications"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <NotificationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/my-notifications"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Timetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/recommendations"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <CourseRecommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Common Routes */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Unauthorized Access
                  </h2>
                  <p className="text-gray-600">
                    You don't have permission to access this page.
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </Layout>
      {user && <Chatbot />}
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
