import React, { useEffect, useState, useRef } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { 
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFacebook, FaInstagram, FaTwitter, 
  FaBed, FaShoppingCart, FaTruck, FaGasPump, FaWineGlass, FaSeedling, FaHeart, FaCreditCard,
  FaShieldAlt, FaStar, FaHandshake, FaChartLine, FaArrowRight
} from 'react-icons/fa';

// AKR Group Companies Data
const AKR_COMPANIES = [
  {
    id: 'akr-sons',
    name: 'AKR Sons (Pvt) Ltd',
    description: 'A trusted premium dealership for Bajaj motorcycles and three-wheelers, offering a diverse range of reliable, fuel-efficient models perfect for every commute and adventure.',
    icon: FaTruck,
    color: 'from-blue-500 to-blue-700',
    route: '/akr-sons',
    image: '/images/65D8EAD7-4DFC-4C1A-A902-EC3B7463C756.jpg'
  },
  {
    id: 'akr-multicomplex',
    name: 'AKR Multicomplex',
    description: 'A vibrant, all-in-one destination offering premium shopping, dining, entertainment, fitness, hospitality, and vehicle services.',
    icon: FaShoppingCart,
    color: 'from-green-500 to-green-700',
    route: '/multicomplex',
    image: '/images/akr-multi-complex.jpg'
  },
  {
    id: 'akr-construction',
    name: 'AKR Construction',
    description: 'Your reliable source for premium construction materials — including sea sand, red soil, metal, gravel, and more.',
    icon: FaTruck,
    color: 'from-orange-500 to-orange-700',
    route: '/construction',
    image: '/images/akr-construction.jpg'
  },
  {
    id: 'akr-filling-station',
    name: 'AKR Lanka Filling Station',
    description: 'Your dependable stop for high-quality fuel, petroleum products, and full automotive services.',
    icon: FaGasPump,
    color: 'from-red-500 to-red-700',
    route: '/filling-station',
    image: '/images/akr-fuel-station.jpg'
  },
  {
    id: 'akr-wine-store',
    name: 'AKR Wine Store',
    description: 'A refined retail destination offering a curated selection of fine wines from around the world.',
    icon: FaWineGlass,
    color: 'from-purple-500 to-purple-700',
    route: '/wine-store',
    image: '/images/akr-wine-store.jpg'
  },
  {
    id: 'akr-farm',
    name: 'AKR Farm',
    description: 'A forward-thinking agricultural initiative promoting sustainable, organic farming practices.',
    icon: FaSeedling,
    color: 'from-green-600 to-green-800',
    route: '/farm',
    image: '/images/akr-farm.jpg'
  },
  {
    id: 'akr-amma',
    name: 'AKR\'s Amma Organization',
    description: 'A heartfelt social initiative dedicated to uplifting communities through charitable projects.',
    icon: FaHeart,
    color: 'from-pink-500 to-pink-700',
    route: '/amma',
    image: '/images/AKR AMMA.jpg'
  },
  {
    id: 'akr-easy-credit',
    name: 'AKR Easy Credit (Pvt) Ltd',
    description: 'Your trusted partner for flexible credit solutions and personal loans.',
    icon: FaCreditCard,
    color: 'from-indigo-500 to-indigo-700',
    route: '/easy-credit',
    image: '/images/akr-easy-credit.jpg'
  }
];

// Core Values Data
const CORE_VALUES = [
  {
    icon: FaShieldAlt,
    title: 'Integrity & Transparency',
    description: 'Building trust through honest business practices and clear communication.'
  },
  {
    icon: FaStar,
    title: 'Excellence in Service',
    description: 'Delivering exceptional quality in every interaction and transaction.'
  },
  {
    icon: FaHandshake,
    title: 'Community Development',
    description: 'Empowering local communities through sustainable initiatives and support.'
  },
  {
    icon: FaChartLine,
    title: 'Sustainable Growth',
    description: 'Fostering long-term success through responsible business practices.'
  }
];

const Home = () => {
  const [settings, setSettings] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const slideInterval = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/settings").then(res => setSettings(res.data));
  }, []);

  useEffect(() => {
    if (!settings?.akrGroupBanners || settings.akrGroupBanners.length === 0) return;
    if (slideInterval.current) clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setSlideIndex(idx => (idx + 1) % settings.akrGroupBanners.length);
    }, 4000);
    return () => clearInterval(slideInterval.current);
  }, [settings]);

  const handleCompanyClick = (company) => {
    if (company.id === 'akr-sons') {
      // Open AKR Sons in new tab since it's an external site
      window.open('https://sons.akr.lk/', '_blank');
    } else {
      navigate(company.route);
    }
  };

  if (!settings) return <LoadingSpinner fullScreen={true} text="Loading AKR Group..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Admin Editable */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          {settings.akrGroupBanners && settings.akrGroupBanners.length > 0 ? (
            settings.akrGroupBanners.map((img, i) => (
              <img
                key={img}
                src={img}
                alt="Banner"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100' : 'opacity-0'}`}
              />
            ))
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800"></div>
          )}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 flex items-center min-h-screen lg:min-h-0 lg:items-start">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            {/* Left Content */}
            <div className="text-white text-center lg:text-left">
              {/* Logo */}
              <div className="mb-4 sm:mb-6 flex justify-center lg:justify-start">
                <img
                  src="/images/image copy 2.png"
                  alt="AKR Group Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-green-500 shadow-2xl"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 sm:mb-6 text-white" style={{ color: settings.akrGroupHeadingColor || '#fff' }}>
                {settings.akrGroupHeading || 'AKR Group of Companies'}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0" style={{ color: settings.akrGroupSubheadingColor || '#fff' }}>
                {settings.akrGroupSubheading || 'A legacy of excellence, innovation, and community service since 1978.'}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base lg:text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Explore Our Companies</span>
                </button>
                <button 
                  onClick={() => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base lg:text-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Our Story</span>
                  <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Right Content - AKR Group Preview Images */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {settings.akrGroupBanners && settings.akrGroupBanners.slice(0, 4).map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`AKR Group ${i + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AKR Group Story Section */}
      <section id="story-section" className="py-8 sm:py-12 md:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              The Story of AKR Group
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto px-2 sm:px-0">
              AKR Group's legacy began in 1978 with Mr. Anton, a humble bus driver who later transformed Sri Lanka's northern region with his entrepreneurial spirit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 md:mb-16">
            <div className="order-2 lg:order-1">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                A Family Legacy
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                From mobile fuel sales to today's diverse ventures, the group reflects decades of resilience, innovation, and commitment to uplifting communities. Now led by Mr. Rojar Stalin, AKR continues to thrive under visionary leadership rooted in integrity and service to society.
              </p>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 sm:p-6 rounded-r-lg">
                <p className="text-sm sm:text-base md:text-lg font-semibold text-green-800 mb-2">Our Guiding Principle</p>
                <p className="text-green-700 italic text-sm sm:text-base">"Eradicate poverty, empower through knowledge."</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 sm:p-8 rounded-2xl order-1 lg:order-2">
              <h4 className="text-lg sm:text-xl font-bold mb-4">Mission & Vision</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2 text-sm sm:text-base">Mission</h5>
                  <p className="text-green-100 text-sm sm:text-base">Deliver exceptional services with integrity, innovation, and community impact.</p>
                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-sm sm:text-base">Vision</h5>
                  <p className="text-green-100 text-sm sm:text-base">Be Sri Lanka's most trusted business group, fostering sustainable progress.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Our Core Values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {CORE_VALUES.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div key={index} className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4 mx-auto">
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* AKR Group Companies Section */}
      <section id="companies-section" className="py-8 sm:py-12 md:py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Companies
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
              Discover our diverse portfolio of businesses, each committed to excellence and innovation in their respective fields.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {AKR_COMPANIES.map((company) => {
              const IconComponent = company.icon;
              return (
                <div
                  key={company.id}
                  onClick={() => handleCompanyClick(company)}
                  className={`bg-gradient-to-br ${company.color} text-white rounded-2xl shadow-lg p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 transform group`}
                >
                  <div className="w-full h-24 sm:h-32 mb-3 sm:mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={company.image} 
                      alt={company.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full mb-3 sm:mb-4">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3">{company.name}</h3>
                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                    {company.description}
                  </p>
                  <div className="flex items-center text-white/80 text-xs sm:text-sm group-hover:text-white transition-colors">
                    <span>Learn More</span>
                    <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">AKR Group</h3>
              <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
                Excellence in every venture, committed to serving our community with integrity and innovation since 1978.
              </p>
              <div className="flex space-x-4 justify-center sm:justify-start">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaFacebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
              <div className="space-y-2 text-gray-300 text-sm sm:text-base">
                <div className="flex items-center justify-center sm:justify-start">
                  <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span>Main street Murunkan, Mannar</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start">
                  <FaPhoneAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span>0773111266</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start">
                  <FaEnvelope className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span>akrfuture@gmail.com</span>
                </div>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm sm:text-base">
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">About Us</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Our Companies</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Contact</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Business Hours</h4>
              <div className="space-y-2 text-gray-300 text-sm sm:text-base">
                <div className="flex items-center justify-center sm:justify-start">
                  <FaClock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start">
                  <FaClock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span>Sunday: 9:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2024 AKR Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 