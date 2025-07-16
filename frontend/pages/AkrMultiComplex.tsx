import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, ShoppingCart, Home, Users, BedDouble, Dumbbell, Wrench, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const facilities = [
  {
    name: "Shopping Center",
    description: "A modern shopping center with a variety of retail outlets, brands, and services for all your needs.",
    icon: <ShoppingCart className="w-8 h-8 text-blue-500" />, 
    image: "/images/Shopping Center.jpeg",
    features: ["Wide range of shops", "Food court", "Kids play area", "Parking", "Security"],
    specifications: {
      area: "10,000 sq ft",
      floors: "3",
      shops: "50+",
      parking: "200+ vehicles",
      openHours: "9am - 10pm"
    }
  },
  {
    name: "Party Hall & Restaurant",
    description: "Spacious party hall and a fine restaurant for celebrations, events, and dining experiences.",
    icon: <Users className="w-8 h-8 text-pink-500" />, 
    image: "/images/Party Hall & Restaurant.jpg",
    features: ["Banquet seating", "Stage & AV", "Catering", "Private dining", "Event planning"],
    specifications: {
      capacity: "300+ guests",
      cuisine: "Multi-cuisine",
      parking: "Valet available",
      openHours: "10am - 12am"
    }
  },
  {
    name: "Hotel & Rooms",
    description: "Comfortable hotel rooms and suites for guests, business travelers, and families.",
    icon: <BedDouble className="w-8 h-8 text-green-500" />, 
    image: "/images/Hotel & Rooms.jpg",
    features: ["Luxury suites", "Room service", "Wi-Fi", "Conference rooms", "Laundry"],
    specifications: {
      rooms: "80+",
      suites: "10",
      checkIn: "24/7",
      amenities: "Pool, Gym, Spa"
    }
  },
  {
    name: "Gym & Theater",
    description: "State-of-the-art gym and a modern theater for fitness and entertainment.",
    icon: <Dumbbell className="w-8 h-8 text-purple-500" />, 
    image: "/images/Gym & Theater.jpg",
    features: ["Modern equipment", "Personal trainers", "Group classes", "Cinema screen", "Dolby sound"],
    specifications: {
      gymArea: "2,000 sq ft",
      theaterSeats: "120",
      openHours: "6am - 11pm"
    }
  },
  {
    name: "AKR Service Center",
    description: "Professional service center for vehicle maintenance and repairs.",
    icon: <Wrench className="w-8 h-8 text-yellow-500" />, 
    image: "/images/AKR Service Center.jpeg",
    features: ["Certified mechanics", "Genuine parts", "Quick service", "Customer lounge", "Warranty support"],
    specifications: {
      bays: "10",
      services: "All brands",
      openHours: "8am - 8pm"
    }
  }
];

// Add image arrays for each facility (using Unsplash/Google placeholder images)
const facilityImages = {
  "Shopping Center": [
    "/images/Shopping Center.jpeg",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1515168833906-d2a3b82b1a48?auto=format&fit=crop&w=600&q=80"
  ],
  "Party Hall & Restaurant": [
    "/images/Party Hall & Restaurant.jpg",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
  ],
  "Hotel & Rooms": [
    "/images/Hotel & Rooms.jpg",
    "https://images.unsplash.com/photo-1501117716987-c8e1ecb2101f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
  ],
  "Gym & Theater": [
    "/images/Gym & Theater.jpg",
    "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80"
  ],
  "AKR Service Center": [
    "/images/AKR Service Center.jpeg",
    "https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
  ]
};

const heroImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80"
];

export default function AkrMultiComplex() {
  const navigate = useNavigate();
  const [selectedFacility, setSelectedFacility] = useState<null | typeof facilities[0]>(null);
  // Move slideshow state and handlers inside the component
  const [slideIndexes, setSlideIndexes] = useState<{ [name: string]: number }>({});
  const handlePrev = (name: string, images: string[]) => {
    setSlideIndexes(idx => ({
      ...idx,
      [name]: (idx[name] ?? 0) === 0 ? images.length - 1 : (idx[name] ?? 0) - 1
    }));
  };
  const handleNext = (name: string, images: string[]) => {
    setSlideIndexes(idx => ({
      ...idx,
      [name]: (idx[name] ?? 0) === images.length - 1 ? 0 : (idx[name] ?? 0) + 1
    }));
  };
  // Remove rooms state and fetch
  // const [rooms, setRooms] = useState<any[]>([]);
  // useEffect(() => { ... }, []);
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const handleHeroPrev = () => setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const handleHeroNext = () => setHeroIndex((prev) => (prev + 1) % heroImages.length);
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Large floating elements */}
        <div className="absolute top-16 left-16 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full animate-dynamicFloat1"></div>
        <div className="absolute top-32 right-24 w-20 h-20 bg-gradient-to-br from-indigo-400/25 to-blue-500/25 rounded-full animate-dynamicFloat2"></div>
        <div className="absolute bottom-24 left-1/3 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full animate-dynamicFloat3"></div>
        {/* Medium moving elements */}
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full animate-dynamicMove1"></div>
        <div className="absolute bottom-1/3 right-1/4 w-10 h-10 bg-gradient-to-br from-indigo-500/35 to-blue-600/35 rounded-full animate-dynamicMove2"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-500/25 to-indigo-600/25 rounded-full animate-dynamicMove3"></div>
        {/* Small bouncing elements */}
        <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-blue-400/40 rounded-full animate-dynamicBounce1"></div>
        <div className="absolute top-3/4 left-1/3 w-4 h-4 bg-indigo-400/45 rounded-full animate-dynamicBounce2"></div>
        <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-blue-400/35 rounded-full animate-dynamicBounce3"></div>
        {/* Rotating elements */}
        <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-blue-400/20 rounded-full animate-dynamicRotate1"></div>
        <div className="absolute top-1/4 left-1/2 w-16 h-16 border-2 border-indigo-400/25 rounded-full animate-dynamicRotate2"></div>
      </div>
      {/* Navigation */}
      <nav className="relative z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <div className="text-center">
              <h1 className="text-base sm:text-lg text-gray-500 tracking-wide leading-tight">AKR Multi Complex</h1>
              <p className="text-xs sm:text-xs text-gray-400 leading-tight mt-1">Premium Commercial & Residential Hub</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-10 sm:pb-16 px-2 sm:px-6 lg:px-8 flex items-center justify-center min-h-[350px]">
        {/* Background slideshow */}
        {heroImages.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt="AKR Multi Complex"
            className={`absolute inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-1000 ${idx === heroIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ filter: 'brightness(0.45)' }}
            draggable={false}
          />
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 z-0" />
        {/* Slideshow navigation arrows */}
        <button
          onClick={handleHeroPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 transition backdrop-blur-sm"
          aria-label="Previous background"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleHeroNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 transition backdrop-blur-sm"
          aria-label="Next background"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
        {/* Dots indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === heroIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        {/* Card */}
        <div className="relative z-10 max-w-3xl w-full mx-auto text-center bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-12 border border-blue-100">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-gray-900 drop-shadow-lg">AKR Multi Complex</h1>
          <p className="text-base sm:text-xl text-gray-900 mb-6 sm:mb-8 max-w-2xl mx-auto font-medium drop-shadow">
            Discover a world of convenience, luxury, and modern amenities at AKR Multi Complex. Our facilities are designed to meet the needs of families, businesses, and guests with professionalism and excellence.
          </p>
        </div>
      </section>
      {/* Facilities Grid */}
      <section className="relative z-10 py-12 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, idx) => {
              const images = facilityImages[facility.name] || [facility.image];
              const imgIdx = slideIndexes[facility.name] ?? 0;
              return (
                <Card key={facility.name} className="relative glass-card group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center hover:scale-[1.03] p-0 min-h-[420px]">
                  {/* Slideshow background */}
                  <div className="absolute inset-0 w-full h-full z-0">
                    <img src={images[imgIdx]} alt={facility.name} className="w-full h-full object-cover object-center" style={{filter: 'brightness(0.5)'}} />
                  </div>
                  {/* Slideshow controls */}
                  {images.length > 1 && (
                    <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                      <button onClick={e => { e.stopPropagation(); handlePrev(facility.name, images); }} className="bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow transition"><ChevronLeft className="w-5 h-5" /></button>
                      <button onClick={e => { e.stopPropagation(); handleNext(facility.name, images); }} className="bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow transition"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                  )}
                  {/* Card content overlays */}
                  <div className="relative z-10 p-6 flex flex-col flex-1 w-full h-full justify-end items-center">
                    <div className="flex flex-col items-center mb-4">
                      <div className="mb-2">{facility.icon}</div>
                      <h3 className="text-2xl font-bold text-white mb-2 truncate drop-shadow-lg">{facility.name}</h3>
                    </div>
                    <p className="text-gray-100 text-sm mb-3 line-clamp-2 drop-shadow-lg">{facility.description}</p>
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {facility.features?.slice(0, 3).map((f: string, i: number) => (
                        <span key={i} className="bg-blue-50/80 text-blue-900 px-2 py-0.5 rounded text-xs font-medium">{f}</span>
                      ))}
                    </div>
                    {facility.name === "Hotel & Rooms" ? (
                      <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 mt-auto" onClick={() => navigate("/akr-multi-complex/rooms")}>View Rooms</Button>
                    ) : (
                      <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 mt-auto" onClick={() => setSelectedFacility(facility)}>
                        View Details
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      {/* Why Choose Section */}
      <section className="relative z-10 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-8 text-center">Why Choose AKR Multi Complex?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <Star className="w-8 h-8 text-yellow-500 mb-2" />
              <h3 className="font-semibold text-lg mb-2">Prime Location</h3>
              <p className="text-gray-600 text-sm">Located in the heart of Colombo, easily accessible for all your needs.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <Home className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold text-lg mb-2">Modern Facilities</h3>
              <p className="text-gray-600 text-sm">State-of-the-art amenities and infrastructure for a premium experience.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <Dumbbell className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold text-lg mb-2">All-in-One Hub</h3>
              <p className="text-gray-600 text-sm">Shopping, dining, fitness, entertainment, and accommodation in one place.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <Wrench className="w-8 h-8 text-yellow-600 mb-2" />
              <h3 className="font-semibold text-lg mb-2">Trusted Service</h3>
              <p className="text-gray-600 text-sm">Professional staff and reliable support for all your requirements.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Contact & Location Section */}
      <section className="relative z-10 py-12 px-2 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 rounded-2xl shadow-xl p-8 flex flex-col items-center border border-blue-100">
            <h2 className="text-2xl font-bold gradient-text mb-2">Contact & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold text-gray-800">Visit Us</div>
                <div className="text-gray-600 text-sm">AKR Multi Complex, Colombo, Sri Lanka</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold text-gray-800">Hotline</div>
                <div className="text-gray-600 text-sm">+94 11 234 5678</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold text-gray-800">Email</div>
                <div className="text-gray-600 text-sm">info@akrgroup.lk</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Remove Hotel & Rooms Section */}
      {/* Remove rooms grid and section here */}
      {/* Facility Details Modal */}
      {selectedFacility && selectedFacility.name !== "Hotel & Rooms" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] mx-2 p-0 relative flex flex-col overflow-hidden animate-scaleIn">
            {/* Large Image with Icon Overlay */}
            <div className="relative w-full h-36 sm:h-48 bg-gray-100 flex items-center justify-center rounded-t-2xl overflow-hidden shadow-md border-b border-gray-200">
              <img src={selectedFacility.image} alt={selectedFacility.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/80 rounded-full p-2 shadow flex items-center justify-center">
                {selectedFacility.icon}
              </div>
            </div>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white/95 border-b border-gray-200 flex justify-between items-center px-4 sm:px-6 py-3">
              <h2 className="text-lg sm:text-2xl text-gray-800 text-center w-full">{selectedFacility.name} Details</h2>
              <button
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-20"
                onClick={() => setSelectedFacility(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-4">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl sm:text-2xl text-gray-800 mb-2 text-center">{selectedFacility.name}</h3>
                <p className="text-gray-600 mb-6 text-center">{selectedFacility.description}</p>
                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">Key Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedFacility.features?.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Specifications */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">Specifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedFacility.specifications && Object.entries(selectedFacility.specifications).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                        <span className="block font-semibold text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="block text-gray-600 text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Contact Section */}
            <div className="border-t border-gray-200 px-4 sm:px-6 py-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Contact & Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-semibold text-gray-800">Visit Us</div>
                  <div className="text-gray-600 text-sm">AKR Multi Complex, Colombo, Sri Lanka</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-semibold text-gray-800">Hotline</div>
                  <div className="text-gray-600 text-sm">+94 11 234 5678</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-semibold text-gray-800">Email</div>
                  <div className="text-gray-600 text-sm">info@akrgroup.lk</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 