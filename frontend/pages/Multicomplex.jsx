import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import MobileNavigation from "../components/MobileNavigation";
import { motion } from "framer-motion";
import { 
  Card, Button, Typography, Row, Col
} from 'antd';
import { 
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFacebook, FaInstagram, FaTwitter,
  FaBed, FaShoppingCart, FaTruck, FaGasPump, FaWineGlass, FaSeedling, FaHeart, FaCreditCard,
  FaArrowLeft, FaDumbbell, FaFilm, FaUtensils, FaWrench
} from 'react-icons/fa';
import { RightOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

const Multicomplex = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const slideInterval = useRef(null);

  useEffect(() => {
    api.get("/api/settings").then(res => setSettings(res.data));
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
      name: "Shopping Center", 
      description: "A world-class shopping experience with diverse retail outlets and brands.",
      status: "active",
      buttonText: "View Details",
      icon: FaShoppingCart
    },
    { 
      name: "Party Hall & Restaurant", 
      description: "Perfect venue for your celebrations, weddings, and special events.",
      status: "active",
      buttonText: "View Details",
      icon: FaUtensils
    },
    { 
      name: "Hotel & Rooms", 
      description: "Book luxury rooms and suites with premium amenities and exceptional service.", 
      status: "active",
      buttonText: "View Details",
      icon: FaBed
    },
    { 
      name: "Gym & Theater", 
      description: "State-of-the-art fitness center and premium entertainment theatre with latest movies and shows.",
      status: "active",
      buttonText: "View Details",
      icon: FaDumbbell
    },
    { 
      name: "AKR Service Center", 
      description: "Professional vehicle maintenance and repair services for all brands.",
      status: "active",
      buttonText: "View Details",
      icon: FaWrench
    },
  ];

  // Helper to get image for a service card by name
  const getServiceImage = (name) => {
    if (!settings?.services) return null;
    
    // Map new names to existing service names in settings
    let serviceName = name;
    if (name === "Shopping Center") {
      serviceName = "Shopping";
    } else if (name === "Gym & Theater") {
      serviceName = "Gym";
    } else if (name === "Party Hall & Restaurant") {
      serviceName = "Party Hall";
    } else if (name === "AKR Service Center") {
      serviceName = "Service Center";
    } else if (name === "Hotel & Rooms") {
      serviceName = "Hotel & Room Booking";
    }
    
    const svc = settings.services.find(s => s.name === serviceName);
    
    // If service exists and has images, return the first image
    if (svc && svc.images && svc.images.length > 0) {
      return svc.images[0];
    }
    
    // Fallback to direct image files if service doesn't have images configured
    const fallbackImages = {
      "Shopping Center": "/images/shopping.jpg",
      "Hotel & Rooms": "/images/Hotel & Rooms.jpg",
      "Gym & Theater": "/images/Gym & Theater.jpg", 
      "Party Hall & Restaurant": "/images/partyhall.jpg",
      "AKR Service Center": "/images/AKR Service Center.jpeg"
    };
    
    return fallbackImages[name] || null;
  };

  const handleServiceClick = (service) => {
    if (service.name === "Hotel & Rooms") {
      navigate("/hotel");
    } else if (service.name === "Shopping Center") {
      navigate("/shopping");
    } else if (service.name === "Gym & Theater") {
      navigate("/gym");
    } else if (service.name === "AKR Service Center") {
      navigate("/servicecenter");
    } else if (service.name === "Party Hall & Restaurant") {
      navigate("/partyhall");
    }
  };

  if (!settings) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <header className="bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="relative">
              {settings.homepageLogo && (
                <img
                  src={settings.homepageLogo}
                  alt="AKR Logo"
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-green-500 shadow-md"
                />
              )}
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  AKR MULTI COMPLEX
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Luxury & Convenience Hub
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNavigation />
          </div>
        </div>
      </header>

      {/* Hero Section - Left Aligned Text */}
      <section className="relative bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {settings.banners && settings.banners.length > 0 ? (
            settings.banners.map((img, i) => (
              <img
                key={img}
                src={img}
                alt="AKR Multi Complex"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100' : 'opacity-0'}`}
              />
            ))
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800"></div>
          )}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content - Left Aligned */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                {settings.homepageHeading || 'AKR Multi Complex'}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed" style={{ color: settings.homepageSubheadingColor || '#fff' }}>
                {settings.homepageSubheading || 'Your premier destination for shopping, fitness, entertainment, dining, and luxury accommodation in Mannar.'}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaMapMarkerAlt className="w-5 h-5" />
                  <span>Discover Our Services</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/hotel'}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FaBed className="w-5 h-5" />
                  <span>Book Hotel Now</span>
                </button>
              </div>
            </div>
            {/* Right side intentionally left empty for clean design */}
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* Service Cards - Matching Home Page Style */}
      <motion.section 
        id="services-section" 
        className="py-16 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <Title level={2} className="mb-4">
              Our Premium Services
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover world-class amenities and services designed for your comfort and convenience at AKR Multi Complex.
            </Paragraph>
          </motion.div>

          <Row gutter={[24, 24]}>
            {SERVICE_CARDS.map((service, index) => (
              <Col xs={24} sm={12} lg={6} key={service.name}>
                <motion.div
                  variants={scaleIn}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Card
                    hoverable
                    className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col"
                    cover={
                      <div className="h-48 overflow-hidden">
                {getServiceImage(service.name) ? (
                          <img 
                            alt={service.name}
                            src={getServiceImage(service.name)}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                            <service.icon className="w-12 h-12" />
                  </div>
                )}
              </div>
                    }
                    onClick={() => handleServiceClick(service)}
                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <div className="text-center flex flex-col h-full">
                      <Title level={4} className="mb-2">
                        {service.name}
                      </Title>
                      <Paragraph className="text-gray-600 text-sm mb-4 flex-grow">
                        {service.description}
                      </Paragraph>
                      <div className="mt-auto">
                        <Button 
                          type="link" 
                          icon={<RightOutlined />}
                          className="p-0 h-auto text-green-600 hover:text-green-700"
              >
                {service.buttonText}
                        </Button>
                      </div>
            </div>
                  </Card>
                </motion.div>
              </Col>
          ))}
          </Row>
        </div>
      </motion.section>

      {/* Footer */}
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
            <a href="/multicomplex" className="hover:underline">Multi Complex</a>
            <a href="/shopping" className="hover:underline">Shopping Center</a>
            <a href="/hotel" className="hover:underline">Hotel & Rooms</a>
            <a href="/gym" className="hover:underline">Gym & Theatre</a>
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