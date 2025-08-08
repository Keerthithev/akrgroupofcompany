import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaTimes, FaBed, FaCalculator } from 'react-icons/fa';
import api from '../lib/axios';

const BookingModal = ({ isOpen, onClose, room }) => {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
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
  const numberOfNights = checkInDate && checkOutDate 
    ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) 
    : 0;
  const totalAmount = numberOfNights * roomRate;

  // Fetch unavailable dates when modal opens
  useEffect(() => {
    if (isOpen && room?._id) {
      fetchUnavailableDates();
    }
  }, [isOpen, room?._id]);

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

  // Handle date selection
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setCheckInDate(start);
    setCheckOutDate(end);
    setError('');
  };

  // Validate date selection
  const validateDates = () => {
    if (!checkInDate || !checkOutDate) {
      setError('Please select both check-in and check-out dates');
      return false;
    }

    if (checkInDate >= checkOutDate) {
      setError('Check-out date must be after check-in date');
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

          {/* Date Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Check-in and Check-out Dates
            </label>
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

          {/* Booking Summary */}
          {checkInDate && checkOutDate && numberOfNights > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FaCalculator className="text-blue-600" />
                <h4 className="font-semibold text-gray-800">Booking Summary</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{checkInDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{checkOutDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights:</span>
                  <span className="font-medium">{numberOfNights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Rate:</span>
                  <span className="font-medium">Rs. {roomRate.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold">Rs. {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Payment:</span>
                    <span className="font-bold">Pay on arrival</span>
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