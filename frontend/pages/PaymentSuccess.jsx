import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaCalendarCheck } from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('payhere_amount');

  useEffect(() => {
    // Auto redirect to hotel page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/hotel');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your room booking has been confirmed</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-3">Payment Details</h3>
          <div className="space-y-2 text-sm">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderId}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-green-600">Rs. {parseFloat(amount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Confirmed</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You'll receive a confirmation email shortly</li>
            <li>• Please bring a valid ID during check-in</li>
            <li>• Remaining balance can be paid at the hotel</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/hotel')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaCalendarCheck />
            View Rooms
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
          Redirecting to hotel page in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess; 