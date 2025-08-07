import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import BookingModal from '../components/BookingModal';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  useEffect(() => {
    axios.get(`/api/rooms/${id}`)
      .then(res => {
        setRoom(res.data);
        setError(null);
      })
      .catch(err => {
        setRoom(null);
        setError('Room not found or has been deleted.');
      });
  }, [id]);
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-600 text-lg">{error}</div>;
  if (!room) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  const imgCount = room.images?.length || 0;
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-4 py-8">
        {/* Image gallery */}
        <div className="relative w-full h-72 md:h-96 bg-gray-100 rounded-2xl overflow-hidden mb-8 flex items-center justify-center">
          {imgCount > 0 ? (
            <img src={room.images[imgIdx]} alt={room.name} className="w-full h-full object-cover" />
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
        {/* Room info */}
        <div className="flex flex-col md:flex-row gap-8">
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
              <button 
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition text-base" 
                onClick={() => setIsBookingModalOpen(true)}
              >
                Book Now
              </button>
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
        {/* Location */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><FaMapMarkerAlt /> Location</h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-700 font-medium">Main Street, Murunkan, Mannar, Sri Lanka</p>
            <p className="text-sm text-gray-500 mt-1">Located in the heart of Murunkan, easily accessible from main roads</p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        room={room} 
      />
    </div>
  );
};

export default RoomDetails; 