import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/axios';
import MobileNavigation from '../components/MobileNavigation';
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaBed, FaCalendarAlt, FaWrench, FaCar, FaUsers, FaCogs, FaShieldAlt, FaStar, FaLeaf, FaArrowRight, FaTools, FaCheckCircle } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';

const SERVICE_CENTER_LOGO = '/images/image copy 2.png'; // AKR Service Center logo

// Optimized Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const scaleOnHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeInOut" }
};

const Footer = ({ homepageLogo }) => (
  <footer className="bg-gradient-to-r from-green-700 to-green-400 text-white pt-10 pb-6 mt-16" id="contact">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="flex flex-col items-center md:items-start">
        {(homepageLogo || SERVICE_CENTER_LOGO) && (
          <img
            src={homepageLogo || SERVICE_CENTER_LOGO}
            alt="Logo"
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: '2px solid #fff', background: '#fff' }}
          />
        )}
        <div className="text-lg font-bold mb-2">AKR Service Center</div>
        <div className="text-sm opacity-90 mb-2">Trusted vehicle maintenance and repair solutions for all brands.</div>
        <div className="flex gap-3 mt-2">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-200"><FaFacebook size={22} /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-200"><FaInstagram size={22} /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-200"><FaTwitter size={22} /></a>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center md:items-start">
        <div className="font-semibold mb-1">Contact</div>
        <div className="flex items-center gap-2"><FaMapMarkerAlt /> Main street Murunkan, Mannar</div>
        <div className="flex items-center gap-2"><FaPhoneAlt /> <a href="tel:0773111266" className="underline hover:text-green-200">0773111266</a></div>
        <div className="flex items-center gap-2"><FaEnvelope /> <a href="mailto:akrfuture@gmail.com" className="underline hover:text-green-200">akrfuture@gmail.com</a></div>
      </div>
      <div className="flex flex-col gap-2 items-center md:items-start">
        <div className="font-semibold mb-1">Business Hours</div>
        <div className="flex items-center gap-2"><FaClock /> Daily: 8:00 AM - 8:00 PM</div>
        <div className="flex items-center gap-2"><FaClock /> 10 service bays available</div>
      </div>
      <div className="flex flex-col gap-2 items-center md:items-start">
        <div className="font-semibold mb-1">Quick Links</div>
        <a href="/" className="hover:underline">Home</a>
        <a href="/servicecenter" className="hover:underline">Service Center</a>
        <a href="#contact" className="hover:underline">Contact</a>
      </div>
    </div>
    <div className="text-center text-xs opacity-80 mt-8">© {new Date().getFullYear()} AKR Service Center. All rights reserved.</div>
  </footer>
);

const ServiceCenter = () => {
  const [banners, setBanners] = useState([]);
  const [homepageLogo, setHomepageLogo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/settings");
        const settings = response.data;
        setBanners(settings.banners || []);
        setHomepageLogo(settings.homepageLogo || "");
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo and Brand */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <img
                  src={SERVICE_CENTER_LOGO}
                  alt="AKR Service Center Logo"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-green-500 shadow-md"
                />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  AKR SERVICE CENTER
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Trusted Vehicle Solutions
                </div>
              </div>
            </motion.div>

            {/* Mobile Navigation */}
            <MobileNavigation />
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-blue-50 via-green-50 to-gray-50 relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-48 h-48 md:w-64 md:h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{ 
              x: [0, 50, 0],
              y: [0, -50, 0],
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute top-0 right-10 w-48 h-48 md:w-64 md:h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{ 
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{ 
              duration: 18,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-green-100 rounded-full mb-4"
            >
              <FaWrench className="w-3 h-3 text-blue-600 mr-2" />
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Trusted Service • All Vehicle Brands • Open Daily 8AM-8PM</span>
              <FaCar className="w-3 h-3 text-green-600 ml-2" />
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-green-700 bg-clip-text text-transparent mb-4 leading-tight"
            >
              🔧 AKR Service Center 🚗
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto"
            >
              A trusted, fully equipped service center offering comprehensive maintenance and repair solutions for all vehicle brands
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section 
        id="about" 
        className="py-8 sm:py-12 md:py-16 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Content */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 lg:mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
          >
            <motion.div variants={fadeInLeft}>
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-green-100 rounded-full mb-4">
                <FaCheckCircle className="w-3 h-3 text-blue-600 mr-2" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Certified Mechanics & Expert Service</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Professional Vehicle 
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Maintenance & Repair</span>
              </h2>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                Our team of certified mechanics ensures every service meets the highest standards of safety and reliability. We work with all vehicle brands to provide comprehensive solutions.
              </p>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                Enjoy quick turnaround times, genuine parts, warranty support, and the comfort of a dedicated customer lounge while you wait.
              </p>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: FaWrench, label: "Expert Mechanics", color: "text-blue-600" },
                  { icon: FaShieldAlt, label: "Warranty Support", color: "text-green-600" },
                  { icon: FaCogs, label: "Quick Service", color: "text-purple-600" },
                  { icon: FaUsers, label: "Customer Lounge", color: "text-orange-600" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-2 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center`}>
                      <item.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${item.color}`} />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              variants={fadeInRight}
              className="order-first lg:order-last"
            >
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-500 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
                <img
                  src="/images/servicecenter.jpg"
                  alt="Service Center Facility"
                  className="relative w-full h-64 sm:h-80 md:h-96 object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-2xl"></div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                icon: "🔧",
                title: "Expert Mechanics",
                description: "Certified technicians with expertise in all vehicle brands",
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100",
                borderColor: "border-blue-200"
              },
              {
                icon: "🚗",
                title: "Quick Service",
                description: "Fast turnaround times across our 10 equipped service bays",
                gradient: "from-green-500 to-green-600",
                bgGradient: "from-green-50 to-green-100",
                borderColor: "border-green-200"
              },
              {
                icon: "🛡️",
                title: "Genuine Parts",
                description: "Original parts with warranty support for peace of mind",
                gradient: "from-purple-500 to-purple-600",
                bgGradient: "from-purple-50 to-purple-100",
                borderColor: "border-purple-200"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`bg-gradient-to-br ${feature.bgGradient} p-4 sm:p-6 rounded-xl border ${feature.borderColor} text-center group hover:shadow-lg transition-all duration-300`}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div 
                  className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md group-hover:shadow-lg transition-shadow duration-300`}
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-xl sm:text-2xl">{feature.icon}</span>
                </motion.div>
                <h3 className={`text-base sm:text-lg font-bold ${feature.gradient.includes('blue') ? 'text-blue-800' : feature.gradient.includes('green') ? 'text-green-800' : 'text-purple-800'} mb-2`}>
                  {feature.title}
                </h3>
                <p className={`text-xs sm:text-sm ${feature.gradient.includes('blue') ? 'text-blue-700' : feature.gradient.includes('green') ? 'text-green-700' : 'text-purple-700'} leading-relaxed`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Amenities Section */}
      <motion.section 
        className="py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 mb-8">
            <motion.div 
              className="text-center mb-6 sm:mb-8"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                Our Amenities
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need for professional vehicle maintenance and a comfortable service experience
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
            >
              {[
                {
                  icon: "👨‍🔧",
                  title: "Certified Mechanics & Expert Technicians",
                  description: "Highly trained professionals with expertise in all vehicle brands and comprehensive repair solutions",
                  features: ["Certified mechanics", "Expert technicians", "All vehicle brands", "Professional training"]
                },
                {
                  icon: "🔧",
                  title: "Genuine Parts and Warranty Support",
                  description: "Original equipment parts with comprehensive warranty coverage for your peace of mind",
                  features: ["Genuine OEM parts", "Warranty support", "Quality assurance", "Reliable components"]
                },
                {
                  icon: "⚡",
                  title: "Quick Service Across 10 Bays",
                  description: "Fast and efficient service delivery with multiple service bays for reduced waiting times",
                  features: ["10 service bays", "Quick turnaround", "Efficient workflow", "Reduced wait times"]
                },
                {
                  icon: "☕",
                  title: "Comfortable Customer Lounge",
                  description: "Relax in our comfortable waiting area while our experts take care of your vehicle",
                  features: ["Comfortable seating", "Climate controlled", "Refreshments available", "WiFi access"]
                }
              ].map((amenity, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-lg sm:text-xl">{amenity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2">{amenity.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">{amenity.description}</p>
                    </div>
                  </div>
                  <ul className="text-xs text-gray-500 space-y-1 ml-12 sm:ml-16">
                    {amenity.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Services & Contact Section */}
      <motion.section 
        className="py-8 sm:py-12 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeInLeft}>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">Visit Our Service Center</h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { icon: FaClock, title: "Operating Hours", info: "Daily: 8:00 AM - 8:00 PM", subtitle: "10 service bays operating every day" },
                    { icon: FaMapMarkerAlt, title: "Location", info: "AKR Multi Complex, Main Street", subtitle: "Murunkan, Mannar - Easy access and parking" },
                    { icon: FaPhoneAlt, title: "Book Service", info: "Phone: 0773111266", subtitle: "Call to schedule your vehicle maintenance" }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm sm:text-base text-gray-700 font-medium">{item.info}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{item.subtitle}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div variants={fadeInRight}>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">Our Services</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { icon: "🔧", title: "General Maintenance", description: "Regular servicing and preventive maintenance" },
                    { icon: "🚗", title: "Engine Repair", description: "Complete engine diagnostics and repair services" },
                    { icon: "🛡️", title: "Brake Service", description: "Brake inspection, repair, and replacement" },
                    { icon: "⚡", title: "Electrical Service", description: "Automotive electrical systems and diagnostics" }
                  ].map((service, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-lg sm:text-xl mb-2">{service.icon}</div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{service.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{service.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <Footer homepageLogo={homepageLogo} />
    </div>
  );
};

export default ServiceCenter; 