import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaHome, FaCalendarCheck, FaArrowLeft } from 'react-icons/fa';

const PaymentCancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect to hotel page after 8 seconds
    const timer = setTimeout(() => {
      navigate('/hotel');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Cancel Icon */}
        <div className="mb-6">
          <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">Your payment was cancelled or interrupted</p>
        </div>

        {/* Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">What Happened?</h3>
          <ul className="text-sm text-yellow-700 space-y-1 text-left">
            <li>• Payment was cancelled by user</li>
            <li>• Payment gateway was closed</li>
            <li>• Your booking is still pending</li>
            <li>• No charges have been made</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You can try booking again</li>
            <li>• Your room selection is not reserved</li>
            <li>• Contact us if you need assistance</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/hotel')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaCalendarCheck />
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            <FaHome />
            Home
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Redirecting to hotel page in 8 seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel; 