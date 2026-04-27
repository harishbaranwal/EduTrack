import { Link } from 'react-router';
import { Facebook, Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-indigo-400 mb-4">
              EduTrack{' '}
              <br />
              <span className="text-xs text-gray-500 tracking-wide uppercase mt-0">
                Smart Learning Suite
              </span>
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              A modern attendance management solution with QR code scanning, geolocation verification,
              and personalized recommendations for students.
            </p>
            <div className="flex space-x-4">
              <a className="text-gray-400 hover:text-indigo-400 transition-colors" title="Facebook">
                <Facebook className="h-6 w-6" />
              </a>
              <a className="text-gray-400 hover:text-indigo-400 transition-colors" title="Twitter">
                <Twitter className="h-6 w-6" />
              </a>
              <a className="text-gray-400 hover:text-indigo-400 transition-colors" title="GitHub">
                <Github className="h-6 w-6" />
              </a>
              <a className="text-gray-400 hover:text-indigo-400 transition-colors" title="LinkedIn">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-indigo-400">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="" className="text-gray-400 hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-indigo-400">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} EduTrack. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy
              </Link>
              <Link to="" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms
              </Link>
              <Link to="" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
