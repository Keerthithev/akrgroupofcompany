import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, ShoppingCart, Home, Users, BedDouble, Dumbbell, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

export default function AkrMultiComplex() {
  const navigate = useNavigate();
  const [selectedFacility, setSelectedFacility] = useState<null | typeof facilities[0]>(null);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
              <h1 className="text-base sm:text-lg font-old-english text-gray-500 tracking-wide leading-tight">AKR Multi Complex</h1>
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
      <section className="relative z-10 pt-28 sm:pt-36 pb-10 sm:pb-16 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-old-english text-gray-800 mb-4 sm:mb-6 drop-shadow-sm bg-white/70 inline-block px-3 sm:px-6 py-2 rounded-xl">
            AKR Multi Complex
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Discover a world of convenience, luxury, and modern amenities at AKR Multi Complex. Our facilities are designed to meet the needs of families, businesses, and guests with professionalism and excellence.
          </p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, idx) => (
              <Card key={facility.name} className="glass-card p-6 cosmic-hover group overflow-hidden relative border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="relative z-10 space-y-4">
                  <div className="w-full h-48 rounded-xl overflow-hidden relative flex items-center justify-center bg-gray-100">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 left-2">{facility.icon}</div>
                  </div>
                  <h3 className="text-xl font-old-english text-gray-800 group-hover:gradient-text transition-all duration-300">
                    {facility.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{facility.description}</p>
                  <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105" onClick={() => setSelectedFacility(facility)}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Facility Details Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] mx-2 p-0 relative animate-fadeIn flex flex-col overflow-hidden">
            {/* Large Image with Icon Overlay */}
            <div className="relative w-full h-36 sm:h-48 bg-gray-100 flex items-center justify-center rounded-t-2xl overflow-hidden shadow-md border-b border-gray-200">
              <img src={selectedFacility.image} alt={selectedFacility.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/80 rounded-full p-2 shadow flex items-center justify-center">
                {selectedFacility.icon}
              </div>
            </div>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white/95 border-b border-gray-200 flex justify-between items-center px-4 sm:px-6 py-3">
              <h2 className="text-lg sm:text-2xl font-old-english text-gray-800 text-center w-full">{selectedFacility.name} Details</h2>
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
                <h3 className="text-xl sm:text-2xl font-old-english text-gray-800 mb-2 text-center">{selectedFacility.name}</h3>
                <p className="text-gray-600 mb-6 text-center">{selectedFacility.description}</p>
                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">Key Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedFacility.features?.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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