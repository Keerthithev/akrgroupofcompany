import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Home, BedDouble, Dumbbell, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONTACT_NUMBER = "+94 11 234 5678";
const LOCATION = "AKR Multi Complex, Colombo, Sri Lanka";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80";

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:5050/api/rooms/${id}`)
      .then(res => res.json())
      .then(data => { setRoom(data); setLoading(false); })
      .catch(() => { setError("Failed to load room"); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col items-center justify-center">
      <span className="material-icons text-5xl text-blue-300 mb-4 animate-spin">hotel</span>
      <div className="text-center text-gray-500 text-lg">Loading room details...</div>
    </div>
  );
  if (error || !room) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Room Not Found</h2>
        <p className="text-gray-600 mb-6">{error || "The requested room could not be found."}</p>
        <Button onClick={() => navigate(-1)} size="lg">Go Back</Button>
      </div>
    </div>
  );

  const images = room.images && room.images.length > 0 ? room.images : [PLACEHOLDER_IMAGE];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 relative">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Rooms
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Hotel & Rooms</h1>
            <p className="text-xs text-gray-500">AKR Multi Complex</p>
          </div>
          <div className="w-24" />
        </div>
      </header>
      {/* Main Card Section */}
      <section className="pt-24 pb-8 max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-3xl shadow-2xl border-2 border-blue-100 p-0 sm:p-0 flex flex-col md:flex-row gap-10 overflow-hidden">
          {/* Image Gallery */}
          <div className="flex-1 flex flex-col gap-4 items-center justify-center p-6">
            <div className="w-full h-72 rounded-2xl overflow-hidden relative flex items-center justify-center bg-white/60 backdrop-blur-md shadow-lg">
              <img src={images[currentImage]} alt={room.name} className="w-full h-full object-cover transition-transform duration-500" onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }} />
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((img: string, i: number) => (
                    <button key={i} className={`w-3 h-3 rounded-full border-2 ${i === currentImage ? 'bg-blue-500 border-blue-700' : 'bg-white border-gray-300'} transition`} onClick={() => setCurrentImage(i)} />
                  ))}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                {images.map((src: string, i: number) => (
                  <img key={i} src={src} alt="preview" className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${i === currentImage ? 'border-blue-500' : 'border-transparent'} transition`} onClick={() => setCurrentImage(i)} />
                ))}
              </div>
            )}
          </div>
          {/* Details */}
          <div className="flex-1 flex flex-col gap-4 justify-center p-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight drop-shadow-lg">{room.name}</h1>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">{room.type}</span>
              <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">LKR {room.price}</span>
              <span className={`text-sm px-2 py-0.5 rounded font-semibold ${room.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{room.status}</span>
            </div>
            <p className="text-gray-700 text-base mb-2 leading-relaxed">{room.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {room.amenities?.slice(0, 3).map((a: string, i: number) => (
                <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{a}</span>
              ))}
            </div>
            {/* Contact Section */}
            <div className="mt-8 flex flex-col items-center">
              <div className="text-lg font-bold text-blue-700 mb-1 text-center">For booking, call:</div>
              <a href={`tel:${CONTACT_NUMBER.replace(/\s/g,"")}`} className="text-2xl sm:text-3xl font-extrabold text-blue-900 bg-blue-100 px-8 py-3 rounded-2xl shadow-lg hover:bg-blue-200 transition text-center select-all mb-2">
                {CONTACT_NUMBER}
              </a>
              <div className="flex items-center gap-2 text-blue-700 font-semibold mt-1">
                <MapPin className="w-4 h-4" />
                {LOCATION}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Room Highlights */}
      <section className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
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
      </section>
      {/* Guest Reviews */}
      <section className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 pb-8">
        <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-8 text-center">Guest Reviews</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
            <MessageCircle className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-gray-700 italic mb-2">“The room was beautiful and the staff was incredibly helpful. Will definitely stay again!”</p>
            <div className="font-semibold text-gray-800">- Nimal, Colombo</div>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
            <MessageCircle className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-gray-700 italic mb-2">“Great location, modern facilities, and a wonderful breakfast. Highly recommended!”</p>
            <div className="font-semibold text-gray-800">- Priya, Kandy</div>
          </div>
        </div>
      </section>
      {/* Features, Amenities, Specs */}
      <section className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="bg-white/90 rounded-2xl shadow p-6">
            <h3 className="font-semibold text-blue-700 mb-2 text-center tracking-wide">Features</h3>
            <ul className="list-disc list-inside text-gray-600">
              {room.features?.length ? room.features.map((f: string, i: number) => <li key={i}>{f}</li>) : <li>No features listed.</li>}
            </ul>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-6">
            <h3 className="font-semibold text-blue-700 mb-2 text-center tracking-wide">Amenities</h3>
            <ul className="list-disc list-inside text-gray-600">
              {room.amenities?.length ? room.amenities.map((a: string, i: number) => <li key={i}>{a}</li>) : <li>No amenities listed.</li>}
            </ul>
          </div>
          <div className="bg-white/90 rounded-2xl shadow p-6">
            <h3 className="font-semibold text-blue-700 mb-2 text-center tracking-wide">Specifications</h3>
            <ul className="list-disc list-inside text-gray-600">
              {room.specs && typeof room.specs === 'object' && Object.entries(room.specs).length > 0 ? (
                Object.entries(room.specs).map(([k, v]) => (
                  <li key={k}><b>{k}:</b> {v as string}</li>
                ))
              ) : <li>No specifications listed.</li>}
            </ul>
          </div>
        </div>
      </section>
      {/* Sticky Contact Button for Mobile */}
      <a href={`tel:${CONTACT_NUMBER.replace(/\s/g,"")}`} className="fixed bottom-6 right-6 z-50 block sm:hidden bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg font-bold text-lg hover:bg-blue-800 transition">
        Book Now: {CONTACT_NUMBER}
      </a>
    </div>
  );
} 