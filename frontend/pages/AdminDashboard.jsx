import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Button, Typography, Upload, message, Input, Modal, List, Space, Row, Col, Empty, Spin, Table, Form, InputNumber, Popconfirm, Switch, Alert, Drawer, DatePicker, Tabs, Statistic, Card, Divider, Progress } from "antd";
import { Input as AntInput } from "antd";
import {
  DashboardOutlined,
  HomeOutlined,
  PictureOutlined,
  ShopOutlined,
  TrophyOutlined,
  VideoCameraOutlined,
  GiftOutlined,
  ToolOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  BarChartOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserAddOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  QrcodeOutlined,
  BankOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import api from "../lib/axios";
import { Select } from 'antd';
import QRCodeGenerator from '../components/QRCodeGenerator';
import SimpleChart from '../components/SimpleChart';
import VisualCharts from '../components/VisualCharts';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tag } from 'antd';
import dayjs from 'dayjs';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { 
    key: 'hotel', 
    label: 'Hotel & Room Booking', 
    icon: <HomeOutlined />,
    children: [
      { key: 'hotel-management', label: 'Hotel Management' },
      { key: 'bookings-pending', label: 'Pending Bookings' },
      { key: 'bookings-confirmed', label: 'Confirmed Bookings' },
      { key: 'bookings-cancelled', label: 'Cancelled Bookings' },
      { key: 'bookings-all', label: 'All Bookings' },
      { key: 'customer-details', label: 'Customer Details' },
      { key: 'reviews', label: 'Reviews Management' },
    ]
  },
  { key: 'payment-history', label: 'Payment History', icon: <BarChartOutlined /> },
  { key: 'banners', label: 'Banners & Images', icon: <PictureOutlined /> },
  { key: 'shopping', label: 'Shopping', icon: <ShopOutlined /> },
  { key: 'gym', label: 'Gym', icon: <TrophyOutlined /> },
  { key: 'theatre', label: 'Theatre', icon: <VideoCameraOutlined /> },
  { key: 'partyhall', label: 'Party Hall', icon: <GiftOutlined /> },
  { key: 'servicecenter', label: 'Service Center', icon: <ToolOutlined /> },
  { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
];

// Add a mapping from sectionKey to service name
const SECTION_KEY_TO_SERVICE_NAME = {
  shopping: 'Shopping',
  hotel: 'Hotel & Room Booking',
  gym: 'Gym',
  theatre: 'Theatre',
  partyhall: 'Party Hall',
  servicecenter: 'Service Center',
};

const PRODUCT_CATEGORIES = [
  'Fashion', 'Electronics', 'Home', 'Toys', 'Sports', 'Accessories', 'Beauty', 'Books', 'Gadgets'
];

const SUPERMARKET_CATEGORIES = [
  'Chocolates', 'Ice Cream', 'Fruits', 'Vegetables', 'Rice', 'Snacks', 'Dairy', 'Beverages', 'Bakery', 'Household', 'Personal Care', 'Frozen Foods'
];

const ROOM_TYPES = ['Double', 'Twin', 'Suite', 'Family', 'Single'];
const ROOM_CATEGORIES = ['Economy', 'Business', 'First-Class'];
const BED_TYPES = ['1 double', '2 single', '1 king', '2 queen', '1 single'];
const VIEWS = ['Garden', 'Sea', 'City', 'Mountain', 'Pool', 'Paddy'];
const AMENITIES = [
  'Free WiFi', 'Air Conditioning', 'Balcony', 'Private Bathroom', 'Breakfast Included',
  'TV', 'Mini Bar', 'Room Service', 'Swimming Pool', 'Parking', 'Laundry Service',
  'Tea/Coffee Maker', 'Electric Kettle', 'Desk', 'Seating Area', 'Fan', 'Mosquito Net',
];

// Move this OUTSIDE AdminDashboard:
function CustomerDetailsSection({ selected, bookings, setBookings, newCustomer, setNewCustomer }) {
  const [loading, setLoading] = React.useState(true);
  const [editingBookingId, setEditingBookingId] = React.useState(null);
  const [addingToBookingId, setAddingToBookingId] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [date, setDate] = React.useState(dayjs());
  const [admin, setAdmin] = React.useState('');
  const [admins, setAdmins] = React.useState([]);

  React.useEffect(() => {
    if (selected === 'customer-details') {
      setLoading(true);
      // Fetch admins for dropdown
      api.get('/api/admin', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
        .then(res => setAdmins(res.data))
        .catch(() => setAdmins([]));
    }
  }, [selected]);

  React.useEffect(() => {
    if (selected === 'customer-details') {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (date) params.date = date.format('YYYY-MM-DD');
      if (admin) params.admin = admin;
      api.get('/api/bookings', { params, headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
        .then(res => setBookings(res.data))
        .finally(() => setLoading(false));
    }
  }, [selected, search, date, admin]);

  const handleAddCustomer = async (bookingId) => {
    if (!newCustomer.name) return message.error('Name is required');
    await api.put(`/api/bookings/${bookingId}/add-customer`, newCustomer, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    setNewCustomer({ name: '', email: '', phone: '', address: '', age: '', relationship: '' });
    setAddingToBookingId(null);
    // Refresh bookings
    const res = await api.get('/api/bookings', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    setBookings(res.data);
    message.success('Customer added');
  };

  const handleDeleteCustomer = async (bookingId, customerIndex) => {
    await api.put(`/api/bookings/${bookingId}/remove-customer`, { index: customerIndex }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    const res = await api.get('/api/bookings', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    setBookings(res.data);
    message.success('Customer removed');
  };

  const handleExport = async () => {
    const params = {};
    if (search) params.search = search;
    if (date) params.date = date.format('YYYY-MM-DD');
    if (admin) params.admin = admin;
    const token = localStorage.getItem('adminToken');
    const url = `/api/bookings/export?${new URLSearchParams(params).toString()}`;
    // Use fetch to handle blob
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'customer_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Title level={3}>Customer Details (Trips)</Title>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
        <Input
          placeholder="Search customer name, email, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 220 }}
        />
        <DatePicker
          placeholder="Select date"
          value={date}
          onChange={(date) => setDate(date)}
        />
        <Select
          placeholder="Filter by admin"
          value={admin}
          onChange={setAdmin}
          allowClear
          style={{ width: 180 }}
        >
          {admins.map(a => (
            <Select.Option key={a._id} value={a._id}>{a.username}</Select.Option>
          ))}
        </Select>
        <Button icon={<DownloadOutlined />} onClick={handleExport} type="primary">
          Export
        </Button>
      </div>
      {loading ? <Spin /> : (
        bookings.length === 0 ? <Empty description="No bookings found" /> : (
          <List
            itemLayout="vertical"
            dataSource={bookings}
            renderItem={booking => (
              <List.Item key={booking._id} style={{ background: '#f9f9f9', marginBottom: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
                <div style={{ marginBottom: 8 }}>
                  <b>Trip:</b> {booking.room?.name || 'Room'} | <b>Check-in:</b> {new Date(booking.checkIn).toLocaleDateString()} | <b>Check-out:</b> {new Date(booking.checkOut).toLocaleDateString()} | <b>Status:</b> {booking.status}
                </div>
                <div>
                  <b>Customers:</b>
                  <List
                    dataSource={booking.customers || []}
                    renderItem={(customer, idx) => (
                      <List.Item key={idx} style={{ padding: 8, background: '#fff', marginBottom: 4, borderRadius: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                        <Space direction="vertical" size={0}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span><b>Name:</b> {customer.name}</span>
                              {customer.relationship === 'Primary Guest' && (
                                <Tag color="green" size="small">Auto-Added</Tag>
                              )}
                            </div>
                          {customer.email && <span><b>Email:</b> {customer.email}</span>}
                          {customer.phone && <span><b>Phone:</b> {customer.phone}</span>}
                          {customer.address && <span><b>Address:</b> {customer.address}</span>}
                          {customer.age && <span><b>Age:</b> {customer.age}</span>}
                          {customer.relationship && <span><b>Relationship:</b> {customer.relationship}</span>}
                        </Space>
                          <Button danger size="small" onClick={() => handleDeleteCustomer(booking._id, idx)}>Delete</Button>
                        </div>
                      </List.Item>
                    )}
                  />
                  {addingToBookingId === booking._id ? (
                    <div style={{ marginTop: 8, background: '#f6ffed', padding: 12, borderRadius: 6 }}>
                      <Input placeholder="Name" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} style={{ marginBottom: 4 }} />
                      <Input placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} style={{ marginBottom: 4 }} />
                      <Input placeholder="Phone" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} style={{ marginBottom: 4 }} />
                      <Input placeholder="Address" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} style={{ marginBottom: 4 }} />
                      <InputNumber placeholder="Age" value={newCustomer.age} onChange={val => setNewCustomer({ ...newCustomer, age: val })} style={{ marginBottom: 4, width: '100%' }} />
                      <Input placeholder="Relationship" value={newCustomer.relationship} onChange={e => setNewCustomer({ ...newCustomer, relationship: e.target.value })} style={{ marginBottom: 4 }} />
                      <Button type="primary" onClick={() => handleAddCustomer(booking._id)}>Add Customer</Button>
                      <Button style={{ marginLeft: 8 }} onClick={() => setAddingToBookingId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button type="dashed" style={{ marginTop: 8 }} onClick={() => setAddingToBookingId(booking._id)}>Add Customer</Button>
                  )}
                </div>
              </List.Item>
            )}
          />
        )
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const [selected, setSelected] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(false);
  const [bookings, setBookings] = React.useState([]);
  const [rooms, setRooms] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState(dayjs()); // Add date selection state
  const [loading, setLoading] = React.useState(true);
  const [notificationCount, setNotificationCount] = React.useState(0);
  const [revenuePeriod, setRevenuePeriod] = React.useState('monthly');
  const [manualRevenueModal, setManualRevenueModal] = React.useState(false);
  const [manualCostModal, setManualCostModal] = React.useState(false);
  const [discountModal, setDiscountModal] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const [paymentModal, setPaymentModal] = React.useState(false);
  const [paymentForm, setPaymentForm] = React.useState({
    amount: 0,
    discountAmount: 0,
    discountPercentage: 0,
    discountReason: '',
    finalAmount: 0
  });
  const [qrCodeModal, setQrCodeModal] = React.useState(false);
  const [showBookingChart, setShowBookingChart] = React.useState(true);
  const [showRevenueChart, setShowRevenueChart] = React.useState(true);
  const [reviewsLoading, setReviewsLoading] = React.useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [settings, setSettings] = useState(null);
  const [descEdit, setDescEdit] = useState({});
  const [imgModal, setImgModal] = useState({ open: false, section: '', url: '' });
  const [bannerUploading, setBannerUploading] = useState(false);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [headingColor, setHeadingColor] = useState("#22c55e");
  const [subheadingColor, setSubheadingColor] = useState("#fff");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productModal, setProductModal] = useState({ open: false, editing: null });
  const [productFormData, setProductFormData] = useState({ name: '', description: '', price: '', image: '', category: '' });
  const [productImagePreview, setProductImagePreview] = useState('');
  const [productUploading, setProductUploading] = useState(false);
  const [showRealProducts, setShowRealProducts] = useState(true);
  const [shoppingHeading, setShoppingHeading] = useState("");
  const [shoppingSubheading, setShoppingSubheading] = useState("");
  const [shoppingHeadingColor, setShoppingHeadingColor] = useState("#11998e");
  const [shoppingSubheadingColor, setShoppingSubheadingColor] = useState("#fff");
  const [shoppingSpecialOffer, setShoppingSpecialOffer] = useState("");
  const [shoppingSpecialOfferLink, setShoppingSpecialOfferLink] = useState("");
  const navigate = useNavigate();
  const [packageModal, setPackageModal] = useState({ open: false, editing: null });
  const [packageFormData, setPackageFormData] = useState({ name: '', price: '', description: '', features: '' });
  // Add state for gymSection fields
  const [gymHeading, setGymHeading] = useState("");
  const [gymSubheading, setGymSubheading] = useState("");
  const [gymHeadingColor, setGymHeadingColor] = useState("#22c55e");
  const [gymSubheadingColor, setGymSubheadingColor] = useState("#fff");
  const [gymImages, setGymImages] = useState([]);
  const [gymAmenities, setGymAmenities] = useState([]);
  const [gymPackages, setGymPackages] = useState([]);
  const [showRealGymPackages, setShowRealGymPackages] = useState(true);
  const [mockGymPackages, setMockGymPackages] = useState([
    {
      name: 'Monthly Fitness',
      price: 3500,
      duration: 'Monthly',
      description: 'Unlimited gym access for 30 days',
      features: ['Locker', 'Group Classes', 'Steam Room']
    },
    {
      name: 'Weekly Pass',
      price: 1200,
      duration: 'Weekly',
      description: 'Full access for 7 days',
      features: ['Locker', 'Cardio Zone']
    },
    {
      name: 'Day Pass',
      price: 300,
      duration: 'Daily',
      description: 'One day unlimited access',
      features: ['Locker', 'Weights Area']
    },
    {
      name: 'Annual VIP',
      price: 35000,
      duration: 'Yearly',
      description: 'All access, VIP amenities, and personal trainer',
      features: ['All Facilities', 'Personal Trainer', 'VIP Locker', 'Nutrition Plan']
    },
  ]);
  const [gymSpecialOffer, setGymSpecialOffer] = useState("");
  const [gymSpecialOfferLink, setGymSpecialOfferLink] = useState("");
  const [showRealGymAmenities, setShowRealGymAmenities] = useState(true);
  const [mockGymAmenities, setMockGymAmenities] = useState([
    'Modern Equipment',
    'Personal Trainers',
    'Group Classes',
    'Locker Rooms',
    'Sauna & Steam Room',
    'Free WiFi',
    'Parking',
    'Juice Bar',
  ]);
  const [newAmenity, setNewAmenity] = useState("");
  // Add state for hotelSection fields
  const [hotelHeading, setHotelHeading] = useState("");
  const [hotelSubheading, setHotelSubheading] = useState("");
  const [hotelHeadingColor, setHotelHeadingColor] = useState("#11998e");
  const [hotelSubheadingColor, setHotelSubheadingColor] = useState("#fff");
  const [hotelImages, setHotelImages] = useState([]);
  const [hotelAmenities, setHotelAmenities] = useState([]);
  const [newHotelAmenity, setNewHotelAmenity] = useState("");
  const [hotelSpecialOffer, setHotelSpecialOffer] = useState("");
  const [hotelSpecialOfferLink, setHotelSpecialOfferLink] = useState("");

  // AKR Group Homepage settings
  const [akrGroupHeading, setAkrGroupHeading] = useState("");
  const [akrGroupSubheading, setAkrGroupSubheading] = useState("");
  const [akrGroupHeadingColor, setAkrGroupHeadingColor] = useState("#22c55e");
  const [bufferHours, setBufferHours] = useState(3);
  const [akrGroupSubheadingColor, setAkrGroupSubheadingColor] = useState("#fff");
  const [akrGroupBanners, setAkrGroupBanners] = useState([]);

  // Multi Complex Homepage settings (renamed from homepage settings)
  const [multiComplexHeading, setMultiComplexHeading] = useState("");
  const [multiComplexSubheading, setMultiComplexSubheading] = useState("");
  const [multiComplexHeadingColor, setMultiComplexHeadingColor] = useState("#22c55e");
  const [multiComplexSubheadingColor, setMultiComplexSubheadingColor] = useState("#fff");

  // Room management state
  const [roomModal, setRoomModal] = useState({ open: false, editing: null });
  const [roomCategoryFilter, setRoomCategoryFilter] = useState('all');
  const [discountForm, setDiscountForm] = useState({ type: 'percentage', value: 0, reason: '' });
  const [manualRevenueForm, setManualRevenueForm] = useState({ type: 'collected', amount: 0, description: '', date: dayjs() });
  const [manualRevenues, setManualRevenues] = useState([]);
  const [manualCosts, setManualCosts] = useState([]);
  const [manualCostForm, setManualCostForm] = useState({ category: 'Maintenance', amount: 0, description: '', date: dayjs(), paymentMethod: 'Cash' });
  const [roomFormData, setRoomFormData] = useState({ name: '', category: 'Economy', description: '', price: '', capacity: 1, amenities: [], images: [], isAvailable: true, type: '', beds: '', maxGuests: '', size: '', discountedPrice: '', breakfastIncluded: false, breakfastPrice: '', cancellationPolicy: '', view: '', newAmenity: '' });
  const [roomImageUploading, setRoomImageUploading] = useState(false);
  const [roomImageInput, setRoomImageInput] = useState('');
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [reviewEmails, setReviewEmails] = useState({}); // Store review emails for each room
  const [currentQRIndex, setCurrentQRIndex] = useState(0); // Track current QR code index
  
  // Booking management state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingModal, setBookingModal] = useState({ open: false, booking: null });
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'cancelled'
  const [customerModal, setCustomerModal] = useState({ open: false, bookingId: null });
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '', age: '', relationship: '' });
  
  // Booking statistics state
  const [bookingStats, setBookingStats] = useState({
    monthly: [],
    daily: [],
    revenueByPeriod: []
  });

  // Booking management functions
  const fetchBookings = async () => {
    setBookingLoading(true);
    try {
      const response = await api.get('/api/bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error('Failed to fetch bookings');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      console.log('🔄 Confirming booking:', bookingId);
      
      const response = await api.put(`/api/bookings/${bookingId}`, {
        status: 'Confirmed',
        paymentStatus: 'pending' // This ensures it goes to Upcoming Revenue
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      console.log('✅ Booking confirmed successfully:', response.data);
      message.success('Booking confirmed successfully!');
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error('❌ Error confirming booking:', error);
      message.error('Failed to confirm booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      // Update booking status to cancelled
      await api.patch(`/api/bookings/${bookingId}/status`, 
        { status: 'Cancelled' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );
      
      // Send cancellation email
      const booking = bookings.find(b => b._id === bookingId);
      if (booking) {
        await api.post('/api/bookings/send-cancellation', {
          bookingId: booking._id,
          customerEmail: booking.customerEmail,
          customerName: booking.customerName
        });
      }
      
      message.success('Booking cancelled and email sent!');
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      message.error('Failed to cancel booking');
    }
  };

  const handlePaymentPaid = async (bookingId) => {
    try {
      console.log('💳 Marking payment as paid for booking:', bookingId);
      
      const booking = bookings.find(b => b._id === bookingId);
      if (!booking) {
        message.error('Booking not found');
        return;
      }

      console.log('📋 Booking details before payment:', {
        customerName: booking.customerName,
        totalAmount: booking.totalAmount,
        discountAmount: booking.discountAmount,
        paymentStatus: booking.paymentStatus
      });

      // Calculate final amount with existing discount
      const finalAmount = booking.totalAmount - (booking.discountAmount || 0);
      
      console.log('💰 Final amount to be collected:', finalAmount);
      
      // Update booking to mark payment as paid - this moves it from Upcoming to Collected Revenue
      const response = await api.put(`/api/bookings/${bookingId}`, {
        paymentStatus: 'paid',
        finalAmount: finalAmount
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      console.log('✅ Payment marked as paid successfully:', response.data);
      message.success(`Payment marked as paid! Amount ${formatCurrency(finalAmount)} moved to Collected Revenue.`);
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error('❌ Error marking payment as paid:', error);
      message.error('Failed to mark payment as paid');
    }
  };

  const handlePaymentSubmit = async () => {
    try {
      const { booking } = paymentModal;
      if (!booking) {
        message.error('No booking selected');
        return;
      }

      // Calculate final amount
      const finalAmount = paymentForm.amount - paymentForm.discountAmount;

      // Update booking with payment and discount details
      await api.patch(`/api/bookings/${booking._id}/payment`, {
        amount: paymentForm.amount,
        discountAmount: paymentForm.discountAmount,
        discountPercentage: paymentForm.discountPercentage,
        discountReason: paymentForm.discountReason,
        finalAmount: finalAmount,
        paymentStatus: 'paid'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });

      // Add to manual revenue as collected (optional - for tracking purposes)
      try {
        await api.post('/api/bookings/manual-revenue', {
          type: 'collected',
          amount: finalAmount,
          description: `Payment received for booking ${booking.customerName} - ${booking.room?.name}`
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
      } catch (revenueError) {
        console.log('Manual revenue tracking failed (non-critical):', revenueError);
        // Don't fail the payment if revenue tracking fails
      }

      message.success('Payment recorded successfully!');
      setPaymentModal({ open: false, booking: null });
      setPaymentForm({ amount: 0, discountAmount: 0, discountPercentage: 0, discountReason: '' });
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error recording payment:', error);
      message.error('Failed to record payment');
    }
  };

  // Filter bookings based on status
  const getFilteredBookings = () => {
    if (bookingStatusFilter === 'all') {
      return bookings;
    }
    return bookings.filter(booking => {
      const status = booking.status?.toLowerCase();
      const filter = bookingStatusFilter.toLowerCase();
      return status === filter;
    });
  };

  // Calculate notification count
  const calculateNotificationCount = () => {
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    setNotificationCount(pendingBookings);
  };

  // Currency formatting function
  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `Rs. ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `Rs. ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Rs. ${(amount / 1000).toFixed(1)}K`;
    } else {
      return `Rs. ${amount.toLocaleString()}`;
    }
  };

  // Calculate dashboard statistics
  const calculateDashboardStats = () => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const availableRooms = rooms.filter(r => r.status === 'Available').length;
    const totalRooms = rooms.length;
    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    const notificationCount = calculateNotificationCount();

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      availableRooms,
      totalRooms,
      totalReviews,
      averageRating,
      notificationCount
    };
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await api.get('/api/reviews', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Failed to fetch reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      message.success('Review deleted successfully!');
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error deleting review:', error);
      message.error('Failed to delete review');
    }
  };

  // Fetch booking statistics
  const fetchBookingStats = async () => {
    try {
      // Calculate monthly statistics
      const monthlyStats = [];
      const currentDate = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getMonth() === date.getMonth() && 
                 bookingDate.getFullYear() === date.getFullYear();
        });
        
        monthlyStats.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          bookings: monthBookings.length,
          revenue: monthBookings
            .filter(b => b.status === 'Confirmed' && new Date(b.checkOut) < new Date())
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        });
      }

      // Calculate daily statistics (last 30 days)
      const dailyStats = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.toDateString() === date.toDateString();
        });
        
        dailyStats.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          bookings: dayBookings.length,
          revenue: dayBookings
            .filter(b => b.status === 'Confirmed' && new Date(b.checkOut) < new Date())
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        });
      }

      // Calculate revenue by completed booking periods
      const completedBookings = bookings.filter(booking => 
        booking.status === 'Confirmed' && new Date(booking.checkOut) < new Date()
      );
      
      const revenueByPeriod = [];
      const currentYear = new Date().getFullYear();
      for (let month = 0; month < 12; month++) {
        const monthBookings = completedBookings.filter(booking => {
          const checkoutDate = new Date(booking.checkOut);
          return checkoutDate.getMonth() === month && checkoutDate.getFullYear() === currentYear;
        });
        
        revenueByPeriod.push({
          month: new Date(currentYear, month).toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        });
      }

      setBookingStats({
        monthly: monthlyStats,
        daily: dailyStats,
        revenueByPeriod: revenueByPeriod
      });
    } catch (error) {
      console.error('Error calculating booking statistics:', error);
    }
  };

  // Handle adding customer to booking
  const handleAddCustomerToBooking = async (bookingId) => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      message.error('Please fill in all required fields (Name, Email, Phone)');
      return;
    }

    try {
      await api.put(`/api/bookings/${bookingId}/add-customer`, newCustomer, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      message.success('Customer added successfully!');
      setCustomerModal({ open: false, bookingId: null });
      setNewCustomer({ name: '', email: '', phone: '', address: '', age: '', relationship: '' });
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error adding customer:', error);
      message.error('Failed to add customer');
    }
  };

  useEffect(() => {
    if (selected === 'hotel-management') {
      api.get('/api/rooms').then(res => setRooms(res.data));
    }
    if (selected.startsWith('bookings-')) {
      const status = selected.replace('bookings-', '');
      setBookingStatusFilter(status);
      fetchBookings();
    }
    if (selected === 'dashboard') {
      // Fetch bookings and rooms for dashboard
      fetchBookings();
      api.get('/api/rooms').then(res => setRooms(res.data));
      fetchReviews(); // Fetch reviews for dashboard stats
      fetchManualRevenue(); // Fetch manual revenue
      fetchManualCosts(); // Fetch manual costs
    }
    if (selected === 'reviews') {
      fetchReviews();
    }
    if (selected === 'payment-history') {
      fetchManualRevenue(); // Fetch manual revenue
      fetchManualCosts(); // Fetch manual costs
    }
  }, [selected]);

  // Update notification count when bookings change
  useEffect(() => {
    calculateNotificationCount();
    fetchBookingStats();
  }, [bookings]);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await api.get('/api/settings');
      setSettings(res.data);
    };
    fetchSettings();
  }, []);

  // Fetch initial data on mount
  useEffect(() => {
    fetchBookings();
    fetchReviews();
    api.get('/api/rooms').then(res => setRooms(res.data));
  }, []);

  // When settings are loaded, set local state for homepage fields
  useEffect(() => {
    if (settings) {
      // AKR Group Homepage settings
      setAkrGroupHeading(settings.akrGroupHeading || "");
      setAkrGroupSubheading(settings.akrGroupSubheading || "");
      setAkrGroupHeadingColor(settings.akrGroupHeadingColor || "#22c55e");
      setAkrGroupSubheadingColor(settings.akrGroupSubheadingColor || "#fff");
      setAkrGroupBanners(settings.akrGroupBanners || []);
      
      // Multi Complex Homepage settings (renamed from homepage settings)
      setMultiComplexHeading(settings.homepageHeading || "");
      setMultiComplexSubheading(settings.homepageSubheading || "");
      setMultiComplexHeadingColor(settings.homepageHeadingColor || "#22c55e");
      setMultiComplexSubheadingColor(settings.homepageSubheadingColor || "#fff");
      
      // Logo and other settings
      setLogoUrl(settings.homepageLogo || "");
      setShowRealProducts(settings.showRealProducts !== false);
      setShoppingHeading(settings.shoppingHeading || "");
      setShoppingSubheading(settings.shoppingSubheading || "");
      setShoppingHeadingColor(settings.shoppingHeadingColor || "#11998e");
      setShoppingSubheadingColor(settings.shoppingSubheadingColor || "#fff");
      setShoppingSpecialOffer(settings.shoppingSpecialOffer || "");
      setShoppingSpecialOfferLink(settings.shoppingSpecialOfferLink || "");
      
      // Room turnover management settings
      setBufferHours(settings.bufferHours || 3);
    }
  }, [settings]);

  // When settings load, prefill gymSection fields
  useEffect(() => {
    if (settings && settings.gymSection) {
      setGymHeading(settings.gymSection.heading || "");
      setGymSubheading(settings.gymSection.subheading || "");
      setGymHeadingColor(settings.gymSection.headingColor || "#22c55e");
      setGymSubheadingColor(settings.gymSection.subheadingColor || "#fff");
      setGymImages(settings.gymSection.images || []);
      setGymAmenities(settings.gymSection.amenities || []);
      setGymPackages(settings.gymSection.packages || []);
      setShowRealGymPackages(settings.gymSection.showRealGymPackages !== false);
      setGymSpecialOffer(settings.gymSection.specialOffer || "");
      setGymSpecialOfferLink(settings.gymSection.specialOfferLink || "");
      setShowRealGymAmenities(settings.gymSection.showRealGymAmenities !== false);
    }
  }, [settings]);

  // When settings load, prefill hotelSection fields
  useEffect(() => {
    if (settings && settings.hotelSection) {
      console.log('Loading hotel section from settings:', settings.hotelSection);
      setHotelHeading(settings.hotelSection.heading || "");
      setHotelSubheading(settings.hotelSection.subheading || "");
      setHotelHeadingColor(settings.hotelSection.headingColor || "#11998e");
      setHotelSubheadingColor(settings.hotelSection.subheadingColor || "#fff");
      setHotelImages(settings.hotelSection.images || []);
      setHotelAmenities(settings.hotelSection.amenities || []);
      setHotelSpecialOffer(settings.hotelSection.specialOffer || "");
      setHotelSpecialOfferLink(settings.hotelSection.specialOfferLink || "");
    } else {
      console.log('No hotel section found in settings:', settings);
    }
    
    // Also sync with service card images if hotel section images are empty
    if (settings && settings.services) {
      const hotelService = settings.services.find(s => s.name === 'Hotel & Room Booking');
      if (hotelService && hotelService.images && hotelService.images.length > 0) {
        // If hotel section has no images but service card does, sync them
        if (!settings.hotelSection || !settings.hotelSection.images || settings.hotelSection.images.length === 0) {
          setHotelImages(hotelService.images);
        }
      }
    }
  }, [settings]);

  // Fetch products when Shopping section is selected
  useEffect(() => {
    if (selected === 'shopping') {
      api.get('/api/products').then(res => setProducts(res.data));
    }
  }, [selected]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/multicomplex/admin-login");
  };

  // Replace handleUpload with direct Cloudinary upload
  const handleUpload = async (file) => {
    const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setUploadedUrl(data.secure_url);
        message.success('Image uploaded!');
        return data.secure_url;
      } else {
        message.error('Upload failed');
        return null;
      }
    } catch (err) {
      message.error('Upload failed');
      return null;
    }
  };

  // Update handleUpload to handle multiple files and batch add to banners
  const handleBannerUpload = async (fileList) => {
    setBannerUploading(true);
    // Upload all files in parallel
    const uploadPromises = fileList.map(file => {
      const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      return fetch(url, {
        method: 'POST',
        body: formData,
      })
        .then(res => res.json())
        .then(data => data.secure_url)
        .catch(() => null);
    });
    const urls = (await Promise.all(uploadPromises)).filter(Boolean);
    if (urls.length > 0) {
      await addBanners(urls);
      message.success(`${urls.length} image(s) uploaded and added!`);
    }
    setBannerUploading(false);
    return false;
  };

  // Save section changes
  const saveSection = async (sectionKey) => {
    if (!settings) return;
    try {
      const updated = { ...settings };
      const serviceName = SECTION_KEY_TO_SERVICE_NAME[sectionKey] || sectionKey;
      // Update description if edited
      if (descEdit[sectionKey] !== undefined) {
        const idx = updated.services.findIndex(s => s.name === serviceName);
        if (idx !== -1) updated.services[idx].description = descEdit[sectionKey];
      }
      await api.put('/api/settings', updated, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      setDescEdit({ ...descEdit, [sectionKey]: undefined });
      message.success('Section updated!');
      // Refresh settings
      const res = await api.get('/api/settings');
      setSettings(res.data);
    } catch (err) {
      if (handleApiError(err)) return;
      message.error('Save failed');
    }
  };

  // Add image to section
  const addImageToSection = async (sectionKey, url) => {
    if (!settings) return;
    try {
      const updated = { ...settings };
      const serviceName = SECTION_KEY_TO_SERVICE_NAME[sectionKey] || sectionKey;
      const idx = updated.services.findIndex(s => s.name === serviceName);
      if (idx !== -1) {
        updated.services[idx].images = updated.services[idx].images || [];
        updated.services[idx].images.push(url);
      }
      await api.put('/api/settings', updated, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      message.success('Image added!');
      setUploadedUrl("");
      // Refresh settings
      const res = await api.get('/api/settings');
      setSettings(res.data);
    } catch (err) {
      if (handleApiError(err)) return;
      message.error('Add image failed');
    }
  };

  // Remove image from section
  const removeImageFromSection = async (sectionKey, url) => {
    if (!settings) return;
    try {
      const updated = { ...settings };
      const serviceName = SECTION_KEY_TO_SERVICE_NAME[sectionKey] || sectionKey;
      const idx = updated.services.findIndex(s => s.name === serviceName);
      if (idx !== -1) {
        updated.services[idx].images = updated.services[idx].images.filter(img => img !== url);
      }
      await api.put('/api/settings', updated, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      message.success('Image removed!');
      // Refresh settings
      const res = await api.get('/api/settings');
      setSettings(res.data);
    } catch (err) {
      if (handleApiError(err)) return;
      message.error('Remove image failed');
    }
  };

  // Section management UI
  const renderSection = (sectionKey) => {
    if (!settings) return null;
    const serviceName = SECTION_KEY_TO_SERVICE_NAME[sectionKey] || sectionKey;
    const section = settings.services.find(s => s.name === serviceName);
    if (!section) return <Text type="secondary">No data for this section.</Text>;
    return (
      <div>
        <Title level={4}>Description</Title>
        <Input.TextArea
          rows={3}
          value={descEdit[sectionKey] !== undefined ? descEdit[sectionKey] : section.description}
          onChange={e => setDescEdit({ ...descEdit, [sectionKey]: e.target.value })}
          style={{ maxWidth: 500 }}
        />
        <Button type="primary" style={{ marginTop: 12 }} onClick={() => saveSection(sectionKey)}>
          Save Description
        </Button>
        <Title level={4} style={{ marginTop: 32 }}>Images</Title>
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={section.images || []}
          renderItem={img => (
            <List.Item>
              <div style={{ position: 'relative' }}>
                <img src={img} alt="Section" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  style={{ position: 'absolute', top: 4, right: 4 }}
                  onClick={() => removeImageFromSection(sectionKey, img)}
                />
              </div>
            </List.Item>
          )}
        />
        <Space style={{ marginTop: 16 }}>
          <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
            <Button icon={<PlusOutlined />}>Upload Image</Button>
          </Upload>
          {uploadedUrl && (
            <Button type="primary" icon={<EditOutlined />} onClick={() => addImageToSection(sectionKey, uploadedUrl)}>
              Add Uploaded Image
            </Button>
          )}
        </Space>
      </div>
    );
  };

  // Banners & Images management UI
  const renderBannersAndImages = () => {
    if (!settings) return null;
    return (
      <div>
        <Title level={4}>Homepage Slideshow Images</Title>
        {(settings.banners && settings.banners.length > 0) ? (
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={settings.banners}
            renderItem={img => (
              <List.Item>
                <div style={{ position: 'relative' }}>
                  <img src={img} alt="Banner" style={{ width: 180, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    style={{ position: 'absolute', top: 4, right: 4 }}
                    onClick={() => removeBanner(img)}
                  />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ background: '#fafafa', borderRadius: 8, padding: 32, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Empty description="No data" />
          </div>
        )}
        <Space style={{ marginTop: 16 }}>
          <Upload beforeUpload={(file, fileList) => handleBannerUpload(fileList)} showUploadList={false} accept="image/*" multiple disabled={bannerUploading}>
            <Button icon={<PlusOutlined />} disabled={bannerUploading}>Upload Slideshow Image(s)</Button>
          </Upload>
          {bannerUploading && <Spin size="small" style={{ marginLeft: 8 }} />}
          {uploadedUrl && (
            <Button type="primary" icon={<EditOutlined />} onClick={() => addBanner(uploadedUrl)}>
              Add Uploaded Slideshow Image
            </Button>
          )}
        </Space>
        <div style={{ marginTop: 40 }}>
          <Title level={4}>Section Card Images</Title>
          <Row gutter={[24, 24]}>
            {settings.services.map(section => (
              <Col key={section.name} xs={24} sm={12} md={8}>
                <div style={{ background: '#fafafa', borderRadius: 8, padding: 16, minHeight: 260 }}>
                  <Text strong>{section.name}</Text>
                  <List
                    grid={{ gutter: 8, column: 3 }}
                    dataSource={(() => {
                      // Special handling for hotel service - use hotel section images if service images are empty
                      if (section.name === 'Hotel & Room Booking' && (!section.images || section.images.length === 0)) {
                        return settings.hotelSection?.images || [];
                      }
                      return section.images || [];
                    })()}
                    style={{ marginTop: 8, minHeight: 90 }}
                    renderItem={img => (
                      <List.Item>
                        <div style={{ position: 'relative' }}>
                          <img src={img} alt="Card" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                          <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            style={{ position: 'absolute', top: 2, right: 2 }}
                            onClick={() => {
                              // Special handling for hotel service
                              if (section.name === 'Hotel & Room Booking') {
                                // Remove from both hotel section and service
                                if (settings.hotelSection) {
                                  const updatedHotelImages = settings.hotelSection.images.filter(i => i !== img);
                                  setHotelImages(updatedHotelImages);
                                }
                              }
                              removeImageFromSection(section.name.toLowerCase().replace(/\s/g, ''), img);
                            }}
                          />
                        </div>
                      </List.Item>
                    )}
                  />
                  <Space style={{ marginTop: 8 }}>
                    <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
                      <Button icon={<PlusOutlined />}>Upload Card Image</Button>
                    </Upload>
                    {uploadedUrl && (
                      <Button type="primary" icon={<EditOutlined />} onClick={async () => {
                        await addImageToSection(section.name.toLowerCase().replace(/\s/g, ''), uploadedUrl);
                        // Special handling for hotel service - also add to hotel section
                        if (section.name === 'Hotel & Room Booking' && settings.hotelSection) {
                          const updatedHotelImages = [...(settings.hotelSection.images || []), uploadedUrl];
                          setHotelImages(updatedHotelImages);
                        }
                      }}>
                        Add Uploaded Card Image
                      </Button>
                    )}
                  </Space>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  };

  // Add/remove banner helpers
  const addBanner = async (url) => {
    if (!settings) return;
    try {
      const updated = { ...settings };
      updated.banners = updated.banners || [];
      updated.banners.push(url);
      await api.put('/api/settings', updated, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      message.success('Banner added!');
      setUploadedUrl("");
      const res = await api.get('/api/settings');
      setSettings(res.data);
    } catch (err) {
      if (handleApiError(err)) return;
      message.error('Add banner failed');
    }
  };
  const removeBanner = async (url) => {
    if (!settings) return;
    try {
      const updated = { ...settings };
      updated.banners = updated.banners.filter(img => img !== url);
      await api.put('/api/settings', updated, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      message.success('Banner removed!');
      const res = await api.get('/api/settings');
      setSettings(res.data);
    } catch (err) {
      if (handleApiError(err)) return;
      message.error('Remove banner failed');
    }
  };

  // Add a new helper to batch add banners
  const addBanners = async (urls) => {
    if (!settings) return;
    try {
      const updated = { ...settings };
      updated.banners = updated.banners || [];
      updated.banners.push(...urls);
      await api.put('/api/settings', updated, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const res = await api.get('/api/settings');
      setSettings(res.data);
      setUploadedUrl("");
    } catch (err) {
      if (handleApiError(err)) return;
      message.error('Failed to add banners');
    }
  };

  const handleLogoUpload = async (file) => {
    setLogoUploading(true);
    const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setLogoUrl(data.secure_url);
        message.success('Logo uploaded!');
      } else {
        message.error('Logo upload failed');
      }
    } catch {
      message.error('Logo upload failed');
    }
    setLogoUploading(false);
    return false;
  };

  // Add a save handler for Multi Complex homepage fields
  const saveMultiComplexFields = async () => {
    if (!settings) return;
    
    const saveWithRetry = async (retryCount = 0) => {
      try {
        // First, get the latest settings to avoid conflicts
        const latestSettings = await api.get('/api/settings');
        const currentSettings = latestSettings.data;
        
        const updated = { ...currentSettings };
        updated.homepageHeading = multiComplexHeading;
        updated.homepageSubheading = multiComplexSubheading;
        updated.homepageHeadingColor = multiComplexHeadingColor;
        updated.homepageSubheadingColor = multiComplexSubheadingColor;
        updated.homepageLogo = logoUrl;
        updated.showRealProducts = showRealProducts;
        await api.put('/api/settings', updated, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });
        message.success('Multi Complex homepage fields updated!');
        const res = await api.get('/api/settings');
        setSettings(res.data);
      } catch (err) {
        if (err.response?.status === 409 && retryCount < 3) {
          // Retry on conflict
          console.log(`Retrying Multi Complex save (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return saveWithRetry(retryCount + 1);
        }
        if (handleApiError(err)) return;
        message.error('Failed to update Multi Complex fields');
      }
    };
    
    await saveWithRetry();
  };

  // Add a save handler for AKR Group homepage fields
  const saveAkrGroupFields = async () => {
    if (!settings) return;
    
    const saveWithRetry = async (retryCount = 0) => {
      try {
        // First, get the latest settings to avoid conflicts
        const latestSettings = await api.get('/api/settings');
        const currentSettings = latestSettings.data;
        
        const updated = { ...currentSettings };
        updated.akrGroupHeading = akrGroupHeading;
        updated.akrGroupSubheading = akrGroupSubheading;
        updated.akrGroupHeadingColor = akrGroupHeadingColor;
        updated.akrGroupSubheadingColor = akrGroupSubheadingColor;
        updated.akrGroupBanners = akrGroupBanners;
        await api.put('/api/settings', updated, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });
        message.success('AKR Group homepage fields updated!');
        const res = await api.get('/api/settings');
        setSettings(res.data);
      } catch (err) {
        if (err.response?.status === 409 && retryCount < 3) {
          // Retry on conflict
          console.log(`Retrying AKR Group save (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return saveWithRetry(retryCount + 1);
        }
        if (handleApiError(err)) return;
        message.error('Failed to update AKR Group fields');
      }
    };
    
    await saveWithRetry();
  };

  // Add a save handler for hotel section
  const saveHotelSection = async () => {
    if (!settings) return;
    
    const saveWithRetry = async (retryCount = 0) => {
      try {
        console.log('Saving hotel section with data:', {
          heading: hotelHeading,
          subheading: hotelSubheading,
          headingColor: hotelHeadingColor,
          subheadingColor: hotelSubheadingColor,
          images: hotelImages,
          amenities: hotelAmenities,
          specialOffer: hotelSpecialOffer,
          specialOfferLink: hotelSpecialOfferLink
        });
        
        // First, get the latest settings to avoid conflicts
        const latestSettings = await api.get('/api/settings');
        const currentSettings = latestSettings.data;
        
        const updated = { ...currentSettings };
        updated.hotelSection = {
          heading: hotelHeading,
          subheading: hotelSubheading,
          headingColor: hotelHeadingColor,
          subheadingColor: hotelSubheadingColor,
          images: hotelImages,
          amenities: hotelAmenities,
          specialOffer: hotelSpecialOffer,
          specialOfferLink: hotelSpecialOfferLink
        };
        
        // Also sync hotel images with service card images
        const hotelService = updated.services.find(s => s.name === 'Hotel & Room Booking');
        if (hotelService) {
          hotelService.images = hotelImages;
        }
        
        console.log('Sending updated settings:', updated);
        
        await api.put('/api/settings', updated, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });
        message.success('Hotel section saved successfully!');
        const res = await api.get('/api/settings');
        setSettings(res.data);
        console.log('Settings refreshed after save:', res.data);
      } catch (err) {
        console.error('Error saving hotel section:', err);
        if (err.response?.status === 409 && retryCount < 3) {
          // Retry on conflict
          console.log(`Retrying save (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return saveWithRetry(retryCount + 1);
        }
        if (handleApiError(err)) return;
        message.error('Failed to save hotel section');
      }
    };
    
    await saveWithRetry();
  };

  // Product CRUD handlers
  const handleProductSave = async (values) => {
    if (productModal.editing) {
      // Edit
      await api.put(`/api/products/${productModal.editing._id}`, values, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    } else {
      // Add
      await api.post('/api/products', values, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    }
    const res = await api.get('/api/products');
    setProducts(res.data);
    setProductModal({ open: false, editing: null });
    productForm.resetFields();
  };
  const handleProductDelete = async (id) => {
    await api.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    setProducts(products.filter(p => p._id !== id));
  };
  const handleProductImageUpload = async (file) => {
    setProductUploading(true);
    const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) {
        productForm.setFieldsValue({ image: data.secure_url });
      }
    } finally {
      setProductUploading(false);
    }
    return false;
  };
  // Product management UI
  const renderShoppingSection = () => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 600, marginRight: 12 }}>Show Real Products on Shopping Page</label>
        <Switch
          checked={showRealProducts}
          onChange={async (checked) => {
            setShowRealProducts(checked);
            const updated = { ...settings, showRealProducts: checked };
            await api.put('/api/settings', updated, {
              headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            message.success(`Shopping page will now show ${checked ? 'real' : 'mock'} products.`);
            // Optionally, refresh settings
            const res = await api.get('/api/settings');
            setSettings(res.data);
          }}
        />
        <div style={{ marginTop: 8 }}>
          {showRealProducts ? (
            <Alert message="Showing real products on the shopping page." type="success" showIcon />
          ) : (
            <Alert message="Showing 100+ sample mock products on the shopping page." type="info" showIcon />
          )}
        </div>
      </div>
      <Button type="primary" onClick={() => {
        setProductModal({ open: true, editing: null });
        setProductFormData({ name: '', description: '', price: '', image: '', category: '' });
        setProductImagePreview('');
      }} style={{ marginBottom: 16 }}>Add Product</Button>
      <div style={{ maxWidth: 600, marginBottom: 32 }}>
        <Typography.Title level={4}>Shopping Page Heading & Subheading</Typography.Title>
        <div style={{ marginBottom: 16 }}>
          <label>Heading Text</label>
          <Input
            value={shoppingHeading}
            onChange={e => setShoppingHeading(e.target.value)}
            placeholder="Shopping Page Heading"
            style={{ marginBottom: 8 }}
          />
          <label>Heading Color</label>
          <input type="color" value={shoppingHeadingColor} onChange={e => setShoppingHeadingColor(e.target.value)} style={{ marginLeft: 8, marginBottom: 16 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Subheading Text</label>
          <Input.TextArea
            value={shoppingSubheading}
            onChange={e => setShoppingSubheading(e.target.value)}
            placeholder="Shopping Page Subheading"
            rows={3}
            style={{ marginBottom: 8 }}
          />
          <label>Subheading Color</label>
          <input type="color" value={shoppingSubheadingColor} onChange={e => setShoppingSubheadingColor(e.target.value)} style={{ marginLeft: 8, marginBottom: 16 }} />
        </div>
        <Button type="primary" onClick={async () => {
          const updated = { ...settings, shoppingHeading, shoppingSubheading, shoppingHeadingColor, shoppingSubheadingColor };
          await api.put('/api/settings', updated, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
          const res = await api.get('/api/settings');
          setSettings(res.data);
          message.success('Shopping page heading and subheading updated!');
        }}>Save Shopping Heading & Subheading</Button>
      </div>
      <div style={{ maxWidth: 600, marginBottom: 32 }}>
        <Typography.Title level={5}>Special Offer (optional)</Typography.Title>
        <Input
          value={shoppingSpecialOffer}
          onChange={e => setShoppingSpecialOffer(e.target.value)}
          placeholder="Special offer text (e.g., 20% off on your first purchase!)"
          style={{ marginBottom: 8 }}
        />
        <Input
          value={shoppingSpecialOfferLink}
          onChange={e => setShoppingSpecialOfferLink(e.target.value)}
          placeholder="Special offer link (optional)"
          style={{ marginBottom: 8 }}
        />
        <Button type="primary" onClick={async () => {
          const updated = { ...settings, shoppingSpecialOffer, shoppingSpecialOfferLink };
          await api.put('/api/settings', updated, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
          const res = await api.get('/api/settings');
          setSettings(res.data);
          message.success('Special offer updated!');
        }}>Save Special Offer</Button>
      </div>
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={4}>Shopping Page Slideshow Images</Typography.Title>
        {(settings.shoppingBanners && settings.shoppingBanners.length > 0) ? (
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={settings.shoppingBanners}
            renderItem={img => (
              <List.Item>
                <div style={{ position: 'relative' }}>
                  <img src={img} alt="Shopping Banner" style={{ width: 180, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    style={{ position: 'absolute', top: 4, right: 4 }}
                    onClick={async () => {
                      const updated = { ...settings, shoppingBanners: settings.shoppingBanners.filter(b => b !== img) };
                      await api.put('/api/settings', updated, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
                      const res = await api.get('/api/settings');
                      setSettings(res.data);
                      message.success('Shopping banner removed!');
                    }}
                  />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ background: '#fafafa', borderRadius: 8, padding: 32, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Empty description="No shopping banners" />
          </div>
        )}
        <Space style={{ marginTop: 16 }}>
          <Upload
            beforeUpload={async (file) => {
              const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
              const formData = new FormData();
              formData.append('file', file);
              formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
              const res = await fetch(url, { method: 'POST', body: formData });
              const data = await res.json();
              if (data.secure_url) {
                const updated = { ...settings, shoppingBanners: [...(settings.shoppingBanners || []), data.secure_url] };
                await api.put('/api/settings', updated, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
                const refreshed = await api.get('/api/settings');
                setSettings(refreshed.data);
                message.success('Shopping banner uploaded!');
              } else {
                message.error('Upload failed');
              }
              return false;
            }}
            showUploadList={false}
            accept="image/*"
            multiple={false}
          >
            <Button icon={<PlusOutlined />}>Upload Shopping Banner</Button>
          </Upload>
        </Space>
      </div>
      <Table
        dataSource={products}
        rowKey="_id"
        columns={[
          { title: 'Image', dataIndex: 'image', render: img => img ? <img src={img} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} /> : 'No Image' },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Description', dataIndex: 'description' },
          { title: 'Price', dataIndex: 'price', render: p => `$${p}` },
          {
            title: 'Actions',
            render: (_, rec) => (
              <span>
                <Button size="small" onClick={() => {
                  setProductModal({ open: true, editing: rec });
                  setProductFormData({ name: rec.name, description: rec.description, price: rec.price, image: rec.image, category: rec.category });
                  setProductImagePreview(rec.image);
                }}>Edit</Button>
                <Popconfirm title="Delete?" onConfirm={() => handleProductDelete(rec._id)}><Button size="small" danger style={{ marginLeft: 8 }}>Delete</Button></Popconfirm>
              </span>
            )
          }
        ]}
      />
      <Modal
        open={productModal.open}
        title={productModal.editing ? 'Edit Product' : 'Add Product'}
        onCancel={() => {
          setProductModal({ open: false, editing: null });
          setProductFormData({ name: '', description: '', price: '', image: '', category: '' });
          setProductImagePreview('');
        }}
        onOk={() => handleProductFormSubmit()}
        okText="Save"
        okButtonProps={{
          disabled: !productFormData.name || !productFormData.price || !productFormData.image || productUploading
        }}
      >
        <form onSubmit={e => { e.preventDefault(); handleProductFormSubmit(); }}>
          <div style={{ marginBottom: 12 }}>
            <label>Name</label>
            <input
              type="text"
              value={productFormData.name}
              onChange={e => setProductFormData({ ...productFormData, name: e.target.value })}
              required
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Description</label>
            <textarea
              value={productFormData.description}
              onChange={e => setProductFormData({ ...productFormData, description: e.target.value })}
              rows={2}
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Price</label>
            <input
              type="number"
              min="0"
              value={productFormData.price}
              onChange={e => setProductFormData({ ...productFormData, price: e.target.value })}
              required
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Category</label>
            <select
              value={productFormData.category || ''}
              onChange={e => setProductFormData({ ...productFormData, category: e.target.value })}
              required
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            >
              <option value="" disabled>Select category</option>
              {SUPERMARKET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async e => {
                if (e.target.files && e.target.files[0]) {
                  setProductImagePreview(URL.createObjectURL(e.target.files[0]));
                  setProductUploading(true);
                  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
                  const formData = new FormData();
                  formData.append('file', e.target.files[0]);
                  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                  try {
                    const res = await fetch(url, { method: 'POST', body: formData });
                    const data = await res.json();
                    if (data.secure_url) {
                      setProductFormData(f => ({ ...f, image: data.secure_url }));
                    }
                  } finally {
                    setProductUploading(false);
                  }
                }
              }}
              style={{ display: 'block', marginTop: 4 }}
            />
            {productImagePreview && (
              <img src={productImagePreview} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', marginTop: 8, borderRadius: 8 }} />
            )}
            {productFormData.image && !productImagePreview && (
              <img src={productFormData.image} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', marginTop: 8, borderRadius: 8 }} />
            )}
          </div>
        </form>
      </Modal>
    </div>
  );

  // Helper to handle API errors
  const handleApiError = (err) => {
    if (err.response && err.response.status === 401) {
      message.error('Session expired. Please log in again.');
      localStorage.removeItem('adminToken');
      navigate('/multicomplex/admin-login');
      return true;
    }
    return false;
  };

  const handleProductFormSubmit = async () => {
    if (!productFormData.name || !productFormData.price || !productFormData.image) {
      message.error('Please fill all required fields and upload an image.');
      return;
    }
    const values = {
      name: productFormData.name,
      description: productFormData.description,
      price: Number(productFormData.price),
      image: productFormData.image,
      category: productFormData.category,
    };
    if (productModal.editing) {
      await api.put(`/api/products/${productModal.editing._id}`, values, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    } else {
      await api.post('/api/products', values, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    }
    const res = await api.get('/api/products');
    setProducts(res.data);
    setProductModal({ open: false, editing: null });
    setProductFormData({ name: '', description: '', price: '', image: '', category: '' });
    setProductImagePreview('');
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: roomFormData.name,
        category: roomFormData.category,
        type: roomFormData.type,
        beds: roomFormData.beds,
        view: roomFormData.view,
        maxGuests: Number(roomFormData.maxGuests),
        size: Number(roomFormData.size),
        price: Number(roomFormData.price),
        discountedPrice: roomFormData.discountedPrice ? Number(roomFormData.discountedPrice) : undefined,
        amenities: roomFormData.amenities,
        images: roomFormData.images,
      };
      if (editingRoomId) {
        await api.put(`/api/rooms/${editingRoomId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      } else {
        await api.post('/api/rooms', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      }
      const res = await api.get('/api/rooms');
      setRooms(res.data);
      setRoomFormData({ name: '', category: 'Economy', description: '', price: '', capacity: 1, amenities: [], images: [], isAvailable: true, type: '', beds: '', maxGuests: '', size: '', discountedPrice: '', breakfastIncluded: false, breakfastPrice: '', cancellationPolicy: '', view: '', newAmenity: '' });
      setRoomDrawerOpen(false);
      setEditingRoomId(null);
      message.success(editingRoomId ? 'Room updated!' : 'Room added!');
    } catch (err) {
      message.error(editingRoomId ? 'Failed to update room' : 'Failed to add room');
    }
  };

  // Add edit/delete handlers inside AdminDashboard component:
  const handleEditRoom = (room) => {
    setRoomFormData({
      name: room.name || '',
      category: room.category || 'Economy',
      type: room.type || '',
      beds: room.beds || '',
      view: room.view || '',
      maxGuests: room.maxGuests || '',
      size: room.size || '',
      price: room.price || '',
      discountedPrice: room.discountedPrice || '',
      amenities: room.amenities || [],
      images: room.images || [],
      description: room.description || '',
      capacity: room.capacity || 1,
      isAvailable: room.isAvailable !== undefined ? room.isAvailable : true,
      breakfastIncluded: room.breakfastIncluded || false,
      breakfastPrice: room.breakfastPrice || '',
      cancellationPolicy: room.cancellationPolicy || '',
      newAmenity: '',
    });
    setEditingRoomId(room._id);
    setRoomDrawerOpen(true);
  };
  const handleDeleteRoom = async (roomId) => {
    try {
      await api.delete(`/api/rooms/${roomId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      const res = await api.get('/api/rooms');
      setRooms(res.data);
      message.success('Room deleted!');
    } catch (err) {
      message.error('Failed to delete room');
    }
  };

  // Filter rooms by category
  const getFilteredRooms = () => {
    if (roomCategoryFilter === 'all') {
      return rooms;
    }
    return rooms.filter(room => room.category === roomCategoryFilter);
  };

  // Send review invitation
  const handleSendReviewInvitation = async (bookingId) => {
    try {
      await api.post(`/api/bookings/${bookingId}/send-review-invitation`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      message.success('Review invitation sent successfully!');
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error sending review invitation:', error);
      message.error('Failed to send review invitation');
    }
  };

  // Send review reminder
  const handleSendReviewReminder = async (bookingId) => {
    try {
      await api.post(`/api/bookings/${bookingId}/send-review-reminder`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      message.success('Review reminder sent successfully!');
    } catch (error) {
      console.error('Error sending review reminder:', error);
      message.error('Failed to send review reminder');
    }
  };

  // Helper function to get category colors
  const getCategoryColor = (category) => {
    const colors = {
      'Maintenance': '#ff4d4f',
      'Utilities': '#1890ff',
      'Supplies': '#52c41a',
      'Staff': '#722ed1',
      'Marketing': '#fa8c16',
      'Other': '#666666'
    };
    return colors[category] || '#666666';
  };

  // Handle adding manual cost
  const handleAddManualCost = async () => {
    if (!manualCostForm.amount || !manualCostForm.description) {
      message.error('Please fill in amount and description');
      return;
    }

    try {
      const costData = {
        category: manualCostForm.category,
        amount: parseFloat(manualCostForm.amount),
        description: manualCostForm.description,
        date: manualCostForm.date.toDate(),
        paymentMethod: manualCostForm.paymentMethod
      };

      await api.post('/api/manual-costs', costData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });

      setManualCostForm({ category: 'Maintenance', amount: 0, description: '', date: dayjs(), paymentMethod: 'Cash' });
      setManualCostModal(false);
      message.success('Cost entry added successfully!');
      fetchManualCosts(); // Refresh the list
    } catch (error) {
      console.error('Error adding manual cost:', error);
      message.error('Failed to add cost entry');
    }
  };

  // Calculate total manual costs
  const calculateTotalManualCosts = () => {
    return manualCosts.reduce((total, cost) => total + cost.amount, 0);
  };

  // Calculate net profit (revenue - costs)
  const calculateNetProfit = () => {
    const totalRevenue = calculateCollectedRevenue() + calculateManualRevenue('collected');
    const totalCosts = calculateTotalManualCosts();
    return totalRevenue - totalCosts;
  };

  const handleAddManualRevenue = async () => {
    try {
      const revenueData = {
        type: manualRevenueForm.type,
        amount: parseFloat(manualRevenueForm.amount),
        description: manualRevenueForm.description,
        date: manualRevenueForm.date.toDate()
      };
      
      if (manualRevenueForm.editingId) {
        // Editing existing entry
        await api.put(`/api/manual-revenue/${manualRevenueForm.editingId}`, revenueData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        message.success('Revenue entry updated successfully!');
      } else {
        // Adding new entry
        await api.post('/api/manual-revenue', revenueData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        message.success('Revenue entry added successfully!');
      }
      
      setManualRevenueModal(false);
      setManualRevenueForm({ type: 'collected', amount: 0, description: '', date: dayjs() });
      fetchManualRevenue(); // Refresh the list
    } catch (error) {
      console.error('Error saving manual revenue:', error);
      message.error('Failed to save revenue entry');
    }
  };

  // Calculate total manual revenue
  const calculateManualRevenue = (type) => {
    return manualRevenues
      .filter(revenue => revenue.type === type)
      .reduce((total, revenue) => total + revenue.amount, 0);
  };

  // Calculate total revenue including manual entries
  const calculateTotalRevenue = (period) => {
    const bookingRevenue = calculateRevenueByPeriod(period); // Only paid bookings
    const collectedRevenue = calculateManualRevenue('collected');
    const upcomingRevenue = calculateManualRevenue('upcoming');
    return bookingRevenue + collectedRevenue + upcomingRevenue;
  };

  // Calculate upcoming revenue from confirmed but unpaid bookings
  const calculateUpcomingRevenue = () => {
    // Handle both old bookings (no paymentStatus) and new bookings (with paymentStatus)
    const upcomingBookings = bookings.filter(b => {
      if (b.status === 'Confirmed') {
        // If paymentStatus doesn't exist, treat as unpaid (upcoming)
        if (!b.paymentStatus) {
          return true;
        }
        // If paymentStatus exists, check if it's not 'paid'
        return b.paymentStatus !== 'paid';
      }
      return false;
    });
    
    const total = upcomingBookings.reduce((sum, b) => {
      const baseAmount = b.totalAmount || 0;
      const discountAmount = b.discountAmount || 0;
      return sum + (baseAmount - discountAmount);
    }, 0);

    // Debug logging
    console.log('🔍 Upcoming Revenue Calculation:');
    console.log(`  - Total bookings: ${bookings.length}`);
    console.log(`  - Confirmed bookings: ${bookings.filter(b => b.status === 'Confirmed').length}`);
    console.log(`  - Upcoming bookings: ${upcomingBookings.length}`);
    upcomingBookings.forEach(b => {
      console.log(`    - ${b.customerName}: ${b.totalAmount} (paymentStatus: ${b.paymentStatus})`);
    });
    console.log(`  - Total upcoming revenue: ${total}`);

    return total;
  };

  // Calculate collected revenue from paid bookings
  const calculateCollectedRevenue = () => {
    // Only include bookings that explicitly have paymentStatus === 'paid'
    const collectedBookings = bookings.filter(b => b.status === 'Confirmed' && b.paymentStatus === 'paid');
    
    const total = collectedBookings.reduce((sum, b) => {
      const finalAmount = b.finalAmount || (b.totalAmount - (b.discountAmount || 0));
      return sum + finalAmount;
    }, 0);

    // Debug logging
    console.log('💰 Collected Revenue Calculation:');
    console.log(`  - Collected bookings: ${collectedBookings.length}`);
    collectedBookings.forEach(b => {
      console.log(`    - ${b.customerName}: ${b.finalAmount || (b.totalAmount - (b.discountAmount || 0))} (paymentStatus: ${b.paymentStatus})`);
    });
    console.log(`  - Total collected revenue: ${total}`);

    return total;
  };

  // Calculate payment activities for a specific date
  const calculatePaymentActivitiesForDate = (date) => {
    // Convert dayjs to Date if needed
    const dateObj = date instanceof Date ? date : date.toDate();
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // Filter bookings for the specific date
    const dateBookings = bookings.filter(b => {
      // Use updatedAt for payment status changes, createdAt for new bookings
      const bookingDate = new Date(b.updatedAt || b.createdAt);
      return bookingDate >= startOfDay && bookingDate <= endOfDay;
    });

    // Calculate collected revenue for the date (only paid bookings)
    const collectedRevenue = dateBookings
      .filter(b => b.status === 'Confirmed' && b.paymentStatus === 'paid')
      .reduce((sum, b) => {
        const finalAmount = b.finalAmount || (b.totalAmount - (b.discountAmount || 0));
        return sum + finalAmount;
      }, 0);

    // Count paid bookings for the date
    const paidBookings = dateBookings.filter(b => 
      b.status === 'Confirmed' && b.paymentStatus === 'paid'
    ).length;

    // Count pending payments for the date
    const pendingPayments = dateBookings.filter(b => 
      b.status === 'Confirmed' && b.paymentStatus !== 'paid'
    ).length;

    // Calculate total discounts for the date
    const totalDiscounts = dateBookings.reduce((sum, b) => {
      return sum + (b.discountAmount || 0);
    }, 0);

    // Debug logging
    console.log(`💰 Payment Activities for ${dateObj.toLocaleDateString()}:`);
    console.log(`  - Total bookings on this date: ${dateBookings.length}`);
    console.log(`  - Paid bookings: ${paidBookings}`);
    console.log(`  - Pending payments: ${pendingPayments}`);
    console.log(`  - Collected revenue: ${collectedRevenue}`);
    console.log(`  - Total discounts: ${totalDiscounts}`);

    return {
      collectedRevenue,
      paidBookings,
      pendingPayments,
      totalDiscounts,
      totalBookings: dateBookings.length
    };
  };

  // Handle discount application
  const handleApplyDiscount = async () => {
    try {
      const { booking } = discountModal;
      const { type, value, reason } = discountForm;
      
      let discountAmount = 0;
      let discountPercentage = 0;
      
      if (type === 'percentage') {
        discountPercentage = value;
        discountAmount = (booking.totalAmount * value) / 100;
      } else {
        discountAmount = value;
        discountPercentage = (value / booking.totalAmount) * 100;
      }
      
      const finalAmount = booking.totalAmount - discountAmount;
      
      await api.patch(`/api/bookings/${booking._id}/discount`, {
        discountAmount,
        discountPercentage,
        discountReason: reason,
        finalAmount
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      message.success('Discount applied successfully!');
      setDiscountModal({ open: false, booking: null });
      setDiscountForm({ type: 'percentage', value: 0, reason: '' });
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error applying discount:', error);
      message.error('Failed to apply discount');
    }
  };

  // Calculate revenue based on selected period
  const calculateRevenueByPeriod = (period) => {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // Filter by when payment was made (updatedAt) instead of check-in date
    return bookings
      .filter(b => {
        if (b.status !== 'Confirmed' || b.paymentStatus !== 'paid') return false;
        
        // Use updatedAt for when payment was marked as paid
        const paymentDate = new Date(b.updatedAt || b.createdAt);
        return paymentDate >= startDate && paymentDate <= now;
      })
      .reduce((sum, b) => {
        const finalAmount = b.finalAmount || (b.totalAmount - (b.discountAmount || 0));
        return sum + finalAmount;
      }, 0);
  };

  // Fetch manual revenue and costs from backend
  const fetchManualRevenue = async () => {
    try {
      const response = await api.get('/api/manual-revenue', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setManualRevenues(response.data);
    } catch (error) {
      console.error('Error fetching manual revenue:', error);
      message.error('Failed to fetch manual revenue');
    }
  };

  const fetchManualCosts = async () => {
    try {
      const response = await api.get('/api/manual-costs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setManualCosts(response.data);
    } catch (error) {
      console.error('Error fetching manual costs:', error);
      message.error('Failed to fetch manual costs');
    }
  };

  // Fetch bookings and rooms for dashboard
  useEffect(() => {
    fetchBookings();
    fetchReviews();
    api.get('/api/rooms').then(res => setRooms(res.data));
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={220} 
        collapsed={collapsed}
        collapsedWidth={80}
        style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
        trigger={null}
      >
        <div className="p-4 text-center">
          <Title level={4} style={{ margin: 0, color: '#11998e', fontSize: collapsed ? 16 : 20 }}>
            {collapsed ? 'AP' : 'Admin Panel'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          onClick={({ key }) => setSelected(key)}
          style={{ height: '100%', borderRight: 0 }}
          inlineCollapsed={collapsed}
          items={SECTIONS.map(s => {
            if (s.children) {
              return {
                key: s.key,
                icon: s.icon,
                label: collapsed ? null : s.label,
                children: collapsed ? undefined : s.children.map(child => ({
                  key: child.key,
                  label: child.label
                }))
              };
            }
            return { 
              key: s.key, 
              icon: s.icon, 
              label: collapsed ? null : s.label,
              title: collapsed ? s.label : undefined
            };
          })}
        />
        <div className="p-4">
          <Button 
            icon={<LogoutOutlined />} 
            block 
            danger 
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            {collapsed ? null : 'Logout'}
          </Button>
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
          <Title level={3} style={{ margin: 0, color: '#11998e' }}>
            {selected.startsWith('bookings-') || selected === 'hotel-management'
              ? SECTIONS.find(s => s.key === 'hotel')?.children?.find(c => c.key === selected)?.label || 'Hotel Management'
              : SECTIONS.find(s => s.key === selected)?.label || 'Admin Panel'
            }
          </Title>
          </div>
          
          {/* Notification Bell */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 20 }} />}
                size="large"
                onClick={() => setSelected('bookings-pending')}
                style={{ 
                  color: notificationCount > 0 ? '#ff4d4f' : '#666',
                  border: notificationCount > 0 ? '1px solid #ff4d4f' : '1px solid #d9d9d9'
                }}
              />
              {notificationCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  background: '#ff4d4f',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold',
                  border: '2px solid white'
                }}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </div>
              )}
            </div>
          </div>
        </Header>
        <Content style={{ margin: 0, padding: 24, background: '#fff', minHeight: 360 }}>
          {selected === 'dashboard' && (
            <div>
              {/* Dashboard Overview Cards with Financial Summary */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                  {/* Dashboard Overview Cards */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Card style={{ textAlign: 'center' }}>
                        <Statistic
                          title="Total Bookings"
                          value={bookings.length}
                          prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                          Confirmed: {bookings.filter(b => b.status === 'Confirmed').length} | 
                          Pending: {bookings.filter(b => b.status === 'Pending').length}
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card style={{ textAlign: 'center' }}>
                        <Statistic
                          title="Available Rooms"
                          value={rooms.filter(r => r.status === 'Available').length}
                          prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                          Total: {rooms.length} rooms
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card style={{ textAlign: 'center' }}>
                        <Statistic
                          title="Total Reviews"
                          value={reviews.length}
                          prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
                          valueStyle={{ color: '#722ed1' }}
                        />
                        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                          Average: {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0} ⭐
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card style={{ textAlign: 'center' }}>
                        <Statistic
                          title="Notification Count"
                          value={notificationCount}
                          prefix={<BellOutlined style={{ color: '#fa8c16' }} />}
                          valueStyle={{ color: '#fa8c16' }}
                        />
                        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                          New bookings pending
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card style={{ textAlign: 'center' }}>
                        <Statistic
                          title="Collected Revenue"
                          value={formatCurrency(calculateCollectedRevenue() + calculateManualRevenue('collected'))}
                          prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                          Paid bookings + Manual
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card style={{ textAlign: 'center' }}>
                        <Statistic
                          title="Upcoming Revenue"
                          value={formatCurrency(calculateUpcomingRevenue() + calculateManualRevenue('upcoming'))}
                          prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
                          valueStyle={{ color: '#fa8c16' }}
                        />
                        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                          Confirmed but unpaid
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </Col>
                <Col xs={24} lg={8}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Financial Summary Card */}
                    <Card title="📊 Financial Summary" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ lineHeight: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14 }}>💰 Booking Revenue:</span>
                          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#52c41a' }}>
                            {formatCurrency(calculateCollectedRevenue())}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14 }}>➕ Manual Revenue:</span>
                          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#52c41a' }}>
                            {formatCurrency(calculateManualRevenue('collected'))}
                          </span>
                        </div>
                        <Divider style={{ margin: '12px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 'bold' }}>📈 Total Revenue:</span>
                          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#52c41a' }}>
                            {formatCurrency(calculateCollectedRevenue() + calculateManualRevenue('collected'))}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14 }}>💸 Total Costs:</span>
                          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#ff4d4f' }}>
                            -{formatCurrency(calculateTotalManualCosts())}
                          </span>
                        </div>
                        <Divider style={{ margin: '12px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 'bold' }}>💵 Net Profit:</span>
                          <span style={{ fontSize: 14, fontWeight: 'bold', color: calculateNetProfit() >= 0 ? '#52c41a' : '#ff4d4f' }}>
                            {formatCurrency(calculateNetProfit())}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
              </Row>

              {/* Today's Schedule and QR Code - Side by side under dashboard cards */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                  <Card title="📅 Today's Schedule" style={{ height: 'fit-content' }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <div style={{ 
                          padding: 16, 
                          backgroundColor: '#f6ffed', 
                          borderRadius: 8, 
                          border: '1px solid #b7eb8f',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a', marginBottom: 8 }}>
                            {bookings.filter(b => {
                              const today = new Date().toDateString();
                              const checkInDate = new Date(b.checkIn).toDateString();
                              return checkInDate === today && b.status === 'Confirmed';
                            }).length}
                          </div>
                          <div style={{ fontSize: 14, color: '#52c41a', fontWeight: 'bold' }}>
                            Check-ins Today
                          </div>
                          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                            Confirmed bookings
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div style={{ 
                          padding: 16, 
                          backgroundColor: '#fff7e6', 
                          borderRadius: 8, 
                          border: '1px solid #ffd591',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16', marginBottom: 8 }}>
                            {bookings.filter(b => {
                              const today = new Date().toDateString();
                              const checkOutDate = new Date(b.checkOut).toDateString();
                              return checkOutDate === today && b.status === 'Confirmed';
                            }).length}
                          </div>
                          <div style={{ fontSize: 14, color: '#fa8c16', fontWeight: 'bold' }}>
                            Check-outs Today
                          </div>
                          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                            Rooms to clean
                          </div>
                        </div>
                      </Col>
                    </Row>
                    
                    {/* Today's Schedule Details */}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1890ff' }}>
                        📋 Today's Details
                      </div>
                      
                      {/* Check-ins List */}
                      {(() => {
                        const todayCheckIns = bookings.filter(b => {
                          const today = new Date().toDateString();
                          const checkInDate = new Date(b.checkIn).toDateString();
                          return checkInDate === today && b.status === 'Confirmed';
                        });
                        
                        if (todayCheckIns.length > 0) {
                          return (
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 12, color: '#52c41a', fontWeight: 'bold', marginBottom: 8 }}>
                                ✅ Check-ins ({todayCheckIns.length})
                              </div>
                              {todayCheckIns.slice(0, 3).map(booking => (
                                <div key={booking._id} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  padding: '8px 12px',
                                  backgroundColor: '#f6ffed',
                                  borderRadius: 6,
                                  marginBottom: 4
                                }}>
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 'bold' }}>
                                      {booking.customerName}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#666' }}>
                                      {booking.room?.name || 'Room N/A'}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: 11, color: '#52c41a' }}>
                                    {new Date(booking.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              ))}
                              {todayCheckIns.length > 3 && (
                                <div style={{ fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4 }}>
                                  +{todayCheckIns.length - 3} more check-ins
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Check-outs List */}
                      {(() => {
                        const todayCheckOuts = bookings.filter(b => {
                          const today = new Date().toDateString();
                          const checkOutDate = new Date(b.checkOut).toDateString();
                          return checkOutDate === today && b.status === 'Confirmed';
                        });
                        
                        if (todayCheckOuts.length > 0) {
                          return (
                            <div>
                              <div style={{ fontSize: 12, color: '#fa8c16', fontWeight: 'bold', marginBottom: 8 }}>
                                🚪 Check-outs ({todayCheckOuts.length})
                              </div>
                              {todayCheckOuts.slice(0, 3).map(booking => (
                                <div key={booking._id} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  padding: '8px 12px',
                                  backgroundColor: '#fff7e6',
                                  borderRadius: 6,
                                  marginBottom: 4
                                }}>
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 'bold' }}>
                                      {booking.customerName}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#666' }}>
                                      {booking.room?.name || 'Room N/A'}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: 11, color: '#fa8c16' }}>
                                    {new Date(booking.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              ))}
                              {todayCheckOuts.length > 3 && (
                                <div style={{ fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4 }}>
                                  +{todayCheckOuts.length - 3} more check-outs
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Enhanced Empty State */}
                      {(() => {
                        const todayCheckIns = bookings.filter(b => {
                          const today = new Date().toDateString();
                          const checkInDate = new Date(b.checkIn).toDateString();
                          return checkInDate === today && b.status === 'Confirmed';
                        });
                        
                        const todayCheckOuts = bookings.filter(b => {
                          const today = new Date().toDateString();
                          const checkOutDate = new Date(b.checkOut).toDateString();
                          return checkOutDate === today && b.status === 'Confirmed';
                        });
                        
                        if (todayCheckIns.length === 0 && todayCheckOuts.length === 0) {
                          return (
                            <div style={{ 
                              textAlign: 'center', 
                              padding: 20, 
                              color: '#666',
                              backgroundColor: '#f5f5f5',
                              borderRadius: 8
                            }}>
                              <div style={{ fontSize: 16, marginBottom: 8 }}>📅</div>
                              <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>No Schedule Today</div>
                              <div style={{ fontSize: 12, marginBottom: 12 }}>No check-ins or check-outs scheduled for today</div>
                              
                              {/* Show upcoming bookings */}
                              {(() => {
                                const upcomingBookings = bookings.filter(b => {
                                  const today = new Date();
                                  const checkInDate = new Date(b.checkIn);
                                  return checkInDate > today && b.status === 'Confirmed';
                                }).slice(0, 2);
                                
                                if (upcomingBookings.length > 0) {
                                  return (
                                    <div style={{ textAlign: 'left', marginTop: 12 }}>
                                      <div style={{ fontSize: 12, fontWeight: 'bold', color: '#1890ff', marginBottom: 8 }}>
                                        🔮 Upcoming Bookings:
                                      </div>
                                      {upcomingBookings.map(booking => (
                                        <div key={booking._id} style={{ 
                                          fontSize: 11, 
                                          marginBottom: 4,
                                          padding: '4px 8px',
                                          backgroundColor: '#e6f7ff',
                                          borderRadius: 4
                                        }}>
                                          <div style={{ fontWeight: 'bold' }}>
                                            {booking.customerName} - {booking.room?.name || 'Room N/A'}
                                          </div>
                                          <div style={{ color: '#666' }}>
                                            {new Date(booking.checkIn).toLocaleDateString()} at {new Date(booking.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                              
                              {/* Show room status summary */}
                              <div style={{ marginTop: 12, padding: '8px 12px', backgroundColor: '#f0f9ff', borderRadius: 6 }}>
                                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#1890ff', marginBottom: 4 }}>
                                  🏨 Room Status Summary:
                                </div>
                                <div style={{ fontSize: 11, color: '#666' }}>
                                  Available: {rooms.filter(r => r.status === 'Available').length} | 
                                  Occupied: {rooms.filter(r => r.status === 'Occupied').length} | 
                                  Cleaning: {rooms.filter(r => r.status === 'Cleaning').length}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="📱 Room QR Code for Reviews" style={{ height: 'fit-content' }}>
                    {rooms.length > 0 ? (
                      <div style={{ textAlign: 'center' }}>
                        {/* Room Information */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
                            {rooms[currentQRIndex]?.name}
                          </div>
                          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                            {rooms[currentQRIndex]?.category} • {rooms[currentQRIndex]?.type}
                          </div>
                        </div>
                        
                        {/* QR Code Display */}
                        <div style={{ 
                          backgroundColor: '#f5f5f5', 
                          padding: 20, 
                          borderRadius: 8, 
                          marginBottom: 16,
                          minHeight: 150,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <QrcodeOutlined style={{ fontSize: 100, color: '#1890ff' }} />
                            <div style={{ fontSize: 14, color: '#666', marginTop: 12 }}>
                              QR Code for {rooms[currentQRIndex]?.name}
                            </div>
                          </div>
                        </div>

                        {/* Review Invitation Form */}
                        <div style={{ marginBottom: 16 }}>
                          <Input
                            placeholder="Enter customer email"
                            size="middle"
                            style={{ marginBottom: 12 }}
                            value={reviewEmails[rooms[currentQRIndex]?._id] || ''}
                            onChange={(e) => {
                              setReviewEmails(prev => ({
                                ...prev,
                                [rooms[currentQRIndex]?._id]: e.target.value
                              }));
                            }}
                          />
                          <Button
                            type="primary"
                            size="middle"
                            style={{ width: '100%' }}
                            onClick={async () => {
                              const room = rooms[currentQRIndex];
                              const email = reviewEmails[room?._id];
                              if (!email) {
                                message.error('Please enter customer email');
                                return;
                              }
                              
                              try {
                                // Find a booking for this room and email
                                const booking = bookings.find(b => 
                                  b.room && b.room._id === room._id && 
                                  (b.customerEmail === email || b.customerName?.toLowerCase().includes(email.toLowerCase()))
                                );
                                
                                if (booking) {
                                  await api.post(`/api/bookings/${booking._id}/send-review-invitation`, {}, {
                                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                                  });
                                  message.success(`Review invitation sent to ${email} for ${room.name}`);
                                  // Clear the email input after successful send
                                  setReviewEmails(prev => ({
                                    ...prev,
                                    [room._id]: ''
                                  }));
                                } else {
                                  message.error(`No booking found for ${email} in ${room.name}`);
                                }
                              } catch (error) {
                                console.error('Error sending review invitation:', error);
                                message.error('Failed to send review invitation');
                              }
                            }}
                          >
                            Send Review Invitation
                          </Button>
                        </div>

                        {/* Navigation */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            size="middle"
                            disabled={currentQRIndex === 0}
                            onClick={() => setCurrentQRIndex(prev => Math.max(0, prev - 1))}
                            style={{ flex: 1 }}
                          >
                            ← Previous
                          </Button>
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            fontSize: 14, 
                            color: '#666',
                            minWidth: 60,
                            justifyContent: 'center'
                          }}>
                            {currentQRIndex + 1} / {rooms.length}
                          </span>
                          <Button
                            size="middle"
                            disabled={currentQRIndex === rooms.length - 1}
                            onClick={() => setCurrentQRIndex(prev => Math.min(rooms.length - 1, prev + 1))}
                            style={{ flex: 1 }}
                          >
                            Next →
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                        No rooms available for QR codes
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>

              {/* Recent Bookings */}
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16 }}>📋 Recent Bookings</Title>
                <Table
                  dataSource={bookings.slice(0, 5)}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Customer',
                      dataIndex: 'customerName',
                      key: 'customerName',
                      render: (text, record) => (
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{text}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{record.customerPhone}</div>
                        </div>
                      )
                    },
                    {
                      title: 'Room',
                      key: 'room',
                      render: (_, record) => {
                        // Handle different room data structures
                        let roomName = 'N/A';
                        let roomCategory = '';
                        
                        if (record.room) {
                          if (typeof record.room === 'object' && record.room.name) {
                            roomName = record.room.name;
                            roomCategory = record.room.category || '';
                          } else if (typeof record.room === 'string') {
                            roomName = record.room;
                          } else if (record.roomId) {
                            // Fallback to roomId if room object is not populated
                            roomName = `Room ID: ${record.roomId}`;
                          }
                        }
                        
                        return (
                          <div style={{ fontSize: 14 }}>
                            <div style={{ fontWeight: 'bold' }}>{roomName}</div>
                            {roomCategory && (
                              <div style={{ fontSize: 12, color: '#666' }}>{roomCategory}</div>
                            )}
                          </div>
                        );
                      }
                    },
                    {
                      title: 'Dates',
                      key: 'dates',
                      render: (_, record) => (
                        <div>
                          <div>{new Date(record.checkIn).toLocaleDateString()}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.nights} nights
                          </div>
                        </div>
                      )
                    },
                    {
                      title: 'Amount',
                      dataIndex: 'totalAmount',
                      key: 'totalAmount',
                      render: (amount, record) => (
                        <div>
                          <div>{formatCurrency(amount || 0)}</div>
                          {record.discountAmount > 0 && (
                            <div style={{ fontSize: 12, color: '#dc3545' }}>
                              -{formatCurrency(record.discountAmount)} ({record.discountPercentage}%)
                            </div>
                          )}
                          {record.finalAmount && record.finalAmount !== amount && (
                            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#11998e' }}>
                              Final: {formatCurrency(record.finalAmount)}
                            </div>
                          )}
                        </div>
                      )
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: status === 'Confirmed' ? '#e6f7ff' : status === 'Cancelled' ? '#fff2e8' : '#f6ffed',
                          color: status === 'Confirmed' ? '#1890ff' : status === 'Cancelled' ? '#fa8c16' : '#52c41a'
                        }}>
                          {status}
                        </span>
                      )
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_, record) => (
                        <Space>
                          {record.status === 'Pending' && (
                            <Button 
                              size="small" 
                              type="primary"
                              onClick={() => handleConfirmBooking(record._id)}
                            >
                              Confirm
                            </Button>
                          )}
                          {record.status === 'Pending' && (
                            <Button 
                              size="small" 
                              danger
                              onClick={() => handleCancelBooking(record._id)}
                            >
                              Cancel
                            </Button>
                          )}
                          {record.status === 'Confirmed' && record.paymentStatus !== 'paid' && (
                            <Button 
                              size="small" 
                              type="primary"
                              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                              onClick={() => handlePaymentPaid(record._id)}
                            >
                              Payment Paid
                            </Button>
                          )}
                          <Button 
                            size="small"
                            onClick={() => setSelected('bookings-all')}
                          >
                            View
                          </Button>
                          <Button 
                            size="small"
                            type="default"
                            onClick={() => setDiscountModal({ open: true, booking: record })}
                          >
                            Discount
                          </Button>
                        </Space>
                      )
                    }
                  ]}
                />
                {bookings.length > 5 && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="link" onClick={() => setSelected('bookings-all')}>
                      View All Bookings ({bookings.length})
                    </Button>
                  </div>
                )}
              </div>

              {/* Recent Payment Activities */}
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16 }}>💰 Recent Payment Activities</Title>
                <div style={{ 
                  background: '#f8f9fa', 
                  borderRadius: 8, 
                  padding: 16,
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 14 }}>Payment Summary</div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <DatePicker
                            value={dayjs(selectedDate)}
                            onChange={(date) => setSelectedDate(date ? date : dayjs())}
                            format="DD/MM/YYYY"
                            style={{ width: 150 }}
                            placeholder="Select Date"
                          />
                          <Button 
                            size="small" 
                            type="default"
                            onClick={() => setSelectedDate(dayjs())}
                          >
                            Today
                          </Button>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {selectedDate.toDate().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 'bold', color: '#52c41a' }}>
                        {formatCurrency(calculatePaymentActivitiesForDate(selectedDate).collectedRevenue)}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>Collected Revenue</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ 
                      background: 'white', 
                      padding: 12, 
                      borderRadius: 6, 
                      flex: 1, 
                      minWidth: 120,
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Paid Bookings</div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#52c41a' }}>
                        {calculatePaymentActivitiesForDate(selectedDate).paidBookings}
                      </div>
                    </div>
                    <div style={{ 
                      background: 'white', 
                      padding: 12, 
                      borderRadius: 6, 
                      flex: 1, 
                      minWidth: 120,
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Pending Payments</div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16' }}>
                        {calculatePaymentActivitiesForDate(selectedDate).pendingPayments}
                      </div>
                    </div>
                    <div style={{ 
                      background: 'white', 
                      padding: 12, 
                      borderRadius: 6, 
                      flex: 1, 
                      minWidth: 120,
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Discounts</div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ff4d4f' }}>
                        {formatCurrency(calculatePaymentActivitiesForDate(selectedDate).totalDiscounts)}
                      </div>
                    </div>
                    <div style={{ 
                      background: 'white', 
                      padding: 12, 
                      borderRadius: 6, 
                      flex: 1, 
                      minWidth: 120,
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Bookings</div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
                        {calculatePaymentActivitiesForDate(selectedDate).totalBookings}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Management */}
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16 }}>🏠 Room Management</Title>
                <Row gutter={[16, 16]}>
                  {rooms.slice(0, 4).map(room => (
                    <Col xs={24} sm={12} md={6} key={room._id}>
                      <div style={{ 
                        border: '1px solid #e8e8e8', 
                        borderRadius: 8, 
                        padding: 16,
                        background: room.status === 'Available' ? '#f6ffed' : 
                                   room.status === 'Cleaning' ? '#fff7e6' : '#fff2e8'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          {room.images && room.images.length > 0 && (
                            <img 
                              src={room.images[0]} 
                              alt={room.name}
                              style={{ 
                                width: 40, 
                                height: 40, 
                                objectFit: 'cover', 
                                borderRadius: 4,
                                marginRight: 12
                              }} 
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: 14 }}>{room.name}</div>
                            <div style={{ fontSize: 12, color: '#666' }}>{room.type} • {room.category}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: '#666' }}>Price:</span> Rs. {room.price?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: '#666' }}>Max Guests:</span> {room.maxGuests}
                        </div>
                        <div style={{ fontSize: 12, marginBottom: 8 }}>
                          <span style={{ color: '#666' }}>Status:</span> 
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            marginLeft: 4,
                            backgroundColor: room.status === 'Available' ? '#f6ffed' : 
                                           room.status === 'Cleaning' ? '#fff7e6' : '#fff2e8',
                            color: room.status === 'Available' ? '#52c41a' : 
                                  room.status === 'Cleaning' ? '#fa8c16' : '#ff4d4f',
                            border: `1px solid ${room.status === 'Available' ? '#52c41a' : 
                                              room.status === 'Cleaning' ? '#fa8c16' : '#ff4d4f'}`
                          }}>
                            {room.status}
                          </span>
                        </div>
                        {room.status === 'Cleaning' && room.cleaningEndTime && (
                          <div style={{ fontSize: 10, color: '#fa8c16', marginBottom: 8 }}>
                            Available at: {new Date(room.cleaningEndTime).toLocaleTimeString()}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Button 
                            size="small" 
                            type="default"
                            onClick={() => setSelected('hotel-management')}
                            style={{ flex: 1, fontSize: 10 }}
                          >
                            Manage
                          </Button>
                          {room.status === 'Cleaning' && (
                            <Button 
                              size="small" 
                              type="primary"
                              onClick={async () => {
                                try {
                                  await api.put(`/api/rooms/${room._id}/mark-ready`, {}, {
                                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                                  });
                                  message.success('Room marked as ready!');
                                  // Refresh rooms data
                                  api.get('/api/rooms').then(res => setRooms(res.data));
                                } catch (error) {
                                  console.error('Error marking room as ready:', error);
                                  message.error('Failed to mark room as ready');
                                }
                              }}
                              style={{ flex: 1, fontSize: 10, backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            >
                              Mark Ready
                            </Button>
                          )}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
                {rooms.length > 4 && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="link" onClick={() => setSelected('hotel-management')}>
                      Manage All Rooms ({rooms.length})
                    </Button>
                  </div>
                )}
              </div>

              {/* Room Occupancy & Revenue Charts */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Title level={4} style={{ margin: 0 }}>📊 Analytics Charts</Title>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button 
                      type="default" 
                      size="small"
                      onClick={() => setShowBookingChart(!showBookingChart)}
                      style={{ fontSize: 12 }}
                    >
                      {showBookingChart ? '🙈 Hide' : '📊 Show'} Booking Chart
                    </Button>
                    <Button 
                      type="default" 
                      size="small"
                      onClick={() => setShowRevenueChart(!showRevenueChart)}
                      style={{ fontSize: 12 }}
                    >
                      {showRevenueChart ? '🙈 Hide' : '📈 Show'} Revenue Chart
                    </Button>
                  </div>
                </div>
                
                <Row gutter={[16, 16]}>
                  {showBookingChart && (
                    <Col xs={24} lg={12}>
                      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Title level={4} style={{ marginBottom: 16 }}>🏨 Room Booking Count</Title>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={rooms.map(room => {
                            // Handle room object structure
                            const roomBookings = bookings.filter(b => {
                              // Extract room name from different possible structures
                              let bookingRoomName = '';
                              
                              if (typeof b.room === 'string') {
                                bookingRoomName = b.room;
                              } else if (b.room && typeof b.room === 'object') {
                                bookingRoomName = b.room.name || b.room.roomName || b.room._id || '';
                              } else {
                                bookingRoomName = b.roomName || b.roomId || b.room_id || '';
                              }
                              
                              const roomName = room.name || room.roomName || '';
                              
                              return bookingRoomName.toLowerCase().includes(roomName.toLowerCase()) ||
                                     roomName.toLowerCase().includes(bookingRoomName.toLowerCase()) ||
                                     bookingRoomName === roomName ||
                                     b.roomId === room._id ||
                                     (b.room && b.room._id === room._id);
                            });
                            
                            const totalBookings = roomBookings.length;
                            const totalRevenue = roomBookings.reduce((sum, b) => {
                              const amount = parseFloat(b.finalAmount) || parseFloat(b.amount) || 0;
                              return sum + amount;
                            }, 0);
                            
                            return {
                              name: room.name,
                              bookings: totalBookings,
                              revenue: totalRevenue
                            };
                          })}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip formatter={(value, name) => [name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Bookings']} />
                            <Legend />
                            <Bar dataKey="bookings" fill="#1890ff" name="Bookings" />
                            <Bar dataKey="revenue" fill="#52c41a" name="Revenue" />
                          </BarChart>
                        </ResponsiveContainer>
                        

                      </Card>
                    </Col>
                  )}
                  {showRevenueChart && (
                    <Col xs={24} lg={showBookingChart ? 12 : 24}>
                      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Title level={4} style={{ marginBottom: 16 }}>📈 Booking Revenue Trend</Title>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={[
                            { month: 'Jan', revenue: 0 },
                            { month: 'Feb', revenue: 0 },
                            { month: 'Mar', revenue: 0 },
                            { month: 'Apr', revenue: 0 },
                            { month: 'May', revenue: 0 },
                            { month: 'Jun', revenue: calculateCollectedRevenue() + calculateManualRevenue('collected') },
                            { month: 'Jul', revenue: 0 },
                            { month: 'Aug', revenue: 0 },
                            { month: 'Sep', revenue: 0 },
                            { month: 'Oct', revenue: 0 },
                            { month: 'Nov', revenue: 0 },
                            { month: 'Dec', revenue: 0 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="revenue" 
                              stroke="#1890ff" 
                              strokeWidth={3}
                              dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Revenue"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                  )}
                </Row>
                
                {!showBookingChart && !showRevenueChart && (
                  <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', padding: 40 }}>
                    <Title level={4} style={{ color: '#666', marginBottom: 16 }}>📊 Charts Hidden</Title>
                    <p style={{ color: '#999', marginBottom: 16 }}>
                      Charts are currently hidden. Use the toggle buttons above to show them when needed.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => setShowBookingChart(true)}
                      >
                        Show Booking Chart
                      </Button>
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => setShowRevenueChart(true)}
                      >
                        Show Revenue Chart
                      </Button>
                    </div>
                  </Card>
                )}
              </div>

              {/* Quick Actions moved to top right corner */}

                {/* Manual Revenue History */}
                {manualRevenues.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <Title level={4} style={{ marginBottom: 16 }}>💰 Manual Revenue History</Title>
                    <Table
                      dataSource={manualRevenues}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                      columns={[
                        {
                          title: 'Date',
                          dataIndex: 'date',
                          key: 'date',
                          render: (date) => new Date(date).toLocaleDateString()
                        },
                        {
                          title: 'Type',
                          dataIndex: 'type',
                          key: 'type',
                          render: (type) => (
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: type === 'collected' ? '#e6f7ff' : 
                                             type === 'upcoming' ? '#fff7e6' : '#fff2e8',
                              color: type === 'collected' ? '#1890ff' : 
                                    type === 'upcoming' ? '#fa8c16' : '#ff4d4f'
                            }}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          )
                        },
                        {
                          title: 'Amount',
                          dataIndex: 'amount',
                          key: 'amount',
                          render: (amount) => `Rs. ${amount.toLocaleString()}`
                        },
                        {
                          title: 'Description',
                          dataIndex: 'description',
                          key: 'description',
                          ellipsis: true
                        },
                        {
                          title: 'Actions',
                          key: 'actions',
                          render: (_, record) => (
                            <Space>
                              <Button 
                                size="small" 
                                type="primary"
                                onClick={() => {
                                  setManualRevenueForm({
                                    type: record.type,
                                    amount: record.amount,
                                    description: record.description,
                                    date: dayjs(record.date),
                                    editingId: record._id
                                  });
                                  setManualRevenueModal(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="small" 
                                danger
                                onClick={async () => {
                                  try {
                                    await api.delete(`/api/manual-revenue/${record._id}`, {
                                      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                                    });
                                    message.success('Revenue entry removed');
                                    fetchManualRevenue(); // Refresh the list
                                  } catch (error) {
                                    console.error('Error removing revenue entry:', error);
                                    message.error('Failed to remove revenue entry');
                                  }
                                }}
                              >
                                Remove
                              </Button>
                            </Space>
                          )
                        }
                      ]}
                    />
                  </div>
                )}

              



              {/* System Status */}
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16 }}>🔧 System Status</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <Alert
                      message="Email Notifications"
                      description="Admin notifications are active"
                      type="success"
                      showIcon
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Alert
                      message="Database Connection"
                      description="Connected and operational"
                      type="success"
                      showIcon
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Alert
                      message="Last Updated"
                      description={new Date().toLocaleString()}
                      type="info"
                      showIcon
                    />
                  </Col>
                </Row>
              </div>
            </div>
          )}
          {selected === 'banners' && renderBannersAndImages()}
          {selected === 'shopping' && <>
            {renderSection('shopping')}
            <div style={{ marginTop: 40 }}>{renderShoppingSection()}</div>
          </>}
          {selected === 'hotel-management' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4}>Hotel Hero Section</Title>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={saveHotelSection}
                  style={{ backgroundColor: '#11998e', borderColor: '#11998e' }}
                >
                  Save Hotel Section
                </Button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Heading</label>
                <Input value={hotelHeading} onChange={e => setHotelHeading(e.target.value)} placeholder="Hotel Heading" style={{ marginBottom: 8 }} />
                <label>Heading Color</label>
                <input type="color" value={hotelHeadingColor} onChange={e => setHotelHeadingColor(e.target.value)} style={{ marginLeft: 8, marginBottom: 16 }} />
                <label>Subheading</label>
                <Input value={hotelSubheading} onChange={e => setHotelSubheading(e.target.value)} placeholder="Hotel Subheading" style={{ marginBottom: 8 }} />
                <label>Subheading Color</label>
                <input type="color" value={hotelSubheadingColor} onChange={e => setHotelSubheadingColor(e.target.value)} style={{ marginLeft: 8, marginBottom: 16 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Images</label>
                <List
                  grid={{ gutter: 16, column: 3 }}
                  dataSource={hotelImages}
                  renderItem={img => (
                    <List.Item>
                      <div style={{ position: 'relative' }}>
                        <img src={img} alt="Hotel" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                        <Button
                          icon={<DeleteOutlined />}
                          size="small"
                          danger
                          style={{ position: 'absolute', top: 4, right: 4 }}
                          onClick={async () => {
                            setHotelImages(hotelImages.filter(i => i !== img));
                            // Also remove from service card images
                            if (settings) {
                              const updated = { ...settings };
                              const hotelService = updated.services.find(s => s.name === 'Hotel & Room Booking');
                              if (hotelService) {
                                hotelService.images = hotelService.images.filter(i => i !== img);
                                await api.put('/api/settings', updated, {
                                  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                                });
                              }
                            }
                          }}
                        />
                      </div>
                    </List.Item>
                  )}
                />
                <Upload beforeUpload={async (file) => {
                  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                  const res = await fetch(url, { method: 'POST', body: formData });
                  const data = await res.json();
                  if (data.secure_url) {
                    setHotelImages([...hotelImages, data.secure_url]);
                    // Also add to service card images
                    if (settings) {
                      const updated = { ...settings };
                      const hotelService = updated.services.find(s => s.name === 'Hotel & Room Booking');
                      if (hotelService) {
                        hotelService.images = hotelService.images || [];
                        hotelService.images.push(data.secure_url);
                        await api.put('/api/settings', updated, {
                          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                        });
                      }
                    }
                  }
                  return false;
                }} showUploadList={false} accept="image/*">
                  <Button icon={<PlusOutlined />}>Upload Image</Button>
                </Upload>
              </div>
              <div style={{ marginBottom: 32 }}>
                <Typography.Title level={5}>Amenities</Typography.Title>
                <ul style={{ marginBottom: 12 }}>
                  {hotelAmenities.map((am, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span>{am}</span>
                      <Button size="small" danger onClick={() => setHotelAmenities(hotelAmenities.filter((_, i) => i !== idx))}>Delete</Button>
                    </li>
                  ))}
                </ul>
                <Input
                  value={newHotelAmenity}
                  onChange={e => setNewHotelAmenity(e.target.value)}
                  placeholder="Add new amenity"
                  style={{ width: 240, marginRight: 8 }}
                  onPressEnter={() => {
                    if (!newHotelAmenity.trim()) return;
                    setHotelAmenities([...hotelAmenities, newHotelAmenity.trim()]);
                    setNewHotelAmenity("");
                  }}
                />
                <Button type="primary" onClick={() => {
                  if (!newHotelAmenity.trim()) return;
                  setHotelAmenities([...hotelAmenities, newHotelAmenity.trim()]);
                  setNewHotelAmenity("");
                }}>Add</Button>
              </div>
              <div style={{ maxWidth: 600, marginBottom: 32 }}>
                <Typography.Title level={5}>Special Offer (optional)</Typography.Title>
                <Input
                  value={hotelSpecialOffer}
                  onChange={e => setHotelSpecialOffer(e.target.value)}
                  placeholder="Special offer text (e.g., 20% off on your first booking!)"
                  style={{ marginBottom: 8 }}
                />
                <Input
                  value={hotelSpecialOfferLink}
                  onChange={e => setHotelSpecialOfferLink(e.target.value)}
                  placeholder="Special offer link (optional)"
                  style={{ marginBottom: 8 }}
                />
              </div>
              <Button type="primary" style={{ marginTop: 40, marginBottom: 16 }} onClick={() => {
                setRoomFormData({ name: '', description: '', price: '', capacity: 1, amenities: [], images: [], isAvailable: true, type: '', beds: '', maxGuests: '', size: '', discountedPrice: '', breakfastIncluded: false, breakfastPrice: '', cancellationPolicy: '', view: '', newAmenity: '' });
                setEditingRoomId(null);
                setRoomDrawerOpen(true);
              }}>Add New Room</Button>
              <Drawer
                title={editingRoomId ? "Edit Room" : "Add New Room"}
                placement="right"
                width={420}
                onClose={() => { setRoomDrawerOpen(false); setEditingRoomId(null); }}
                open={roomDrawerOpen}
              >
                <form onSubmit={handleAddRoom}>
                  <div style={{ marginBottom: 12 }}>
                    <label>Name</label>
                    <Input value={roomFormData.name} onChange={e => setRoomFormData({ ...roomFormData, name: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>Category</label>
                    <select value={roomFormData.category} onChange={e => setRoomFormData({ ...roomFormData, category: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} required>
                      <option value="" disabled>Select category</option>
                      {ROOM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>Type</label>
                    <select value={roomFormData.type} onChange={e => setRoomFormData({ ...roomFormData, type: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} required>
                      <option value="" disabled>Select type</option>
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>Beds</label>
                    <select value={roomFormData.beds} onChange={e => setRoomFormData({ ...roomFormData, beds: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} required>
                      <option value="" disabled>Select beds</option>
                      {BED_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>View</label>
                    <select value={roomFormData.view} onChange={e => setRoomFormData({ ...roomFormData, view: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                      <option value="" disabled>Select view</option>
                      {VIEWS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>Max Guests</label>
                    <Input type="number" min={1} value={roomFormData.maxGuests} onChange={e => setRoomFormData({ ...roomFormData, maxGuests: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>Size (m²)</label>
                    <Input type="number" min={1} value={roomFormData.size} onChange={e => setRoomFormData({ ...roomFormData, size: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>Price (LKR)</label>
                    <Input type="number" min={0} value={roomFormData.price} onChange={e => setRoomFormData({ ...roomFormData, price: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>Discounted Price (LKR)</label>
                    <Input type="number" min={0} value={roomFormData.discountedPrice} onChange={e => setRoomFormData({ ...roomFormData, discountedPrice: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>Amenities</label>
                    <div style={{ marginBottom: 8 }}>
                      <ul style={{ marginBottom: 8 }}>
                        {roomFormData.amenities.map((am, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span>{am}</span>
                            <Button size="small" danger onClick={() => setRoomFormData({ ...roomFormData, amenities: roomFormData.amenities.filter((_, i) => i !== idx) })}>Delete</Button>
                          </li>
                        ))}
                      </ul>
                      <Input
                        value={roomFormData.newAmenity || ''}
                        onChange={e => setRoomFormData({ ...roomFormData, newAmenity: e.target.value })}
                        placeholder="Type amenity and press Enter"
                        style={{ width: '100%', marginRight: 8 }}
                        onPressEnter={(e) => {
                          e.preventDefault();
                          if (!roomFormData.newAmenity?.trim()) return;
                          setRoomFormData({ 
                            ...roomFormData, 
                            amenities: [...roomFormData.amenities, roomFormData.newAmenity.trim()],
                            newAmenity: ''
                          });
                        }}
                      />
                      <Button 
                        type="primary" 
                        size="small"
                        style={{ marginTop: 4 }}
                        onClick={() => {
                          if (!roomFormData.newAmenity?.trim()) return;
                          setRoomFormData({ 
                            ...roomFormData, 
                            amenities: [...roomFormData.amenities, roomFormData.newAmenity.trim()],
                            newAmenity: ''
                          });
                        }}
                      >
                        Add Amenity
                      </Button>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>Images</label>
                    <Upload beforeUpload={async (file) => {
                      setRoomImageUploading(true);
                      const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                      const res = await fetch(url, { method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.secure_url) setRoomFormData({ ...roomFormData, images: [...roomFormData.images, data.secure_url] });
                      setRoomImageUploading(false);
                      return false;
                    }} showUploadList={false} accept="image/*">
                      <Button icon={<PlusOutlined />} loading={roomImageUploading}>Upload Image</Button>
                    </Upload>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      {roomFormData.images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={img} alt="Room" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                          <Button icon={<DeleteOutlined />} size="small" danger style={{ position: 'absolute', top: 2, right: 2 }} onClick={() => setRoomFormData({ ...roomFormData, images: roomFormData.images.filter((_, i) => i !== idx) })} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button type="primary" htmlType="submit" style={{ marginTop: 16, width: '100%' }} disabled={!roomFormData.name || !roomFormData.category || !roomFormData.type || !roomFormData.beds || !roomFormData.maxGuests || !roomFormData.price || !roomFormData.images.length || roomImageUploading}>
                    {editingRoomId ? 'Update Room' : 'Add Room'}
                  </Button>
                </form>
              </Drawer>
              
              {/* Category Filter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <label style={{ fontWeight: 'bold' }}>Filter by Category:</label>
                  <Select
                    value={roomCategoryFilter}
                    onChange={setRoomCategoryFilter}
                    style={{ width: 200 }}
                  >
                    <Select.Option value="all">All Categories</Select.Option>
                    {ROOM_CATEGORIES.map(category => (
                      <Select.Option key={category} value={category}>{category}</Select.Option>
                    ))}
                  </Select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    Showing {getFilteredRooms().length} of {rooms.length} rooms
                  </div>
                  <Button 
                    type="default" 
                    onClick={() => setQrCodeModal(true)} 
                    icon={<QrcodeOutlined />}
                  >
                    Room QR Codes
                  </Button>
                </div>
              </div>
              
              <Table
                dataSource={getFilteredRooms()}
                rowKey="_id"
                columns={[
                  { 
                    title: 'Image', 
                    dataIndex: 'images', 
                    width: 80,
                    render: imgs => imgs && imgs.length > 0 ? 
                      <img src={imgs[0]} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} /> : 
                      <div style={{ width: 60, height: 60, backgroundColor: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No Image</div>
                  },
                  { 
                    title: 'Room Details', 
                    dataIndex: 'name',
                    width: 200,
                    render: (name, record) => (
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>{name}</div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{record.type} • {record.beds}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Size: {record.size}m² • View: {record.view}</div>
                      </div>
                    )
                  },
                  { 
                    title: 'Category & Status', 
                    width: 150,
                    render: (_, record) => (
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            backgroundColor: record.category === 'Economy' ? '#f0f9ff' : 
                                           record.category === 'Business' ? '#f0fdf4' : '#fef3c7',
                            color: record.category === 'Economy' ? '#0369a1' : 
                                  record.category === 'Business' ? '#166534' : '#92400e',
                            border: `1px solid ${record.category === 'Economy' ? '#0369a1' : 
                                              record.category === 'Business' ? '#166534' : '#92400e'}`
                          }}>
                            {record.category}
                          </span>
                        </div>
                        <div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            backgroundColor: record.status === 'Available' ? '#f6ffed' : 
                                           record.status === 'Cleaning' ? '#fff7e6' : '#fff2e8',
                            color: record.status === 'Available' ? '#52c41a' : 
                                  record.status === 'Cleaning' ? '#fa8c16' : '#ff4d4f',
                            border: `1px solid ${record.status === 'Available' ? '#52c41a' : 
                                              record.status === 'Cleaning' ? '#fa8c16' : '#ff4d4f'}`
                          }}>
                            {record.status}
                          </span>
                        </div>
                        {record.status === 'Cleaning' && record.cleaningEndTime && (
                          <div style={{ fontSize: 10, color: '#fa8c16', marginTop: 4 }}>
                            Ready: {new Date(record.cleaningEndTime).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    )
                  },
                  { 
                    title: 'Pricing', 
                    width: 120,
                    render: (_, record) => (
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: 14, color: '#1890ff' }}>
                          Rs. {record.price?.toLocaleString()}
                        </div>
                        {record.discountedPrice && (
                          <div style={{ fontSize: 12, color: '#52c41a', textDecoration: 'line-through' }}>
                            Rs. {record.discountedPrice?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )
                  },
                  { 
                    title: 'Capacity', 
                    width: 100,
                    render: (_, record) => (
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 'bold' }}>{record.maxGuests} Guests</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Max Capacity</div>
                      </div>
                    )
                  },
                  { 
                    title: 'Amenities', 
                    width: 200,
                    dataIndex: 'amenities', 
                    render: amenities => amenities && amenities.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>
                        {amenities.slice(0, 3).join(', ')}
                      </div>
                        {amenities.length > 3 && (
                          <div style={{ fontSize: 11, color: '#666' }}>
                            +{amenities.length - 3} more amenities
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: '#999' }}>No amenities</div>
                    )
                  },
                  {
                    title: 'Actions',
                    width: 120,
                    render: (_, rec) => (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Button 
                          size="small" 
                          onClick={() => handleEditRoom(rec)} 
                          style={{ width: '100%' }}
                        >
                          Edit
                        </Button>
                        {rec.status === 'Cleaning' && (
                          <Button 
                            size="small" 
                            type="primary"
                            onClick={async () => {
                              try {
                                await api.put(`/api/rooms/${rec._id}/mark-ready`, {}, {
                                  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                                });
                                message.success('Room marked as ready!');
                                // Refresh rooms data
                                api.get('/api/rooms').then(res => setRooms(res.data));
                              } catch (error) {
                                console.error('Error marking room as ready:', error);
                                message.error('Failed to mark room as ready');
                              }
                            }}
                            style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                          >
                            Mark Ready
                          </Button>
                        )}
                        <Popconfirm 
                          title="Delete this room?" 
                          onConfirm={() => handleDeleteRoom(rec._id)} 
                          okText="Yes" 
                          cancelText="No"
                        >
                          <Button size="small" danger style={{ width: '100%' }}>Delete</Button>
                        </Popconfirm>
                      </div>
                    )
                  }
                ]}
                pagination={false}
                style={{ marginBottom: 32, marginTop: 16 }}
                scroll={{ x: 1000 }}
                size="middle"
              />
            </div>
          )}
          {selected === 'gym' && (
            <div>
              <Title level={4}>Gym Section</Title>
              <div style={{ marginBottom: 16 }}>
                <label>Heading</label>
                <Input value={gymHeading} onChange={e => setGymHeading(e.target.value)} placeholder="Gym Heading" style={{ marginBottom: 8 }} />
                <label>Heading Color</label>
                <input type="color" value={gymHeadingColor} onChange={e => setGymHeadingColor(e.target.value)} style={{ marginLeft: 8, marginBottom: 16 }} />
                <label>Subheading</label>
                <Input value={gymSubheading} onChange={e => setGymSubheading(e.target.value)} placeholder="Gym Subheading" style={{ marginBottom: 8 }} />
                <label>Subheading Color</label>
                <input type="color" value={gymSubheadingColor} onChange={e => setGymSubheadingColor(e.target.value)} style={{ marginLeft: 8, marginBottom: 16 }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 600, marginRight: 12 }}>Show Real Amenities</label>
                <Switch
                  checked={showRealGymAmenities}
                  onChange={async (checked) => {
                    setShowRealGymAmenities(checked);
                    // Save toggle to backend
                    const updated = {
                      ...settings,
                      gymSection: {
                        ...settings.gymSection,
                        showRealGymAmenities: checked,
                      }
                    };
                    await api.put('/api/settings', updated, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
                    const res = await api.get('/api/settings');
                    setSettings(res.data);
                  }}
                  style={{ marginLeft: 8 }}
                />
                <div style={{ marginTop: 8 }}>
                  {showRealGymAmenities ? (
                    <Alert message="Showing real amenities from backend." type="success" showIcon />
                  ) : (
                    <Alert message="Showing mock amenities (not saved to backend)." type="info" showIcon />
                  )}
                </div>
              </div>
              <div style={{ marginBottom: 32 }}>
                <Typography.Title level={5}>Amenities</Typography.Title>
                <ul style={{ marginBottom: 12 }}>
                  {(showRealGymAmenities ? gymAmenities : mockGymAmenities).map((am, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span>{am}</span>
                      <Button size="small" danger onClick={() => {
                        if (showRealGymAmenities) {
                          setGymAmenities(gymAmenities.filter((_, i) => i !== idx));
                        } else {
                          const updated = mockGymAmenities.filter((_, i) => i !== idx);
                          setMockGymAmenities(updated);
                          localStorage.setItem('mockGymAmenities', JSON.stringify(updated));
                        }
                      }}>Delete</Button>
                    </li>
                  ))}
                </ul>
                <Input
                  value={newAmenity}
                  onChange={e => setNewAmenity(e.target.value)}
                  placeholder="Add new amenity"
                  style={{ width: 240, marginRight: 8 }}
                  onPressEnter={() => {
                    if (!newAmenity.trim()) return;
                    if (showRealGymAmenities) {
                      setGymAmenities([...gymAmenities, newAmenity.trim()]);
                    } else {
                      const updated = [...mockGymAmenities, newAmenity.trim()];
                      setMockGymAmenities(updated);
                      localStorage.setItem('mockGymAmenities', JSON.stringify(updated));
                    }
                    setNewAmenity("");
                  }}
                />
                <Button type="primary" onClick={() => {
                  if (!newAmenity.trim()) return;
                  if (showRealGymAmenities) {
                    setGymAmenities([...gymAmenities, newAmenity.trim()]);
                  } else {
                    const updated = [...mockGymAmenities, newAmenity.trim()];
                    setMockGymAmenities(updated);
                    localStorage.setItem('mockGymAmenities', JSON.stringify(updated));
                  }
                  setNewAmenity("");
                }}>Add</Button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Images</label>
                <List
                  grid={{ gutter: 16, column: 3 }}
                  dataSource={gymImages}
                  renderItem={img => (
                    <List.Item>
                      <div style={{ position: 'relative' }}>
                        <img src={img} alt="Gym" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                        <Button
                          icon={<DeleteOutlined />}
                          size="small"
                          danger
                          style={{ position: 'absolute', top: 4, right: 4 }}
                          onClick={() => setGymImages(gymImages.filter(i => i !== img))}
                        />
                      </div>
                    </List.Item>
                  )}
                />
                <Upload beforeUpload={async (file) => {
                  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                  const res = await fetch(url, { method: 'POST', body: formData });
                  const data = await res.json();
                  if (data.secure_url) setGymImages([...gymImages, data.secure_url]);
                  return false;
                }} showUploadList={false} accept="image/*">
                  <Button icon={<PlusOutlined />}>Upload Image</Button>
                </Upload>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 600, marginRight: 12 }}>Show Real Gym Packages</label>
                <Switch
                  checked={showRealGymPackages}
                  onChange={setShowRealGymPackages}
                  style={{ marginLeft: 8 }}
                />
                <div style={{ marginTop: 8 }}>
                  {showRealGymPackages ? (
                    <Alert message="Showing real gym packages on the gym page." type="success" showIcon />
                  ) : (
                    <Alert message="Showing mock gym packages on the gym page." type="info" showIcon />
                  )}
                </div>
              </div>
              <div style={{ maxWidth: 600, marginBottom: 32 }}>
                <Typography.Title level={5}>Special Offer (optional)</Typography.Title>
                <Input
                  value={gymSpecialOffer}
                  onChange={e => setGymSpecialOffer(e.target.value)}
                  placeholder="Special offer text (e.g., 20% off on your first month!)"
                  style={{ marginBottom: 8 }}
                />
                <Input
                  value={gymSpecialOfferLink}
                  onChange={e => setGymSpecialOfferLink(e.target.value)}
                  placeholder="Special offer link (optional)"
                  style={{ marginBottom: 8 }}
                />
                <Button type="primary" onClick={async () => {
                  const updated = {
                    ...settings,
                    gymSection: {
                      heading: gymHeading,
                      subheading: gymSubheading,
                      headingColor: gymHeadingColor,
                      subheadingColor: gymSubheadingColor,
                      images: gymImages,
                      amenities: showRealGymAmenities ? gymAmenities : settings.gymSection.amenities,
                      packages: gymPackages,
                      showRealGymPackages,
                      specialOffer: gymSpecialOffer,
                      specialOfferLink: gymSpecialOfferLink,
                    }
                  };
                  await api.put('/api/settings', updated, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
                  const res = await api.get('/api/settings');
                  setSettings(res.data);
                  message.success('Gym section updated!');
                }}>Save Special Offer</Button>
              </div>
              <div style={{ marginBottom: 32 }}>
                <Title level={5}>Gym Packages</Title>
                <Button type="primary" onClick={() => {
                  setPackageModal({ open: true, editing: null });
                  setPackageFormData({ name: '', price: '', duration: '', description: '', features: '' });
                }} style={{ marginBottom: 16 }}>Add Package</Button>
                <List
                  dataSource={showRealGymPackages ? gymPackages : mockGymPackages}
                  renderItem={(pkg, idx) => (
                    <List.Item
                      actions={showRealGymPackages ? [
                        <Button type="link" size="small" onClick={() => {
                          setPackageModal({ open: true, editing: { ...pkg, idx } });
                          setPackageFormData({ name: pkg.name, price: pkg.price, duration: pkg.duration, description: pkg.description, features: (pkg.features || []).join(', ') });
                        }}>Edit</Button>,
                        <Popconfirm title="Delete package?" onConfirm={() => {
                          const updated = [...gymPackages];
                          updated.splice(idx, 1);
                          setGymPackages(updated);
                        }}><Button type="link" size="small" danger>Delete</Button></Popconfirm>
                      ] : [
                        <Button type="link" size="small" onClick={() => {
                          setPackageModal({ open: true, editing: { ...pkg, idx } });
                          setPackageFormData({ name: pkg.name, price: pkg.price, duration: pkg.duration, description: pkg.description, features: (pkg.features || []).join(', ') });
                        }}>Edit</Button>,
                        <Popconfirm title="Delete mock package?" onConfirm={() => {
                          const updated = [...mockGymPackages];
                          updated.splice(idx, 1);
                          setMockGymPackages(updated);
                        }}><Button type="link" size="small" danger>Delete</Button></Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        title={<span style={{ color: '#11998e', fontWeight: 600 }}>{pkg.name} <span style={{ color: '#888', fontWeight: 400, fontSize: 13 }}>({pkg.duration})</span></span>}
                        description={<>
                          <span style={{ color: '#22c55e', fontWeight: 500 }}>LKR {pkg.price?.toLocaleString()}</span><br />
                          <span>{pkg.description}</span><br />
                          <span style={{ color: '#11998e', fontSize: 12 }}>Features: {(pkg.features || []).join(', ')}</span>
                        </>}
                      />
                    </List.Item>
                  )}
                />
              </div>
              <Modal
                open={packageModal.open}
                title={packageModal.editing ? 'Edit Package' : 'Add Package'}
                onCancel={() => {
                  setPackageModal({ open: false, editing: null });
                  setPackageFormData({ name: '', price: '', duration: '', description: '', features: '' });
                }}
                onOk={async () => {
                  const features = packageFormData.features.split(',').map(f => f.trim()).filter(f => f);
                  const values = {
                    name: packageFormData.name,
                    price: Number(packageFormData.price),
                    duration: packageFormData.duration,
                    description: packageFormData.description,
                    features: features,
                  };
                  if (showRealGymPackages) {
                    let updated = [...gymPackages];
                    if (packageModal.editing) {
                      updated[packageModal.editing.idx] = values;
                    } else {
                      updated.push(values);
                    }
                    setGymPackages(updated);
                  } else {
                    let updated = [...mockGymPackages];
                    if (packageModal.editing) {
                      updated[packageModal.editing.idx] = values;
                    } else {
                      updated.push(values);
                    }
                    setMockGymPackages(updated);
                  }
                  setPackageModal({ open: false, editing: null });
                  setPackageFormData({ name: '', price: '', duration: '', description: '', features: '' });
                }}
                okText="Save"
                okButtonProps={{
                  disabled: !packageFormData.name || !packageFormData.price || !packageFormData.duration || !packageFormData.description || !packageFormData.features
                }}
              >
                <Form layout="vertical">
                  <Form.Item label="Name" required>
                    <Input value={packageFormData.name} onChange={e => setPackageFormData({ ...packageFormData, name: e.target.value })} />
                  </Form.Item>
                  <Form.Item label="Price (LKR)" required>
                    <Input type="number" value={packageFormData.price} onChange={e => setPackageFormData({ ...packageFormData, price: e.target.value })} />
                  </Form.Item>
                  <Form.Item label="Duration" required>
                    <Input value={packageFormData.duration} onChange={e => setPackageFormData({ ...packageFormData, duration: e.target.value })} placeholder="e.g. Monthly, Weekly, Daily, Yearly" />
                  </Form.Item>
                  <Form.Item label="Description" required>
                    <Input.TextArea value={packageFormData.description} onChange={e => setPackageFormData({ ...packageFormData, description: e.target.value })} rows={2} />
                  </Form.Item>
                  <Form.Item label="Features (comma-separated)" required>
                    <Input value={packageFormData.features} onChange={e => setPackageFormData({ ...packageFormData, features: e.target.value })} placeholder="Feature 1, Feature 2, Feature 3" />
                  </Form.Item>
                </Form>
              </Modal>
              <Button type="primary" onClick={async () => {
                const updated = {
                  ...settings,
                  gymSection: {
                    heading: gymHeading,
                    subheading: gymSubheading,
                    headingColor: gymHeadingColor,
                    subheadingColor: gymSubheadingColor,
                    images: gymImages,
                    amenities: showRealGymAmenities ? gymAmenities : settings.gymSection.amenities,
                    packages: gymPackages,
                    showRealGymPackages,
                    specialOffer: gymSpecialOffer,
                    specialOfferLink: gymSpecialOfferLink,
                    showRealGymAmenities,
                  }
                };
                await api.put('/api/settings', updated, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
                const res = await api.get('/api/settings');
                setSettings(res.data);
                message.success('Gym section updated!');
              }}>Save Gym Section</Button>
            </div>
          )}
          {selected === 'theatre' && renderSection('theatre')}
          {selected === 'partyhall' && renderSection('partyhall')}
          {selected === 'servicecenter' && renderSection('servicecenter')}
          {(selected.startsWith('bookings-')) && (
            <div>
              <Title level={4}>
                {bookingStatusFilter === 'all' && `All Bookings (${bookings.length})`}
                {bookingStatusFilter === 'pending' && `Pending Bookings (${bookings.filter(b => b.status === 'Pending').length})`}
                {bookingStatusFilter === 'confirmed' && `Confirmed Bookings (${bookings.filter(b => b.status === 'Confirmed').length})`}
                {bookingStatusFilter === 'cancelled' && `Cancelled Bookings (${bookings.filter(b => b.status === 'Cancelled').length})`}
              </Title>
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  onClick={fetchBookings} 
                  loading={bookingLoading}
                  style={{ marginRight: 8 }}
                >
                  Refresh Bookings
                </Button>
              </div>
              
              <Table
                dataSource={getFilteredBookings()}
                loading={bookingLoading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
                columns={[
                  {
                    title: 'Customer',
                    dataIndex: 'customerName',
                    key: 'customerName',
                    render: (text, record) => (
                      <div>
                        <div><strong>{text}</strong></div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {record.customerEmail}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {record.customerPhone}
                        </div>
                      </div>
                    )
                  },
                  {
                    title: 'Room',
                    key: 'room',
                    render: (_, record) => {
                      // Handle different room data structures
                      let roomName = 'N/A';
                      let roomCategory = '';
                      
                      if (record.room) {
                        if (typeof record.room === 'object' && record.room.name) {
                          roomName = record.room.name;
                          roomCategory = record.room.category || '';
                        } else if (typeof record.room === 'string') {
                          roomName = record.room;
                        } else if (record.roomId) {
                          roomName = `Room ID: ${record.roomId}`;
                        }
                      }
                      
                      return (
                        <div style={{ fontSize: 14 }}>
                          <div style={{ fontWeight: 'bold' }}>{roomName}</div>
                          {roomCategory && (
                            <div style={{ fontSize: 12, color: '#666' }}>{roomCategory}</div>
                          )}
                        </div>
                      );
                    }
                  },
                  {
                    title: 'Dates',
                    key: 'dates',
                    render: (_, record) => (
                      <div>
                        <div>Check-in: {new Date(record.checkIn).toLocaleDateString()}</div>
                        <div>Check-out: {new Date(record.checkOut).toLocaleDateString()}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {record.nights} nights, {record.guests} guests
                        </div>
                      </div>
                    )
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'totalAmount',
                    key: 'totalAmount',
                    render: (amount) => `Rs. ${amount?.toLocaleString() || '0'}`
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: status === 'Confirmed' ? '#e6f7ff' : status === 'Cancelled' ? '#fff2e8' : '#f6ffed',
                        color: status === 'Confirmed' ? '#1890ff' : status === 'Cancelled' ? '#fa8c16' : '#52c41a'
                      }}>
                        {status}
                      </span>
                    )
                  },
                  {
                    title: 'Payment',
                    dataIndex: 'paymentStatus',
                    key: 'paymentStatus',
                    render: (paymentStatus, record) => {
                      if (record.status !== 'Confirmed') return '-';
                      return (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: paymentStatus === 'paid' ? '#f6ffed' : '#fff7e6',
                          color: paymentStatus === 'paid' ? '#52c41a' : '#fa8c16',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {paymentStatus === 'paid' ? (
                            <>
                              <CheckCircleOutlined style={{ fontSize: '12px' }} />
                              Paid
                            </>
                          ) : (
                            <>
                              <ClockCircleOutlined style={{ fontSize: '12px' }} />
                              Pending
                            </>
                          )}
                        </span>
                      );
                    }
                  },
                  {
                    title: 'Review Invitation',
                    dataIndex: 'reviewInvitationSent',
                    key: 'reviewInvitationSent',
                    render: (sent, record) => {
                      if (record.status !== 'Confirmed') return '-';
                      return (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: sent ? '#f6ffed' : '#fff2e8',
                          color: sent ? '#52c41a' : '#ff4d4f',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {sent ? (
                            <>
                              <CheckCircleOutlined style={{ fontSize: '12px' }} />
                              Sent
                            </>
                          ) : (
                            <>
                              <ClockCircleOutlined style={{ fontSize: '12px' }} />
                              Pending
                            </>
                          )}
                        </span>
                      );
                    }
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record) => (
                      <Space>
                        {record.status === 'Pending' && (
                          <Button 
                            size="small" 
                            type="primary"
                            onClick={() => handleConfirmBooking(record._id)}
                          >
                            Confirm
                          </Button>
                        )}
                        {record.status === 'Pending' && (
                          <Button 
                            size="small" 
                            danger
                            onClick={() => handleCancelBooking(record._id)}
                          >
                            Cancel
                          </Button>
                        )}
                        {record.status === 'Confirmed' && record.paymentStatus !== 'paid' && (
                          <Button 
                            size="small" 
                            type="primary"
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            onClick={() => handlePaymentPaid(record._id)}
                          >
                            💰 Payment Paid
                          </Button>
                        )}
                        <Button 
                          size="small"
                          onClick={() => setBookingModal({ open: true, booking: record })}
                        >
                          View Details
                        </Button>
                        {record.status === 'Confirmed' && !record.reviewInvitationSent && (
                          <Button 
                            size="small"
                            type="default"
                            onClick={() => handleSendReviewInvitation(record._id)}
                          >
                            Send Review Invitation
                          </Button>
                        )}
                        {record.status === 'Confirmed' && record.reviewInvitationSent && (
                          <Button 
                            size="small"
                            type="default"
                            onClick={() => handleSendReviewReminder(record._id)}
                          >
                            Send Reminder
                          </Button>
                        )}
                      </Space>
                    )
                  }
                ]}
              />
              
              {/* Booking Details Modal */}
              <Modal
                title="Booking Details"
                open={bookingModal.open}
                onCancel={() => setBookingModal({ open: false, booking: null })}
                footer={null}
                width={600}
              >
                {bookingModal.booking && (
                  <div>
                    <Row gutter={16}>
                      <Col span={12}>
                        <h4>Customer Information</h4>
                        <p><strong>Name:</strong> {bookingModal.booking.customerName}</p>
                        <p><strong>Email:</strong> {bookingModal.booking.customerEmail}</p>
                        <p><strong>Phone:</strong> {bookingModal.booking.customerPhone}</p>
                        {bookingModal.booking.customerAddress && (
                          <p><strong>Address:</strong> {bookingModal.booking.customerAddress}</p>
                        )}
                        {bookingModal.booking.specialRequests && (
                          <p><strong>Special Requests:</strong> {bookingModal.booking.specialRequests}</p>
                        )}
                      </Col>
                      <Col span={12}>
                        <h4>Booking Information</h4>
                        <p><strong>Room:</strong> {bookingModal.booking.room?.name}</p>
                        <p><strong>Check-in:</strong> {new Date(bookingModal.booking.checkIn).toLocaleDateString()}</p>
                        <p><strong>Check-out:</strong> {new Date(bookingModal.booking.checkOut).toLocaleDateString()}</p>
                        <p><strong>Nights:</strong> {bookingModal.booking.nights}</p>
                        <p><strong>Guests:</strong> {bookingModal.booking.guests}</p>
                        <p><strong>Total Amount:</strong> Rs. {(bookingModal.booking.totalAmount || bookingModal.booking.payment?.amount || bookingModal.booking.advancePaid || 0).toLocaleString()}</p>
                        <p><strong>Status:</strong> {bookingModal.booking.status}</p>
                      </Col>
                    </Row>
                  </div>
                )}
              </Modal>

              {/* Payment Modal */}
              <Modal
                title="💰 Record Payment & Apply Discount"
                open={paymentModal}
                onCancel={() => setPaymentModal(false)}
                footer={[
                  <Button key="cancel" onClick={() => setPaymentModal(false)}>
                    Cancel
                  </Button>,
                  <Button key="submit" type="primary" onClick={handlePaymentSubmit}>
                    Record Payment
                  </Button>
                ]}
                width={600}
              >
                {paymentModal.booking && (
                  <div>
                    <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', borderRadius: 8 }}>
                      <h4>Booking Summary</h4>
                      <p><strong>Customer:</strong> {paymentModal.booking.customerName}</p>
                      <p><strong>Room:</strong> {paymentModal.booking.room?.name}</p>
                      <p><strong>Original Amount:</strong> Rs. {paymentModal.booking.totalAmount?.toLocaleString() || '0'}</p>
                    </div>

                    <Form layout="vertical">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Payment Amount">
                            <InputNumber
                              style={{ width: '100%' }}
                              value={paymentForm.amount}
                              onChange={(value) => setPaymentForm({ ...paymentForm, amount: value || 0 })}
                              formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value.replace(/Rs.\s?|(,*)/g, '')}
                              min={0}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Discount Amount">
                            <InputNumber
                              style={{ width: '100%' }}
                              value={paymentForm.discountAmount}
                              onChange={(value) => {
                                const discountAmount = value || 0;
                                const percentage = paymentForm.amount > 0 ? (discountAmount / paymentForm.amount) * 100 : 0;
                                setPaymentForm({ 
                                  ...paymentForm, 
                                  discountAmount: discountAmount,
                                  discountPercentage: Math.round(percentage)
                                });
                              }}
                              formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value.replace(/Rs.\s?|(,*)/g, '')}
                              min={0}
                              max={paymentForm.amount}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Discount Percentage">
                            <InputNumber
                              style={{ width: '100%' }}
                              value={paymentForm.discountPercentage}
                              onChange={(value) => {
                                const percentage = value || 0;
                                const discountAmount = (paymentForm.amount * percentage) / 100;
                                setPaymentForm({ 
                                  ...paymentForm, 
                                  discountPercentage: percentage,
                                  discountAmount: Math.round(discountAmount)
                                });
                              }}
                              formatter={(value) => `${value}%`}
                              parser={(value) => value.replace('%', '')}
                              min={0}
                              max={100}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Final Amount">
                            <Input
                              value={`Rs. ${(paymentForm.amount - paymentForm.discountAmount).toLocaleString()}`}
                              disabled
                              style={{ backgroundColor: '#f5f5f5' }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item label="Discount Reason">
                        <Input.TextArea
                          value={paymentForm.discountReason}
                          onChange={(e) => setPaymentForm({ ...paymentForm, discountReason: e.target.value })}
                          placeholder="Reason for discount (optional)"
                          rows={2}
                        />
                      </Form.Item>

                      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#e6f7ff', borderRadius: 8 }}>
                        <h4>Payment Summary</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>Original Amount:</span>
                          <span>Rs. {paymentForm.amount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>Discount:</span>
                          <span style={{ color: '#ff4d4f' }}>-Rs. {paymentForm.discountAmount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #d9d9d9', paddingTop: 8 }}>
                          <span>Final Amount:</span>
                          <span style={{ color: '#52c41a' }}>Rs. {(paymentForm.amount - paymentForm.discountAmount).toLocaleString()}</span>
                        </div>
                      </div>
                    </Form>
                  </div>
                )}
              </Modal>
            </div>
          )}
          {selected === 'payment-history' && (
            <div>
              <Title level={2} style={{ marginBottom: 24, color: '#11998e' }}>💰 Payment History & Revenue Tracking</Title>
              
              {/* Revenue Summary Cards */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
                    padding: 20, 
                    borderRadius: 12, 
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
                      {formatCurrency(calculateTotalRevenue(revenuePeriod))}
                    </div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Total Revenue</div>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>({revenuePeriod.charAt(0).toUpperCase() + revenuePeriod.slice(1)})</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)', 
                    padding: 20, 
                    borderRadius: 12, 
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
                      {formatCurrency(calculateCollectedRevenue() + calculateManualRevenue('collected'))}
                    </div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Collected Revenue</div>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>(Paid Bookings + Manual)</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', 
                    padding: 20, 
                    borderRadius: 12, 
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
                      {formatCurrency(calculateTotalManualCosts())}
                    </div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Total Costs</div>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>(Manual Expenses)</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', 
                    padding: 20, 
                    borderRadius: 12, 
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
                      {formatCurrency(calculateNetProfit())}
                    </div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Net Profit</div>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>(Revenue - Costs)</div>
                  </div>
                </Col>
              </Row>

              {/* Period Selection */}
              <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <Select
                  value={revenuePeriod}
                  onChange={setRevenuePeriod}
                  style={{ width: 200 }}
                  options={[
                    { value: 'daily', label: '📅 Daily' },
                    { value: 'weekly', label: '📊 Weekly' },
                    { value: 'monthly', label: '📈 Monthly' },
                    { value: 'yearly', label: '📊 Yearly' }
                  ]}
                />
              </div>

              {/* Tabs for different payment categories */}
              <Tabs
                defaultActiveKey="payment-transactions"
                items={[
                  {
                    key: 'payment-transactions',
                    label: '💳 Payment Transactions',
                    children: (
                      <div>
                        <Title level={4} style={{ marginBottom: 16 }}>Complete Payment Transaction History</Title>
                        <Table
                          dataSource={bookings.filter(b => b.status === 'Confirmed').map(booking => ({
                            ...booking,
                            paymentDate: booking.paymentStatus === 'paid' ? booking.updatedAt : null,
                            paymentMethod: booking.payment?.method || 'Cash',
                            transactionId: booking.paymentReference || `BK${booking._id.slice(-6)}`,
                            originalAmount: booking.totalAmount,
                            discountAmount: booking.discountAmount || 0,
                            finalAmount: booking.finalAmount || (booking.totalAmount - (booking.discountAmount || 0))
                          }))}
                          rowKey="_id"
                          pagination={{ pageSize: 15 }}
                          columns={[
                            {
                              title: 'Transaction ID',
                              dataIndex: 'transactionId',
                              key: 'transactionId',
                              render: (id) => (
                                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1890ff' }}>
                                  {id}
                                </span>
                              )
                            },
                            {
                              title: 'Customer',
                              dataIndex: 'customerName',
                              key: 'customerName',
                              render: (text, record) => (
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>{text}</div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>{record.customerEmail}</div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>{record.customerPhone}</div>
                                </div>
                              )
                            },
                            {
                              title: 'Room',
                              dataIndex: 'room',
                              key: 'room',
                              render: (_, record) => {
                                // Handle different room data structures
                                let roomName = 'N/A';
                                let roomCategory = '';
                                
                                if (record.room) {
                                  if (typeof record.room === 'object' && record.room.name) {
                                    roomName = record.room.name;
                                    roomCategory = record.room.category || '';
                                  } else if (typeof record.room === 'string') {
                                    roomName = record.room;
                                  } else if (record.roomId) {
                                    roomName = `Room ID: ${record.roomId}`;
                                  }
                                }
                                
                                return (
                                  <div style={{ fontSize: 14 }}>
                                    <div style={{ fontWeight: 'bold' }}>{roomName}</div>
                                    {roomCategory && (
                                      <div style={{ fontSize: 12, color: '#666' }}>{roomCategory}</div>
                                    )}
                                  </div>
                                );
                              }
                            },
                            {
                              title: 'Payment Date',
                              dataIndex: 'paymentDate',
                              key: 'paymentDate',
                              render: (date, record) => {
                                if (record.paymentStatus === 'paid') {
                                  return (
                                    <div>
                                      <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
                                        {new Date(date).toLocaleDateString()}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#666' }}>
                                        {new Date(date).toLocaleTimeString()}
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <span style={{ color: '#fa8c16', fontStyle: 'italic' }}>
                                    Pending
                                  </span>
                                );
                              },
                              sorter: (a, b) => new Date(a.paymentDate || 0) - new Date(b.paymentDate || 0),
                              defaultSortOrder: 'descend'
                            },
                            {
                              title: 'Payment Method',
                              dataIndex: 'paymentMethod',
                              key: 'paymentMethod',
                              render: (method) => (
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  backgroundColor: method === 'Cash' ? '#f6ffed' : '#e6f7ff',
                                  color: method === 'Cash' ? '#52c41a' : '#1890ff'
                                }}>
                                  {method}
                                </span>
                              )
                            },
                            {
                              title: 'Amount Details',
                              key: 'amountDetails',
                              render: (_, record) => (
                                <div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>
                                    Original: Rs. {record.originalAmount?.toLocaleString()}
                                  </div>
                                  {record.discountAmount > 0 && (
                                    <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                                      Discount: -Rs. {record.discountAmount.toLocaleString()}
                                    </div>
                                  )}
                                  <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
                                    Final: Rs. {record.finalAmount?.toLocaleString()}
                                  </div>
                                </div>
                              )
                            },
                            {
                              title: 'Payment Status',
                              dataIndex: 'paymentStatus',
                              key: 'paymentStatus',
                              render: (status) => (
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  backgroundColor: status === 'paid' ? '#f6ffed' : '#fff7e6',
                                  color: status === 'paid' ? '#52c41a' : '#fa8c16'
                                }}>
                                  {status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                </span>
                              ),
                              filters: [
                                { text: 'Paid', value: 'paid' },
                                { text: 'Pending', value: 'pending' }
                              ],
                              onFilter: (value, record) => record.paymentStatus === value
                            },
                            {
                              title: 'Actions',
                              key: 'actions',
                              render: (_, record) => (
                                <Space>
                                  {record.paymentStatus !== 'paid' && (
                                    <Button 
                                      size="small" 
                                      type="primary"
                                      onClick={() => handlePaymentPaid(record._id)}
                                    >
                                      Mark Paid
                                    </Button>
                                  )}
                                  <Button 
                                    size="small"
                                    onClick={() => {
                                      // View booking details
                                      setSelected('bookings-all');
                                    }}
                                  >
                                    View
                                  </Button>
                                </Space>
                              )
                            }
                          ]}
                        />
                      </div>
                    )
                  },
                  {
                    key: 'manual-revenue',
                    label: '💰 Manual Revenue',
                    children: (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <Title level={4}>Manual Revenue History</Title>
                          <Button 
                            type="primary" 
                            onClick={() => setManualRevenueModal(true)}
                            icon={<PlusOutlined />}
                          >
                            Add Revenue Entry
                          </Button>
                        </div>
                        <Table
                          dataSource={manualRevenues}
                          rowKey="id"
                          pagination={{ pageSize: 10 }}
                          columns={[
                            {
                              title: 'Date',
                              dataIndex: 'date',
                              key: 'date',
                              render: (date) => new Date(date).toLocaleDateString(),
                              sorter: (a, b) => new Date(a.date) - new Date(b.date),
                              defaultSortOrder: 'descend'
                            },
                            {
                              title: 'Type',
                              dataIndex: 'type',
                              key: 'type',
                              render: (type) => (
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  backgroundColor: type === 'collected' ? '#e6f7ff' : 
                                                 type === 'upcoming' ? '#fff7e6' : '#fff2e8',
                                  color: type === 'collected' ? '#1890ff' : 
                                        type === 'upcoming' ? '#fa8c16' : '#ff4d4f'
                                }}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </span>
                              ),
                              filters: [
                                { text: 'Collected', value: 'collected' },
                                { text: 'Upcoming', value: 'upcoming' }
                              ],
                              onFilter: (value, record) => record.type === value
                            },
                            {
                              title: 'Amount',
                              dataIndex: 'amount',
                              key: 'amount',
                              render: (amount, record) => (
                                <span style={{ 
                                  color: '#52c41a',
                                  fontWeight: 'bold'
                                }}>
                                  +Rs. {amount.toLocaleString()}
                                </span>
                              ),
                              sorter: (a, b) => a.amount - b.amount
                            },
                            {
                              title: 'Description',
                              dataIndex: 'description',
                              key: 'description',
                              ellipsis: true,
                              width: 300
                            },
                            {
                              title: 'Actions',
                              key: 'actions',
                              render: (_, record) => (
                                <Space>
                                  <Button 
                                    size="small" 
                                    type="primary"
                                    onClick={() => {
                                      setManualRevenueForm({
                                        type: record.type,
                                        amount: record.amount,
                                        description: record.description,
                                        date: dayjs(record.date),
                                        editingId: record._id
                                      });
                                      setManualRevenueModal(true);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    size="small" 
                                    danger
                                    onClick={async () => {
                                      try {
                                        await api.delete(`/api/manual-revenue/${record._id}`, {
                                          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                                        });
                                        message.success('Revenue entry removed');
                                        fetchManualRevenue(); // Refresh the list
                                      } catch (error) {
                                        console.error('Error removing revenue entry:', error);
                                        message.error('Failed to remove revenue entry');
                                      }
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </Space>
                              )
                            }
                          ]}
                        />
                      </div>
                    )
                  },
                  {
                    key: 'booking-discounts',
                    label: '🎫 Booking Discounts',
                    children: (
                      <div>
                        <Title level={4} style={{ marginBottom: 16 }}>Discounts Applied to Bookings</Title>
                        <Table
                          dataSource={bookings.filter(b => b.discountAmount > 0)}
                          rowKey="_id"
                          pagination={{ pageSize: 10 }}
                          columns={[
                            {
                              title: 'Customer',
                              dataIndex: 'customerName',
                              key: 'customerName',
                              render: (text, record) => (
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>{text}</div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>{record.customerEmail}</div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>{record.customerPhone}</div>
                                </div>
                              )
                            },
                            {
                              title: 'Room',
                              dataIndex: 'room',
                              key: 'room',
                              render: (_, record) => {
                                // Handle different room data structures
                                let roomName = 'N/A';
                                let roomCategory = '';
                                
                                if (record.room) {
                                  if (typeof record.room === 'object' && record.room.name) {
                                    roomName = record.room.name;
                                    roomCategory = record.room.category || '';
                                  } else if (typeof record.room === 'string') {
                                    roomName = record.room;
                                  } else if (record.roomId) {
                                    roomName = `Room ID: ${record.roomId}`;
                                  }
                                }
                                
                                return (
                                  <div style={{ fontSize: 14 }}>
                                    <div style={{ fontWeight: 'bold' }}>{roomName}</div>
                                    {roomCategory && (
                                      <div style={{ fontSize: 12, color: '#666' }}>{roomCategory}</div>
                                    )}
                                  </div>
                                );
                              }
                            },
                            {
                              title: 'Original Amount',
                              dataIndex: 'totalAmount',
                              key: 'totalAmount',
                              render: (amount) => `Rs. ${amount.toLocaleString()}`
                            },
                            {
                              title: 'Discount',
                              key: 'discount',
                              render: (_, record) => (
                                <div>
                                  <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                                    -Rs. {record.discountAmount?.toLocaleString() || 0}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>
                                    ({record.discountPercentage || 0}%)
                                  </div>
                                </div>
                              )
                            },
                            {
                              title: 'Final Amount',
                              dataIndex: 'finalAmount',
                              key: 'finalAmount',
                              render: (amount) => `Rs. ${amount?.toLocaleString() || 0}`
                            },
                            {
                              title: 'Discount Reason',
                              dataIndex: 'discountReason',
                              key: 'discountReason',
                              ellipsis: true,
                              width: 200
                            },
                            {
                              title: 'Status',
                              dataIndex: 'status',
                              key: 'status',
                              render: (status) => (
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  backgroundColor: status === 'Confirmed' ? '#e6f7ff' : status === 'Cancelled' ? '#fff2e8' : '#f6ffed',
                                  color: status === 'Confirmed' ? '#1890ff' : status === 'Cancelled' ? '#fa8c16' : '#52c41a'
                                }}>
                                  {status}
                                </span>
                              )
                            }
                          ]}
                        />
                      </div>
                    )
                  },
                  {
                    key: 'revenue-analytics',
                    label: '📊 Revenue Analytics',
                    children: (
                      <div>
                        <Title level={4} style={{ marginBottom: 16 }}>Revenue Analytics & Insights</Title>
                        
                        {/* Revenue Summary by Period */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                          <Col xs={24} sm={12} md={6}>
                            <Card style={{ textAlign: 'center' }}>
                              <Statistic
                                title="Daily Revenue"
                                value={formatCurrency(calculateRevenueByPeriod('daily'))}
                                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#52c41a' }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <Card style={{ textAlign: 'center' }}>
                              <Statistic
                                title="Weekly Revenue"
                                value={formatCurrency(calculateRevenueByPeriod('weekly'))}
                                prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
                                valueStyle={{ color: '#1890ff' }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <Card style={{ textAlign: 'center' }}>
                              <Statistic
                                title="Monthly Revenue"
                                value={formatCurrency(calculateRevenueByPeriod('monthly'))}
                                prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
                                valueStyle={{ color: '#722ed1' }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <Card style={{ textAlign: 'center' }}>
                              <Statistic
                                title="Yearly Revenue"
                                value={formatCurrency(calculateRevenueByPeriod('yearly'))}
                                prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
                                valueStyle={{ color: '#fa8c16' }}
                              />
                            </Card>
                          </Col>
                        </Row>

                        {/* Payment Status Distribution */}
                        <Row gutter={[16, 16]}>
                          <Col xs={24} md={12}>
                            <Card title="Payment Status Distribution" style={{ marginBottom: 16 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                                    {bookings.filter(b => b.status === 'Confirmed' && b.paymentStatus === 'paid').length}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#666' }}>Paid</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                                    {bookings.filter(b => b.status === 'Confirmed' && b.paymentStatus !== 'paid').length}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#666' }}>Pending</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                                    {bookings.filter(b => b.status === 'Pending').length}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#666' }}>Pending Confirmation</div>
                                </div>
                              </div>
                            </Card>
                          </Col>
                          <Col xs={24} md={12}>
                            <Card title="Revenue Summary" style={{ marginBottom: 16 }}>
                              <div style={{ lineHeight: 2 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>Total Bookings:</span>
                                  <span style={{ fontWeight: 'bold' }}>{bookings.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>Confirmed Bookings:</span>
                                  <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                                    {bookings.filter(b => b.status === 'Confirmed').length}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>Total Revenue:</span>
                                  <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                    {formatCurrency(calculateCollectedRevenue())}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>Total Discounts:</span>
                                  <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                                    {formatCurrency(bookings.reduce((sum, b) => sum + (b.discountAmount || 0), 0))}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    )
                  },
                  {
                    key: 'manual-costs',
                    label: '💸 Manual Costs & Expenses',
                    children: (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <Title level={4}>Manual Costs & Expenses Tracking</Title>
                          <Button 
                            type="primary" 
                            onClick={() => setManualCostModal(true)}
                            icon={<PlusOutlined />}
                          >
                            Add Cost Entry
                          </Button>
                        </div>
                        <Table
                          dataSource={manualCosts}
                          rowKey="id"
                          pagination={{ pageSize: 10 }}
                          columns={[
                            {
                              title: 'Date',
                              dataIndex: 'date',
                              key: 'date',
                              render: (date) => new Date(date).toLocaleDateString(),
                              sorter: (a, b) => new Date(a.date) - new Date(b.date),
                              defaultSortOrder: 'descend'
                            },
                            {
                              title: 'Category',
                              dataIndex: 'category',
                              key: 'category',
                              render: (category) => (
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  backgroundColor: getCategoryColor(category),
                                  color: 'white'
                                }}>
                                  {category}
                                </span>
                              ),
                              filters: [
                                { text: 'Maintenance', value: 'Maintenance' },
                                { text: 'Utilities', value: 'Utilities' },
                                { text: 'Supplies', value: 'Supplies' },
                                { text: 'Staff', value: 'Staff' },
                                { text: 'Marketing', value: 'Marketing' },
                                { text: 'Other', value: 'Other' }
                              ],
                              onFilter: (value, record) => record.category === value
                            },
                            {
                              title: 'Amount',
                              dataIndex: 'amount',
                              key: 'amount',
                              render: (amount) => (
                                <span style={{ 
                                  color: '#ff4d4f',
                                  fontWeight: 'bold'
                                }}>
                                  -Rs. {amount.toLocaleString()}
                                </span>
                              ),
                              sorter: (a, b) => a.amount - b.amount
                            },
                            {
                              title: 'Description',
                              dataIndex: 'description',
                              key: 'description',
                              ellipsis: true,
                              width: 300
                            },
                            {
                              title: 'Payment Method',
                              dataIndex: 'paymentMethod',
                              key: 'paymentMethod',
                              render: (method) => (
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  backgroundColor: method === 'Cash' ? '#f6ffed' : '#e6f7ff',
                                  color: method === 'Cash' ? '#52c41a' : '#1890ff'
                                }}>
                                  {method}
                                </span>
                              )
                            },
                            {
                              title: 'Actions',
                              key: 'actions',
                              render: (_, record) => (
                                <Button 
                                  size="small" 
                                  danger
                                  onClick={async () => {
                                    try {
                                      await api.delete(`/api/manual-costs/${record._id}`, {
                                        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                                      });
                                      message.success('Cost entry removed');
                                      fetchManualCosts(); // Refresh the list
                                    } catch (error) {
                                      console.error('Error removing cost entry:', error);
                                      message.error('Failed to remove cost entry');
                                    }
                                  }}
                                >
                                  Remove
                                </Button>
                              )
                            }
                          ]}
                        />
                      </div>
                    )
                  }
                ]}
              />
            </div>
          )}
          {selected === 'settings' && (
            <div style={{ maxWidth: 800 }}>
              {/* AKR Group Homepage Settings */}
              <div style={{ marginBottom: 40, padding: 20, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Title level={3} style={{ color: '#22c55e', marginBottom: 20 }}>AKR Group Homepage Settings</Title>
                <div style={{ marginBottom: 16 }}>
                  <label>Hero Heading Text</label>
                  <AntInput 
                    value={akrGroupHeading} 
                    onChange={e => setAkrGroupHeading(e.target.value)} 
                    placeholder="AKR Group Hero Heading" 
                    style={{ marginBottom: 8 }} 
                  />
                  <label>Heading Color</label>
                  <input 
                    type="color" 
                    value={akrGroupHeadingColor} 
                    onChange={e => setAkrGroupHeadingColor(e.target.value)} 
                    style={{ marginLeft: 8, marginBottom: 16 }} 
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Hero Subheading Text</label>
                  <AntInput.TextArea 
                    value={akrGroupSubheading} 
                    onChange={e => setAkrGroupSubheading(e.target.value)} 
                    placeholder="AKR Group Hero Subheading" 
                    rows={3} 
                    style={{ marginBottom: 8 }} 
                  />
                  <label>Subheading Color</label>
                  <input 
                    type="color" 
                    value={akrGroupSubheadingColor} 
                    onChange={e => setAkrGroupSubheadingColor(e.target.value)} 
                    style={{ marginLeft: 8, marginBottom: 16 }} 
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Hero Banner Images</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    {akrGroupBanners.map((banner, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img 
                          src={banner} 
                          alt={`Banner ${index + 1}`} 
                          style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4 }} 
                        />
                        <Button 
                          size="small" 
                          danger 
                          style={{ position: 'absolute', top: -5, right: -5 }}
                          onClick={() => {
                            const newBanners = akrGroupBanners.filter((_, i) => i !== index);
                            setAkrGroupBanners(newBanners);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Upload 
                    beforeUpload={async (file) => {
                      const url = await handleUpload(file);
                      if (url) {
                        setAkrGroupBanners([...akrGroupBanners, url]);
                      }
                      return false;
                    }} 
                    showUploadList={false} 
                    accept="image/*"
                  >
                    <Button>Add Banner Image</Button>
                  </Upload>
                </div>
                <Button type="primary" onClick={saveAkrGroupFields}>Save AKR Group Settings</Button>
              </div>

              {/* Multi Complex Homepage Settings */}
              <div style={{ marginBottom: 40, padding: 20, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Title level={3} style={{ color: '#11998e', marginBottom: 20 }}>Multi Complex Homepage Settings</Title>
                <div style={{ marginBottom: 16 }}>
                  <label>Logo Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                    {logoUrl && (
                      <img src={logoUrl} alt="Logo Preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }} />
                    )}
                    <Upload beforeUpload={handleLogoUpload} showUploadList={false} accept="image/*" disabled={logoUploading}>
                      <Button loading={logoUploading}>Upload Logo</Button>
                    </Upload>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Heading Text</label>
                  <AntInput value={multiComplexHeading} onChange={e => setMultiComplexHeading(e.target.value)} placeholder="Multi Complex Heading" style={{ marginBottom: 8 }} />
                  <label>Heading Color</label>
                  <input type="color" value={multiComplexHeadingColor} onChange={e => setMultiComplexHeadingColor(e.target.value)} style={{ marginLeft: 8, marginBottom: 16 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Subheading Text</label>
                  <AntInput.TextArea value={multiComplexSubheading} onChange={e => setMultiComplexSubheading(e.target.value)} placeholder="Multi Complex Subheading" rows={3} style={{ marginBottom: 8 }} />
                  <label>Subheading Color</label>
                  <input type="color" value={multiComplexSubheadingColor} onChange={e => setMultiComplexSubheadingColor(e.target.value)} style={{ marginLeft: 8, marginBottom: 16 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Show Real Products on Shopping Page</label>
                  <Switch checked={showRealProducts} onChange={setShowRealProducts} style={{ marginLeft: 12 }} />
                </div>
                <Button type="primary" onClick={saveMultiComplexFields}>Save Multi Complex Settings</Button>
              </div>

                {/* Room Turnover Management Settings */}
                <div style={{ marginBottom: 40, padding: 20, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                  <Title level={3} style={{ color: '#11998e', marginBottom: 20 }}>Room Turnover Management</Title>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                      Cleaning Buffer Time (Hours)
                    </label>
                    <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
                      Time allocated for cleaning, inspection, and maintenance between check-out and next check-in.
                    </p>
                    <Select
                      value={bufferHours}
                      onChange={setBufferHours}
                      style={{ width: 200 }}
                    >
                      <Select.Option value={1}>1 Hour</Select.Option>
                      <Select.Option value={2}>2 Hours</Select.Option>
                      <Select.Option value={3}>3 Hours (Recommended)</Select.Option>
                      <Select.Option value={4}>4 Hours</Select.Option>
                      <Select.Option value={5}>5 Hours</Select.Option>
                    </Select>
                  </div>
                  <Button 
                    type="primary" 
                    onClick={async () => {
                      try {
                        await api.post('/api/rooms/settings/buffer', { bufferHours }, {
                          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                        });
                        message.success('Buffer hours updated successfully!');
                      } catch (error) {
                        console.error('Error updating buffer hours:', error);
                        message.error('Failed to update buffer hours');
                      }
                    }}
                    style={{ backgroundColor: '#11998e', borderColor: '#11998e' }}
                  >
                    Save Buffer Settings
                  </Button>
              </div>
            </div>
          )}
          {selected === 'customer-details' && <CustomerDetailsSection selected={selected} bookings={bookings} setBookings={setBookings} newCustomer={newCustomer} setNewCustomer={setNewCustomer} />}
          
          {/* Reviews Management Section */}
          {selected === 'reviews' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4}>Reviews Management</Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#666' }}>Total Reviews: {reviews.length}</span>
                </div>
              </div>
              
              {reviewsLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>Loading reviews...</div>
                </div>
              ) : (
                <Table
                  dataSource={reviews}
                  columns={[
                    {
                      title: 'Customer',
                      key: 'customer',
                      render: (_, record) => (
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{record.customerName}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{record.customerEmail}</div>
                        </div>
                      )
                    },
                    {
                      title: 'Room',
                      key: 'room',
                      render: (_, record) => {
                        // Handle different room data structures
                        let roomName = 'N/A';
                        let roomCategory = '';
                        
                        if (record.room) {
                          if (typeof record.room === 'object' && record.room.name) {
                            roomName = record.room.name;
                            roomCategory = record.room.category || '';
                          } else if (typeof record.room === 'string') {
                            roomName = record.room;
                          } else if (record.roomId) {
                            // Fallback to roomId if room object is not populated
                            roomName = `Room ID: ${record.roomId}`;
                          }
                        }
                        
                        return (
                          <div style={{ fontSize: 14 }}>
                            <div style={{ fontWeight: 'bold' }}>{roomName}</div>
                            {roomCategory && (
                              <div style={{ fontSize: 12, color: '#666' }}>{roomCategory}</div>
                            )}
                          </div>
                        );
                      }
                    },
                    {
                      title: 'Rating',
                      key: 'rating',
                      render: (_, record) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontWeight: 'bold' }}>{record.rating}/5</span>
                          <div style={{ display: 'flex', gap: 1 }}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={{ color: i < record.rating ? '#fbbf24' : '#d1d5db' }}>★</span>
                            ))}
                          </div>
                        </div>
                      )
                    },
                    {
                      title: 'Review',
                      key: 'review',
                      render: (_, record) => (
                        <div style={{ maxWidth: 300 }}>
                          <div style={{ fontSize: 14, lineHeight: 1.4 }}>
                            {record.review.length > 100 
                              ? `${record.review.substring(0, 100)}...` 
                              : record.review
                            }
                          </div>
                        </div>
                      )
                    },
                    {
                      title: 'Stay Date',
                      key: 'stayDate',
                      render: (_, record) => (
                        <div style={{ fontSize: 14 }}>
                          {new Date(record.stayDate).toLocaleDateString()}
                        </div>
                      )
                    },
                    {
                      title: 'Created',
                      key: 'createdAt',
                      render: (_, record) => (
                        <div style={{ fontSize: 14 }}>
                          {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      )
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_, record) => (
                        <Space>
                          <Popconfirm
                            title="Delete this review?"
                            description="This action cannot be undone."
                            onConfirm={() => handleDeleteReview(record._id)}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                          >
                            <Button type="primary" danger size="small">
                              Delete
                            </Button>
                          </Popconfirm>
                        </Space>
                      )
                    }
                  ]}
                  rowKey="_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reviews`
                  }}
                />
              )}
            </div>
          )}
          
          {/* Customer Add Modal */}
          <Modal
            title="Add Customer to Booking"
            open={customerModal.open}
            onCancel={() => {
              setCustomerModal({ open: false, bookingId: null });
              setNewCustomer({ name: '', email: '', phone: '', address: '', age: '', relationship: '' });
            }}
            onOk={() => handleAddCustomerToBooking(customerModal.bookingId)}
            okText="Add Customer"
            okButtonProps={{
              disabled: !newCustomer.name || !newCustomer.email || !newCustomer.phone || !customerModal.bookingId
            }}
            width={600}
          >
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: '#666', marginBottom: 16 }}>
                Add a new customer to an existing booking. Please select a booking and fill in the customer details.
              </p>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  Select Booking *
                </label>
                <Select
                  placeholder="Choose a booking"
                  style={{ width: '100%' }}
                  value={customerModal.bookingId}
                  onChange={(value) => setCustomerModal({ ...customerModal, bookingId: value })}
                >
                  {bookings.map(booking => (
                    <Select.Option key={booking._id} value={booking._id}>
                      {booking.customerName} - {booking.room?.name} ({new Date(booking.checkIn).toLocaleDateString()})
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Full Name *" required>
                    <Input
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email *" required>
                    <Input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Phone *" required>
                    <Input
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Age">
                    <InputNumber
                      value={newCustomer.age}
                      onChange={(value) => setNewCustomer({ ...newCustomer, age: value })}
                      placeholder="Enter age"
                      style={{ width: '100%' }}
                      min={1}
                      max={120}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="Address">
                <Input.TextArea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="Enter address"
                  rows={2}
                />
              </Form.Item>
              
              <Form.Item label="Relationship">
                <Input
                  value={newCustomer.relationship}
                  onChange={(e) => setNewCustomer({ ...newCustomer, relationship: e.target.value })}
                  placeholder="e.g., Spouse, Child, Friend"
                />
              </Form.Item>
            </Form>
          </Modal>
          
          {/* Discount Modal */}
          <Modal
            title="Apply Discount"
            open={discountModal}
            onCancel={() => {
              setDiscountModal(false);
              setDiscountForm({ type: 'percentage', value: 0, reason: '' });
            }}
            onOk={handleApplyDiscount}
            okText="Apply Discount"
            okButtonProps={{
              disabled: !discountForm.value || !discountForm.reason || !discountModal.booking
            }}
            width={500}
          >
            {discountModal.booking && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: '#666', marginBottom: 16 }}>
                  Apply discount to booking: <strong>{discountModal.booking.customerName}</strong>
                </p>
                <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>
                    <strong>Original Amount:</strong> Rs. {discountModal.booking.totalAmount?.toLocaleString()}
                  </div>
                  {discountModal.booking.discountAmount > 0 && (
                    <div style={{ fontSize: 14, marginBottom: 4, color: '#dc3545' }}>
                      <strong>Current Discount:</strong> Rs. {discountModal.booking.discountAmount?.toLocaleString()} ({discountModal.booking.discountPercentage}%)
                    </div>
                  )}
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: '#11998e' }}>
                    <strong>Final Amount:</strong> Rs. {(discountModal.booking.finalAmount || discountModal.booking.totalAmount)?.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Discount Type *" required>
                    <Select
                      value={discountForm.type}
                      onChange={(value) => setDiscountForm({ ...discountForm, type: value })}
                      style={{ width: '100%' }}
                    >
                      <Select.Option value="percentage">Percentage (%)</Select.Option>
                      <Select.Option value="amount">Fixed Amount (Rs.)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={`Discount ${discountForm.type === 'percentage' ? '(%)' : '(Rs.)'} *`} required>
                    <InputNumber
                      value={discountForm.value}
                      onChange={(value) => setDiscountForm({ ...discountForm, value })}
                      style={{ width: '100%' }}
                      min={0}
                      max={discountForm.type === 'percentage' ? 100 : discountModal.booking?.totalAmount}
                      placeholder={discountForm.type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="Reason for Discount *" required>
                <Input.TextArea
                  value={discountForm.reason}
                  onChange={(e) => setDiscountForm({ ...discountForm, reason: e.target.value })}
                  placeholder="Enter reason for discount (e.g., Loyalty discount, Special offer, etc.)"
                  rows={3}
                />
              </Form.Item>
              
              {discountForm.value > 0 && (
                <div style={{ background: '#f6ffed', padding: 12, borderRadius: 8, marginTop: 16 }}>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>
                    <strong>Discount Preview:</strong>
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>
                    {discountForm.type === 'percentage' ? (
                      <>Discount Amount: Rs. {((discountModal.booking?.totalAmount || 0) * discountForm.value / 100).toLocaleString()}</>
                    ) : (
                      <>Discount Percentage: {((discountForm.value / (discountModal.booking?.totalAmount || 1)) * 100).toFixed(1)}%</>
                    )}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: '#11998e' }}>
                    New Final Amount: Rs. {
                      discountForm.type === 'percentage' 
                        ? ((discountModal.booking?.totalAmount || 0) * (1 - discountForm.value / 100)).toLocaleString()
                        : ((discountModal.booking?.totalAmount || 0) - discountForm.value).toLocaleString()
                    }
                  </div>
                </div>
              )}
            </Form>
          </Modal>
          
          {/* QR Code Generator Modal */}
          <QRCodeGenerator 
            visible={qrCodeModal}
            onClose={() => setQrCodeModal(false)}
          />

          {/* Manual Revenue Modal */}
          <Modal
            title={manualRevenueForm.editingId ? "Edit Manual Revenue Entry" : "Add Manual Revenue Entry"}
            open={manualRevenueModal}
            onCancel={() => {
              setManualRevenueModal(false);
              setManualRevenueForm({ type: 'collected', amount: 0, description: '', date: dayjs() });
            }}
            onOk={handleAddManualRevenue}
            okText={manualRevenueForm.editingId ? "Update Revenue" : "Add Revenue"}
            okButtonProps={{
              disabled: !manualRevenueForm.amount || !manualRevenueForm.description
            }}
            width={500}
          >
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Revenue Type *" required>
                    <Select
                      value={manualRevenueForm.type}
                      onChange={(value) => setManualRevenueForm({ ...manualRevenueForm, type: value })}
                      style={{ width: '100%' }}
                    >
                      <Select.Option value="collected">Collected</Select.Option>
                      <Select.Option value="upcoming">Upcoming</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Amount (Rs.) *" required>
                    <InputNumber
                      value={manualRevenueForm.amount}
                      onChange={(value) => setManualRevenueForm({ ...manualRevenueForm, amount: value })}
                      style={{ width: '100%' }}
                      min={0}
                      placeholder="Enter amount"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="Description *" required>
                <Input.TextArea
                  value={manualRevenueForm.description}
                  onChange={(e) => setManualRevenueForm({ ...manualRevenueForm, description: e.target.value })}
                  placeholder="Enter description (e.g., Cash payment, Bank transfer, Special discount, etc.)"
                  rows={3}
                />
              </Form.Item>
              
              <Form.Item label="Date">
                <DatePicker
                  value={manualRevenueForm.date}
                  onChange={(date) => setManualRevenueForm({ ...manualRevenueForm, date: date })}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Form>
          </Modal>

          {/* Manual Cost Modal */}
          <Modal
            title="Add Manual Cost Entry"
            open={manualCostModal}
            onCancel={() => {
              setManualCostModal(false);
              setManualCostForm({ category: 'Maintenance', amount: 0, description: '', date: dayjs(), paymentMethod: 'Cash' });
            }}
            onOk={handleAddManualCost}
            okText="Add Cost"
            okButtonProps={{
              disabled: !manualCostForm.amount || !manualCostForm.description
            }}
            width={500}
          >
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Cost Category *" required>
                    <Select
                      value={manualCostForm.category}
                      onChange={(value) => setManualCostForm({ ...manualCostForm, category: value })}
                      style={{ width: '100%' }}
                    >
                      <Select.Option value="Maintenance">Maintenance</Select.Option>
                      <Select.Option value="Utilities">Utilities</Select.Option>
                      <Select.Option value="Supplies">Supplies</Select.Option>
                      <Select.Option value="Staff">Staff</Select.Option>
                      <Select.Option value="Marketing">Marketing</Select.Option>
                      <Select.Option value="Other">Other</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Amount (Rs.) *" required>
                    <InputNumber
                      value={manualCostForm.amount}
                      onChange={(value) => setManualCostForm({ ...manualCostForm, amount: value })}
                      style={{ width: '100%' }}
                      min={0}
                      placeholder="Enter amount"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="Description *" required>
                <Input.TextArea
                  value={manualCostForm.description}
                  onChange={(e) => setManualCostForm({ ...manualCostForm, description: e.target.value })}
                  placeholder="Enter description (e.g., AC repair, Electricity bill, Cleaning supplies, etc.)"
                  rows={3}
                />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Date">
                    <DatePicker
                      value={manualCostForm.date}
                      onChange={(date) => setManualCostForm({ ...manualCostForm, date: date })}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Payment Method">
                    <Select
                      value={manualCostForm.paymentMethod}
                      onChange={(value) => setManualCostForm({ ...manualCostForm, paymentMethod: value })}
                      style={{ width: '100%' }}
                    >
                      <Select.Option value="Cash">Cash</Select.Option>
                      <Select.Option value="Card">Card</Select.Option>
                      <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
                      <Select.Option value="Other">Other</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard; 