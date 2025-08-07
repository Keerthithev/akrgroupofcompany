import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Button, Typography, Upload, message, Input, Modal, List, Space, Row, Col, Empty, Spin, Table, Form, InputNumber, Popconfirm, Switch, Alert, Drawer } from "antd";
import { Input as AntInput } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  HomeOutlined,
  TrophyOutlined,
  VideoCameraOutlined,
  GiftOutlined,
  ToolOutlined,
  PictureOutlined,
  SettingOutlined,
  LogoutOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import api from "../lib/axios";
import { DatePicker, Select } from 'antd';

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
    ]
  },
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
const BED_TYPES = ['1 double', '2 single', '1 king', '2 queen', '1 single'];
const VIEWS = ['Garden', 'Sea', 'City', 'Mountain', 'Pool', 'Paddy'];
const AMENITIES = [
  'Free WiFi', 'Air Conditioning', 'Balcony', 'Private Bathroom', 'Breakfast Included',
  'TV', 'Mini Bar', 'Room Service', 'Swimming Pool', 'Parking', 'Laundry Service',
  'Tea/Coffee Maker', 'Electric Kettle', 'Desk', 'Seating Area', 'Fan', 'Mosquito Net',
];

// Move this OUTSIDE AdminDashboard:
function CustomerDetailsSection({ selected }) {
  const [bookings, setBookings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editingBookingId, setEditingBookingId] = React.useState(null);
  const [newCustomer, setNewCustomer] = React.useState({ name: '', email: '', phone: '', address: '', age: '', relationship: '' });
  const [addingToBookingId, setAddingToBookingId] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [date, setDate] = React.useState(null);
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
          onChange={setDate}
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
                        <Space direction="vertical" size={0}>
                          <span><b>Name:</b> {customer.name}</span>
                          {customer.email && <span><b>Email:</b> {customer.email}</span>}
                          {customer.phone && <span><b>Phone:</b> {customer.phone}</span>}
                          {customer.address && <span><b>Address:</b> {customer.address}</span>}
                          {customer.age && <span><b>Age:</b> {customer.age}</span>}
                          {customer.relationship && <span><b>Relationship:</b> {customer.relationship}</span>}
                        </Space>
                        <Button danger size="small" style={{ marginLeft: 16 }} onClick={() => handleDeleteCustomer(booking._id, idx)}>Delete</Button>
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
  const [selected, setSelected] = useState('dashboard');
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
  const [akrGroupSubheadingColor, setAkrGroupSubheadingColor] = useState("#fff");
  const [akrGroupBanners, setAkrGroupBanners] = useState([]);

  // Multi Complex Homepage settings (renamed from homepage settings)
  const [multiComplexHeading, setMultiComplexHeading] = useState("");
  const [multiComplexSubheading, setMultiComplexSubheading] = useState("");
  const [multiComplexHeadingColor, setMultiComplexHeadingColor] = useState("#22c55e");
  const [multiComplexSubheadingColor, setMultiComplexSubheadingColor] = useState("#fff");

  // Room management state
  const [rooms, setRooms] = useState([]);
  const [roomModal, setRoomModal] = useState({ open: false, editing: null });
  const [roomFormData, setRoomFormData] = useState({ name: '', description: '', price: '', capacity: 1, amenities: [], images: [], isAvailable: true, type: '', beds: '', maxGuests: '', size: '', discountedPrice: '', breakfastIncluded: false, breakfastPrice: '', cancellationPolicy: '', view: '', newAmenity: '' });
  const [roomImageUploading, setRoomImageUploading] = useState(false);
  const [roomImageInput, setRoomImageInput] = useState('');
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  
  // Booking management state
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingModal, setBookingModal] = useState({ open: false, booking: null });
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'cancelled'

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
      // Update booking status to confirmed
      await api.patch(`/api/bookings/${bookingId}/status`, 
        { status: 'Confirmed' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );
      
      // Send confirmation email
      const booking = bookings.find(b => b._id === bookingId);
      if (booking) {
        await api.post('/api/bookings/send-confirmation', {
          bookingId: booking._id,
          customerEmail: booking.customerEmail,
          customerName: booking.customerName
        });
      }
      
      message.success('Booking confirmed and email sent!');
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error confirming booking:', error);
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

  useEffect(() => {
    if (selected === 'hotel-management') {
      api.get('/api/rooms').then(res => setRooms(res.data));
    }
    if (selected.startsWith('bookings-')) {
      const status = selected.replace('bookings-', '');
      setBookingStatusFilter(status);
      fetchBookings();
    }
  }, [selected]);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await api.get('/api/settings');
      setSettings(res.data);
    };
    fetchSettings();
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
      setRoomFormData({ name: '', description: '', price: '', capacity: 1, amenities: [], images: [], isAvailable: true, type: '', beds: '', maxGuests: '', size: '', discountedPrice: '', breakfastIncluded: false, breakfastPrice: '', cancellationPolicy: '', view: '', newAmenity: '' });
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div className="p-4 text-center">
          <Title level={4} style={{ margin: 0, color: '#11998e' }}>Admin Panel</Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          onClick={({ key }) => setSelected(key)}
          style={{ height: '100%', borderRight: 0 }}
          items={SECTIONS.map(s => {
            if (s.children) {
              return {
                key: s.key,
                icon: s.icon,
                label: s.label,
                children: s.children.map(child => ({
                  key: child.key,
                  label: child.label
                }))
              };
            }
            return { key: s.key, icon: s.icon, label: s.label };
          })}
        />
        <div className="p-4">
          <Button icon={<LogoutOutlined />} block danger onClick={handleLogout}>Logout</Button>
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 24px' }}>
          <Title level={3} style={{ margin: 0, color: '#11998e' }}>
            {selected.startsWith('bookings-') || selected === 'hotel-management'
              ? SECTIONS.find(s => s.key === 'hotel')?.children?.find(c => c.key === selected)?.label || 'Hotel Management'
              : SECTIONS.find(s => s.key === selected)?.label || 'Admin Panel'
            }
          </Title>
        </Header>
        <Content style={{ margin: 0, padding: 24, background: '#fff', minHeight: 360 }}>
          {selected === 'dashboard' && <div>Dashboard stats and overview here.</div>}
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
                  <Button type="primary" htmlType="submit" style={{ marginTop: 16, width: '100%' }} disabled={!roomFormData.name || !roomFormData.type || !roomFormData.beds || !roomFormData.maxGuests || !roomFormData.price || !roomFormData.images.length || roomImageUploading}>
                    {editingRoomId ? 'Update Room' : 'Add Room'}
                  </Button>
                </form>
              </Drawer>
              <Table
                dataSource={rooms}
                rowKey="_id"
                columns={[
                  { title: 'Image', dataIndex: 'images', render: imgs => imgs && imgs.length > 0 ? <img src={imgs[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} /> : 'No Image' },
                  { title: 'Name', dataIndex: 'name' },
                  { title: 'Description', dataIndex: 'description', ellipsis: true },
                  { title: 'Price', dataIndex: 'price', render: p => `LKR ${p}` },
                  { title: 'Capacity', dataIndex: 'capacity' },
                  { title: 'Available', dataIndex: 'isAvailable', render: v => v ? 'Yes' : 'No' },
                  { title: 'Type', dataIndex: 'type' },
                  { title: 'Beds', dataIndex: 'beds' },
                  { title: 'Max Guests', dataIndex: 'maxGuests' },
                  { title: 'Size', dataIndex: 'size' },
                  { title: 'Discounted Price', dataIndex: 'discountedPrice', render: p => p ? `LKR ${p}` : 'N/A' },
                  { title: 'View', dataIndex: 'view' },
                  { 
                    title: 'Amenities', 
                    dataIndex: 'amenities', 
                    render: amenities => amenities && amenities.length > 0 ? (
                      <div style={{ maxWidth: 200 }}>
                        {amenities.slice(0, 3).join(', ')}
                        {amenities.length > 3 && ` +${amenities.length - 3} more`}
                      </div>
                    ) : 'None'
                  },
                  {
                    title: 'Actions',
                    render: (_, rec) => (
                      <span>
                        <Button size="small" onClick={() => handleEditRoom(rec)} style={{ marginRight: 8 }}>Edit</Button>
                        <Popconfirm title="Delete this room?" onConfirm={() => handleDeleteRoom(rec._id)} okText="Yes" cancelText="No">
                          <Button size="small" danger>Delete</Button>
                        </Popconfirm>
                      </span>
                    )
                  }
                ]}
                pagination={false}
                style={{ marginBottom: 32, marginTop: 16 }}
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
                    dataIndex: 'room',
                    key: 'room',
                    render: (room) => room?.name || 'N/A'
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
                        {record.status === 'Confirmed' && (
                          <Button 
                            size="small" 
                            danger
                            onClick={() => handleCancelBooking(record._id)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button 
                          size="small"
                          onClick={() => setBookingModal({ open: true, booking: record })}
                        >
                          View Details
                        </Button>
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
            </div>
          )}
          {selected === 'customer-details' && <CustomerDetailsSection selected={selected} />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard; 