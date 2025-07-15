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
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    async function fetchVehicle() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5050/api/vehicles/${id}`);
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
          <Button onClick={() => navigate(-1)} size="lg">
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentImages = getCurrentImages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Floating Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div whileHover={{ x: -5 }}>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Store
              </Button>
            </motion.div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">AKR & SONS</h1>
              <p className="text-sm text-gray-500">Premium Motorcycle Dealership</p>
            </div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLiked(!isLiked)}
                  className={isLiked ? "text-red-500" : "text-gray-500"}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => navigate('/prebook')} className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Pre-Book
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section ref={heroRef} style={{ y, opacity }} className="relative pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Vehicle Images */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
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
                </CardContent>
              </Card>
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
            {/* Vehicle Info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Badge variant="secondary" className="mb-3 text-sm px-3 py-1">
                    {vehicle.category}
                  </Badge>
                </motion.div>
                <motion.h1
                  className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {vehicle.name}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4 mb-6"
                >
                  {vehicle.price && <p className="text-3xl font-bold text-blue-600">LKR {vehicle.price}</p>}
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {vehicle.availability}
                  </Badge>
                </motion.div>
              </div>
              {/* Quick Stats */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { icon: Gauge, label: "Power", value: vehicle.specs?.Power },
                  { icon: Zap, label: "Torque", value: vehicle.specs?.Torque },
                  { icon: Fuel, label: "Mileage", value: vehicle.specs?.Mileage },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 bg-white rounded-xl shadow-sm border"
                  >
                    <stat.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="font-semibold text-gray-900">{stat.value}</p>
                  </motion.div>
                ))}
              </motion.div>
              {/* Description */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button
                    onClick={() => navigate('/prebook')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Pre-Book
                  </Button>
                </motion.div>
              </motion.div>
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
          <div>
            <h2 className="text-3xl font-bold mb-2">Unleash the Power. Ride with Confidence.</h2>
            <p className="text-lg mb-4">
              Discover the perfect blend of performance, style, and reliability. Every ride is a new adventure with AKR & SONS.
            </p>
            <div className="flex flex-wrap gap-4 mb-4">
              <span className="inline-flex items-center bg-white/20 text-white px-3 py-1 rounded-full font-semibold text-sm">
                <CheckCircle className="h-4 w-4 mr-1" /> 2-Year Warranty
              </span>
              <span className="inline-flex items-center bg-white/20 text-white px-3 py-1 rounded-full font-semibold text-sm">
                <Gauge className="h-4 w-4 mr-1" /> Best-in-Class Mileage
              </span>
              <span className="inline-flex items-center bg-white/20 text-white px-3 py-1 rounded-full font-semibold text-sm">
                <Star className="h-4 w-4 mr-1" /> 24/7 Service Support
              </span>
              <span className="inline-flex items-center bg-white/20 text-white px-3 py-1 rounded-full font-semibold text-sm">
                <Zap className="h-4 w-4 mr-1" /> Flexible Financing
              </span>
            </div>
            <Button
              onClick={() => navigate('/prebook')}
              className="bg-white/20 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform border border-white/30"
            >
              Pre-Book
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={currentImages[0] || '/hero-bg.jpg'}
              alt={vehicle.name}
              className="w-72 h-48 object-cover rounded-xl shadow-md mb-4"
            />
            <span className="text-sm text-white/80">100% Genuine. Warranty Included.</span>
          </div>
        </div>
      </motion.section>
      {/* Detailed Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-16">
        {/* Overview Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(vehicle.specs || {}).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Gauge className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{key}</p>
                    <p className="font-bold text-gray-900">{value}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Specifications Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(vehicle.specs || {}).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-600 font-medium">{key}</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Features Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicle.features?.map((feature: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Variants Section */}
        {vehicle.variants && vehicle.variants.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {vehicle.variants.map((variant: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          <div className="flex justify-between items-center">
                            <CardTitle>{variant.name}</CardTitle>
                            <Badge variant="secondary" className="bg-white text-blue-600">
                              LKR {variant.price}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {variant.features?.map((feature: string, fIndex: number) => (
                              <motion.div
                                key={fIndex}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: fIndex * 0.05 }}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">{feature}</span>
                              </motion.div>
                            ))}
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

        {/* Reviews Section */}
        {vehicle.reviews && vehicle.reviews.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
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
        {allGalleryImages.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Photo Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allGalleryImages.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setShowImageGallery(true);
                      }}
                    >
                      <img
                        src={image || "/hero-bg.jpg"}
                        alt={`${vehicle.name} gallery ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
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
                  <Info className="h-5 w-5 text-blue-600" />
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
                    className="border-l-4 border-blue-600 pl-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">Q: {faq.question}</h3>
                    <p className="text-gray-700">A: {faq.answer}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.section>
        )}
        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Ready to Experience the {vehicle.name}?</h2>
                  <p className="mb-6 opacity-90">
                    Visit our showroom for a test drive or get in touch with our experts for more information.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5" />
                      <span>+94 11 234 5678</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5" />
                      <span>info@akrsons.lk</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5" />
                      <span>123 Main Street, Colombo 03</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5" />
                      <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      onClick={() => navigate('/prebook')}
                      className="w-full bg-white text-blue-600 hover:bg-gray-100 py-6 text-lg font-semibold"
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      Pre-Book
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Confirm Booking</Button>
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
            {currentImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
