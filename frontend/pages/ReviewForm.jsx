import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Rate, Button, message, Spin, Alert, Divider } from 'antd';
import { StarOutlined, UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, HomeOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const { TextArea } = Input;

const ReviewForm = () => {
  const { bookingId, token } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    validateToken();
  }, [bookingId, token]);

  const validateToken = async () => {
    try {
      setValidating(true);
      const response = await api.get(`/api/bookings/review/validate/${bookingId}/${token}`);
      
      if (response.data.valid) {
        setBookingData(response.data.booking);
        setLoading(false);
      } else {
        setError('Invalid review invitation');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setError(error.response?.data?.error || 'Invalid or expired review invitation');
      setLoading(false);
    } finally {
      setValidating(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      
      const reviewData = {
        roomId: bookingData.room._id,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        rating: values.rating,
        review: values.review,
        stayDate: bookingData.checkIn,
        bookingId: bookingId
      };

      await api.post('/api/reviews', reviewData);
      
      message.success('Thank you for your review! Your feedback helps us improve our services.');
      
      // Redirect to a thank you page or home
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return <LoadingSpinner fullScreen={true} text="Validating your review invitation..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              type="primary" 
              onClick={() => navigate('/')}
              style={{ backgroundColor: '#11998e', borderColor: '#11998e' }}
            >
              Go to Home
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading review form..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Experience</h1>
            <p className="text-gray-600">We'd love to hear about your stay at AKR Hotel</p>
          </div>

          {/* Stay Information */}
          <Card className="mb-6" style={{ borderColor: '#11998e' }}>
            <div className="flex items-center gap-3 mb-4">
              <HomeOutlined style={{ fontSize: 20, color: '#11998e' }} />
              <h3 className="text-lg font-semibold text-gray-900">Your Stay Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Room:</span>
                <div className="text-gray-900">{bookingData.room.name}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Room Type:</span>
                <div className="text-gray-900">{bookingData.room.type}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Check-in:</span>
                <div className="text-gray-900">
                  {new Date(bookingData.checkIn).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Check-out:</span>
                <div className="text-gray-900">
                  {new Date(bookingData.checkOut).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>

          {/* Review Form */}
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                customerName: bookingData.customerName || '',
                customerEmail: bookingData.customerEmail || '',
                customerPhone: bookingData.customerPhone || '',
                rating: 5,
                review: ''
              }}
            >
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserOutlined style={{ color: '#11998e' }} />
                  Your Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="customerName"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Your full name"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="customerEmail"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="your.email@example.com"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="customerPhone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter your phone number' }]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      placeholder="Your phone number"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Stay Date"
                  >
                    <Input 
                      prefix={<CalendarOutlined />} 
                      value={new Date(bookingData.checkIn).toLocaleDateString()}
                      disabled
                      size="large"
                    />
                  </Form.Item>
                </div>
              </div>

              <Divider />

              {/* Rating */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <StarOutlined style={{ color: '#11998e' }} />
                  Rate Your Experience
                </h3>
                
                <Form.Item
                  name="rating"
                  rules={[{ required: true, message: 'Please rate your experience' }]}
                >
                  <div className="text-center">
                    <Rate 
                      size={32} 
                      style={{ fontSize: 32 }}
                      tooltips={['Terrible', 'Poor', 'Average', 'Good', 'Excellent']}
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      Click on the stars to rate your stay
                    </div>
                  </div>
                </Form.Item>
              </div>

              <Divider />

              {/* Review Text */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Experience</h3>
                
                <Form.Item
                  name="review"
                  rules={[
                    { required: true, message: 'Please share your experience' },
                    { min: 10, message: 'Review must be at least 10 characters long' }
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Tell us about your stay... What did you like? What could we improve? Share your experience to help other travelers."
                    maxLength={1000}
                    showCount
                    size="large"
                  />
                </Form.Item>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={submitting}
                  style={{ 
                    backgroundColor: '#11998e', 
                    borderColor: '#11998e',
                    height: 48,
                    fontSize: 16,
                    paddingLeft: 32,
                    paddingRight: 32
                  }}
                >
                  {submitting ? 'Submitting Review...' : 'Submit Review'}
                </Button>
              </div>
            </Form>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Thank you for choosing AKR Hotel. Your feedback helps us improve our services.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewForm; 