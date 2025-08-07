import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaBed, FaCalendarAlt } from 'react-icons/fa';

const EASY_CREDIT_LOGO = '/images/image copy 2.png'; // AKR Easy Credit logo

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
        <div className="text-lg font-bold mb-2">AKR Easy Credit (Pvt) Ltd</div>
        <div className="text-sm opacity-90 mb-2">Your trusted partner for flexible credit solutions and personal loans.</div>
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
        <div className="flex items-center gap-2"><FaClock /> Mon - Sat: 9:00 AM - 6:00 PM</div>
        <div className="flex items-center gap-2"><FaClock /> Sunday: 10:00 AM - 4:00 PM</div>
      </div>
      <div className="flex flex-col gap-2 items-center md:items-start">
        <div className="font-semibold mb-1">Quick Links</div>
        <a href="/" className="hover:underline">Home</a>
        <a href="/easy-credit" className="hover:underline">Easy Credit</a>
        <a href="#contact" className="hover:underline">Contact</a>
      </div>
    </div>
    <div className="text-center text-xs opacity-80 mt-8">© {new Date().getFullYear()} AKR Easy Credit (Pvt) Ltd. All rights reserved.</div>
  </footer>
);

const EasyCredit = () => {
  const [banners, setBanners] = useState([]);
  const [homepageLogo, setHomepageLogo] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    api.get('/api/settings').then(res => {
      // Get easy credit images from the easyCreditSection
      const easyCreditImages = res.data.easyCreditSection?.images || [];
      setBanners(easyCreditImages.length > 0 ? easyCreditImages : []);
      setHomepageLogo(res.data.homepageLogo || "");
    });
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setSlideIndex(idx => (idx + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <img
                src={EASY_CREDIT_LOGO}
                alt="AKR Easy Credit Logo"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-green-500"
              />
              <div>
                <div className="text-base sm:text-lg md:text-2xl font-bold text-gray-900">AKR EASY CREDIT</div>
                <div className="text-xs sm:text-sm text-gray-600">Flexible Credit Solutions</div>
              </div>
            </div>
            {/* CTA Button */}
            <button 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
              disabled
            >
              <FaBed className="w-4 h-4" />
              <span className="hidden sm:inline">Coming Soon</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {[
            '/images/akr-easy-credit.jpg'
          ].map((img, i) => (
            <img
              key={img}
              src={img}
              alt="AKR Easy Credit"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              AKR Easy Credit (Pvt) Ltd
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto">
              Your trusted partner for flexible credit solutions and personal loans.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Credit Services
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible and reliable credit solutions tailored to your financial needs.
            </p>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-8 md:p-12 text-center mb-12">
            <div className="text-6xl mb-6">💳</div>
            <h3 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">
              Services Coming Soon!
            </h3>
            <p className="text-lg md:text-xl text-green-700 mb-6 max-w-2xl mx-auto">
              We're currently setting up our credit services. Our team is working hard to bring you flexible loan solutions and financial assistance programs.
            </p>
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Want to know more?</h4>
              <p className="text-gray-600 mb-6">
                Contact us for information about our upcoming credit services and loan programs.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <div className="flex items-center space-x-3 text-lg">
                  <FaPhoneAlt className="w-6 h-6 text-green-600" />
                  <span className="font-semibold">0773111266</span>
                </div>
                <div className="flex items-center space-x-3 text-lg">
                  <FaEnvelope className="w-6 h-6 text-green-600" />
                  <span className="font-semibold">akrfuture@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                title: "Personal Loans",
                description: "Flexible personal loans with competitive interest rates.",
                icon: "💰"
              },
              {
                title: "Business Credit",
                description: "Credit solutions for business expansion and development.",
                icon: "🏢"
              },
              {
                title: "Quick Approval",
                description: "Fast and efficient loan processing and approval system.",
                icon: "⚡"
              },
              {
                title: "Financial Consultation",
                description: "Expert financial advice and credit counseling services.",
                icon: "📊"
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-lg text-center opacity-75">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
                <div className="mt-4">
                  <span className="hidden sm:inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose AKR Easy Credit?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              We provide reliable credit solutions with excellent customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              "Flexible terms",
              "Quick approval",
              "Competitive rates",
              "Professional service",
              "Financial consultation",
              "Trusted partner"
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-900 font-medium">{feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer homepageLogo={homepageLogo} />
    </div>
  );
};

export default EasyCredit;
