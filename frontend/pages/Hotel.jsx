import React, { useEffect, useState, useMemo } from "react";
import api from "../lib/axios";
import { FaBed, FaUser, FaCalendarAlt, FaCheckCircle, FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingModal from '../components/BookingModal';

const MEALS = [
  'Self catering',
  'Breakfast included',
  'All meals included',
  'All-inclusive',
  'Breakfast & lunch included',
  'Breakfast & dinner included'
];

const AMENITIES = [
  'Free WiFi',
  '24/7 Reception',
  'Room Service',
  'Swimming Pool',
  'Restaurant',
  'Air Conditioning',
  'Parking',
  'Laundry Service',
  'Spa and wellness centre',
  'Free cancellation',
  '5 stars'
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
  const [roomDetailsModal, setRoomDetailsModal] = useState({ open: false, room: null });
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hotelInfo.images.length === 0) return;
    const interval = setInterval(() => {
      setSlideIndex(idx => (idx + 1) % hotelInfo.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [hotelInfo]);

  useEffect(() => {
    api.get("/api/settings").then(res => {
      const h = res.data.hotelSection || {};
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
      setHomepageLogo(res.data.homepageLogo || "");
    });
    api.get("/api/rooms").then(res => setRooms(res.data));
  }, []);

  const handleBookNow = (room) => {
    console.log('handleBookNow called with room:', room);
    setBookingModal({ open: true, room });
  };


  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const price = room.discountedPrice || room.price;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(a => room.amenities?.includes(a));
      return matchesPrice && matchesAmenities;
    });
  }, [rooms, priceRange, selectedAmenities]);

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

            {/* CTA Button */}
            <button 
              onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
            >
              <FaBed className="w-4 h-4" />
              <span className="hidden sm:inline">Book Now</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {hotelInfo.images.length > 0 ? (
            hotelInfo.images.map((img, i) => (
              <img
                key={img}
                src={img}
                alt="Hotel Background"
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6" style={{ color: hotelInfo.headingColor }}>
                {hotelInfo.heading}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed" style={{ color: hotelInfo.subheadingColor }}>
                {hotelInfo.subheading}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8">
                {hotelInfo.amenities.slice(0, 4).map((amenity, i) => (
                  <span key={i} className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-white/30">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Content - Staff/Management Images */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {hotelInfo.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Hotel ${i + 1}`}
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Available Rooms ({filteredRooms.length})
              </h2>
              <p className="text-gray-600">
                Discover comfortable accommodations on the second floor
              </p>
            </div>

            {/* Room Cards - Professional Style */}
            <div className="space-y-4">
              {filteredRooms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">No rooms match your filters.</div>
                  <button 
                    onClick={() => {
                      setPriceRange([0, 30000]);
                      setSelectedAmenities([]);
                    }}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : filteredRooms.map(room => (
                <div key={room._id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section - Mobile responsive */}
                    <div className="relative w-full md:w-80 h-48 md:h-60 flex-shrink-0">
                      {room.images && room.images.length > 1 ? (
                        <RoomImageCarousel images={room.images} roomName={room.name} />
                      ) : room.images && room.images.length > 0 ? (
                        <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                          <FaBed className="w-8 h-8" />
                        </div>
                      )}
                      
                      {/* Second Floor Badge */}
                      <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded font-bold shadow-md">
                        Second Floor
                      </div>
                      
                      {/* Heart Icon */}
                      <button className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 rounded-full p-1.5 shadow-md transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                      <div>
                        {/* Header */}
                        <div className="mb-3">
                          <h3 className="text-lg md:text-xl font-bold text-green-700 mb-1">{room.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">Available</span>
                            {room.discountedPrice && (
                              <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded font-medium">Special Offer</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="text-green-600">Mannar, Sri Lanka</span>
                          </div>
                        </div>
                        
                        {/* Room Details */}
                        <div className="mb-3">
                          <div className="text-gray-900 font-medium text-sm">{room.type}</div>
                          <div className="text-gray-600 text-sm">{room.beds} • {room.maxGuests} guests</div>
                          {room.size && <div className="text-gray-600 text-sm">{room.size} m²</div>}
                        </div>
                        
                        {/* Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {room.amenities.slice(0, 3).map((amenity, i) => (
                              <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded border border-green-200">
                                {amenity}
                              </span>
                            ))}
                            {room.amenities.length > 3 && (
                              <span className="text-xs text-gray-500">+{room.amenities.length - 3} more</span>
                            )}
                          </div>
                        )}
                        
                        {/* Features */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-green-600 text-sm">✓ No prepayment needed - pay at the property</span>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-green-100 gap-3">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">per night</div>
                          {room.discountedPrice ? (
                            <div>
                              <span className="text-gray-400 line-through text-sm">LKR {room.price?.toLocaleString()}</span>
                              <div className="text-xl md:text-2xl font-bold text-green-700">LKR {room.discountedPrice?.toLocaleString()}</div>
                            </div>
                          ) : (
                            <div className="text-xl md:text-2xl font-bold text-green-700">LKR {room.price?.toLocaleString()}</div>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => {
                            setRoomDetailsModal({ open: true, room });
                          }}
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded font-semibold transition-colors duration-200 text-sm"
                        >
                          See availability &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
      <RoomDetailsModal open={roomDetailsModal.open} room={roomDetailsModal.room} onClose={() => setRoomDetailsModal({ open: false, room: null })} handleBookNow={handleBookNow} />
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

const RoomDetailsModal = ({ open, room, onClose, handleBookNow }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const imgCount = room?.images?.length || 0;
  if (!room) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 ${open ? '' : 'hidden'}`}> 
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-0 relative animate-fadeIn overflow-hidden">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-green-700 text-2xl font-bold z-10"
          onClick={onClose}
          aria-label="Close"
        >×</button>
        {/* Image carousel */}
        <div className="relative w-full h-64 md:h-80 bg-gray-100 flex items-center justify-center">
          {imgCount > 0 ? (
            <img src={room.images[imgIdx]} alt={room.name} className="w-full h-full object-cover rounded-t-2xl" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
          {imgCount > 1 && (
            <>
              <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-green-700 rounded-full p-1 shadow hover:bg-green-100" onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + imgCount) % imgCount); }}>&lt;</button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-green-700 rounded-full p-1 shadow hover:bg-green-100" onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % imgCount); }}>&gt;</button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {room.images.map((_, i) => (
                  <span key={i} className={`inline-block w-2 h-2 rounded-full ${i === imgIdx ? 'bg-green-600' : 'bg-green-200'}`}></span>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Details */}
        <div className="p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-blue-900 mb-0">{room.name}</h2>
              <span className="bg-gray-200 text-xs px-2 py-1 rounded font-semibold">{room.type}</span>
              <span className="bg-blue-700 text-white text-xs px-2 py-1 rounded font-bold">Second Floor</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-700 mb-2">
              <span>{room.beds}</span>
              <span>• {room.maxGuests} guests</span>
              {room.size && <span>• {room.size} m²</span>}
              {room.view && <span>• {room.view} view</span>}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {room.amenities && room.amenities.map((a, i) => (
                <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><FaCheckCircle className="text-green-500" /> {a}</span>
              ))}
            </div>
            <div className="text-gray-700 text-base mb-2">{room.description}</div>
            <div className="flex items-center gap-3 mt-2">
              {room.discountedPrice ? (
                <>
                  <span className="text-gray-400 line-through text-lg">LKR {room.price?.toLocaleString()}</span>
                  <span className="text-green-700 font-bold text-2xl">LKR {room.discountedPrice?.toLocaleString()}</span>
                </>
              ) : (
                <span className="text-green-700 font-bold text-2xl">LKR {room.price?.toLocaleString()}</span>
              )}
              <span className="text-xs text-gray-500">+ taxes and charges</span>
            </div>
            <div className="mt-4">
              <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition text-base" onClick={() => { onClose(); handleBookNow(room); }}>Book Now</button>
            </div>
          </div>
          {/* Review score and highlights (stub) */}
          <div className="w-full md:w-64 flex flex-col gap-2 items-center md:items-end">
            <div className="bg-gray-100 rounded-xl p-4 w-full flex flex-col items-center md:items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-gray-300 text-gray-700 font-bold px-2 py-1 rounded text-sm">No reviews yet</span>
              </div>
              <div className="text-xs text-gray-500">Be the first to review this room!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotel; 