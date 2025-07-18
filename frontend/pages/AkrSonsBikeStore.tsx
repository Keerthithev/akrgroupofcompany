import React, { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Row, Col, Card, Button, Typography, Badge, Spin, message, Modal, Tag, Select, Image, Grid, Link } from "antd"
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
  const [settings, setSettings] = useState({ mode: 'online', bannerImages: [], bannerText: '', bannerHeading: '', bannerSubheading: '', phone: '', email: '', address: '', companyName: '', socialLinks: {}, openingHours: [] });

  useEffect(() => {
    fetch('http://localhost:5050/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const heroImages = settings.bannerImages && settings.bannerImages.length > 0
    ? settings.bannerImages
    : ["/images/PHOTO-2025-07-15-21-49-15.jpg"];
  const [heroIndex, setHeroIndex] = useState(0);
  // Change hero slideshow interval to 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroImages.length]);
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
        const vehiclesRes = await fetch("http://localhost:5050/api/vehicles");
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData.filter((v: any) => v.available !== false));
      } catch (err) {
        setError("Failed to load vehicles.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
      {/* Removed back arrow button from hero slideshow */}

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
        {/* Maintenance mode banner */}
        {settings.mode === 'maintenance' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 text-white text-center p-8">
            {settings.bannerImages && settings.bannerImages[0] && <img src={settings.bannerImages[0]} alt="Banner" className="max-h-48 mx-auto mb-4 rounded-xl shadow-lg" />}
            <h2 className="text-3xl font-bold mb-2">Maintenance Mode</h2>
            <p className="text-lg font-semibold mb-2">{settings.bannerText || 'The platform is currently under maintenance. Please check back soon.'}</p>
          </div>
        )}
        {(settings.bannerHeading || settings.bannerSubheading) && settings.mode !== 'maintenance' && (
          <div className="relative z-10 max-w-3xl w-full mx-auto text-center p-8 sm:p-12">
            {/* Company Logo above banner text */}
            <div className="flex justify-center mb-4">
              <img src="/images/image copy 2.png" alt="Company Logo" className="h-24 w-24 rounded-full object-cover shadow-lg" style={{ background: 'transparent' }} />
            </div>
            {settings.bannerHeading && (
              <h1
                style={{
                  color: '#22c55e',
                  textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 1px 0 #fff'
                }}
                className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4"
              >
                {settings.bannerHeading}
              </h1>
            )}
            {settings.bannerSubheading && (
              <h2
                style={{
                  color: '#fff',
                  textShadow: '0 1px 8px rgba(0,0,0,0.7), 0 1px 0 #22c55e'
                }}
                className="text-base sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto font-medium"
              >
                {settings.bannerSubheading}
              </h2>
            )}
          </div>
        )}
        {/* Remove hero slideshow arrows */}
        {/* <button ...> ... </button> <button ...> ... </button> */}
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
      </section>

      {/* Sticky Filter Bar - always visible, green theme, scrollable */}
      <div
        className="sticky top-0 z-30 bg-white/95 rounded-2xl shadow-xl py-3 mb-6 w-full overflow-x-auto border-t-4 border-green-500"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex flex-nowrap gap-3 min-w-max px-4">
          {filterOptions.map(opt => (
            <Button
              key={opt.value}
              className={`font-bold rounded-2xl min-w-[120px] px-4 py-2 transition ${activeFilter === opt.value ? 'bg-gradient-to-r from-green-600 to-emerald-400 hover:scale-105' : 'bg-green-100 border border-green-300 hover:bg-green-200'} text-black`}
              style={{ fontWeight: 600, whiteSpace: 'normal' }}
              onClick={() => setActiveFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
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
              <h2 className="text-2xl font-bold mb-4 ml-2 text-green-700">{category}</h2>
              {/* Embla Carousel for infinite, snapping, auto-scroll */}
              <EmblaVehicleCarousel bikes={bikes} selectedColors={selectedColors} setSlideIndexes={setSlideIndexes} slideIndexes={slideIndexes} handlePrev={handlePrev} handleNext={handleNext} navigate={navigate} />
            </div>
          ))
        )}
      </div>

      {/* Contact Section */}
      <div style={{ background: "#fff", padding: "48px 0", marginTop: 32 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Title level={3} style={{ marginBottom: 32 }}>Get in Touch</Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8}>
              <div style={{ background: "#f6ffed", borderRadius: 12, padding: 24 }}>
                <PhoneOutlined style={{ fontSize: 32, color: "#22c55e" }} />
                <Title level={5} style={{ margin: "16px 0 8px 0" }}>Call Us</Title>
                <Text>{settings.phone}</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ background: "#e6f7ff", borderRadius: 12, padding: 24 }}>
                <MailOutlined style={{ fontSize: 32, color: "#22c55e" }} />
                <Title level={5} style={{ margin: "16px 0 8px 0" }}>Email Us</Title>
                <Text>{settings.email}</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 24 }}>
                <EnvironmentOutlined style={{ fontSize: 32, color: "#22c55e" }} />
                <Title level={5} style={{ margin: "16px 0 8px 0" }}>Visit Us</Title>
                <Text>{settings.address}</Text>
              </div>
            </Col>
          </Row>
          <div className="flex justify-center gap-6 mt-8">
            {settings.socialLinks?.facebook && <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-200 text-2xl"><i className="fab fa-facebook"></i></a>}
            {settings.socialLinks?.instagram && <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-200 text-2xl"><i className="fab fa-instagram"></i></a>}
            {settings.socialLinks?.whatsapp && <a href={settings.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-200 text-2xl"><i className="fab fa-whatsapp"></i></a>}
            {settings.socialLinks?.twitter && <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-200 text-2xl"><i className="fab fa-twitter"></i></a>}
          </div>
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
      <footer className="bg-gradient-to-r from-green-700 to-emerald-500 text-white py-10 mt-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          <div>
            <img src="/images/image copy 2.png" alt="AKR Group Logo" className="h-16 w-16 rounded-full object-cover mb-3 mx-auto" style={{ background: 'transparent' }} />
            <div className="font-bold text-lg mb-2 text-center">{settings.bannerHeading}</div>
            <p className="text-sm opacity-80 text-center">{settings.bannerSubheading}</p>
          </div>
          <div>
            <div className="font-semibold mb-2">About Us</div>
            <p className="text-sm opacity-80">We are committed to providing premium motorcycles, exceptional service, and a seamless booking experience for all our customers. Your satisfaction is our top priority.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Opening Hours</div>
            <ul className="text-sm opacity-80">
              {(Array.isArray(settings.openingHours) ? settings.openingHours : [settings.openingHours]).filter(Boolean).map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Contact</div>
            <p className="text-sm">{settings.email}</p>
            <p className="text-sm">{settings.phone}</p>
            <p className="text-sm">{settings.address}</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Follow Us</div>
            <div className="flex space-x-4">
              {settings.socialLinks?.facebook && <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-200 text-2xl"><i className="fab fa-facebook"></i></a>}
              {settings.socialLinks?.instagram && <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-200 text-2xl"><i className="fab fa-instagram"></i></a>}
              {settings.socialLinks?.whatsapp && <a href={settings.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-200 text-2xl"><i className="fab fa-whatsapp"></i></a>}
              {settings.socialLinks?.twitter && <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-200 text-2xl"><i className="fab fa-twitter"></i></a>}
            </div>
          </div>
        </div>
        <div className="text-center text-xs opacity-70 mt-8">© 2025 {settings.bannerHeading || "AKR & SONS"}. All rights reserved.</div>
      </footer>
    </div>
  )
}

function EmblaVehicleCarousel({ bikes, selectedColors, setSlideIndexes, slideIndexes, handlePrev, handleNext, navigate }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', skipSnaps: false });
  // Remove auto-scroll logic
  return (
    <div className="relative">
      <div className="overflow-x-auto" ref={emblaRef}>
        <div className="flex">
          {bikes.map((bike) => {
            // Only show real data, no mock fallbacks
            const images = (selectedColors[bike._id]?.images || bike.colors?.[0]?.images || bike.images);
            const engine = bike.specs?.Engine || bike.specs?.Displacement;
            const power = bike.specs?.Power;
            const torque = bike.specs?.Torque;
            const price = bike.price;
            return (
              <div
                key={bike._id}
                className="flex-shrink-0 px-4"
                style={{ width: 320 }}
              >
                <Card
                  hoverable
                  cover={
                    <div className="relative w-full h-56 rounded-xl overflow-hidden group">
                      {/* Vehicle Category Badge */}
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
                      {/* Slideshow controls - keep manual arrows only */}
                      {images && images.length > 1 && (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); handlePrev(bike._id, images); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-green-500 hover:bg-green-600 text-white shadow transition"
                          >
                            <LeftOutlined />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleNext(bike._id, images); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-green-500 hover:bg-green-600 text-white shadow transition"
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
                            className={`w-2 h-2 rounded-full ${idx === (slideIndexes[bike._id] ?? 0) ? 'bg-green-600' : 'bg-white/60'} border border-white transition`}
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
                    <div>Engine: <b>{engine}</b></div>
                    <div>Power: <b>{power}</b></div>
                    <div>Torque: <b>{torque}</b></div>
                  </div>
                  {/* Price */}
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#222", marginBottom: 8 }}>
                    {price ? `Rs ${Number(price).toLocaleString('en-IN')}/=` : ''}
                  </div>
                  {/* Action Buttons - green theme */}
                  <div className="flex gap-3 w-full mt-2">
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/akr-sons-bike-store/${bike._id}`)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-400 font-bold text-white rounded-xl hover:scale-105 transition min-w-0 border-none"
                    >
                      View Details
                    </Button>
                    <Button
                      icon={<CalendarOutlined />}
                      onClick={() => navigate('/prebook')}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-400 font-bold text-white rounded-xl hover:scale-105 transition min-w-0 border-none"
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
  );
} 