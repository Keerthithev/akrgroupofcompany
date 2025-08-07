import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFacebook, FaInstagram, FaTwitter,
  FaBed, FaShoppingCart, FaTruck, FaGasPump, FaWineGlass, FaSeedling, FaHeart, FaCreditCard,
  FaArrowLeft
} from 'react-icons/fa';

const Multicomplex = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const slideInterval = useRef(null);

  useEffect(() => {
    axios.get("/api/settings").then(res => setSettings(res.data));
  }, []);

  useEffect(() => {
    if (!settings?.banners || settings.banners.length === 0) return;
    if (slideInterval.current) clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setSlideIndex(idx => (idx + 1) % settings.banners.length);
    }, 4000);
    return () => clearInterval(slideInterval.current);
  }, [settings]);

  const SERVICE_CARDS = [
    { 
      name: "Hotel & Room Booking", 
      description: "Book luxury rooms and suites.", 
      status: "active",
      buttonText: "Book Now"
    },
    { 
      name: "Shopping", 
      description: "A world-class shopping experience.", 
      status: "coming-soon",
      buttonText: "Coming Soon"
    },
    { 
      name: "Gym", 
      description: "State-of-the-art fitness center.", 
      status: "coming-soon",
      buttonText: "Coming Soon"
    },
    { 
      name: "Theatre", 
      description: "Enjoy the latest movies and shows.", 
      status: "coming-soon",
      buttonText: "Coming Soon"
    },
    { 
      name: "Party Hall", 
      description: "Perfect venue for your celebrations.", 
      status: "coming-soon",
      buttonText: "Coming Soon"
    },
    { 
      name: "Service Center", 
      description: "Expert maintenance and support.", 
      status: "coming-soon",
      buttonText: "Coming Soon"
    },
  ];

  // Helper to get image for a service card by name
  const getServiceImage = (name) => {
    if (!settings?.services) return null;
    const svc = settings.services.find(s => s.name === name);
    return svc && svc.images && svc.images.length > 0 ? svc.images[0] : null;
  };

  if (!settings) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {settings.homepageLogo && (
                <img
                  src={settings.homepageLogo}
                  alt="AKR Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-green-500"
                />
              )}
              <div>
                <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">AKR MULTI COMPLEX</div>
                <div className="text-xs sm:text-sm text-gray-600">Your destination for luxury and convenience</div>
              </div>
            </div>
            {/* CTA Button - only show on sm and up */}
            <button 
              onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:flex bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 items-center space-x-2"
            >
              <FaMapMarkerAlt className="w-4 h-4" />
              <span>Explore Services</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {settings.banners && settings.banners.length > 0 ? (
            settings.banners.map((img, i) => (
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
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                {settings.homepageHeading || 'AKR Multi Complex'}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8 leading-relaxed" style={{ color: settings.homepageSubheadingColor || '#fff' }}>
                {settings.homepageSubheading || 'Your destination for shopping, fitness, entertainment, and luxury accommodation in Mannar.'}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Explore Services</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/hotel'}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FaBed className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Book Hotel Now</span>
                </button>
              </div>
            </div>

            {/* Right Content - Service Preview Images */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {settings.banners && settings.banners.slice(0, 4).map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Service ${i + 1}`}
                      className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <div id="services-section" className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Our Services</h2>
          <p className="text-gray-600">Experience luxury and convenience at AKR Multi Complex</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
          {SERVICE_CARDS.map((service, idx) => (
            <div
              key={service.name}
              className={`bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center transition-transform duration-200 hover:scale-105 ${
                service.status === 'active' ? 'ring-2 ring-green-500 shadow-xl' : 'opacity-75'
              }`}
            >
              <div className="w-full h-40 md:h-56 relative mb-3 overflow-hidden rounded-xl">
                {getServiceImage(service.name) ? (
                  <img src={getServiceImage(service.name)} alt={service.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl">No Image</div>
                )}
                {service.status === 'active' && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    ACTIVE
                  </div>
                )}
                {service.status === 'coming-soon' && (
                  <div className="hidden sm:block absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    COMING SOON
                  </div>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-bold text-green-800 mb-1 text-center">{service.name}</h2>
              <p className="text-gray-600 text-center text-sm mb-2">{service.description}</p>
              <button
                onClick={() => {
                  if (service.name === "Hotel & Room Booking") {
                    navigate("/hotel");
                  } else if (service.name === "Shopping") {
                    navigate("/shopping");
                  } else if (service.name === "Gym") {
                    navigate("/gym");
                  } else if (service.name === "Theatre") {
                    navigate("/theater");
                  } else if (service.name === "Service Center") {
                    navigate("/servicecenter");
                  } else if (service.name === "Party Hall") {
                    navigate("/partyhall");
                  } else {
                    alert("Coming soon!");
                  }
                }}
                className={`mt-2 px-4 py-2 rounded-lg shadow transition w-full ${
                  service.status === 'active' 
                    ? 'bg-green-700 text-white hover:bg-green-800' 
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                {service.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      {/* Footer (copied from Shopping/Gym pages) */}
      <footer className="bg-gradient-to-r from-green-700 to-green-400 text-white pt-10 pb-6 mt-16" id="contact">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center md:items-start">
            {settings.homepageLogo && (
              <img
                src={settings.homepageLogo}
                alt="Logo"
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: '2px solid #fff', background: '#fff' }}
              />
            )}
            <div className="text-lg font-bold mb-2">AKR Multi Complex</div>
            <div className="text-sm opacity-90 mb-2">Your destination for shopping, fitness, and entertainment in Mannar.</div>
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
            <div className="flex items-center gap-2"><FaClock /> Mon - Sat: 9:00 AM - 9:00 PM</div>
            <div className="flex items-center gap-2"><FaClock /> Sunday: 10:00 AM - 6:00 PM</div>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="font-semibold mb-1">Quick Links</div>
            <a href="/" className="hover:underline">Home</a>
            <a href="/shopping" className="hover:underline">Shopping</a>
            <a href="/gym" className="hover:underline">Gym</a>
            <a href="/hotel" className="hover:underline">Hotel</a>
            <a href="/theatre" className="hover:underline">Theatre</a>
            <a href="/partyhall" className="hover:underline">Party Hall</a>
            <a href="/servicecenter" className="hover:underline">Service Center</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </div>
        </div>
        <div className="text-center text-xs opacity-80 mt-8">© {new Date().getFullYear()} AKR Multi Complex. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Multicomplex; 