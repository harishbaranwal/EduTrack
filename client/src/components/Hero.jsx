import { Link } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  QrCode,
  MapPin,
  Target,
  Sparkles,
  LayoutDashboard,
  Lightbulb,
} from "lucide-react";

const Hero = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const getDashboardRoute = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case "Admin":
        return "/admin";
      case "Teacher":
        return "/teacher";
      case "Student":
        return "/student";
      default:
        return "/dashboard";
    }
  };

  return (
    <section className="bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen flex items-center relative overflow-hidden px-3 sm:px-4 md:px-6 lg:px-8 pt-16 sm:pt-20">
      {/* Animated Background - Mobile Optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 sm:-top-32 -left-16 sm:-left-32 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-linear-to-br from-indigo-300 to-purple-300 rounded-full blur-2xl sm:blur-3xl opacity-20 sm:opacity-30 md:opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-16 sm:-bottom-32 -right-16 sm:-right-32 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-linear-to-tr from-pink-300 to-yellow-300 rounded-full blur-2xl sm:blur-3xl opacity-20 sm:opacity-30 md:opacity-40 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40 md:w-60 md:h-60 lg:w-80 lg:h-80 bg-linear-to-r from-blue-300 to-teal-300 rounded-full blur-2xl sm:blur-3xl opacity-15 sm:opacity-20 md:opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Content Container - Mobile Optimized */}
      <div className="max-w-7xl mx-auto relative z-10 py-6 sm:py-8 md:py-10 lg:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
          
          {/* LEFT: Text + CTAs */}
          <div className="text-center lg:text-left space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Badge - Mobile Optimized */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-full text-indigo-700 font-semibold text-[10px] sm:text-xs md:text-sm animate-fade-in">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">AI-Powered • Zero Setup • For Students & Teachers</span>
              <span className="sm:hidden">AI-Powered Education</span>
            </div>

            {/* Headline - Mobile Optimized */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight px-2 sm:px-0">
              {isAuthenticated ? (
                <>
                  <span className="block text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">Welcome Back,</span>
                  <span className="block bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-1 sm:mt-2">
                    {user?.name?.split(" ").slice(0, 2).join(" ") || "User"}!
                  </span>
                </>
              ) : (
                <>
                  <span className="block">Turn Every</span>
                  <span className="block">Minute Into</span>
                  <span className="block bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                    Learning Power
                  </span>
                </>
              )}
            </h1>

            {/* Description - Mobile Optimized */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 max-w-xl mx-auto lg:mx-0 leading-relaxed px-3 sm:px-2 md:px-0">
              {isAuthenticated ? (
                <>
                  <span className="block sm:inline">Ready to continue your journey?</span>
                  <span className="hidden md:inline"> Access your <strong>personalized dashboard</strong> to track attendance, view tasks, and manage your academic progress.</span>
                  <span className="md:hidden block mt-1">Access your dashboard to track progress.</span>
                </>
              ) : (
                <>
                  <span className="hidden md:inline">
                    Auto-mark attendance with <strong>QR and Geolocation</strong>.
                    Transform free periods into{" "}
                    <strong>personalized AI study sprints</strong> - tailored to
                    your goals, strengths, and dream career.
                  </span>
                  <span className="md:hidden">
                    Smart attendance tracking & AI-powered learning recommendations for your academic success.
                  </span>
                </>
              )}
            </p>

            {/* CTA Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 justify-center lg:justify-start w-full px-3 sm:px-0">
              {isAuthenticated ? (
                <Link
                  to={getDashboardRoute()}
                  className="group inline-flex items-center justify-center px-4 sm:px-5 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg sm:shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  <LayoutDashboard className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">Go to Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                  <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center px-4 sm:px-5 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg sm:shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto"
                  >
                    Get Started
                    <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-4 sm:px-5 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base lg:text-lg font-bold text-indigo-700 bg-white border-2 border-indigo-200 rounded-lg sm:rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 w-full sm:w-auto"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators - Fully Responsive */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 xs:gap-4 sm:gap-5 md:gap-6 text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-600 font-medium">
              <div className="whitespace-nowrap flex items-center gap-1">
                <span className="text-indigo-600 font-bold text-sm xs:text-base sm:text-lg md:text-xl">10+</span>
                <span>Colleges</span>
              </div>
              <div className="whitespace-nowrap flex items-center gap-1">
                <span className="text-purple-600 font-bold text-sm xs:text-base sm:text-lg md:text-xl">1K+</span>
                <span>Students</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Feature Cards - Mobile Optimized */}
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-5 mt-4 sm:mt-6 lg:mt-0 px-2 sm:px-0">
            {[
              { icon: QrCode, title: "QR Attendance", desc: "2-sec scan", color: "indigo" },
              { icon: MapPin, title: "Geo-Verified Attendance", desc: "No proxy", color: "blue" },
              { icon: Lightbulb, title: "Smart Recommendation", desc: "AI auto-fill", color: "green" },
              { icon: Target, title: "Goal Based Study Plan", desc: "Study smarter", color: "purple" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-2.5 sm:p-3 md:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md sm:shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-float"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3 mx-auto group-hover:scale-110 transition-transform ${
                    feature.color === "indigo"
                      ? "bg-linear-to-br from-indigo-500 to-indigo-600"
                      : feature.color === "blue"
                      ? "bg-linear-to-br from-blue-500 to-blue-600"
                      : feature.color === "green"
                      ? "bg-linear-to-br from-green-500 to-green-600"
                      : "bg-linear-to-br from-purple-500 to-purple-600"
                  }`}
                >
                  <feature.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-white" />
                </div>
                <h3 className="font-bold text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-900 text-center leading-tight">
                  {feature.title}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-0.5 sm:mt-1 text-center">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;