import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, ArrowLeft } from "lucide-react";
import contactAPI from "../store/features/contact/contactAPI";
import toast from "react-hot-toast";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await contactAPI.submitContactForm(formData);
      if (data.success) {
        toast.success(
          data.message ||
            "Message sent successfully! We'll get back to you soon."
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(
          data.message || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setIsLoading(true);
        const data = await contactAPI.getContactInfo();

        if (data.success) {
          const mappedContactInfo = data.data.map((item) => ({
            ...item,
            icon:
              item.icon === "Phone"
                ? Phone
                : item.icon === "Mail"
                ? Mail
                : item.icon === "MapPin"
                ? MapPin
                : item.icon === "Clock"
                ? Clock
                : Phone,
          }));
          setContactInfo(mappedContactInfo);
        } else {
          throw new Error(
            data.message || "Failed to fetch contact information"
          );
        }
      } catch (error) {
        toast.error("Failed to load contact information");
        setContactInfo([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 mb-4 sm:mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Back</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Contact Us</h1>
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
              Have questions or need assistance? We're here to help! Get in touch
              with our team.
            </p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 shrink-0" />
                Get in Touch
              </h2>

              <div className="space-y-4 sm:space-y-6">
                {isLoading
                  ? // Loading skeleton
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 sm:space-x-4 animate-pulse"
                      >
                        <div className="p-2 sm:p-3 rounded-lg bg-gray-200 w-10 h-10 sm:w-12 sm:h-12 shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded mb-2 w-24"></div>
                          <div className="h-4 bg-gray-200 rounded mb-1 w-32"></div>
                          <div className="h-4 bg-gray-200 rounded w-28"></div>
                        </div>
                      </div>
                    ))
                  : contactInfo.map((info, index) => {
                      const Icon = info.icon;
                      return (
                        <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                          <div
                            className={`p-2 sm:p-3 rounded-lg bg-gray-50 ${info.color} shrink-0`}
                          >
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                              {info.title}
                            </h3>
                            {info.details.map((detail, idx) => (
                              <p key={idx} className="text-sm sm:text-base text-gray-600 overflow-wrap-anywhere">
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
              </div>
               <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-blue-50 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
                  Quick Response
                </h3>
                <p className="text-blue-700 text-sm">
                  We typically respond to all inquiries within 24 hours during
                  business days.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base"
                    placeholder="Enter your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
