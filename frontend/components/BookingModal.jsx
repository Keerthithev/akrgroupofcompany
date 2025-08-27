import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaTimes, FaBed, FaCalculator } from 'react-icons/fa';
import api from '../lib/axios';

const BookingModal = ({ isOpen, onClose, room }) => {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [checkInTime, setCheckInTime] = useState('14:00'); // Default 2 PM
  const [checkOutTime, setCheckOutTime] = useState('11:00'); // Default 11 AM
  const [guests, setGuests] = useState(1);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // User details form
  const [userDetails, setUserDetails] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    specialRequests: ''
  });

  // Booking calculation - use discounted price if available
  const roomRate = room?.discountedPrice || room?.price || 5000;
  
  // Calculate number of nights professionally
  const numberOfNights = checkInDate && checkOutDate 
    ? (() => {
        // Professional calculation: Check-out date minus Check-in date
        // This gives us the exact number of nights (not days)
        const checkIn = new Date(checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        const checkOut = new Date(checkOutDate);
        checkOut.setHours(0, 0, 0, 0);
        
        const diffTime = checkOut.getTime() - checkIn.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        // Professional booking logic:
        // - Same day booking = 1 night (minimum)
        // - Different days = exact night calculation
        // - Handles edge cases properly
        return Math.max(1, Math.floor(diffDays));
      })()
    : 0;

  // Calculate stay duration for display
  const getStayDuration = () => {
    if (numberOfNights === 1) return '1 night';
    if (numberOfNights < 7) return `${numberOfNights} nights`;
    if (numberOfNights === 7) return '1 week';
    if (numberOfNights < 30) return `${numberOfNights} nights (${Math.ceil(numberOfNights / 7)} weeks)`;
    if (numberOfNights === 30) return '1 month';
    if (numberOfNights < 365) return `${numberOfNights} nights (${Math.ceil(numberOfNights / 30)} months)`;
    return `${numberOfNights} nights (${Math.ceil(numberOfNights / 365)} years)`;
  };
    
  const totalAmount = numberOfNights * roomRate;

  // Fetch unavailable dates when modal opens
  useEffect(() => {
    if (isOpen && room?._id) {
      fetchUnavailableDates();
    }
  }, [isOpen, room?._id]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCheckInDate(null);
      setCheckOutDate(null);
      setCheckInTime('14:00');
      setCheckOutTime('11:00');
      setGuests(1);
      setError('');
      setSuccess('');
      setUserDetails({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        specialRequests: ''
      });
    }
  }, [isOpen]);

  const fetchUnavailableDates = async () => {
    try {
      const response = await api.get(`/api/bookings/unavailable-dates/${room._id}`);
      // Convert date strings to Date objects for the date picker
      const dates = response.data.unavailableDates.map(dateString => new Date(dateString));
      setUnavailableDates(dates);
      console.log('Unavailable dates for room:', room._id, dates.map(d => d.toISOString().split('T')[0]));
    } catch (error) {
      console.error('Error fetching unavailable dates:', error);
    }
  };

  // Check if a date is unavailable
  const isDateUnavailable = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return unavailableDates.some(unavailableDate => {
      const unavailableDateString = unavailableDate.toISOString().split('T')[0];
      return dateString === unavailableDateString;
    });
  };

  // Check if a specific date and time is unavailable
  const isDateTimeUnavailable = (date, time) => {
    const dateString = date.toISOString().split('T')[0];
    return unavailableDates.some(unavailableDate => {
      const unavailableDateString = unavailableDate.toISOString().split('T')[0];
      return dateString === unavailableDateString;
    });
  };

  // Handle date selection
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setCheckInDate(start);
    setCheckOutDate(end);
    setError('');
  };

  // Validate date and time selection professionally
  const validateDates = () => {
    if (!checkInDate || !checkOutDate) {
      setError('Please select both check-in and check-out dates');
      return false;
    }

    // Professional validation for different stay types
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    // Check if check-in is in the past
    if (checkIn < today) {
      setError('Check-in date cannot be in the past');
      return false;
    }

    // Check if check-out is after check-in
    if (checkInDate >= checkOutDate) {
      setError('Check-out date must be after check-in date');
      return false;
    }

    // Professional stay duration validation
    const maxStayDays = 365; // Maximum 1 year stay
    const checkOut = new Date(checkOutDate);
    checkOut.setHours(0, 0, 0, 0);
    const stayDuration = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
    
    if (stayDuration > maxStayDays) {
      setError(`Maximum stay duration is ${maxStayDays} days. Please contact us for longer stays.`);
      return false;
    }

    // Check if any date in range is unavailable
    const currentDate = new Date(checkInDate);
    while (currentDate < checkOutDate) {
      if (isDateUnavailable(currentDate)) {
        setError('Selected dates include unavailable days. Please choose different dates.');
        return false;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Validate times
    if (!checkInTime || !checkOutTime) {
      setError('Please select both check-in and check-out times');
      return false;
    }

    // If same day, check-out time must be after check-in time
    if (checkInDate.toDateString() === checkOutDate.toDateString()) {
      if (checkInTime >= checkOutTime) {
        setError('Check-out time must be after check-in time for same-day bookings');
        return false;
      }
    }

    return true;
  };

  // Submit booking with user details
  const handleConfirmBooking = async () => {
    if (!validateDates()) return;
    
    // Validate user details
    if (!userDetails.customerName || !userDetails.customerEmail || !userDetails.customerPhone) {
      setError('Please fill in all required fields (Name, Email, Phone)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        roomId: room._id,
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
        guests: guests,
        nights: numberOfNights,
        totalAmount,
        advancePaid: 0, // No advance payment required - payment on arrival
        customerName: userDetails.customerName,
        customerEmail: userDetails.customerEmail,
        customerPhone: userDetails.customerPhone,
        customerAddress: userDetails.customerAddress,
        specialRequests: userDetails.specialRequests,
        status: 'Pending', // Start as pending, admin will approve
        paymentStatus: 'pending' // Will be handled separately
      };

      // Create booking in database
      const response = await api.post('/api/bookings', bookingData);
      const booking = response.data.booking;
      
      // Send "we will contact soon" email
      await sendContactSoonEmail(booking);
      
      setSuccess('Booking submitted successfully! We will contact you soon for confirmation.');
      setTimeout(() => {
        onClose();
        setSuccess('');
        setCheckInDate(null);
        setCheckOutDate(null);
        setGuests(1);
        setUserDetails({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          customerAddress: '',
          specialRequests: ''
        });
        window.location.href = '/hotel';
      }, 3000);

    } catch (error) {
      console.error('Booking creation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.error || 'Failed to create booking. Please try again.');
      setLoading(false);
    }
  };

  // Send "we will contact soon" email
  const sendContactSoonEmail = async (booking) => {
    try {
      await api.post('/api/bookings/send-contact-soon', {
        bookingId: booking._id,
        customerEmail: userDetails.customerEmail,
        customerName: userDetails.customerName
      });
    } catch (error) {
      console.error('Failed to send contact soon email:', error);
      // Don't show error to user, email sending is not critical
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-blue-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-800">Book Room</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Room Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FaBed className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">{room?.name}</h3>
            </div>
            <p className="text-sm text-gray-600">{room?.type} • {room?.beds} • Max {room?.maxGuests} guests</p>
            <p className="text-lg font-bold text-blue-600 mt-2">Rs. {roomRate.toLocaleString()}/night</p>
          </div>

          {/* Professional Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Select Check-in and Check-out Dates
            </label>
            
            {/* Quick Stay Duration Buttons */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Quick Select:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setCheckInDate(today);
                    setCheckOutDate(tomorrow);
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
                >
                  1 Night
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const weekLater = new Date(today);
                    weekLater.setDate(weekLater.getDate() + 7);
                    setCheckInDate(today);
                    setCheckOutDate(weekLater);
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                >
                  1 Week
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const monthLater = new Date(today);
                    monthLater.setDate(monthLater.getDate() + 30);
                    setCheckInDate(today);
                    setCheckOutDate(monthLater);
                  }}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition"
                >
                  1 Month
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const weekend = new Date(today);
                    weekend.setDate(weekend.getDate() + 2);
                    setCheckInDate(today);
                    setCheckOutDate(weekend);
                  }}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition"
                >
                  Weekend
                </button>
              </div>
            </div>
            
            <DatePicker
              selected={checkInDate}
              onChange={handleDateChange}
              startDate={checkInDate}
              endDate={checkOutDate}
              selectsRange
              inline
              minDate={new Date()}
              excludeDates={unavailableDates}
              dayClassName={(date) => 
                isDateUnavailable(date) 
                  ? "unavailable-date bg-red-100 text-red-400 cursor-not-allowed" 
                  : ""
              }
              className="w-full"
            />
            
            {/* Professional Booking Info */}
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <div className="flex items-center gap-1 mb-1">
                <span>ℹ️</span>
                <span className="font-medium">Professional Booking System</span>
              </div>
              <div className="space-y-1">
                <div>• Supports stays from 1 night to 1 year</div>
                <div>• Accurate night calculation</div>
                <div>• Real-time availability checking</div>
                <div>• Flexible check-in/check-out times</div>
              </div>
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Check-in and Check-out Times
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Check-in Time
                </label>
                <select
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="06:00">6:00 AM</option>
                  <option value="07:00">7:00 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                  <option value="22:00">10:00 PM</option>
                  <option value="23:00">11:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Check-out Time
                </label>
                <select
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="06:00">6:00 AM</option>
                  <option value="07:00">7:00 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                  <option value="22:00">10:00 PM</option>
                  <option value="23:00">11:00 PM</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ⏰ Standard check-in: 2:00 PM | Standard check-out: 11:00 AM
            </p>
          </div>

          {/* Guests Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[...Array(room?.maxGuests || 4)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Guest{i > 0 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* User Details Form */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={userDetails.customerName}
                  onChange={(e) => setUserDetails({...userDetails, customerName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userDetails.customerEmail}
                  onChange={(e) => setUserDetails({...userDetails, customerEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={userDetails.customerPhone}
                  onChange={(e) => setUserDetails({...userDetails, customerPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={userDetails.customerAddress}
                  onChange={(e) => setUserDetails({...userDetails, customerAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your address (optional)"
                  rows="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={userDetails.specialRequests}
                  onChange={(e) => setUserDetails({...userDetails, specialRequests: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requests or requirements (optional)"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Professional Booking Summary */}
          {checkInDate && checkOutDate && numberOfNights > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <FaCalculator className="text-blue-600" />
                <h4 className="font-semibold text-gray-800">📋 Professional Booking Summary</h4>
              </div>
              
              {/* Stay Duration Badge */}
              <div className="mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🏨 {getStayDuration()} Stay
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">📅 Check-in:</span>
                  <span className="font-medium">{checkInDate.toLocaleDateString()} at {checkInTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">📅 Check-out:</span>
                  <span className="font-medium">{checkOutDate.toLocaleDateString()} at {checkOutTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">🌙 Total Nights:</span>
                  <span className="font-medium">{numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">👥 Guests:</span>
                  <span className="font-medium">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">💰 Rate per Night:</span>
                  <span className="font-medium">Rs. {roomRate.toLocaleString()}</span>
                </div>
                
                {/* Professional Pricing Breakdown */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Pricing Breakdown:</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Rs. {roomRate.toLocaleString()} × {numberOfNights} nights</span>
                    <span>Rs. {totalAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">💳 Total Amount:</span>
                      <span className="font-bold text-lg text-blue-600">Rs. {totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600 text-xs mt-1">
                      <span className="font-medium">💳 Payment Method:</span>
                      <span className="font-bold">Pay on arrival</span>
                    </div>
                  </div>
                </div>
                
                {/* Professional Stay Information */}
                <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <span>✅</span>
                      <span>Professional booking system</span>
                    </div>
                                         <div className="flex items-center gap-1">
                       <span>✅</span>
                       <span>Professional night calculation</span>
                     </div>
                    <div className="flex items-center gap-1">
                      <span>✅</span>
                      <span>Flexible check-in/check-out times</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>✅</span>
                      <span>Real-time availability checking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={!checkInDate || !checkOutDate || numberOfNights <= 0 || loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for unavailable dates */}
      <style jsx>{`
        .unavailable-date {
          background-color: #fee2e2 !important;
          color: #ef4444 !important;
          cursor: not-allowed !important;
        }
        .react-datepicker__day--disabled {
          background-color: #fee2e2 !important;
          color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
};

export default BookingModal; 