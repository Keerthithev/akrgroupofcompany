import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Star, Home, ChevronLeft, ChevronRight, BedDouble, Dumbbell, Wrench, MessageCircle } from "lucide-react";

const CONTACT_NUMBER = "+94 11 234 5678";
const LOCATION = "AKR Multi Complex, Colombo, Sri Lanka";

export default function RoomsList() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  // Slideshow state for each card
  const [slideIndexes, setSlideIndexes] = useState<{ [id: string]: number }>({});

  const handlePrev = (id: string, images: string[]) => {
    setSlideIndexes(idx => ({
      ...idx,
      [id]: (idx[id] ?? 0) === 0 ? images.length - 1 : (idx[id] ?? 0) - 1
    }));
  };
  const handleNext = (id: string, images: string[]) => {
    setSlideIndexes(idx => ({
      ...idx,
      [id]: (idx[id] ?? 0) === images.length - 1 ? 0 : (idx[id] ?? 0) + 1
    }));
  };

  const heroImages = [
    "https://images.unsplash.com/photo-1501117716987-c8e1ecb2101f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=1200&q=80"
  ];

  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const handleHeroPrev = () => setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const handleHeroNext = () => setHeroIndex((prev) => (prev + 1) % heroImages.length);

  useEffect(() => {
    fetch("http://localhost:5050/api/rooms")
      .then(res => res.json())
      .then(data => { setRooms(data); setLoading(false); })
      .catch(() => { setError("Failed to load rooms"); setLoading(false); });
  }, []);

  // Get all unique room types
  const roomTypes = Array.from(new Set(rooms.map(r => r.type).filter(Boolean)));
  const filteredRooms = selectedType === "All" ? rooms : rooms.filter(r => r.type === selectedType);

  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-16 left-16 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full animate-dynamicFloat1"></div>
        <div className="absolute top-32 right-24 w-20 h-20 bg-gradient-to-br from-indigo-400/25 to-blue-500/25 rounded-full animate-dynamicFloat2"></div>
        <div className="absolute bottom-24 left-1/3 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full animate-dynamicFloat3"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full animate-dynamicMove1"></div>
        <div className="absolute bottom-1/3 right-1/4 w-10 h-10 bg-gradient-to-br from-indigo-500/35 to-blue-600/35 rounded-full animate-dynamicMove2"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-500/25 to-indigo-600/25 rounded-full animate-dynamicMove3"></div>
        <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-blue-400/40 rounded-full animate-dynamicBounce1"></div>
        <div className="absolute top-3/4 left-1/3 w-4 h-4 bg-indigo-400/45 rounded-full animate-dynamicBounce2"></div>
        <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-blue-400/35 rounded-full animate-dynamicBounce3"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-blue-400/20 rounded-full animate-dynamicRotate1"></div>
        <div className="absolute top-1/4 left-1/2 w-16 h-16 border-2 border-indigo-400/25 rounded-full animate-dynamicRotate2"></div>
      </div>
      {/* Navigation/Header */}
      <nav className="relative z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate("/akr-multi-complex")}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to AKR Multi Complex
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
      <section className="relative z-10 pt-20 sm:pt-28 pb-4 sm:pb-8 px-2 sm:px-6 lg:px-8 flex items-center justify-center min-h-[350px]">
        {/* Background slideshow */}
        {heroImages.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt="Hotel & Rooms"
            className={`absolute inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-1000 ${idx === heroIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ filter: 'brightness(0.45)' }}
            draggable={false}
          />
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 z-0" />
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
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-gray-900 drop-shadow-lg">Hotel & Rooms</h1>
          <p className="text-base sm:text-xl text-gray-900 mb-6 sm:mb-8 max-w-2xl mx-auto font-medium drop-shadow">
            Experience comfort and luxury at AKR Multi Complex. Our hotel offers a range of modern rooms and suites, perfect for families, business travelers, and guests seeking a premium stay in Colombo.
          </p>
        </div>
      </section>
      {/* Room Type Filter */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="text-base font-semibold text-gray-700">Browse by Room Type:</div>
        <div className="relative w-full sm:w-auto">
          <select
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700 shadow w-full sm:w-auto"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="All">All Types</option>
            {roomTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <span className="material-icons text-5xl text-blue-300 mb-4 animate-spin">hotel</span>
            <div className="text-center text-gray-500 text-lg">Loading rooms...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <span className="material-icons text-5xl text-red-300 mb-4">error_outline</span>
            <div className="text-center text-red-500 text-lg">{error}</div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <span className="material-icons text-5xl text-gray-300 mb-4">hotel</span>
            <div className="text-center text-gray-500 text-lg">No rooms found for this type.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredRooms.map(room => {
              const images = room.images && room.images.length > 0 ? room.images : ["/images/Hotel & Rooms.jpg"];
              const idx = slideIndexes[room._id] ?? 0;
              return (
                <Card key={room._id} className="relative bg-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center hover:scale-[1.03] cursor-pointer border-0 p-0 group overflow-hidden min-h-[420px]" onClick={() => navigate(`/akr-multi-complex/rooms/${room._id}`)}>
                  {/* Background image with overlay */}
                  <div className="absolute inset-0 w-full h-full z-0">
                    <img
                      src={images[idx]}
                      alt={room.name}
                      className="w-full h-full object-cover object-center transition-all duration-500"
                      style={{filter: 'brightness(0.5)'}}
                      onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                  {/* Slideshow controls */}
                  {images.length > 1 && (
                    <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                      <button onClick={e => { e.stopPropagation(); handlePrev(room._id, images); }} className="bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow transition"><ChevronLeft className="w-5 h-5" /></button>
                      <button onClick={e => { e.stopPropagation(); handleNext(room._id, images); }} className="bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow transition"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                  )}
                  {/* Card content overlays */}
                  <div className="relative z-10 p-6 flex flex-col flex-1 w-full h-full justify-end items-center">
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {room.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${room.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{room.status}</span>
                      )}
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{room.type}</span>
                      <span className="text-base font-semibold text-white bg-blue-700/80 px-2 py-0.5 rounded">LKR {room.price}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 truncate drop-shadow-lg">{room.name}</h3>
                    <p className="text-gray-100 text-sm mb-3 line-clamp-2 drop-shadow-lg">{room.description}</p>
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {room.amenities?.slice(0, 3).map((a: string, i: number) => (
                        <span key={i} className="bg-blue-50/80 text-blue-900 px-2 py-0.5 rounded text-xs font-medium">{a}</span>
                      ))}
                    </div>
                    <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 mt-auto" onClick={e => { e.stopPropagation(); navigate(`/akr-multi-complex/rooms/${room._id}`); }}>
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      {/* Room Highlights */}
      <section className="relative z-10 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-8 text-center">Room Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <BedDouble className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold text-lg mb-2">Modern Comfort</h3>
              <p className="text-gray-600 text-sm">Spacious, air-conditioned rooms with premium bedding and amenities.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <Star className="w-8 h-8 text-yellow-500 mb-2" />
              <h3 className="font-semibold text-lg mb-2">Top Rated</h3>
              <p className="text-gray-600 text-sm">Consistently high guest ratings for cleanliness, service, and value.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <Home className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold text-lg mb-2">Family Friendly</h3>
              <p className="text-gray-600 text-sm">Perfect for families, business travelers, and solo guests alike.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <Dumbbell className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold text-lg mb-2">Onsite Facilities</h3>
              <p className="text-gray-600 text-sm">Access to gym, restaurant, and entertainment within the complex.</p>
            </div>
          </div>
        </div>
      </section>
      {/* How to Book */}
      <section className="relative z-10 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-8 text-center">How to Book</h2>
          <ol className="space-y-6 text-gray-700 text-base sm:text-lg">
            <li className="flex items-start gap-4">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
              <span>Browse available rooms and select your preferred type and amenities.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</span>
              <span>Click <b>View Details</b> on your chosen room to see more information and photos.</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</span>
              <span>Call our hotline to reserve your room instantly.</span>
            </li>
          </ol>
        </div>
      </section>
      {/* Guest Reviews */}
      <section className="relative z-10 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-8 text-center">Guest Reviews</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <MessageCircle className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-gray-700 italic mb-2">“The rooms were spotless and the staff was incredibly helpful. Will definitely stay again!”</p>
              <div className="font-semibold text-gray-800">- Nimal, Colombo</div>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <MessageCircle className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-gray-700 italic mb-2">“Great location, modern facilities, and a wonderful breakfast. Highly recommended!”</p>
              <div className="font-semibold text-gray-800">- Priya, Kandy</div>
            </div>
          </div>
        </div>
      </section>
      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setImagePreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-4 flex flex-col items-center relative animate-scaleIn" onClick={e => e.stopPropagation()}>
            <img src={imagePreview} alt="Room Preview" className="w-full h-80 object-cover rounded-xl mb-4" />
            <Button variant="outline" onClick={() => setImagePreview(null)}>Close</Button>
          </div>
        </div>
      )}
      {/* Contact Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12">
        <div className="bg-white/80 rounded-2xl shadow-xl p-8 flex flex-col items-center border border-blue-100">
          <h2 className="text-2xl font-bold gradient-text mb-2">Book Your Stay</h2>
          <p className="text-gray-700 mb-4 text-center">For reservations and inquiries, please call our hotline. Our team is ready to assist you with your booking and special requests.</p>
          <a href={`tel:${CONTACT_NUMBER.replace(/\s/g,"")}`} className="text-3xl sm:text-4xl font-extrabold text-blue-900 bg-blue-100 px-8 py-4 rounded-2xl shadow-lg hover:bg-blue-200 transition text-center select-all mb-2">
            {CONTACT_NUMBER}
          </a>
          <div className="flex items-center gap-2 text-blue-700 font-semibold mt-2">
            <MapPin className="w-5 h-5" />
            {LOCATION}
          </div>
        </div>
      </section>
    </div>
  );
} 