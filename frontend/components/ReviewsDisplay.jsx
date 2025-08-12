import React, { useState, useEffect } from 'react';
import { FaStar, FaThumbsUp, FaUser } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/axios';

const ReviewsDisplay = ({ roomId, roomName }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    console.log('ReviewsDisplay mounted with roomId:', roomId, 'roomName:', roomName);
    fetchReviews();
    fetchStats();
  }, [roomId]);

  const fetchReviews = async () => {
    try {
      console.log('Fetching reviews for room:', roomId);
      const response = await api.get(`/api/reviews/room/${roomId}`);
      console.log('Reviews response:', response.data);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats for room:', roomId);
      const response = await api.get(`/api/reviews/room/${roomId}/stats`);
      console.log('Stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const response = await api.put(`/api/reviews/${reviewId}/helpful`);
      const { helpful } = response.data;
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId ? { ...review, helpful } : review
        )
      );
    } catch (error) {
      console.error('Error updating helpful count:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingText = (rating) => {
    if (rating >= 9.0) return 'Exceptional';
    if (rating >= 8.0) return 'Superb';
    if (rating >= 7.0) return 'Very Good';
    if (rating >= 6.0) return 'Good';
    return 'Fair';
  };

  const getRatingColor = (rating) => {
    if (rating >= 9.0) return 'bg-green-600';
    if (rating >= 8.0) return 'bg-blue-600';
    if (rating >= 7.0) return 'bg-yellow-600';
    if (rating >= 6.0) return 'bg-orange-600';
    return 'bg-red-600';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">No reviews yet</div>
        <div className="text-sm text-gray-400">Be the first to review this room!</div>
      </div>
    );
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Guest Reviews</h3>
        {stats && (
          <div className="flex items-center gap-3">
            <div className={`${getRatingColor(stats.averageRating)} text-white px-3 py-1 rounded-lg text-sm font-semibold`}>
              {getRatingText(stats.averageRating)} {stats.averageRating}
            </div>
            <div className="text-sm text-gray-600">
              {stats.totalReviews} reviews
            </div>
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      {stats && stats.ratingDistribution && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Breakdown</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-8">
                    <span className="text-sm text-gray-600">{rating}</span>
                    <FaStar className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence>
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-gray-100 pb-4 last:border-b-0"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{review.customerName}</div>
                    <div className="text-sm text-gray-500">
                      Stayed on {formatDate(review.stayDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-3">
                <p className="text-gray-700 leading-relaxed">{review.review}</p>
              </div>

              {/* Review Footer */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <FaThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful})</span>
                </button>
                <div className="text-xs text-gray-400">
                  {formatDate(review.createdAt)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More/Less Button */}
      {reviews.length > 3 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsDisplay; 