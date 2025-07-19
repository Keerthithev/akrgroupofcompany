import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Zap,
  Gauge,
  Star,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Heart,
  Share2,
  Download,
  Play,
  Camera,
  Settings,
  Info,
  TrendingUp,
  Fuel,
} from "lucide-react";
import { Button, buttonVariants } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Progress } from "../../components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Fetch global settings for footer and theme
  const [settings, setSettings] = useState<any>({ socialLinks: {}, openingHours: [] });
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  useEffect(() => {
    async function fetchVehicle() {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles/${id}`);
        if (!res.ok) throw new Error("Vehicle not found");
        const data = await res.json();
        setVehicle(data);
        setSelectedColor(data.colors && data.colors.length > 0 ? data.colors[0] : null);
      } catch (err: any) {
        setError(err.message || "Failed to load vehicle");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchVehicle();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (heroImageRef.current) {
      gsap.fromTo(
        heroImageRef.current,
        { scale: 1, y: 0 },
        {
          scale: 1.15,
          y: -60,
          scrollTrigger: {
            trigger: heroImageRef.current,
            start: 'top center',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }
  }, []);

  const getCurrentImages = () => {
    return selectedColor?.images || vehicle?.images || ["/hero-bg.jpg"];
  };
  const nextImage = () => {
    const images = getCurrentImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    const images = getCurrentImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // 1. Gather all images from all colors for the gallery
  const allGalleryImages = React.useMemo(() => {
    if (!vehicle) return [];
    const colorImages = (vehicle.colors || []).flatMap((color: any) => color.images || []);
    const mainImages = vehicle.images || [];
    // Remove duplicates
    return Array.from(new Set([...mainImages, ...colorImages]));
  }, [vehicle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          {/* Skeleton rows like YouTube */}
          <div className="space-y-10">
            {[...Array(3)].map((_, row) => (
              <div key={row} className="flex flex-col md:flex-row gap-6">
                <Skeleton className="w-full md:w-1/3 aspect-video rounded-lg" />
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  <Skeleton className="h-6 w-2/3 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <Skeleton className="h-4 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The requested vehicle could not be found."}</p>
          <Button onClick={() => navigate(-1)} size="lg" className="bg-gradient-primary font-bold text-gray-900 rounded-xl hover:scale-105 transition">
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentImages = getCurrentImages();

  // Grouping map: label -> group
  const specGroups = {
    Engine: [
      'Engine Type', 'Max Power', 'Max Torque', 'Displacement', 'Clutch'
    ],
    Electricals: [
      'Head Lamp', 'Tail Lamp', 'Instrument Cluster'
    ],
    'Brakes & Tyres': [
      'Front Brakes', 'Rear Brakes', 'Front Tyres', 'Rear Tyres', 'Brakes Type'
    ],
    Vehicle: [
      'Fuel Tank', 'Ground Clearance', 'Kerb Weight', 'Suspension Front', 'Suspension Rear', 'Wheel Base'
    ]
  };
  // Build grouped specs from vehicle.specs
  const groupedSpecs = {};
  Object.entries(vehicle.specs || {}).forEach(([label, value]) => {
    let found = false;
    for (const [group, labels] of Object.entries(specGroups)) {
      if (labels.includes(label)) {
        if (!groupedSpecs[group]) groupedSpecs[group] = [];
        groupedSpecs[group].push({ label, value });
        found = true;
        break;
      }
    }
    if (!found) {
      if (!groupedSpecs['Other']) groupedSpecs['Other'] = [];
      groupedSpecs['Other'].push({ label, value });
    }
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-r from-emerald-200/40 via-blue-200/40 to-green-200/40 flex items-center justify-center py-8">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-16 bg-gradient-to-r from-emerald-200/60 via-blue-200/60 to-green-200/60 backdrop-blur-xl bg-opacity-80 rounded-3xl border border-white/40 shadow-2xl">
          {/* Floating Header */}
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-gradient-to-r from-emerald-900 to-green-800 text-white shadow-lg hover:scale-110 transition"
              aria-label="Back to Store"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Hero Section */}
          <motion.section ref={heroRef} style={{ y, opacity }} className="relative pt-20 pb-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/40 via-emerald-100/40 to-green-200/40" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center relative">
                {/* Vehicle Info (left) */}
                <motion.div
                  className="space-y-6 z-10 relative"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {/* Removed category badge for cleaner look */}
                  <motion.h1
                    className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {vehicle.name}
                  </motion.h1>
                  {vehicle.description && (
                    <motion.p
                      className="text-base text-gray-700 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      {vehicle.description}
                    </motion.p>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-4 mb-6"
                  >
                    {vehicle.price && <p className="text-3xl font-bold text-emerald-600">Rs {Number(vehicle.price).toLocaleString('en-IN')}/=</p>}
                    <Badge variant="outline" className="text-green-600 border-green-600 bg-white/80">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {vehicle.availability}
                      </Badge>
                  </motion.div>
                  {/* Download Brochure Button */}
                  {vehicle.brochure && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                      className="mb-6"
                    >
                      <a
                        href={vehicle.brochure.replace('/upload/', '/upload/fl_attachment/')}
                        download
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl px-6 py-2 text-base shadow-lg hover:scale-105 transition"
                      >
                        <Download className="w-5 h-5" />
                        Download Brochure
                      </a>
                    </motion.div>
                  )}
                  {/* Technical Details Row */}
                  <div className="flex items-center gap-8 bg-white/80 rounded-xl px-4 py-2 shadow border border-emerald-200 mb-4">
                    <span className="flex items-center gap-2 text-emerald-700 font-semibold text-base">
                      <Gauge className="w-5 h-5 text-emerald-600" />
                      Engine: <span className="font-bold">{vehicle.specs?.Engine || vehicle.specs?.Displacement || '-'}</span>
                    </span>
                    <span className="flex items-center gap-2 text-emerald-700 font-semibold text-base">
                      <Zap className="w-5 h-5 text-emerald-600" />
                      Power: <span className="font-bold">{vehicle.specs?.Power || '-'}</span>
                    </span>
                    <span className="flex items-center gap-2 text-emerald-700 font-semibold text-base">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Torque: <span className="font-bold">{vehicle.specs?.Torque || '-'}</span>
                    </span>
                  </div>
                </motion.div>
                {/* Vehicle Images (right) */}
                <motion.div
                  className="relative z-0"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="relative aspect-[4/3] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        <img
                          src={currentImages[currentImageIndex] || "/hero-bg.jpg"}
                          alt={vehicle.name}
                          className="object-cover w-full h-full cursor-pointer"
                          onClick={() => setShowImageGallery(true)}
                        />
                        <div
                          className="absolute left-1/2 bottom-6 -translate-x-1/2 w-2/3 h-8 bg-black/20 rounded-full blur-md opacity-60 pointer-events-none"
                          style={{ zIndex: 1 }}
                        />
                      </motion.div>
                    </AnimatePresence>
                    {currentImages.length > 1 && (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute left-4 top-1/2 -translate-y-1/2"
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-white/80 hover:bg-white backdrop-blur-sm"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-white/80 hover:bg-white backdrop-blur-sm"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </>
                    )}
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {currentImages.map((_, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.2 }}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex ? "bg-white" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                    {/* Video Play Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowVideo(true)}
                      className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full backdrop-blur-sm"
                    >
                      <Play className="h-5 w-5" />
                    </motion.button>
                  </div>
                  {/* Thumbnail Gallery */}
                  {currentImages.length > 1 && (
                    <motion.div
                      className="flex gap-3 mt-4 overflow-x-auto pb-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {currentImages.map((image, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex ? "border-blue-600" : "border-gray-200"
                          }`}
                        >
                          <img
                            src={image || "/hero-bg.jpg"}
                            alt={`${vehicle.name} view ${index + 1}`}
                            width={80}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                  {/* Color Selector */}
                  {vehicle.colors && vehicle.colors.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <Card className="mt-4">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            Available Colors
                          </h3>
                          <div className="flex gap-3">
                            {vehicle.colors.map((color: any, index: number) => (
                              <motion.button
                                key={index}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setSelectedColor(color);
                                  setCurrentImageIndex(0);
                                }}
                                className={`w-12 h-12 rounded-full border-4 transition-all ${
                                  selectedColor?.value === color.value
                                    ? "border-blue-600 shadow-lg"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          {selectedColor && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-gray-600 mt-2"
                            >
                              Selected: {selectedColor.name}
                            </motion.p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.section>
          {/* After the hero section, add: */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-primary text-white rounded-2xl p-8 shadow-lg">
              {/* Left column: image slideshow for all color images */}
              <div ref={heroImageRef} className="flex flex-col items-center w-full max-w-md md:order-1 order-2">
                <div className="relative aspect-[4/3] flex items-center justify-center w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={allGalleryImages[currentImageIndex] || "/hero-bg.jpg"}
                        alt={vehicle.name}
                        className="object-cover w-full h-full cursor-pointer"
                        onClick={() => setShowImageGallery(true)}
                      />
                    </motion.div>
                  </AnimatePresence>
                  {allGalleryImages.length > 1 && (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-white/80 hover:bg-white backdrop-blur-sm"
                          onClick={() => setCurrentImageIndex((currentImageIndex - 1 + allGalleryImages.length) % allGalleryImages.length)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-white/80 hover:bg-white backdrop-blur-sm"
                          onClick={() => setCurrentImageIndex((currentImageIndex + 1) % allGalleryImages.length)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </>
                  )}
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {allGalleryImages.map((_, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-white/80 mt-2">100% Genuine. Warranty Included.</span>
              </div>
              {/* Right column: offer text and Pre-Book button */}
              <div className="w-full flex flex-col items-center text-center md:order-2 order-1 bg-gradient-to-br from-emerald-400 via-blue-200 to-green-200 rounded-3xl p-8 shadow-xl border border-emerald-100">
                <h2 className="text-3xl font-bold mb-2 text-emerald-900 drop-shadow">Unleash the Power. Ride with Confidence.</h2>
                <p className="text-lg mb-6 max-w-xl text-emerald-800">Discover the perfect blend of performance, style, and reliability. Every ride is a new adventure with AKR & SONS.</p>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <span className="inline-flex items-center bg-white text-emerald-600 px-3 py-1 rounded-full font-semibold text-sm border border-emerald-200 shadow-sm">
                    <CheckCircle className="h-4 w-4 mr-1 text-emerald-400" /> 2-Year Warranty
                  </span>
                  <span className="inline-flex items-center bg-white text-emerald-600 px-3 py-1 rounded-full font-semibold text-sm border border-emerald-200 shadow-sm">
                    <Gauge className="h-4 w-4 mr-1 text-emerald-400" /> Best-in-Class Mileage
                  </span>
                  <span className="inline-flex items-center bg-white text-emerald-700 px-3 py-1 rounded-full font-semibold text-sm border border-emerald-200 shadow-sm">
                    <Star className="h-4 w-4 mr-1 text-emerald-400" /> 24/7 Service Support
                  </span>
                  <span className="inline-flex items-center bg-white text-emerald-600 px-3 py-1 rounded-full font-semibold text-sm border border-emerald-200 shadow-sm">
                    <Zap className="h-4 w-4 mr-1 text-emerald-400" /> Flexible Financing
                  </span>
                  <span className="inline-flex items-center bg-white text-emerald-600 px-3 py-1 rounded-full font-semibold text-sm border border-emerald-200 shadow-sm">
                    <CheckCircle className="h-4 w-4 mr-1 text-emerald-400" /> First 2 Services Free
                  </span>
                </div>
                {/* New: Choose One Offer */}
                <div className="mt-4 w-full max-w-3xl">
                  <h3 className="text-xl font-bold mb-4 text-emerald-700 text-center drop-shadow">Choose One of These Exclusive Offers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-emerald-200 rounded-xl p-4 flex flex-col items-center text-center shadow min-h-[120px]">
                      <span className="font-semibold text-lg text-emerald-700 mb-1">Full Tank Petrol + Jacket + Helmet</span>
                      <span className="text-sm text-emerald-600">Get a full tank of petrol, a stylish jacket, and a helmet with your new ride.</span>
                      <span className="text-xs text-emerald-500 font-semibold mt-2">Only for Ready Cash Payments</span>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-xl p-4 flex flex-col items-center text-center shadow min-h-[120px]">
                      <span className="font-semibold text-lg text-emerald-700 mb-1">15,000 LKR Discount</span>
                      <span className="text-sm text-emerald-600">Enjoy an instant discount of 15,000 LKR on your purchase.</span>
                      <span className="text-xs text-emerald-500 font-semibold mt-2">Only for Ready Cash Payments</span>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-xl p-4 flex flex-col items-center text-center shadow min-h-[120px]">
                      <span className="font-semibold text-lg text-emerald-700 mb-1">Registration Fee Waived</span>
                      <span className="text-sm text-emerald-600">We’ll cover your registration fee for a hassle-free start.</span>
                      <span className="text-xs text-emerald-500 font-semibold mt-2">Only for Ready Cash Payments</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-8 w-full relative z-20">
                  <Button
                    onClick={() => navigate('/prebook')}
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-extrabold rounded-2xl px-10 py-4 text-xl shadow-2xl border-2 border-white hover:scale-105 transition"
                  >
                    Pre-Book
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>
          {/* Detailed Content Sections */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-16">
            {/* Specifications Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            >
              <div className="flex flex-col items-center justify-center">
                <motion.h2
                  className="text-3xl font-extrabold text-emerald-800 mb-2 text-center"
                  initial={{ scale: 0.95, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                >
                  Specifications & Features
                </motion.h2>
                <div className="border-b-4 border-emerald-400 w-16 mx-auto mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl items-start">
                  {['Engine', 'Brakes & Tyres', 'Electricals', 'Vehicle'].filter(heading => groupedSpecs[heading]).map((heading) => {
                    const specs = groupedSpecs[heading];
                    let icon: React.ReactNode = null;
                    if (heading === 'Engine') icon = <Gauge className="w-7 h-7 text-emerald-500 mr-2" />;
                    else if (heading === 'Brakes & Tyres') icon = <Star className="w-7 h-7 text-emerald-500 mr-2" />;
                    else if (heading === 'Electricals') icon = <Zap className="w-7 h-7 text-emerald-500 mr-2" />;
                    else if (heading === 'Vehicle') icon = <Settings className="w-7 h-7 text-emerald-700 mr-2" />;
                    else return null;
                    return (
                      <motion.div
                        key={heading}
                        className="bg-white rounded-2xl shadow-lg border-l-4 border-emerald-400 p-6 flex flex-col min-h-[220px]"
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      >
                        <div className="flex items-center mb-4">
                          {icon}
                          <h3 className="text-xl font-bold text-emerald-800">{heading}</h3>
                        </div>
                        <table className="w-full text-left text-sm divide-y divide-emerald-50">
                          <tbody>
                            {(specs as { label: string; value: string }[]).map(spec => (
                              <tr key={spec.label}>
                                <td className="py-2 pr-2 text-gray-500 font-medium whitespace-nowrap align-top">{spec.label}</td>
                                <td className="py-2 text-emerald-700 font-bold align-top">{spec.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    );
                  })}
                  {/* Features as a card matching specs style */}
                  {vehicle.features && vehicle.features.length > 0 && (
                    <motion.div
                      className="bg-white rounded-2xl shadow-lg border-l-4 border-emerald-400 p-6 flex flex-col min-h-[220px]"
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    >
                      <div className="flex items-center mb-4">
                        <Star className="w-7 h-7 text-emerald-500 mr-2" />
                        <h3 className="text-xl font-bold text-emerald-800">Features</h3>
                      </div>
                      <div className="w-full flex flex-wrap gap-2 mt-2">
                        {vehicle.features.map((feature: string, index: number) => (
                          <span
                            key={index}
                            className="inline-block bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 text-xs font-semibold mr-2 mb-2 border border-emerald-200"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Variants */}
            {vehicle.variants && vehicle.variants.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <motion.h2
                    className="text-2xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-primary"
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                  >
                    Variants
                  </motion.h2>
                  <div className="w-full">
                    {vehicle.variants.map((variant: any, index: number) => (
                      <motion.div
                        key={index}
                        className="rounded-xl p-4 bg-white/60 backdrop-blur-md shadow border border-white/50 flex flex-col items-center mb-4"
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      >
                        <h3 className="text-xl font-bold mb-2 text-emerald-700 text-center">{variant.name}</h3>
                        <span className="text-lg font-bold text-emerald-700 mb-1">LKR {variant.price}</span>
                        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full text-center">
                          {variant.features?.map((feature: string, fIndex: number) => (
                            <motion.li
                              key={fIndex}
                              className="text-base font-semibold text-gray-900 bg-white/80 rounded px-3 py-1 shadow-sm mx-auto"
                              initial={{ scale: 0.97, opacity: 0 }}
                              whileInView={{ scale: 1, opacity: 1 }}
                              transition={{ delay: fIndex * 0.03, type: 'spring', bounce: 0.2, duration: 0.3 }}
                            >
                              {feature}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </div>

            {/* Reviews Section */}
            {vehicle.reviews && vehicle.reviews.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-600" />
                      Customer Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vehicle.reviews.map((review: any, index: number) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <Avatar>
                                  <AvatarImage src={review.avatar || "/hero-bg.jpg"} />
                                  <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{review.name}</h4>
                                    <span className="text-sm text-gray-500">{review.date}</span>
                                  </div>
                                  <p className="text-gray-700">{review.comment}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Gallery Section */}
            {vehicle.galleryImages && vehicle.galleryImages.length > 0 ? (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-emerald-600" />
                      Photo Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0">
                      {vehicle.galleryImages.map((image: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          className="aspect-square overflow-hidden cursor-pointer"
                          onClick={() => {
                            setCurrentImageIndex(index);
                            setShowImageGallery(true);
                          }}
                        >
                          <img
                            src={image || "/hero-bg.jpg"}
                            alt={`${vehicle.name} gallery ${index + 1}`}
                            width={60}
                            height={60}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            ) : (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-emerald-600" />
                      Photo Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-500">No gallery images available.</div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* FAQ Section */}
            {vehicle.faqs && vehicle.faqs.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-emerald-600" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {vehicle.faqs.map((faq: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="border-l-4 border-emerald-600 pl-4"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">Q: {faq.question}</h3>
                        <p className="text-gray-700">A: {faq.answer}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </div>
          {/* Enhanced Booking Modal */}
          <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Book Now - {vehicle.name}</DialogTitle>
              </DialogHeader>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+94 77 123 4567" />
                </div>
                <div>
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input id="preferredDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="preferredTime">Preferred Time</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9am">9:00 AM</SelectItem>
                      <SelectItem value="11am">11:00 AM</SelectItem>
                      <SelectItem value="2pm">2:00 PM</SelectItem>
                      <SelectItem value="4pm">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Additional Message</Label>
                  <Textarea id="message" placeholder="Any specific requirements..." />
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Confirm Booking</Button>
              </motion.div>
            </DialogContent>
          </Dialog>
          {/* Image Gallery Modal */}
          <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
            <DialogContent className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/3]"
              >
                <img
                  src={currentImages[currentImageIndex] || "/hero-bg.jpg"}
                  alt={vehicle.name}
                  className="object-cover w-full h-full rounded-lg"
                />
                {currentImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </motion.div>
              <div className="flex justify-center gap-2 mt-4">
                {currentImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      idx === currentImageIndex ? "bg-emerald-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div> {/* End of glass container */}
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
            <div className="font-semibold mb-2 mt-4">Follow Us</div>
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
    </>
  );
}
