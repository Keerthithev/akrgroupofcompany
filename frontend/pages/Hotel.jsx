import React, { useEffect, useState, useMemo, useRef } from "react";
import api from "../lib/axios";
import MobileNavigation from "../components/MobileNavigation";
import { FaBed, FaUser, FaCalendarAlt, FaCheckCircle, FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFilter, FaList, FaTh } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import LoadingSpinner from '../components/LoadingSpinner';
import AvailabilityChecker from '../components/AvailabilityChecker';

const MEALS = [
  'Self catering',
  'Breakfast included',
  'All meals included',
  'All-inclusive',
  'Breakfast & lunch included',
  'Breakfast & dinner included'
];

const AMENITIES = [
  'WiFi',
  'AC',
  'TV',
  'Mini Bar',
  'Room Service',
  'Free Breakfast',
  'Work Desk',
  'Gym'
];

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
        <div className="text-lg font-bold mb-2">AKR Hotel & Room Booking</div>
        <div className="text-sm opacity-90 mb-2">Your comfortable stay in Mannar, second floor rooms, easy booking, and friendly service.</div>
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
        <a href="/hotel" className="hover:underline">Rooms</a>
        <a href="#contact" className="hover:underline">Contact</a>
      </div>
    </div>
    <div className="text-center text-xs opacity-80 mt-8">© {new Date().getFullYear()} AKR Hotel & Room Booking. All rights reserved.</div>
  </footer>
);

const Hotel = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotelInfo, setHotelInfo] = useState({
    heading: '',
    subheading: '',
    headingColor: '#11998e',
    subheadingColor: '#fff',
    images: [],
    amenities: [],
    specialOffer: '',
    specialOfferLink: '',
  });
  const [homepageLogo, setHomepageLogo] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [bookingModal, setBookingModal] = useState({ open: false, room: null });

  const [priceRange, setPriceRange] = useState([0, 30000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('price-low');
  const [viewMode, setViewMode] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availabilityStatus, setAvailabilityStatus] = useState({});
  const [availabilityDetails, setAvailabilityDetails] = useState({});
  const navigate = useNavigate();

  // Auto-swipe functionality for mobile room cards
  useEffect(() => {
    const intervals = {};
    
    // Set up auto-swipe for each category
    ['Economy', 'Business', 'First-Class'].forEach(category => {
      const categoryRooms = rooms.filter(room => room.category === category);
      if (categoryRooms.length > 1) {
        intervals[category] = setInterval(() => {
          setAutoSwipeIndexes(prev => {
            const currentIndex = prev[category] || 0;
            const nextIndex = (currentIndex + 1) % categoryRooms.length;
            
            // Scroll to the next room
            const scrollContainer = autoSwipeRefs.current[category];
            if (scrollContainer) {
              const roomWidth = 320; // w-80 = 320px
              const gap = 16; // gap-4 = 16px
              const scrollAmount = (roomWidth + gap) * nextIndex;
              scrollContainer.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
              });
            }
            
            return { ...prev, [category]: nextIndex };
          });
        }, 3000); // 3 seconds
      }
    });
    
    // Cleanup intervals on unmount
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [rooms]);

  // Auto-swipe functionality for mobile
  const [autoSwipeIndexes, setAutoSwipeIndexes] = useState({});
  const autoSwipeRefs = useRef({});

  useEffect(() => {
    if (hotelInfo.images.length === 0) return;
    const interval = setInterval(() => {
      setSlideIndex(idx => (idx + 1) % hotelInfo.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [hotelInfo]);

  useEffect(() => {
    Promise.all([
      api.get("/api/settings"),
      api.get("/api/rooms")
    ]).then(([settingsRes, roomsRes]) => {
      const h = settingsRes.data.hotelSection || {};
      setHotelInfo({
        heading: h.heading || 'Welcome to AKR Hotel & Room Booking',
        subheading: h.subheading || 'Experience comfort, convenience, and luxury in the heart of Mannar.',
        headingColor: h.headingColor || '#11998e',
        subheadingColor: h.subheadingColor || '#fff',
        images: h.images && h.images.length > 0 ? h.images : ['/images/hotel.jpg', '/images/Hotel & Rooms.jpg'],
        amenities: h.amenities && h.amenities.length > 0 ? h.amenities : [
          'Free WiFi',
          '24/7 Reception',
          'Room Service',
          'Swimming Pool',
          'Restaurant',
          'Air Conditioning',
          'Parking',
          'Laundry Service',
        ],
        specialOffer: h.specialOffer || '',
        specialOfferLink: h.specialOfferLink || '',
      });
      setHomepageLogo(settingsRes.data.homepageLogo || "");
      setRooms(roomsRes.data);
      setLoading(false);
    }).catch(error => {
      console.error('Error loading hotel data:', error);
      setLoading(false);
    });
  }, []);

  const handleBookNow = (room) => {
    console.log('handleBookNow called with room:', room);
    setBookingModal({ open: true, room });
  };


  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    let filtered = rooms;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(room => room.category === selectedCategory);
    }
    
    // Filter by amenities
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(room => {
        // Check if room has all selected amenities
        return selectedAmenities.every(selectedAmenity => 
          room.amenities && room.amenities.includes(selectedAmenity)
        );
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        filtered = [...filtered].sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [rooms, sortBy, selectedCategory, selectedAmenities]);

  if (loading) return <LoadingSpinner fullScreen={true} text="Loading hotel experience..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {homepageLogo && (
                <img
                  src={homepageLogo}
                  alt="AKR Hotel Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-green-500"
                />
              )}
              <div>
                <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">AKR ROOM</div>
                <div className="text-xs sm:text-sm text-gray-600">Premium Hotel & Room Booking System</div>
              </div>
            </div>

            {/* Search Bar */}
            {/* Removed search bar as requested */}

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Image - Only Main Image */}
        <div className="absolute inset-0">
          {hotelInfo.images.length > 0 ? (
              <img
              src={hotelInfo.images[0]}
                alt="Hotel Background"
              className="absolute inset-0 w-full h-full object-cover"
              />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800"></div>
          )}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
          <div className="text-center text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6" style={{ color: hotelInfo.headingColor }}>
                {hotelInfo.heading}
              </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto" style={{ color: hotelInfo.subheadingColor }}>
                {hotelInfo.subheading}
              </p>
              
              {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button 
                  onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaBed className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Explore Rooms</span>
                </button>
                <button 
                  onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Book Now</span>
                </button>
              </div>

              {/* Amenities Badges */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8 justify-center">
                {hotelInfo.amenities.slice(0, 4).map((amenity, i) => (
                  <span key={i} className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-white/30">
                    {amenity}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      {hotelInfo.specialOffer && (
        <section className="bg-green-600 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Special Offers Available</h2>
            <p className="text-green-100 text-lg mb-4">{hotelInfo.specialOffer}</p>
            {hotelInfo.specialOfferLink && (
              <a 
                href={hotelInfo.specialOfferLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Learn More
              </a>
            )}
          </div>
        </section>
      )}
      {/* Main Content */}
      <div id="rooms-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Banner */}
        <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-400 text-blue-900 font-semibold rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <FaBed className="text-blue-500 text-xl" />
            <span>All rooms are located on the <b>second floor</b> with modern amenities and comfortable accommodations.</span>
          </div>
        </div>

        {/* Availability Checker */}
        <div className="mb-8">
          <AvailabilityChecker 
            rooms={rooms} 
            onAvailabilityCheck={(results) => {
              // Update room availability status
              const updatedRooms = rooms.map(room => {
                const result = results.find(r => r.room._id === room._id);
                return {
                  ...room,
                  availabilityStatus: result ? (result.isAvailable ? 'available' : 'unavailable') : 'unknown',
                  availabilityDetails: result?.conflictDetails || null
                };
              });
              setRooms(updatedRooms);
            }}
          />
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setFilterSidebarOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            <span>Filter Rooms</span>
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filter Rooms
              </h3>
              
              {/* Location Section */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                  Location
                </h4>
                <div className="text-center">
                  <div className="w-full h-24 bg-green-100 rounded-lg mb-3 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-green-700">AKR Multicomplex</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-700 mb-2">Main street Murunkan, Mannar</div>
                  <a 
                    href="https://maps.google.com/?q=AKR+multicomplex+Murunkan+Mannar" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-green-600 border-2 border-green-600 hover:bg-green-600 hover:text-white text-xs px-3 py-1 rounded font-medium transition-colors"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range (per night)</label>
                <input
                  type="range"
                  min={0}
                  max={30000}
                  step={500}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([0, Number(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>LKR 0</span>
                  <span>LKR {priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Amenities</h4>
                <div className="space-y-2">
                  {AMENITIES.map(a => (
                    <label key={a} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(a)}
                        onChange={e => {
                          if (e.target.checked) setSelectedAmenities([...selectedAmenities, a]);
                          else setSelectedAmenities(selectedAmenities.filter(am => am !== a));
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(priceRange[1] !== 30000 || selectedAmenities.length > 0) && (
                <button
                  onClick={() => {
                    setPriceRange([0, 30000]);
                    setSelectedAmenities([]);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>
          {/* Room cards */}
          <main className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Mannar: {filteredRooms.length} properties found
                </h1>
                <p className="text-gray-600 mt-1">Discover comfortable accommodations on the second floor</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="price-low">Price (lowest first)</option>
                    <option value="price-high">Price (highest first)</option>
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <FaList className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <FaTh className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Category Bar */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 mb-6 hidden md:block">
              <div className="flex items-center gap-1 overflow-x-auto py-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border-2 ${
                    selectedCategory === 'all'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  All Rooms ({rooms.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('Economy')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border-2 ${
                    selectedCategory === 'Economy'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  Economy ({rooms.filter(room => room.category === 'Economy').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('Business')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border-2 ${
                    selectedCategory === 'Business'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  Business ({rooms.filter(room => room.category === 'Business').length})
                </button>
                <button
                  onClick={() => setSelectedCategory('First-Class')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border-2 ${
                    selectedCategory === 'First-Class'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  First-Class ({rooms.filter(room => room.category === 'First-Class').length})
                </button>
              </div>
            </div>

            {/* Room Cards - Mobile Responsive Design */}
            <div className="space-y-8">
              {/* Desktop View - Grid Layout */}
              <div className="hidden md:block">
              {filteredRooms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">No rooms match your filters.</div>
                  <button 
                    onClick={() => {
                        setSelectedCategory('all');
                    }}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-2'}>
                    {filteredRooms.map(room => (
                      <div key={room._id} className={`bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 ${
                        viewMode === 'grid' ? 'flex flex-col' : ''
                      }`}>
                        <div className={viewMode === 'grid' ? 'flex flex-col' : 'flex flex-col md:flex-row'}>
                    {/* Image Section - Mobile responsive */}
                          <div className={`relative ${viewMode === 'grid' ? 'w-full h-48' : 'w-full md:w-80 h-48 md:h-64'} flex-shrink-0`}>
                      {room.images && room.images.length > 1 ? (
                        <RoomImageCarousel images={room.images} roomName={room.name} />
                      ) : room.images && room.images.length > 0 ? (
                              <img src={room.images[0]} alt={room.name} className={`w-full h-full object-cover ${viewMode === 'grid' ? 'rounded-t-lg' : 'rounded-t-lg md:rounded-l-lg md:rounded-t-none'}`} />
                      ) : (
                              <div className={`w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 ${viewMode === 'grid' ? 'rounded-t-lg' : 'rounded-t-lg md:rounded-l-lg md:rounded-t-none'}`}>
                          <FaBed className="w-8 h-8" />
                        </div>
                      )}
                      
                    </div>
                    
                    {/* Content Section */}
                          <div className={`flex-1 p-1 md:p-2 flex flex-col ${viewMode === 'grid' ? 'justify-between flex-1' : 'justify-between'}`}>
                      <div>
                        {/* Header */}
                        <div className="mb-1">
                                <div className="flex items-start justify-between mb-0.5">
                                  <h3 className="text-lg md:text-xl font-bold text-green-700">{room.name}</h3>
                                  {/* Stars in top right corner */}
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => {
                                      const rating = room.reviewCount > 0 ? parseFloat(room.averageRating) || 0 : 0;
                                      const starValue = i + 1;
                                      let fill = "none";
                                      
                                      if (starValue <= rating) {
                                        fill = "currentColor"; // Full star
                                      } else if (starValue - rating < 1 && starValue - rating > 0) {
                                        fill = "currentColor"; // Partial star (simplified as full for now)
                                      }
                                      
                                      return (
                                        <svg key={i} className="w-4 h-4 text-yellow-400" fill={fill} stroke="currentColor" viewBox="0 0 20 20">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      );
                                    })}
                                  </div>
                                </div>
                          <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                                    room.availabilityStatus === 'available' 
                                      ? 'bg-green-100 text-green-700' 
                                      : room.availabilityStatus === 'unavailable'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {room.availabilityStatus === 'available' 
                                      ? 'Available' 
                                      : room.availabilityStatus === 'unavailable'
                                      ? 'Not Available'
                                      : 'Available'
                                    }
                                  </span>
                            {room.discountedPrice && (
                              <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded font-medium">Special Offer</span>
                            )}
                          </div>
                                <div className="text-sm text-gray-600 mb-0.5">
                                  <span className="text-green-600">AKR Multicomplex, Main street Murunkan, Mannar • km from centre</span>
                                </div>
                                
                                {/* Rating Text Display */}
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-semibold text-gray-800">
                                    {room.reviewCount > 0 
                                      ? `Good ${room.averageRating}`
                                      : 'No reviews yet'
                                    }
                                  </span>
                                  {room.reviewCount > 0 && (
                                    <span className="text-sm text-gray-600">
                                      Based on {room.reviewCount} review{room.reviewCount !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Availability Details */}
                                {room.availabilityStatus === 'unavailable' && room.availabilityDetails && (
                                  <div className="text-xs text-red-600 mb-0.5">
                                    {room.availabilityDetails}
                          </div>
                                )}
                        </div>
                        
                        {/* Room Details */}
                        <div className="mb-0.5">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="text-gray-900 font-medium text-sm">{room.type}</div>
                              <div className="text-gray-600 text-sm">{room.beds} • {room.maxGuests} guests</div>
                            </div>
                            {room.size && (
                              <div className="text-gray-600 text-sm">{room.size} m²</div>
                            )}
                          </div>
                        </div>
                        
                        {/* List View Only - Description and Privacy Policy */}
                        {viewMode === 'list' && (
                          <div className="mb-0.5">
                            {room.description && (
                              <div className="text-gray-600 text-sm italic mb-0.5">{room.description}</div>
                            )}
                            {room.cancellationPolicy && (
                              <div className="text-gray-500 text-xs mb-0.5">📋 {room.cancellationPolicy}</div>
                            )}
                          </div>
                        )}
                        
                        {/* Amenities and Features Side by Side */}
                        <div className="flex items-start gap-4 mb-0.5">
                          {/* Amenities */}
                          {room.amenities && room.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {room.amenities.slice(0, 3).map((amenity, i) => (
                                <span key={i} className="bg-green-50 text-green-700 text-xs px-1 py-0.5 rounded border border-green-200">
                                  {amenity}
                                </span>
                              ))}
                              {room.amenities.length > 3 && (
                                <span className="text-xs text-gray-500">+{room.amenities.length - 3} more</span>
                              )}
                            </div>
                          )}
                          
                          {/* Features */}
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 text-sm">✓ No prepayment needed - pay at the property</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer */}
                            <div className="pt-0.5 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-0.5">
                                <div>
                          {room.discountedPrice ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg md:text-xl font-bold text-green-600">
                                        LKR {room.discountedPrice.toLocaleString()}
                                      </span>
                                      <span className="text-sm text-gray-500 line-through">
                                        LKR {room.price.toLocaleString()}
                                      </span>
                            </div>
                          ) : (
                                    <span className="text-lg md:text-xl font-bold text-green-600">
                                      LKR {room.price.toLocaleString()}
                                    </span>
                          )}
                                  <div className="text-xs text-gray-500">per night</div>
                                  {room.breakfastIncluded && (
                                    <div className="text-xs text-green-600">🍳 Breakfast included</div>
                                  )}
                                  {!room.taxesIncluded && room.taxesAmount > 0 && (
                                    <div className="text-xs text-orange-600">+ LKR {room.taxesAmount.toLocaleString()} taxes</div>
                                  )}
                                  {room.taxesIncluded && (
                                    <div className="text-xs text-green-600">✓ Taxes included</div>
                                  )}
                        </div>
                        
                        <button 
                          onClick={() => {
                                    navigate(`/hotel/room/${room._id}`);
                                  }}
                                  disabled={room.availabilityStatus === 'unavailable'}
                                  className={`px-4 py-2 rounded font-semibold transition-colors duration-200 text-sm border-2 ${
                                    room.availabilityStatus === 'unavailable'
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
                                      : 'bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white'
                                  }`}
                                >
                                  {room.availabilityStatus === 'unavailable' ? 'Not Available' : 'View Details'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile View - Category Sections with Horizontal Scroll */}
              <div className="md:hidden">
                {filteredRooms.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="text-gray-500 text-lg mb-2">No rooms match your filters.</div>
                    <button 
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedAmenities([]);
                      }}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  ['Economy', 'Business', 'First-Class'].map(category => {
                    const categoryRooms = filteredRooms.filter(room => room.category === category);
                    if (categoryRooms.length === 0) return null;
                    
                    return (
                      <div key={category} className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">{category} Rooms</h2>
                        <div className="overflow-x-auto">
                          <div 
                            ref={el => autoSwipeRefs.current[category] = el}
                            className="flex gap-4 px-4 pb-4" 
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                          >
                            {categoryRooms.map(room => (
                              <div key={room._id} className="bg-white rounded-lg shadow-md border border-gray-200 flex-shrink-0 w-80">
                                {/* Image Section */}
                                <div className="relative w-full h-48">
                                  {room.images && room.images.length > 0 ? (
                                    <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover rounded-t-lg" />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-t-lg">
                                      <FaBed className="w-8 h-8" />
                                    </div>
                                  )}
                                  
                                  {/* Stars in top right corner */}
                                  <div className="absolute top-3 right-3 flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => {
                                      const rating = room.reviewCount > 0 ? parseFloat(room.averageRating) || 0 : 0;
                                      const starValue = i + 1;
                                      let fill = "none";
                                      
                                      if (starValue <= rating) {
                                        fill = "currentColor";
                                      } else if (starValue - rating < 1 && starValue - rating > 0) {
                                        fill = "currentColor";
                                      }
                                      
                                      return (
                                        <svg key={i} className="w-3 h-3 text-yellow-400" fill={fill} stroke="currentColor" viewBox="0 0 20 20">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      );
                                    })}
                                  </div>
                                </div>
                                
                                {/* Content Section */}
                                <div className="p-4">
                                  <div className="mb-3">
                                    <h3 className="text-lg font-bold text-green-700 mb-2">{room.name}</h3>
                                    
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                                        room.availabilityStatus === 'available' 
                                          ? 'bg-green-100 text-green-700' 
                                          : room.availabilityStatus === 'unavailable'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {room.availabilityStatus === 'available' 
                                          ? 'Available' 
                                          : room.availabilityStatus === 'unavailable'
                                          ? 'Not Available'
                                          : 'Available'
                                        }
                                      </span>
                                      {room.discountedPrice && (
                                        <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded font-medium">Special Offer</span>
                                      )}
                                    </div>
                                    
                                    {/* Rating Text */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-semibold text-gray-800">
                                        {room.reviewCount > 0 
                                          ? `Good ${room.averageRating}`
                                          : 'No reviews yet'
                                        }
                                      </span>
                                      {room.reviewCount > 0 && (
                                        <span className="text-sm text-gray-600">
                                          Based on {room.reviewCount} review{room.reviewCount !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Room Details */}
                                    <div className="text-gray-600 text-sm mb-2">
                                      {room.beds} • {room.maxGuests} guests • {room.size} m²
                                    </div>
                                    
                                    {/* Amenities */}
                                    {room.amenities && room.amenities.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-3">
                                        {room.amenities.slice(0, 2).map((amenity, i) => (
                                          <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded border border-green-200">
                                            {amenity}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Footer */}
                                  <div className="border-t border-gray-100 pt-3">
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        {room.discountedPrice ? (
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-green-600">
                                              LKR {room.discountedPrice.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-gray-500 line-through">
                                              LKR {room.price.toLocaleString()}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-lg font-bold text-green-600">
                                            LKR {room.price.toLocaleString()}
                                          </span>
                                        )}
                                        <div className="text-xs text-gray-500">per night</div>
                                        {room.breakfastIncluded && (
                                          <div className="text-xs text-green-600">🍳 Breakfast included</div>
                                        )}
                                        {!room.taxesIncluded && room.taxesAmount > 0 && (
                                          <div className="text-xs text-orange-600">+ LKR {room.taxesAmount.toLocaleString()} taxes</div>
                                        )}
                                        {room.taxesIncluded && (
                                          <div className="text-xs text-green-600">✓ Taxes included</div>
                                        )}
                                      </div>
                                      
                                      <button
                                        onClick={() => {
                                          navigate(`/hotel/room/${room._id}`);
                                        }}
                                        disabled={room.availabilityStatus === 'unavailable'}
                                        className={`px-4 py-2 rounded font-semibold transition-colors duration-200 text-sm ${
                                          room.availabilityStatus === 'unavailable'
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                      >
                                        {room.availabilityStatus === 'unavailable' ? 'Not Available' : 'View Details'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* Booking Modal */}
      <BookingModal 
        isOpen={bookingModal.open} 
        onClose={() => setBookingModal({ open: false, room: null })} 
        room={bookingModal.room} 
      />
      <Footer homepageLogo={homepageLogo} />

      {/* Mobile Filter Sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${filterSidebarOpen ? '' : 'hidden'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setFilterSidebarOpen(false)}
        ></div>
        
        {/* Sidebar */}
        <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300">
          <div className="p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filter Rooms
              </h3>
              <button
                onClick={() => setFilterSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range (per night)</label>
              <input
                type="range"
                min={0}
                max={30000}
                step={500}
                value={priceRange[1]}
                onChange={e => setPriceRange([0, Number(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>LKR 0</span>
                <span>LKR {priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Amenities</h4>
              <div className="space-y-2">
                {AMENITIES.map(a => (
                  <label key={a} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(a)}
                      onChange={e => {
                        if (e.target.checked) setSelectedAmenities([...selectedAmenities, a]);
                        else setSelectedAmenities(selectedAmenities.filter(am => am !== a));
                      }}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(priceRange[1] !== 30000 || selectedAmenities.length > 0) && (
              <button
                onClick={() => {
                  setPriceRange([0, 30000]);
                  setSelectedAmenities([]);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear All Filters
              </button>
            )}

            {/* Apply Filters Button */}
            <button
              onClick={() => setFilterSidebarOpen(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold mt-6"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// RoomImageCarousel component for room cards
function RoomImageCarousel({ images, roomName }) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => { setIdx(0); }, [images]);
  if (!images || images.length === 0) return null;
  return (
    <div className="relative w-full h-full">
      <img src={images[idx]} alt={roomName} className="w-full h-full object-cover transition-opacity duration-500 rounded-t-3xl" />
      {images.length > 1 && (
        <>
          <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-green-700 rounded-full p-1 shadow hover:bg-green-100" onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}>&lt;</button>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-green-700 rounded-full p-1 shadow hover:bg-green-100" onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}>&gt;</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span key={i} className={`inline-block w-2 h-2 rounded-full ${i === idx ? 'bg-green-600' : 'bg-green-200'}`}></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Hotel; 