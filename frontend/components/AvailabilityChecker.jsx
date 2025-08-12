import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaClock, FaSearch } from 'react-icons/fa';
import api from '../lib/axios';

const AvailabilityChecker = ({ rooms, onAvailabilityCheck }) => {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when component mounts
  useEffect(() => {
    setCheckInDate(null);
    setCheckOutDate(null);
    setCheckInTime('14:00');
    setCheckOutTime('11:00');
    setError('');
  }, []);

  // Handle date selection
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setCheckInDate(start);
    setCheckOutDate(end);
    setError('');
  };

  // Validate inputs
  const validateInputs = () => {
    if (!checkInDate || !checkOutDate) {
      setError('Please select both check-in and check-out dates');
      return false;
    }

    if (checkInDate >= checkOutDate) {
      setError('Check-out date must be after check-in date');
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setError('Check-in date cannot be in the past');
      return false;
    }

    return true;
  };

  // Check availability for all rooms
  const checkAvailability = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError('');

    try {
      const results = [];
      
      for (const room of rooms) {
        try {
          // Check room status first
          const roomStatus = room.status;
          
          // Get unavailable dates for this room
          const unavailableResponse = await api.get(`/api/bookings/unavailable-dates/${room._id}`);
          const unavailableDates = unavailableResponse.data.unavailableDates;
          
          // Check if selected dates overlap with unavailable dates
          const checkIn = new Date(checkInDate);
          const checkOut = new Date(checkOutDate);
          let isAvailable = true;
          let conflictDetails = null;
          
          // Check each date in the range
          const currentDate = new Date(checkIn);
          while (currentDate < checkOut) {
            const dateString = currentDate.toISOString().split('T')[0];
            if (unavailableDates.includes(dateString)) {
              isAvailable = false;
              conflictDetails = `Room is already booked on ${new Date(dateString).toLocaleDateString()}`;
              break;
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          // Only check for date conflicts, not room status
          // Room status (Occupied/Available) is for current bookings, not future availability
          
          results.push({
            room,
            isAvailable,
            conflictDetails,
            checkInDate: checkInDate.toISOString().split('T')[0],
            checkOutDate: checkOutDate.toISOString().split('T')[0],
            checkInTime,
            checkOutTime
          });
          
        } catch (error) {
          console.error(`Error checking availability for ${room.name}:`, error);
          results.push({
            room,
            isAvailable: false,
            conflictDetails: 'Error checking availability',
            checkInDate: checkInDate.toISOString().split('T')[0],
            checkOutDate: checkOutDate.toISOString().split('T')[0],
            checkInTime,
            checkOutTime
          });
        }
      }
      
      // Call parent callback to update room cards
      if (onAvailabilityCheck) {
        onAvailabilityCheck(results);
      }
      
    } catch (error) {
      setError('Failed to check availability. Please try again.');
      console.error('Error checking availability:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate nights
  const numberOfNights = checkInDate && checkOutDate 
    ? (() => {
        const checkIn = new Date(checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        const checkOut = new Date(checkOutDate);
        checkOut.setHours(0, 0, 0, 0);
        
        const diffTime = checkOut.getTime() - checkIn.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        return Math.max(1, Math.floor(diffDays));
      })()
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaSearch className="text-green-600 text-lg" />
        <h3 className="text-lg font-semibold text-gray-900">Check Room Availability</h3>
      </div>

      {/* Date and Time Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Date Range */}
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <FaCalendarAlt className="inline mr-1 text-green-600" />
            Check-in & Check-out
          </label>
          <DatePicker
            selectsRange={true}
            startDate={checkInDate}
            endDate={checkOutDate}
            onChange={handleDateChange}
            minDate={new Date()}
            placeholderText="Select dates"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            dateFormat="MMM dd, yyyy"
          />
        </div>

        {/* Check-in Time */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <FaClock className="inline mr-1 text-green-600" />
            Check-in Time
          </label>
          <select
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          >
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="20:00">8:00 PM</option>
          </select>
        </div>

        {/* Check-out Time */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <FaClock className="inline mr-1 text-green-600" />
            Check-out Time
          </label>
          <select
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          >
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
          </select>
        </div>
      </div>

      {/* Stay Summary - Compact */}
      {numberOfNights > 0 && (
        <div className="bg-green-50 rounded-md p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-900 ml-1">
                {numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Check-in:</span>
              <span className="font-medium text-gray-900 ml-1">
                {checkInDate?.toLocaleDateString()} at {checkInTime}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Check-out:</span>
              <span className="font-medium text-gray-900 ml-1">
                {checkOutDate?.toLocaleDateString()} at {checkOutTime}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-xs">{error}</span>
          </div>
        </div>
      )}

      {/* Check Availability Button */}
      <button
        onClick={checkAvailability}
        disabled={loading || !checkInDate || !checkOutDate}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Checking...
          </>
        ) : (
          <>
            <FaSearch className="w-3 h-3" />
            Check Availability
          </>
        )}
      </button>
    </div>
  );
};

export default AvailabilityChecker; 