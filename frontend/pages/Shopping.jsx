import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/axios';
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaSearch, FaFilter, FaSyncAlt, FaSortAmountDown, FaShoppingCart, FaTag, FaBed, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Added for navigation

const features = [
  {
    icon: '🛍️',
    title: 'Diverse Retailers',
    desc: 'From global brands to unique boutiques, discover a curated selection for every taste.'
  },
  {
    icon: '🍽️',
    title: 'Food Court',
    desc: 'Savor flavors from around the world in our vibrant, family-friendly food court.'
  },
  {
    icon: '🚗',
    title: 'Ample Parking',
    desc: 'Enjoy hassle-free visits with secure parking for over 100 vehicles.'
  },
  {
    icon: '🎉',
    title: 'Events & Entertainment',
    desc: 'Experience live events, pop-up shops, and seasonal celebrations year-round.'
  },
];

// Generate 100+ mock products
const MOCK_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1517260911205-8a3bfa7b1b6b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80',
];

function getRandomImage() {
  return MOCK_PRODUCT_IMAGES[Math.floor(Math.random() * MOCK_PRODUCT_IMAGES.length)];
}

function getRandomName(i) {
  const names = [
    'Trendy Bag', 'Smart Watch', 'Classic Sunglasses', 'Bluetooth Speaker', 'Fashion T-shirt',
    'Elegant Dress', 'Running Shoes', 'Leather Wallet', 'Wireless Earbuds', 'Designer Handbag',
    'Sports Cap', 'Travel Backpack', 'Cotton Saree', 'Kids Toy', 'Home Decor', 'Perfume',
    'Wrist Band', 'Laptop Sleeve', 'Casual Shirt', 'Denim Jeans', 'Formal Shoes', 'Table Lamp',
    'Wall Art', 'Coffee Mug', 'Water Bottle', 'Fitness Tracker', 'Power Bank', 'Mobile Cover',
    'Photo Frame', 'Sunglass Case', 'Travel Pillow', 'Notebook', 'Pen Set', 'Desk Organizer',
    'Keychain', 'Hand Sanitizer', 'Face Mask', 'Gift Box', 'Jewellery Set', 'Hair Dryer',
    'Makeup Kit', 'Nail Polish', 'Bluetooth Headphones', 'Yoga Mat', 'Backpack', 'School Bag',
    'Lunch Box', 'Thermos Flask', 'Raincoat', 'Umbrella', 'Slippers', 'Sandals', 'Sneakers',
    'Sports Jersey', 'Cricket Bat', 'Football', 'Basketball', 'Badminton Racket', 'Tennis Ball',
    'Puzzle Game', 'Board Game', 'Toy Car', 'Doll', 'Building Blocks', 'RC Helicopter',
    'Drone', 'Camera', 'Tripod', 'Memory Card', 'USB Drive', 'Charger', 'Extension Cord',
    'LED Bulb', 'Table Fan', 'Iron Box', 'Mixer Grinder', 'Toaster', 'Kettle', 'Cookware Set',
    'Dinner Set', 'Cutlery', 'Serving Tray', 'Wall Clock', 'Alarm Clock', 'Bed Sheet',
    'Pillow', 'Blanket', 'Mattress', 'Curtains', 'Carpet', 'Doormat', 'Laundry Basket',
    'Shoe Rack', 'Bookshelf', 'Wardrobe', 'Mirror', 'Stool', 'Chair', 'Table', 'Sofa',
    'TV Stand', 'Recliner', 'Bean Bag', 'Ottoman', 'Footrest', 'Magazine Rack', 'Planter',
    'Vase', 'Candle Holder', 'Incense Sticks', 'Prayer Mat', 'Idol', 'Photo Album',
  ];
  return `${names[i % names.length]} ${i + 1}`;
}

function getRandomDescription() {
  const descs = [
    'A popular choice among our customers.',
    'High quality and great value.',
    'Limited stock available—grab yours now!',
    'Perfect for gifting or personal use.',
    'A must-have for your collection.',
    'Trendy, durable, and affordable.',
    'Best seller in its category.',
    'New arrival—be the first to own it!',
    'Customer favorite with excellent reviews.',
    'Designed for style and comfort.',
  ];
  return descs[Math.floor(Math.random() * descs.length)];
}

function getRandomPrice() {
  // LKR 1,000 to 50,000
  return Math.floor(Math.random() * 49000) + 1000;
}

// Supermarket-style categories
const SUPERMARKET_CATEGORIES = [
  'Chocolates', 'Ice Cream', 'Fruits', 'Vegetables', 'Rice', 'Snacks', 'Dairy', 'Beverages', 'Bakery', 'Household', 'Personal Care', 'Frozen Foods'
];

// Updated images and realistic prices for Sri Lanka
const SUPERMARKET_PRODUCTS = [
  // Chocolates
  { name: 'Milk Chocolate', category: 'Chocolates', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', price: 350 },
  { name: 'Dark Chocolate', category: 'Chocolates', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80', price: 400 },
  // Ice Cream
  { name: 'Vanilla Ice Cream', category: 'Ice Cream', image: 'https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?auto=format&fit=crop&w=400&q=80', price: 250 },
  { name: 'Chocolate Ice Cream', category: 'Ice Cream', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', price: 300 },
  // Fruits
  { name: 'Banana', category: 'Fruits', image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80', price: 120 },
  { name: 'Apple', category: 'Fruits', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80', price: 180 },
  { name: 'Orange', category: 'Fruits', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80', price: 150 },
  // Vegetables
  { name: 'Carrot', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80', price: 90 },
  { name: 'Broccoli', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80', price: 220 },
  // Rice
  { name: 'Basmati Rice', category: 'Rice', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', price: 180 },
  { name: 'Red Rice', category: 'Rice', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80', price: 160 },
  // Snacks
  { name: 'Potato Chips', category: 'Snacks', image: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80', price: 200 },
  { name: 'Salted Peanuts', category: 'Snacks', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80', price: 180 },
  // Dairy
  { name: 'Fresh Milk', category: 'Dairy', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80', price: 220 },
  { name: 'Cheddar Cheese', category: 'Dairy', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', price: 450 },
  // Beverages
  { name: 'Orange Juice', category: 'Beverages', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', price: 160 },
  { name: 'Cola Drink', category: 'Beverages', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80', price: 140 },
  // Bakery
  { name: 'White Bread', category: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159598-8b8b5c1c7c8e?auto=format&fit=crop&w=400&q=80', price: 100 },
  { name: 'Croissant', category: 'Bakery', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80', price: 160 },
  // Household
  { name: 'Dish Soap', category: 'Household', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80', price: 180 },
  { name: 'Laundry Detergent', category: 'Household', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', price: 350 },
  // Personal Care
  { name: 'Shampoo', category: 'Personal Care', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80', price: 250 },
  { name: 'Toothpaste', category: 'Personal Care', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', price: 120 },
  // Frozen Foods
  { name: 'Frozen Peas', category: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80', price: 200 },
  { name: 'Frozen Chicken', category: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', price: 900 },
];

function getRandomSupermarketProduct(i) {
  const base = SUPERMARKET_PRODUCTS[i % SUPERMARKET_PRODUCTS.length];
  return {
    _id: `mock-${i + 1}`,
    name: base.name + (i >= SUPERMARKET_PRODUCTS.length ? ` ${i + 1}` : ''),
    description: `High quality ${base.name.toLowerCase()} for your daily needs.`,
    image: base.image,
    price: base.price + Math.floor(Math.random() * 100), // LKR 100-2000 for most
    category: base.category,
  };
}
const MOCK_PRODUCTS = Array.from({ length: 120 }, (_, i) => getRandomSupermarketProduct(i));

const Header = () => (
  <header className="w-full bg-white shadow sticky top-0 z-20">
    <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
      <span className="text-2xl font-extrabold text-green-700 tracking-tight">AKR Shopping</span>
      <nav className="space-x-6 text-gray-700 font-medium">
        <a href="/" className="hover:text-green-600 transition">Home</a>
        <a href="#about" className="hover:text-green-600 transition">About</a>
        <a href="#products" className="hover:text-green-600 transition">Products</a>
        <a href="#contact" className="hover:text-green-600 transition">Contact</a>
      </nav>
    </div>
  </header>
);

// Update Footer to accept homepageLogo as a prop
const Footer = ({ homepageLogo }) => (
  <footer className="bg-gradient-to-r from-green-700 to-green-400 text-white pt-10 pb-6 mt-16" id="contact">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="flex flex-col items-center md:items-start">
        {homepageLogo && (
          <img
            src={homepageLogo}
            alt="Logo"
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: '2px solid #fff', background: '#fff' }}
          />
        )}
        <div className="text-lg font-bold mb-2">AKR Shopping Center</div>
        <div className="text-sm opacity-90 mb-2">Your one-stop destination for shopping, dining, and entertainment in Mannar.</div>
        <div className="flex gap-3 mt-2">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-200"><FaFacebook size={22} /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-200"><FaInstagram size={22} /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-200"><FaTwitter size={22} /></a>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center md:items-start">
        <div className="font-semibold mb-1">Contact</div>
        <div className="flex items-center gap-2"><FaMapMarkerAlt /> Main street Murunkan, Mannar</div>
        <div className="flex items-center gap-2"><FaPhoneAlt /> <a href="tel:0773111266" className="underline hover:text-green-200">0773111266</a></div>
        <div className="flex items-center gap-2"><FaEnvelope /> <a href="mailto:akrfuture@gmail.com" className="underline hover:text-green-200">akrfuture@gmail.com</a></div>
      </div>
      <div className="flex flex-col gap-2 items-center md:items-start">
        <div className="font-semibold mb-1">Business Hours</div>
        <div className="flex items-center gap-2"><FaClock /> Mon - Sat: 9:00 AM - 9:00 PM</div>
        <div className="flex items-center gap-2"><FaClock /> Sunday: 10:00 AM - 6:00 PM</div>
      </div>
      <div className="flex flex-col gap-2 items-center md:items-start">
        <div className="font-semibold mb-1">Quick Links</div>
        <a href="#about" className="hover:underline">About</a>
        <a href="#products" className="hover:underline">Products</a>
        <a href="#contact" className="hover:underline">Contact</a>
      </div>
    </div>
    <div className="text-center text-xs opacity-80 mt-8">© {new Date().getFullYear()} AKR Shopping Center. All rights reserved.</div>
  </footer>
);

// 1. Sticky, scrollable horizontal category bar
const CategoryBar = ({ categories, selected, onSelect }) => (
  <div className="sticky top-0 z-20 bg-white/90 backdrop-blur shadow-sm w-full max-w-full overflow-x-auto py-3 px-2 flex gap-3 border-b border-green-100 mb-6 scrollbar-hide">
    {['All', ...categories].map(cat => (
      <button
        key={cat}
        className={`min-w-[8rem] whitespace-nowrap px-5 py-2 rounded-full font-semibold transition shadow-sm ${selected === cat ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
        onClick={() => onSelect(cat)}
      >
        {cat}
      </button>
    ))}
  </div>
);

const SHOPPING_LOGO = '/images/image copy 2.png'; // AKR SHOPPING logo

const Shopping = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRealProducts, setShowRealProducts] = useState(true);
  const [banners, setBanners] = useState([]);
  const [homepageLogo, setHomepageLogo] = useState("");
  const [shoppingHeading, setShoppingHeading] = useState("");
  const [shoppingSubheading, setShoppingSubheading] = useState("");
  const [shoppingHeadingColor, setShoppingHeadingColor] = useState("#11998e");
  const [shoppingSubheadingColor, setShoppingSubheadingColor] = useState("#fff");
  const [slideIndex, setSlideIndex] = useState(0);
  const slideInterval = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([1000, 50000]);
  const [sort, setSort] = useState('default');
  const [shoppingSpecialOffer, setShoppingSpecialOffer] = useState("");
  const [shoppingSpecialOfferLink, setShoppingSpecialOfferLink] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  // Add debug output for category filter
  useEffect(() => {
    console.log('Current filter:', category);
    console.log('Product categories:', products.map(p => p.category));
  }, [category, products]);

  // Robust filter logic for category
  const filteredProducts = showRealProducts
    ? products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
          category === 'All' ||
          (product.category && product.category.trim().toLowerCase() === category.trim().toLowerCase());
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesName && matchesCategory && matchesPrice;
      })
    : products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
          category === 'All' ||
          (product.category && product.category.trim().toLowerCase() === category.trim().toLowerCase());
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesName && matchesCategory && matchesPrice;
      });
  let sortedProducts = [...filteredProducts];
  if (sort === 'price-asc') sortedProducts.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') sortedProducts.sort((a, b) => b.price - a.price);
  if (sort === 'newest') sortedProducts.sort((a, b) => (b._id > a._id ? 1 : -1));

  // 1. When toggle is ON, set price range and category defaults
  useEffect(() => {
    if (showRealProducts) {
      setPriceRange([0, 100000]);
      setCategory('All');
    } else {
      setPriceRange([100, 2000]);
      setCategory('All');
    }
  }, [showRealProducts]);

  useEffect(() => {
    api.get('/api/settings').then(res => {
      setShowRealProducts(res.data.showRealProducts !== false);
      // Use shopping section images from services array
      const shoppingService = res.data.services?.find(s => s.name === 'Shopping');
      setBanners(shoppingService?.images && shoppingService.images.length > 0 ? shoppingService.images : []);
      setHomepageLogo(res.data.homepageLogo || "");
      setShoppingHeading(res.data.shoppingHeading || "");
      setShoppingSubheading(res.data.shoppingSubheading || "");
      setShoppingHeadingColor(res.data.shoppingHeadingColor || "#11998e");
      setShoppingSubheadingColor(res.data.shoppingSubheadingColor || "#fff");
      setShoppingSpecialOffer(res.data.shoppingSpecialOffer || "");
      setShoppingSpecialOfferLink(res.data.shoppingSpecialOfferLink || "");
    });
  }, []);

  useEffect(() => {
    if (showRealProducts) {
      setLoading(true);
      api.get('/api/products').then(res => {
        setProducts(res.data);
        setLoading(false);
      });
    } else {
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }
  }, [showRealProducts]);

  useEffect(() => {
    if (!loading && !showRealProducts) {
      console.log('MOCK_PRODUCTS:', MOCK_PRODUCTS);
      console.log('Filtered products:', filteredProducts);
    }
  }, [products, loading, filteredProducts, showRealProducts]);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setSlideIndex(idx => (idx + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  // Ad card
  const AdCard = () => (
    <div className="bg-gradient-to-br from-green-400 to-green-700 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-2xl transition-transform duration-200 hover:scale-105 min-h-[300px]">
      <div className="text-3xl mb-2">🎉</div>
      <div className="font-bold text-xl mb-2">Special Offer!</div>
      <div className="mb-4 text-center">Get 20% off on your first purchase. Limited time only!</div>
      <a href="#" className="px-6 py-2 bg-white text-green-700 font-bold rounded-lg shadow hover:bg-green-100 transition">Shop Now</a>
    </div>
  );

  // Modal for product details
  const ProductModal = ({ product, open, onClose }) => {
    if (!product) return null;
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${open ? '' : 'hidden'}`}> 
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-green-700 text-2xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <img src={product.image} alt={product.name} className="w-full h-56 object-cover rounded-xl mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">{product.name}</h2>
          <div className="text-gray-600 mb-2">{product.description}</div>
          <div className="font-semibold text-green-700 text-xl mb-4">LKR {product.price.toLocaleString()}</div>
          <div className="mb-4 text-center text-base font-medium">Contact to order: <span className="text-green-700 font-bold">0773111266</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header (like Hotel) */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <img
                src={SHOPPING_LOGO}
                alt="AKR Shopping Logo"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-green-500"
              />
              <div>
                <div className="text-base sm:text-lg md:text-2xl font-bold text-gray-900">AKR SHOPPING</div>
                <div className="text-xs sm:text-sm text-gray-600">Premium Shopping & Entertainment Center</div>
              </div>
            </div>
            {/* No search bar or nav links */}
            {/* CTA Button (optional, can remove or repurpose) */}
            <button 
              className="hidden sm:flex bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 items-center space-x-2"
              disabled
            >
              <FaBed className="w-4 h-4" />
              <span>Coming Soon</span>
            </button>
          </div>
        </div>
      </header>
      {/* Hero Section (like Hotel) */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {banners.length > 0 ? (
            banners.map((img, i) => (
              <img
                key={img}
                src={img}
                alt="Shopping Background"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100' : 'opacity-0'}`}
              />
            ))
          ) : (
            <img
              src={SHOPPING_LOGO}
              alt="Shopping Background"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-green-200">
                AKR Shopping Center
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                Step into a vibrant shopping haven designed to meet every need and delight every visitor. Our modern shopping center offers a diverse mix of retail outlets, popular brands, and specialty stores — all under one roof.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <span className="hidden sm:inline-block bg-yellow-400 text-yellow-900 font-bold px-8 py-4 rounded-full shadow-lg text-lg animate-bounce cursor-default">
                  Coming Soon
                </span>
              </div>
            </div>
            {/* Right Content - Shopping Images (optional, can use same image or leave blank) */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <img
                    src={banners.length > 0 ? banners[0] : SHOPPING_LOGO}
                    alt="Shopping 1"
                    className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                </div>
                <div className="relative group">
                  <img
                    src={banners.length > 1 ? banners[1] : SHOPPING_LOGO}
                    alt="Shopping 2"
                    className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Coming Soon message */}
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-3xl font-bold text-green-700 mb-2">Shopping Experience Coming Soon</h2>
        <p className="text-lg text-gray-600 mb-4">We are working hard to bring you an amazing shopping experience. Stay tuned!</p>
        <div className="text-center text-gray-600">
          <p className="mb-2">Featuring:</p>
          <ul className="text-sm space-y-1">
            <li>• Over 50 retail outlets</li>
            <li>• Food court</li>
            <li>• Secure parking for 100+ vehicles</li>
            <li>• Three spacious floors</li>
          </ul>
        </div>
      </div>
      {/* Footer (keep as is) */}
      <Footer homepageLogo={null} />
    </div>
  );
};

export default Shopping; 