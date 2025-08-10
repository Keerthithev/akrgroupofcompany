import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/axios';
import MobileNavigation from '../components/MobileNavigation';
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaSearch, FaFilter, FaSyncAlt, FaSortAmountDown, FaShoppingCart, FaTag, FaBed, FaCalendarAlt, FaLeaf, FaStar, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';
import { motion, useInView } from 'framer-motion';

// Optimized Animation variants - faster and smoother
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const scaleOnHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeInOut" }
};

const features = [
  {
    icon: '🛍️',
    title: 'Over 50 Retail Outlets',
    desc: 'From global brands to unique boutiques, discover a diverse mix of popular brands and specialty stores all under one roof.'
  },
  {
    icon: '🍽️',
    title: 'Food Court',
    desc: 'Savor flavors from around the world in our vibrant, family-friendly food court with diverse dining options.'
  },
  {
    icon: '🚗',
    title: 'Secure Parking for 200+ Vehicles',
    desc: 'Enjoy hassle-free visits with our spacious and secure parking facility accommodating over 200 vehicles.'
  },
  {
    icon: '🏢',
    title: 'Three Spacious Floors',
    desc: 'Experience shopping across three well-designed floors with spacious layouts and a welcoming atmosphere for the whole family.'
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
  <header className="w-full bg-white shadow sticky top-0 z-50">
    <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
      <div className="flex items-center space-x-3">
        <img
          src="/images/image copy 2.png"
          alt="AKR Shopping Logo"
          className="w-10 h-10 rounded-full object-cover border-2 border-green-500"
        />
        <span className="text-2xl font-extrabold text-green-700 tracking-tight">AKR Shopping</span>
      </div>
      <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
        <a href="/" className="hover:text-green-600 transition">Home</a>
        <a href="#about" className="hover:text-green-600 transition">About</a>
        <a href="#products" className="hover:text-green-600 transition">Products</a>
        <a href="#contact" className="hover:text-green-600 transition">Contact</a>
      </nav>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
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
  <div className="sticky top-16 z-10 bg-white/90 backdrop-blur shadow-sm w-full max-w-full overflow-x-auto py-3 px-2 flex gap-3 border-b border-green-100 mb-6 scrollbar-hide">
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
  const [homepageLogo, setHomepageLogo] = useState("");
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
      setHomepageLogo(res.data.homepageLogo || "");
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

  if (loading) return <LoadingSpinner fullScreen={true} text="Loading shopping experience..." />;

  return (
    <div className="min-h-screen bg-white">
      {/* Optimized Professional Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Optimized Logo and Brand */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <img
                  src={SHOPPING_LOGO}
                  alt="AKR Shopping Logo"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-green-500 shadow-md"
                />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  AKR SHOPPING
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Local Market Since 1978
                </div>
              </div>
            </motion.div>

            {/* Mobile Navigation */}
            <MobileNavigation />
          </div>
        </div>
      </motion.header>

      {/* Optimized Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 relative overflow-hidden"
      >
        {/* Simplified Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-48 h-48 md:w-64 md:h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{ 
              x: [0, 50, 0],
              y: [0, -50, 0],
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mb-4"
            >
              <FaLeaf className="w-3 h-3 text-green-600 mr-2" />
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Fresh • Local • Trusted Since 1978</span>
              <FaStar className="w-3 h-3 text-yellow-500 ml-2" />
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-4 leading-tight"
            >
              🌾 Fresh • Local • Affordable 🌾
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
            >
              Your trusted neighborhood store for daily essentials, fresh produce, and household items at prices that work for every family
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section - Reduced spacing */}
      <motion.section 
        id="about" 
        className="py-8 sm:py-12 md:py-16 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Content with Image - Optimized spacing */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 lg:mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
          >
            <motion.div variants={fadeInLeft}>
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mb-4">
                <FaLeaf className="w-3 h-3 text-green-600 mr-2" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Serving Community Since 1978</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Your Trusted Local 
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Market</span>
              </h2>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                AKR Shopping Center is your trusted local store providing everyday essentials at fair prices. We understand the needs of local families and stock items that matter most to your daily life.
              </p>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                Whether you need rice, vegetables, household supplies, or fresh produce, you'll find quality products at prices that won't break the bank.
              </p>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: FaLeaf, label: "Daily Essentials", color: "text-green-600" },
                  { icon: FaStar, label: "Fair Prices", color: "text-blue-600" },
                  { icon: FaShoppingCart, label: "Friendly Service", color: "text-purple-600" },
                  { icon: FaMapMarkerAlt, label: "Local Trust", color: "text-orange-600" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-2 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center`}>
                      <item.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${item.color}`} />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              variants={fadeInRight}
              className="order-first lg:order-last"
            >
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
                <img
                  src="/images/Simplify Grocery Shopping & Live Better!.jpg"
                  alt="Fresh Market Display"
                  className="relative w-full h-64 sm:h-80 md:h-96 object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-2xl"></div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Features Grid - Reduced spacing */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                icon: "🍚",
                title: "Rice & Grains",
                description: "Fresh rice varieties, flour, and other grains at wholesale prices",
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100",
                borderColor: "border-blue-200"
              },
              {
                icon: "🥕",
                title: "Fresh Vegetables",
                description: "Daily fresh vegetables and fruits from local farmers",
                gradient: "from-green-500 to-green-600",
                bgGradient: "from-green-50 to-green-100",
                borderColor: "border-green-200"
              },
              {
                icon: "🧴",
                title: "Household Items",
                description: "Soap, detergents, and daily use items for the home",
                gradient: "from-purple-500 to-purple-600",
                bgGradient: "from-purple-50 to-purple-100",
                borderColor: "border-purple-200"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`bg-gradient-to-br ${feature.bgGradient} p-4 sm:p-6 rounded-xl border ${feature.borderColor} text-center group hover:shadow-lg transition-all duration-300`}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div 
                  className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md group-hover:shadow-lg transition-shadow duration-300`}
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-xl sm:text-2xl">{feature.icon}</span>
                </motion.div>
                <h3 className={`text-base sm:text-lg font-bold ${feature.gradient.includes('blue') ? 'text-blue-800' : feature.gradient.includes('green') ? 'text-green-800' : 'text-purple-800'} mb-2`}>
                  {feature.title}
                </h3>
                <p className={`text-xs sm:text-sm ${feature.gradient.includes('blue') ? 'text-blue-700' : feature.gradient.includes('green') ? 'text-green-700' : 'text-purple-700'} leading-relaxed`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section - Optimized */}
      <motion.section 
        id="categories" 
        className="py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 mb-8">
            <motion.div 
              className="text-center mb-6 sm:mb-8"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                What You'll Find Here
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Basic necessities for everyday living at prices that work for local families.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
            >
              {[
                {
                  image: "/images/Rice gilan.jpg",
                  alt: "Bulk Rice and Grains",
                  title: "Rice & Grains",
                  description: "Premium quality rice and grains for freshness and wholesale pricing.",
                  features: ["Basmati and Samba rice", "Wheat flour and semolina", "Traditional storage"]
                },
                {
                  image: "/images/Simplify Grocery Shopping & Live Better!.jpg",
                  alt: "Fresh Produce Market",
                  title: "Fresh Produce",
                  description: "Daily fresh vegetables and fruits arranged for easy selection.",
                  features: ["Fresh vegetables daily", "Seasonal fruits", "Locally sourced"]
                },
                {
                  image: "/images/shopping.jpg",
                  alt: "Complete Family Shopping",
                  title: "Family Essentials",
                  description: "Everything your family needs in one convenient shopping trip.",
                  features: ["One-stop shopping", "Quality guaranteed", "Budget-friendly"]
                }
              ].map((category, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="relative overflow-hidden rounded-lg mb-3 sm:mb-4">
                    <img
                      src={category.image}
                      alt={category.alt}
                      className="w-full h-32 sm:h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2">{category.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">{category.description}</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {category.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Additional Categories - Compact */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                image: "/images/a.jpg",
                alt: "Packaged Legumes and Pulses",
                title: "Legumes & Pulses",
                description: "Quality packaged legumes including baby lima beans, lentils, red lentils, chickpeas, and black-eyed peas.",
                features: ["Baby Lima Beans", "Red Lentils & Chickpeas", "Black-Eyed Peas", "Quality packaging"]
              },
              {
                image: "/images/Daily Fresh Mart.jpg",
                alt: "Daily Fresh Mart Items", 
                title: "Daily Fresh Items",
                description: "Fresh daily essentials including bread, milk, eggs, and other perishable items.",
                features: ["Fresh bread & baked goods", "Dairy products & eggs", "Daily delivery items", "Refrigerated storage"]
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
                whileHover={{ scale: 1.01 }}
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={category.image}
                    alt={category.alt}
                    className="w-full h-40 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3">{category.title}</h4>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">{category.description}</p>
                <ul className="text-xs sm:text-sm text-gray-500 space-y-1">
                  {category.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose Us - Compact */}
      <motion.section 
        className="py-8 sm:py-12 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
          >
            <motion.div 
              variants={fadeInLeft}
              className="order-last lg:order-first"
            >
              <img
                src="/images/shopping.jpg"
                alt="Professional Grocery Store"
                className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-2xl shadow-lg"
              />
            </motion.div>

            <motion.div variants={fadeInRight}>
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mb-4">
                <FaLeaf className="w-3 h-3 text-green-600 mr-2" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Trusted by Local Families</span>
              </div>
              
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                Why Local Families 
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Trust Us</span>
              </h3>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                For over 40 years, we've been serving the local community with honest prices, quality products, and friendly service.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                {[
                  { icon: FaStar, title: "Fair Prices Always", description: "No hidden charges. Everyone deserves affordable essentials." },
                  { icon: FaLeaf, title: "Fresh Stock Daily", description: "Fresh vegetables arrive every morning for quality." },
                  { icon: FaShoppingCart, title: "Community Support", description: "We source locally and support community events." },
                  { icon: FaMapMarkerAlt, title: "Helpful Staff", description: "Our staff knows the community and helps you find items." }
                ].map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <benefit.icon className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{benefit.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Store Information - Compact */}
      <motion.section 
        className="py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeInLeft}>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">Visit Our Store</h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { icon: FaClock, title: "Store Hours", info: "Daily: 6:00 AM - 8:00 PM", subtitle: "Fresh vegetables arrive by 7:00 AM daily" },
                    { icon: FaMapMarkerAlt, title: "Location", info: "AKR Multi Complex, Ground Floor", subtitle: "Easy parking near main entrance" },
                    { icon: FaPhoneAlt, title: "Contact Us", info: "Phone: 0773111266", subtitle: "Help finding items or checking stock" }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm sm:text-base text-gray-700 font-medium">{item.info}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{item.subtitle}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div variants={fadeInRight}>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">How We Help</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { icon: "📦", title: "Bulk Orders", description: "Special prices for bulk purchases of rice and staples" },
                    { icon: "💵", title: "Cash Payments", description: "We accept cash and provide proper receipts" },
                    { icon: "🕒", title: "Daily Fresh Stock", description: "Fresh produce arrives every morning" },
                    { icon: "🏪", title: "Local Store", description: "Supporting community with essential goods" }
                  ].map((service, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-lg sm:text-xl mb-2">{service.icon}</div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{service.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{service.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <Footer homepageLogo={homepageLogo} />
    </div>
  );
};

export default Shopping; 