import React from "react"
import { useEffect, useState, useRef } from "react"
import { Row, Col, Card, Button, Typography, Badge, Spin, message, Modal, Tag, Select, Image, Grid } from "antd"
import { ArrowLeftOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, EyeOutlined, CalendarOutlined, StarFilled, ShoppingCartOutlined, LeftOutlined, RightOutlined, PictureOutlined, ThunderboltOutlined, HomeOutlined, SmileOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { BikeSlideshow } from "@/components/BikeSlideshow"
import { BookingForm } from "@/components/BookingForm"
import { ColorSelector } from "@/components/ColorSelector"

const { Title, Text } = Typography
const AKR_COMPANY_NAME = "AKR & SONS (PVT) LTD"

export default function AkrSonsBikeStore() {
  const navigate = useNavigate()
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: any }>({})
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [company, setCompany] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<string>('All')
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const screens = Grid.useBreakpoint()
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardWidth = 336; // 320px card + 16px gap

  const heroImages = [
    "/images/PHOTO-2025-07-15-21-49-15.jpg",
    "/images/PHOTO-2025-07-15-21-49-51.jpg",
    "/images/PHOTO-2025-07-15-21-50-18.jpg"
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const companiesRes = await fetch("http://localhost:5050/api/companies")
        const companies = await companiesRes.json()
        const akr = companies.find((c: any) => c.name === AKR_COMPANY_NAME)
        if (!akr) {
          setError("AKR & SONS (PVT) LTD not found.")
          setLoading(false)
          return
        }
        setCompany(akr)
        const vehiclesRes = await fetch(`http://localhost:5050/api/vehicles/company/${akr._id}`)
        const vehiclesData = await vehiclesRes.json()
        setVehicles(vehiclesData)
      } catch (err) {
        setError("Failed to load vehicles.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!carouselRef.current) return;
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (!carouselRef.current) return;
      const totalCards = (selectedType === 'All' ? vehicles.length : vehicles.filter(v => v.vehicleType === selectedType).length);
      currentIndex = (currentIndex + 1) % totalCards;
      carouselRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth',
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [vehicles, selectedType]);

  // Removed handleBookNow and BookingForm logic

  const handleColorChange = (bikeId: string, color: any) => {
    setSelectedColors(prev => ({
      ...prev,
      [bikeId]: color
    }))
  }

  const getBikeImage = (bike: any) => {
    if (bike.colors && bike.colors.length > 0) {
      const selected = selectedColors[bike._id] || bike.colors[0]
      if (selected.images && selected.images.length > 0) {
        return selected.images[0]
      }
    }
    if (bike.images && bike.images.length > 0) {
      return bike.images[0]
    }
    return "/images/placeholder.svg"
  }

  // Helper to open image preview modal
  const openImagePreview = (bike: any) => {
    const imgs = (selectedColors[bike._id]?.images || bike.colors?.[0]?.images || bike.images || [])
    setPreviewImages(imgs)
    setImagePreviewOpen(true)
  }

  // Get all unique vehicle types
  const vehicleTypes = Array.from(new Set(vehicles.map(v => v.vehicleType)))

  // Dynamic sticky filter bar
  const [activeFilter, setActiveFilter] = useState<string>('All');
  // Get all unique categories (including Threewheeler)
  const uniqueCategories = Array.from(new Set(vehicles.map(v => v.category))).filter(cat => cat);
  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Pulsar', value: 'Pulsar' },
    { label: 'CT 100 & Discover', value: 'CT 100 & Discover' },
    ...uniqueCategories.filter(cat => cat !== 'Pulsar' && cat !== 'CT 100 & Discover').map(cat => ({ label: cat, value: cat }))
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)" }}>
      {/* GSAP-style animated background layer */}
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
      {/* Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full bg-gradient-to-r from-emerald-900 to-green-800 text-white shadow-lg hover:scale-110 transition"
          aria-label="Back to Home"
        >
          <ArrowLeftOutlined className="text-xl" />
        </button>
      </div>

      {/* Modern hero section with background slideshow */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-10 sm:pb-16 px-2 sm:px-6 lg:px-8 flex items-center justify-center min-h-[350px]">
        {heroImages.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt="AKR & SONS Hero"
            className={`absolute inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-1000 ${idx === heroIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ filter: 'brightness(1.1)' }}
            draggable={false}
          />
        ))}
        <div className="absolute inset-0 bg-black/10 z-0" />
        <button
          onClick={handleHeroPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 transition backdrop-blur-sm"
          aria-label="Previous background"
        >
          <LeftOutlined className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleHeroNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 transition backdrop-blur-sm"
          aria-label="Next background"
        >
          <RightOutlined className="w-6 h-6 text-white" />
        </button>
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
        <div className="relative z-10 max-w-3xl w-full mx-auto text-center bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-gray-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">AKR & SONS</h1>
          <p className="text-base sm:text-xl text-gray-100 mb-6 sm:mb-8 max-w-2xl mx-auto font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
            Trusted Bajaj dealership for motorcycles and three-wheelers. Reliable, fuel-efficient models, flexible financing, and genuine after-sales support for every journey.
          </p>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div style={{
        position: 'sticky',
        top: 80,
        zIndex: 20,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        boxShadow: '0 2px 8px #e0e7ef',
        padding: '12px 0',
        marginBottom: 24,
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        display: 'flex',
        gap: 16,
      }}>
        {filterOptions.map(opt => (
          <Button
            key={opt.value}
            className={`font-bold rounded-2xl min-w-[120px] px-4 py-2 transition text-gray-900 ${activeFilter === opt.value ? 'bg-gradient-primary hover:scale-105' : 'bg-white border border-emerald-300 hover:bg-emerald-50'}`}
            style={{ fontWeight: 600, whiteSpace: 'normal' }}
            onClick={() => setActiveFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Bikes Grid - Grouped by Category */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px", position: 'relative' }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}><Spin size="large" /></div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "#f5222d", fontSize: 18 }}>{error}</div>
        ) : vehicles.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888", fontSize: 18 }}>No vehicles found for AKR & SONS (PVT) LTD.</div>
        ) : (
          Object.entries(
            vehicles
              .filter(v => {
                if (activeFilter === 'All') return true;
                if (activeFilter === 'Pulsar') return v.name?.toLowerCase().includes('pulsar');
                if (activeFilter === 'CT 100 & Discover') return v.name?.toLowerCase().includes('ct 100') || v.name?.toLowerCase().includes('discover');
                if (activeFilter === 'Threewheeler') return v.category?.toLowerCase().includes('threewheeler') || v.name?.toLowerCase().includes('threewheeler');
                return true;
              })
              .reduce((acc, v) => {
                const cat = v.category || 'Other';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(v);
                return acc;
              }, {})
          ).map(([category, bikes]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-4 ml-2 text-blue-700">{category}</h2>
              <div className="overflow-x-auto pb-4" style={{ scrollBehavior: 'smooth' }}>
                <div className="flex gap-8 min-w-full" style={{ scrollSnapType: 'x mandatory' }}>
                  {bikes.map((bike) => {
                    const images = selectedColors[bike._id]?.images || bike.colors?.[0]?.images || bike.images;
                    return (
                      <div
                        key={bike._id}
                        className="flex-shrink-0"
                        style={{ width: 320, scrollSnapAlign: 'start' }}
                      >
                        <Card
                          hoverable
                          cover={
                            <div className="relative w-full h-56 rounded-xl overflow-hidden group">
                              {/* Vehicle Category Badge */}
                              {bike.category && (
                                <span className="absolute top-3 left-3 z-20 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-4 py-1 shadow-md" style={{letterSpacing: 0.5}}>
                                  {bike.category}
                                </span>
                              )}
                              {images && images.length > 0 ? (
                                images.map((img: string, idx: number) => (
                                  <img
                                    key={img}
                                    src={img}
                                    alt={bike.name}
                                    className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${idx === (slideIndexes[bike._id] ?? 0) ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ borderRadius: 8 }}
                                    draggable={false}
                                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg'; }}
                                  />
                                ))
                              ) : (
                                <div className="flex flex-col items-center justify-center absolute inset-0 bg-gray-100 text-gray-400" style={{ borderRadius: 8 }}>
                                  <PictureOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                                  <span className="font-semibold text-base">No Image Available</span>
                                </div>
                              )}
                              {/* Slideshow controls */}
                              {images && images.length > 1 && (
                                <>
                                  <button
                                    onClick={e => { e.stopPropagation(); handlePrev(bike._id, images); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white/70 hover:bg-white text-gray-700 shadow transition"
                                  >
                                    <LeftOutlined />
                                  </button>
                                  <button
                                    onClick={e => { e.stopPropagation(); handleNext(bike._id, images); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white/70 hover:bg-white text-gray-700 shadow transition"
                                  >
                                    <RightOutlined />
                                  </button>
                                </>
                              )}
                              {/* Dots indicator */}
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex space-x-1">
                                {(images || []).map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={e => { e.stopPropagation(); setSlideIndexes(si => ({ ...si, [bike._id]: idx })); }}
                                    className={`w-2 h-2 rounded-full ${idx === (slideIndexes[bike._id] ?? 0) ? 'bg-blue-600' : 'bg-white/60'} border border-white transition`}
                                  />
                                ))}
                              </div>
                            </div>
                          }
                          style={{ borderRadius: 20, boxShadow: "0 4px 24px #e0e7ef", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: '2px solid #e0e7ef', margin: '0 auto' }}
                          bodyStyle={{ padding: 24 }}
                        >
                          {/* Color Selector (inline) */}
                          {bike.colors && bike.colors.length > 0 && (
                            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 14, color: '#888', marginRight: 6 }}>Color:</span>
                              {bike.colors.map((color: any, idx: number) => (
                                <div
                                  key={color.value || color.name || idx}
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: color.hex,
                                    border: (selectedColors[bike._id]?.value || bike.colors[0]?.value) === color.value ? '2px solid #1890ff' : '1.5px solid #ccc',
                                    boxShadow: (selectedColors[bike._id]?.value || bike.colors[0]?.value) === color.value ? '0 2px 8px #e6f7ff' : 'none',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s',
                                    marginRight: 4,
                                  }}
                                  title={color.name}
                                  onClick={() => handleColorChange(bike._id, color)}
                                />
                              ))}
                            </div>
                          )}
                          {/* Model Name */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>{bike.name}</Title>
                          </div>
                          {/* Engine, Power, Torque */}
                          <div style={{ fontSize: 14, color: '#444', marginBottom: 10, lineHeight: 1.6 }}>
                            <div>Engine: <b>{bike.specs?.Engine || '-'}</b></div>
                            <div>Power: <b>{bike.specs?.Power || '-'}</b></div>
                            <div>Torque: <b>{bike.specs?.Torque || '-'}</b></div>
                          </div>
                          {/* Price */}
                          <div style={{ fontWeight: 700, fontSize: 18, color: "#222", marginBottom: 8 }}>
                            {bike.price ? `LKR ${bike.price}` : ""}
                          </div>
                          {/* Action Buttons */}
                          <div style={{ display: "flex", gap: 8 }}>
                            <Button
                              icon={<EyeOutlined />}
                              onClick={() => navigate(`/akr-sons-bike-store/${bike._id}`)}
                              className="flex-1 bg-gradient-primary font-bold text-gray-900 rounded-xl hover:scale-105 transition"
                            >
                              View Details
                            </Button>
                            <Button
                              icon={<CalendarOutlined />}
                              onClick={() => navigate('/prebook')}
                              className="flex-1 bg-gradient-primary font-bold text-gray-900 rounded-xl hover:scale-105 transition"
                            >
                              Pre-Book
                            </Button>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bike Store Highlights section */}
      <section className="relative z-10 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-8 text-center">Bike Store Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <StarFilled className="text-yellow-500 text-3xl mb-2" />
              <h3 className="font-semibold text-lg mb-2">Top Brands</h3>
              <p className="text-gray-600 text-sm">We offer the best motorcycles from leading brands in Sri Lanka.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <ThunderboltOutlined className="text-blue-500 text-3xl mb-2" />
              <h3 className="font-semibold text-lg mb-2">Performance</h3>
              <p className="text-gray-600 text-sm">Powerful, fuel-efficient bikes for city and adventure rides.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <HomeOutlined className="text-green-500 text-3xl mb-2" />
              <h3 className="font-semibold text-lg mb-2">Trusted Service</h3>
              <p className="text-gray-600 text-sm">Expert support, genuine parts, and reliable after-sales service.</p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <SmileOutlined className="text-pink-500 text-3xl mb-2" />
              <h3 className="font-semibold text-lg mb-2">Happy Customers</h3>
              <p className="text-gray-600 text-sm">Thousands of satisfied riders across the country.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews section */}
      <section className="relative z-10 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-8 text-center">Customer Reviews</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <SmileOutlined className="text-blue-500 text-3xl mb-2" />
              <p className="text-gray-700 italic mb-2">“Great selection and friendly staff. My new bike is perfect!”</p>
              <div className="font-semibold text-gray-800">- Saman, Colombo</div>
            </div>
            <div className="bg-white/90 rounded-2xl shadow p-6 flex flex-col items-center text-center">
              <SmileOutlined className="text-blue-500 text-3xl mb-2" />
              <p className="text-gray-700 italic mb-2">“Smooth buying process and excellent after-sales support.”</p>
              <div className="font-semibold text-gray-800">- Anjali, Kandy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <div style={{ background: "#fff", padding: "48px 0", marginTop: 32 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Title level={3} style={{ marginBottom: 32 }}>Get in Touch</Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8}>
              <div style={{ background: "#f6ffed", borderRadius: 12, padding: 24 }}>
                <PhoneOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                <Title level={5} style={{ margin: "16px 0 8px 0" }}>Call Us</Title>
                <Text>+94 11 234 5678</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ background: "#e6f7ff", borderRadius: 12, padding: 24 }}>
                <MailOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                <Title level={5} style={{ margin: "16px 0 8px 0" }}>Email Us</Title>
                <Text>info@akrsons.lk</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ background: "#fff1f0", borderRadius: 12, padding: 24 }}>
                <EnvironmentOutlined style={{ fontSize: 32, color: "#fa541c" }} />
                <Title level={5} style={{ margin: "16px 0 8px 0" }}>Visit Us</Title>
                <Text>Colombo, Sri Lanka</Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Bike Details Slideshow */}
      {showSlideshow && vehicles.length > 0 && (
        <BikeSlideshow
          bikes={vehicles as any[]}
          onClose={() => setShowSlideshow(false)}
          selectedColors={selectedColors}
          onColorChange={handleColorChange}
        />
      )}

      {/* Booking Form */}
      {/* Removed BookingForm modal logic */}

      {/* Image Preview Modal for Card Images */}
      <Image.PreviewGroup
        preview={{
          visible: imagePreviewOpen,
          onVisibleChange: (vis) => setImagePreviewOpen(vis),
        }}
      >
        {previewImages.map((img, idx) => (
          <Image key={idx} src={String(img)} alt="vehicle" style={{ display: 'none' }} />
        ))}
      </Image.PreviewGroup>
      {/* Footer */}
      <footer className="bg-gradient-to-r from-emerald-900 to-green-800 text-white py-10 mt-12">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src="/images/image copy 2.png" alt="AKR Group Logo" className="h-10 mb-3" />
            <div className="font-bold text-lg mb-2">AKR & SONS</div>
            <p className="text-sm opacity-80">Your trusted partner for premium motorcycles and exceptional service.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Quick Links</div>
            <ul className="space-y-1 text-sm">
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="/akr-sons-bike-store" className="hover:underline">Book Vehicle</a></li>
              <li><a href="/akr-multi-complex/rooms" className="hover:underline">Book Room</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Contact</div>
            <p className="text-sm">akrfuture@gmail.com</p>
            <p className="text-sm">0773111266</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Follow Us</div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.7-.02-1.36-.21-1.94-.53v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22.46 6z" /></svg></a>
              <a href="#" className="hover:text-pink-400"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.7-.86-.92-1.45-.17-.46-.354-1.26-.41-2.43C2.212 15.634 2.2 15.25 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43.22-.59.48-1.01.92-1.45.44-.44.86-.7 1.45-.92.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07 5.77.128 4.87.312 4.1.54c-.8.24-1.48.56-2.16 1.24-.68.68-1 .96-1.24 2.16-.228.77-.412 1.67-.47 2.95C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.28.242 2.18.47 2.95.24.8.56 1.48 1.24 2.16.68.68.96 1 2.16 1.24.77.228 1.67.412 2.95.47C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.28-.058 2.18-.242 2.95-.47.8-.24 1.48-.56 2.16-1.24.68-.68 1-1 .24-2.16.228-.77.412-1.67.47-2.95.058-1.28.07-1.684.07-4.948 0-3.264-.012-3.668-.07-4.948-.058-1.28-.242-2.18-.47-2.95-.24-.8-.56-1.48-1.24-2.16-.68-.68-.96-1-2.16-1.24-.77-.228-1.67-.412-2.95-.47C15.668.012 15.264 0 12 0z" /></svg></a>
              <a href="#" className="hover:text-blue-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.792 0 0 .77 0 1.72v20.56C0 23.23.792 24 1.77 24h20.46c.978 0 1.77-.77 1.77-1.72V1.72C24 .77 23.208 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.67a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM20.45 20.45h-3.56v-5.6c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.69h-3.56V9h3.42v1.56h.05c.48-.91 1.65-1.87 3.4-1.87 3.63 0 4.3 2.39 4.3 5.5v6.26z" /></svg></a>
            </div>
          </div>
        </div>
        <div className="text-center text-xs opacity-70 mt-8">© 2025 AKR & SONS. All rights reserved.</div>
      </footer>
    </div>
  )
} 