import { Link } from 'react-router';
import { 
  QrCode, 
  MapPin, 
  BarChart3, 
  BookMarked, 
  Bell, 
  Calendar, 
  Shield, 
  Users, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Powerful Features
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Everything you need to manage attendance efficiently and effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-indigo-600 transition-colors">
                <QrCode className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">QR Code Scanning</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Quick and contactless attendance marking with secure QR codes
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-blue-600 transition-colors">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Geolocation Verification</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Ensure students are physically present with GPS-based location verification</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-green-600 transition-colors">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Real-time Analytics</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Track attendance patterns, generate reports, and get actionable insights</p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-purple-600 transition-colors">
                <BookMarked className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Smart Recommendations</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">AI-powered insights to help students improve attendance and performance</p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-red-600 transition-colors">
                <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-red-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Instant Notifications</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Get real-time alerts for attendance updates and important announcements</p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-orange-600 transition-colors">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Smart Timetable</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Manage class schedules, sessions, and batches with an intuitive interface</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-50 rounded-full mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-semibold text-indigo-600">About Us</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                EduTrack
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6">
                Our EduTrack revolutionizes how educational institutions 
                manage student attendance with cutting-edge technology and user-friendly interfaces.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">
                Built for administrators, teachers, and students, our platform provides role-based 
                access with powerful features tailored to each user's needs.
              </p>
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center mt-1">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base text-gray-900 font-semibold mb-1">100% Secure & Private</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Your data is encrypted and protected</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center mt-1">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base text-gray-900 font-semibold mb-1">Easy to Use Interface</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Intuitive design for all users</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center mt-1">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base text-gray-900 font-semibold mb-1">24/7 Support Available</h4>
                    <p className="text-xs sm:text-sm text-gray-600">We're here to help anytime</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-linear-to-br from-indigo-600 to-purple-600 p-8 sm:p-10 lg:p-12 rounded-3xl shadow-2xl">
              <div className="text-white space-y-6 sm:space-y-8 lg:space-y-10">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3">5,000+</div>
                  <div className="text-indigo-100 text-sm sm:text-base lg:text-lg">Active Students</div>
                </div>
                <div className="h-px bg-indigo-400 opacity-30"></div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3">500+</div>
                  <div className="text-indigo-100 text-sm sm:text-base lg:text-lg">Teachers</div>
                </div>
                <div className="h-px bg-indigo-400 opacity-30"></div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3">100+</div>
                  <div className="text-indigo-100 text-sm sm:text-base lg:text-lg">Institutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/banners/image-1.png')] bg-cover bg-center bg-no-repeat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
             Ready to Transform Your Attendance Management?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
             Join thousands of institutions already using our platform to streamline attendance
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Get Started Now
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
