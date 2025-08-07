import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFacebook, FaInstagram, FaTwitter,
  FaTruck, FaMotorcycle, FaTools, FaShieldAlt, FaStar, FaUsers, FaArrowLeft
} from 'react-icons/fa';

const AkrSons = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Fetch settings for dynamic content
    // For now, using static content
  }, []);

  const services = [
    {
      icon: FaMotorcycle,
      title: "Bajaj Motorcycles",
      description: "Premium range of Bajaj motorcycles including Pulsar, Platina, and CT series."
    },
    {
      icon: FaTruck,
      title: "Three-Wheelers",
      description: "Reliable three-wheeler solutions for passenger and cargo transport."
    },
    {
      icon: FaTools,
      title: "Service & Maintenance",
      description: "Expert maintenance and repair services with genuine parts."
    },
    {
      icon: FaShieldAlt,
      title: "Warranty Support",
      description: "Comprehensive warranty coverage and after-sales support."
    }
  ];

  const features = [
    "Premium Bajaj dealership",
    "Genuine parts availability",
    "Expert technical support",
    "Flexible financing options",
    "Comprehensive warranty",
    "24/7 roadside assistance"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back to AKR Group</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <img
                src="/images/akr-sons.jpg"
                alt="AKR Sons Logo"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <div className="text-lg md:text-xl font-bold text-gray-900">AKR Sons (Pvt) Ltd</div>
                <div className="text-sm text-gray-600">Premium Bajaj Dealership</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/akr-sons.jpg"
            alt="AKR Sons"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-blue-900/60"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                AKR Sons (Pvt) Ltd
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                A trusted premium dealership for Bajaj motorcycles and three-wheelers, offering a diverse range of reliable, fuel-efficient models perfect for every commute and adventure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:bg-blue-50">
                  Contact Us
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:bg-white hover:text-blue-600">
                  View Products
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Why Choose AKR Sons?</h3>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <FaStar className="w-5 h-5 text-yellow-400" />
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Your Trusted Bajaj Partner
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                AKR Sons (Pvt) Ltd has been serving the community as a premium Bajaj dealership, providing reliable transportation solutions for over two decades. Our commitment to quality, service, and customer satisfaction has made us the preferred choice for motorcycle and three-wheeler needs.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                We offer a comprehensive range of Bajaj motorcycles and three-wheelers, backed by expert service, genuine parts, and exceptional after-sales support. Our team of trained professionals ensures that every customer receives personalized attention and the best possible service experience.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">20+</div>
                  <div className="text-gray-600">Years of Excellence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6">Our Commitment</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FaShieldAlt className="w-6 h-6 mt-1 text-blue-200" />
                  <div>
                    <h4 className="font-semibold mb-1">Quality Assurance</h4>
                    <p className="text-blue-100 text-sm">Genuine Bajaj products with manufacturer warranty</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaUsers className="w-6 h-6 mt-1 text-blue-200" />
                  <div>
                    <h4 className="font-semibold mb-1">Expert Support</h4>
                    <p className="text-blue-100 text-sm">Trained technicians and comprehensive service</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaStar className="w-6 h-6 mt-1 text-blue-200" />
                  <div>
                    <h4 className="font-semibold mb-1">Customer First</h4>
                    <p className="text-blue-100 text-sm">Personalized attention and after-sales care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive solutions for all your transportation needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{service.title}</h3>
                  <p className="text-gray-600 text-sm text-center">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-blue-100">
              Ready to find your perfect ride? Contact us today!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <FaPhoneAlt className="w-8 h-8 text-blue-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-blue-100">0773111266</p>
            </div>
            <div className="text-center">
              <FaMapMarkerAlt className="w-8 h-8 text-blue-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="text-blue-100">Main street Murunkan, Mannar</p>
            </div>
            <div className="text-center">
              <FaEnvelope className="w-8 h-8 text-blue-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-blue-100">akrfuture@gmail.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AKR Sons (Pvt) Ltd</h3>
              <p className="text-gray-300 mb-4">
                Your trusted partner for Bajaj motorcycles and three-wheelers in Mannar.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaFacebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaTwitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                  <span>Main street Murunkan, Mannar</span>
                </div>
                <div className="flex items-center">
                  <FaPhoneAlt className="w-4 h-4 mr-2" />
                  <span>0773111266</span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="w-4 h-4 mr-2" />
                  <span>akrfuture@gmail.com</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Motorcycles</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Three-Wheelers</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Service & Repair</a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">Parts</a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Business Hours</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <FaClock className="w-4 h-4 mr-2" />
                  <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="w-4 h-4 mr-2" />
                  <span>Sunday: 9:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AKR Sons (Pvt) Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AkrSons; 