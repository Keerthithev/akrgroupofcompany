import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaBed, FaCalendarAlt } from 'react-icons/fa';

const FARM_LOGO = '/images/image copy 2.png'; // AKR Farm logo

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
        <div className="text-lg font-bold mb-2">AKR Farm</div>
        <div className="text-sm opacity-90 mb-2">Sustainable farming practices and fresh produce in Mannar.</div>
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
        <div className="flex items-center gap-2"><FaClock /> Mon - Sat: 6:00 AM - 6:00 PM</div>
        <div className="flex items-center gap-2"><FaClock /> Sunday: 7:00 AM - 5:00 PM</div>
      </div>
      <div className="flex flex-col gap-2 items-center md:items-start">
        <div className="font-semibold mb-1">Quick Links</div>
        <a href="/" className="hover:underline">Home</a>
        <a href="/farm" className="hover:underline">Farm</a>
        <a href="#contact" className="hover:underline">Contact</a>
      </div>
    </div>
    <div className="text-center text-xs opacity-80 mt-8">© {new Date().getFullYear()} AKR Farm. All rights reserved.</div>
  </footer>
);

const Farm = () => {
  const [banners, setBanners] = useState([]);
  const [homepageLogo, setHomepageLogo] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/settings').then(res => {
      // Get farm images from the farmSection
      const farmImages = res.data.farmSection?.images || [];
      setBanners(farmImages.length > 0 ? farmImages : []);
      setHomepageLogo(res.data.homepageLogo || "");
      setLoading(false);
    }).catch(error => {
      console.error('Error loading farm data:', error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setSlideIndex(idx => (idx + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  if (loading) return <LoadingSpinner fullScreen={true} text="Loading farm experience..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <img
                src={FARM_LOGO}
                alt="AKR Farm Logo"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-green-500"
              />
              <div>
                <div className="text-base sm:text-lg md:text-2xl font-bold text-gray-900">AKR FARM</div>
                <div className="text-xs sm:text-sm text-gray-600">Sustainable Agriculture & Fresh Produce</div>
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
      <section className="relative bg-gradient-to-r from-green-700 to-green-400 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {banners.length > 0 ? (
            banners.map((img, i) => (
              <img
                key={img}
                src={img}
                alt="Farm Background"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100' : 'opacity-0'}`}
              />
            ))
          ) : (
            <img
              src={FARM_LOGO}
              alt="Farm Background"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-green-200">
                AKR Farm
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                Experience sustainable farming practices and fresh, organic produce from our farm in Mannar. We are committed to providing high-quality agricultural products while preserving the environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <span className="hidden sm:inline-block bg-yellow-400 text-yellow-900 font-bold px-8 py-4 rounded-full shadow-lg text-lg animate-bounce cursor-default">
                  Coming Soon
                </span>
              </div>
            </div>
            {/* Right Content - Farm Images */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <img
                    src={banners.length > 0 ? banners[0] : FARM_LOGO}
                    alt="Farm 1"
                    className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                </div>
                <div className="relative group">
                  <img
                    src={banners.length > 1 ? banners[1] : FARM_LOGO}
                    alt="Farm 2"
                    className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon message */}
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-3xl font-bold text-green-700 mb-2">Farm Experience Coming Soon</h2>
        <p className="text-lg text-gray-600 mb-4">We are working hard to bring you fresh farm produce and sustainable agriculture services. Stay tuned!</p>
        <div className="text-center text-gray-600">
          <p className="mb-2">Featuring:</p>
          <ul className="text-sm space-y-1">
            <li>• Organic vegetables and fruits</li>
            <li>• Sustainable farming practices</li>
            <li>• Fresh dairy products</li>
            <li>• Farm-to-table experience</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <Footer homepageLogo={homepageLogo} />
    </div>
  );
};

export default Farm;
