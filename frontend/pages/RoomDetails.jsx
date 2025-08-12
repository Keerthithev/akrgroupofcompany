import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBed, FaCheckCircle, FaArrowLeft, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import BookingModal from '../components/BookingModal';
import ReviewModal from '../components/ReviewModal';
import ReviewsDisplay from '../components/ReviewsDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import MobileNavigation from '../components/MobileNavigation';

const RoomDetails = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [bookingModal, setBookingModal] = useState({ open: false, room: null });
  const [reviewModal, setReviewModal] = useState({ open: false, room: null });
  const [homepageLogo, setHomepageLogo] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const [roomRes, settingsRes] = await Promise.all([
          api.get(`/api/rooms/${roomId}`),
          api.get('/api/settings')
        ]);
        setRoom(roomRes.data);
        setHomepageLogo(settingsRes.data.homepageLogo || "");
      } catch (error) {
        console.error('Error fetching room:', error);
        navigate('/hotel');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId, navigate]);

  const handleBookNow = (room) => {
    setBookingModal({ open: true, room });
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading room details..." />;
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h2>
          <button 
            onClick={() => navigate('/hotel')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Hotel
          </button>
        </div>
      </div>
    );
  }

  const imgCount = room?.images?.length || 0;

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

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </div>
      </header>

      {/* Room Details Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Image Section */}
          <div className="relative w-full h-64 md:h-96 lg:h-[500px] bg-gray-100">
          {imgCount > 0 ? (
              <img 
                src={room.images[imgIdx]} 
                alt={room.name} 
                className="w-full h-full object-cover transition-opacity duration-500" 
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FaBed className="w-16 h-16" />
              </div>
          )}
            
            {/* Image Navigation */}
          {imgCount > 1 && (
            <>
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-600 hover:text-green-700 rounded-full p-3 shadow-lg transition-colors"
                  onClick={() => setImgIdx((i) => (i - 1 + imgCount) % imgCount)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-600 hover:text-green-700 rounded-full p-3 shadow-lg transition-colors"
                  onClick={() => setImgIdx((i) => (i + 1) % imgCount)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {room.images.map((_, i) => (
                    <button
                      key={i}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        i === imgIdx ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => setImgIdx(i)}
                    />
                ))}
              </div>
            </>
          )}

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-bold text-white shadow-lg ${
                room.category === 'Economy' ? 'bg-blue-600' :
                room.category === 'Business' ? 'bg-green-600' : 'bg-yellow-600'
              }`}>
                {room.category}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{room.name}</h1>
                      <div className="flex items-center gap-4 text-gray-600 mb-3">
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <FaMapMarkerAlt className="w-4 h-4" />
                          AKR Multicomplex, Main street Murunkan, Mannar
                        </span>
                        <span>• {room.distanceFromCenter || 0.5} km from centre</span>
                      </div>
                      <div className="flex items-center gap-2">
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
                    
                    {/* Rating */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => {
                            const starValue = i + 1;
                            const rating = room.rating || 0;
                            const isFullStar = starValue <= Math.floor(rating);
                            const isHalfStar = !isFullStar && starValue === Math.ceil(rating) && rating % 1 !== 0;
                            
                            return (
                              <FaStar 
                                key={i} 
                                className={`w-4 h-4 ${
                                  isFullStar ? 'text-yellow-400 fill-current' : 
                                  isHalfStar ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`} 
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">
                          {room.rating >= 9.0 ? 'Exceptional' : room.rating >= 8.0 ? 'Superb' : room.rating >= 7.0 ? 'Very Good' : 'Good'} {room.rating}
                        </span>
                        <span className="text-sm text-gray-600">
                          Based on {room.reviewCount || 0} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Information</h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between">
                        <span>Room Type:</span>
                        <span className="font-medium">{room.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bed Configuration:</span>
                        <span className="font-medium">{room.beds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum Guests:</span>
                        <span className="font-medium">{room.maxGuests} guests</span>
                      </div>
                      {room.size && (
                        <div className="flex justify-between">
                          <span>Room Size:</span>
                          <span className="font-medium">{room.size} m²</span>
                        </div>
                      )}
                      {room.view && (
                        <div className="flex justify-between">
                          <span>View:</span>
                          <span className="font-medium">{room.view}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {room.amenities && room.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{room.description}</p>
                </div>

                {/* Policies */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Policies</h3>
                  <div className="space-y-3 text-gray-700">
                    <div>
                      <span className="font-medium">Cancellation Policy:</span> {room.cancellationPolicy}
                    </div>
                    <div>
                      <span className="font-medium">Breakfast:</span> {room.breakfastIncluded ? 'Included' : `Available for Rs. ${room.breakfastPrice}`}
                    </div>
                  </div>
                </div>

                {/* Price Section */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Price per night</div>
              {room.discountedPrice ? (
                        <div>
                  <span className="text-gray-400 line-through text-lg">LKR {room.price?.toLocaleString()}</span>
                          <div className="text-3xl font-bold text-green-700">LKR {room.discountedPrice?.toLocaleString()}</div>
                        </div>
              ) : (
                        <div className="text-3xl font-bold text-green-700">LKR {room.price?.toLocaleString()}</div>
              )}
                      <div className="text-sm text-gray-500 mt-1">+ taxes and charges</div>
            </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleBookNow(room)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                      >
                        Book Now
                      </button>
                    </div>
          </div>
                </div>
              </div>

              {/* Reviews Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <ReviewsDisplay roomId={room._id} roomName={room.name} />
            </div>
          </div>
        </div>
          </div>
        </motion.div>
      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={bookingModal.open}
        room={bookingModal.room}
        onClose={() => setBookingModal({ open: false, room: null })}
      />

      {/* Review Modal */}
      <ReviewModal 
        isOpen={reviewModal.open}
        room={reviewModal.room}
        onClose={() => setReviewModal({ open: false, room: null })}
      />
    </div>
  );
};

export default RoomDetails; 