import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/axios';
import MobileNavigation from '../components/MobileNavigation';
import { motion, useInView } from 'framer-motion';
import { 
  FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, 
  FaBed, FaCalendarAlt, FaWineGlass, FaStar, FaLeaf, FaArrowRight, FaGift, 
  FaCheckCircle, FaGlobe, FaCogs, FaUsers, FaHeart
} from 'react-icons/fa';

const WINE_STORE_LOGO = '/images/image copy 2.png'; // AKR Wine Store logo

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
        {homepageLogo && (
          <img
            src={homepageLogo}
            alt="Logo"
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: '2px solid #fff', background: '#fff' }}
          />
        )}
        <div className="text-lg font-bold mb-2">AKR Wine Store</div>
        <div className="text-sm opacity-90 mb-2">A refined retail destination offering a curated selection of fine wines from around the world.</div>
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
        <div className="flex items-center gap-2"><FaClock /> Mon - Sat: 10:00 AM - 8:00 PM</div>
        <div className="flex items-center gap-2"><FaClock /> Sunday: 12:00 PM - 6:00 PM</div>
      </div>
      <div className="flex flex-col gap-2 items-center md:items-start">
        <div className="font-semibold mb-1">Quick Links</div>
        <a href="/" className="hover:underline">Home</a>
        <a href="/wine-store" className="hover:underline">Wine Store</a>
        <a href="#contact" className="hover:underline">Contact</a>
      </div>
    </div>
    <div className="text-center text-xs opacity-80 mt-8">© {new Date().getFullYear()} AKR Wine Store. All rights reserved.</div>
  </footer>
);

const WineStore = () => {
  const [banners, setBanners] = useState([]);
  const [homepageLogo, setHomepageLogo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/settings");
        const settings = response.data;
        const wineStoreImages = settings.wineStoreSection?.images || [];
        setBanners(wineStoreImages.length > 0 ? wineStoreImages : []);
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
                  src={WINE_STORE_LOGO}
                  alt="AKR Wine Store Logo"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-green-500 shadow-md"
                />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  AKR WINE STORE
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Premium Wine & Spirits Collection
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
        className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-purple-50 via-red-50 to-pink-50 relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-48 h-48 md:w-64 md:h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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
            className="absolute top-0 right-10 w-48 h-48 md:w-64 md:h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-100 to-red-100 rounded-full mb-4"
            >
              <FaWineGlass className="w-3 h-3 text-purple-600 mr-2" />
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Curated Selection • Fine Wines • Global Collection</span>
              <FaGlobe className="w-3 h-3 text-red-600 ml-2" />
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-red-700 bg-clip-text text-transparent mb-4 leading-tight"
            >
              🍷 AKR Wine Store 🥂
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto"
            >
              A refined retail destination offering a curated selection of fine wines from around the world, crafted for true connoisseurs and enthusiasts alike.
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
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-100 to-red-100 rounded-full mb-4">
                <FaCheckCircle className="w-3 h-3 text-purple-600 mr-2" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Curated Selection & Expert Consultation</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Crafted for 
                <span className="bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent"> True Connoisseurs</span>
              </h2>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                We specialize in offering a carefully curated selection of fine wines from renowned vineyards and regions around the world. Our collection represents the pinnacle of winemaking excellence, sourced from the most prestigious wine-producing regions.
              </p>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                Whether you're a seasoned connoisseur or an enthusiastic beginner, our expert team provides personalized recommendations and guidance to help you discover wines that perfectly match your taste and occasion.
              </p>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: FaWineGlass, label: "Fine Wines", color: "text-purple-600" },
                  { icon: FaGlobe, label: "Global Selection", color: "text-red-600" },
                  { icon: FaStar, label: "Premium Quality", color: "text-yellow-600" },
                  { icon: FaUsers, label: "Expert Guidance", color: "text-blue-600" }
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-red-500 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
                <img
                  src="/images/akr-wine-store.jpg"
                  alt="AKR Wine Store"
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
                icon: "🍷",
                title: "Fine Wines",
                description: "Premium wines from renowned vineyards worldwide",
                gradient: "from-purple-500 to-purple-600",
                bgGradient: "from-purple-50 to-purple-100",
                borderColor: "border-purple-200"
              },
              {
                icon: "🥃",
                title: "Premium Spirits",
                description: "High-quality spirits and liqueurs for connoisseurs",
                gradient: "from-red-500 to-red-600",
                bgGradient: "from-red-50 to-red-100",
                borderColor: "border-red-200"
              },
              {
                icon: "👨‍💼",
                title: "Expert Consultation",
                description: "Professional wine recommendations and pairing advice",
                gradient: "from-yellow-500 to-yellow-600",
                bgGradient: "from-yellow-50 to-yellow-100",
                borderColor: "border-yellow-200"
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
                <h3 className={`text-base sm:text-lg font-bold ${feature.gradient.includes('purple') ? 'text-purple-800' : feature.gradient.includes('red') ? 'text-red-800' : 'text-yellow-800'} mb-2`}>
                  {feature.title}
                </h3>
                <p className={`text-xs sm:text-sm ${feature.gradient.includes('purple') ? 'text-purple-700' : feature.gradient.includes('red') ? 'text-red-700' : 'text-yellow-700'} leading-relaxed`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Services Section */}
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
                Our Wine Collection
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Curated selection of fine wines and premium spirits for true connoisseurs
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
                  icon: "🍷",
                  title: "Fine Wines",
                  description: "Premium wines from renowned vineyards and regions worldwide",
                  features: ["Red wines", "White wines", "Rosé wines", "Sparkling wines"]
                },
                {
                  icon: "🥃",
                  title: "Premium Spirits",
                  description: "High-quality spirits including whiskey, vodka, and more",
                  features: ["Whiskey", "Vodka", "Gin", "Premium liqueurs"]
                },
                {
                  icon: "👨‍💼",
                  title: "Expert Consultation",
                  description: "Professional wine recommendations and pairing advice",
                  features: ["Wine pairing", "Tasting notes", "Expert guidance", "Personalized recommendations"]
                },
                {
                  icon: "🎁",
                  title: "Gift Services",
                  description: "Beautiful gift packaging and delivery for special occasions",
                  features: ["Gift packaging", "Special occasions", "Delivery service", "Custom arrangements"]
                }
              ].map((service, index) => (
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
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-lg sm:text-xl">{service.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2">{service.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                  <ul className="text-xs text-gray-500 space-y-1 ml-12 sm:ml-16">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-gradient-to-r from-purple-500 to-red-500 rounded-full"></div>
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

      {/* Contact & Info Section */}
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
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">Contact AKR Wine Store</h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { icon: FaClock, title: "Business Hours", info: "Mon - Sat: 10:00 AM - 8:00 PM", subtitle: "Sunday: 12:00 PM - 6:00 PM" },
                    { icon: FaMapMarkerAlt, title: "Location", info: "Main Street, Murunkan", subtitle: "Mannar - Premium wine destination" },
                    { icon: FaPhoneAlt, title: "Get Wines", info: "Phone: 0773111266", subtitle: "Call for wine selection and consultation" }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
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
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">Why Choose Us</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { icon: "⭐", title: "Premium Selection", description: "Curated fine wines" },
                    { icon: "🌍", title: "Global Collection", description: "Wines from worldwide" },
                    { icon: "👨‍💼", title: "Expert Guidance", description: "Professional consultation" },
                    { icon: "🎁", title: "Gift Services", description: "Beautiful packaging" }
                  ].map((benefit, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-lg sm:text-xl mb-2">{benefit.icon}</div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
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

export default WineStore;
