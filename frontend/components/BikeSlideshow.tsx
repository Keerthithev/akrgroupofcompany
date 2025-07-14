import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, Calendar, MapPin, Phone, Mail } from "lucide-react"
import { ColorSelector } from "@/components/ColorSelector"

interface Bike {
  id: number
  name: string
  price: string
  image: string
  category: string
  rating: number
  features: string[]
  description: string
  specifications: {
    engine: string
    mileage: string
    fuelCapacity: string
    transmission: string
    power: string
    weight: string
  }
  colors: string[]
}

interface BikeSlideshowProps {
  bikes: Bike[]
  onClose: () => void
  onBookNow?: (bike: { name: string; price: string }) => void
  selectedColors?: { [key: number]: any }
  onColorChange?: (bikeId: number, color: any) => void
}

export function BikeSlideshow({ bikes, onClose, onBookNow, selectedColors = {}, onColorChange }: BikeSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % bikes.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + bikes.length) % bikes.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowRight") {
        nextSlide()
      } else if (e.key === "ArrowLeft") {
        prevSlide()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const currentBike = bikes[currentIndex]
  
  const getBikeImage = (bike: any) => {
    if (bike.colorOptions && selectedColors[bike.id]) {
      return selectedColors[bike.id].image
    }
    return bike.image
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-old-english text-gray-800">Bike Details</h2>
          <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </Button>
        </div>

        {/* Slideshow Content */}
        <div className="flex-1 flex h-0">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-8">
              {/* Bike Image and Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-full h-80 rounded-xl overflow-hidden relative">
                    <img
                      src={getBikeImage(currentBike)}
                      alt={currentBike.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {/* Fallback placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center hidden">
                      <div className="text-gray-500 text-xl font-medium">Bike Image</div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2">
                    {bikes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-old-english text-gray-800 mb-2">
                      {currentBike.name}
                    </h1>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline" className="text-sm">
                        {currentBike.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(currentBike.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">({currentBike.rating})</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-4">
                      {currentBike.price}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {currentBike.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentBike.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Colors</h3>
                    {currentBike.colorOptions && onColorChange ? (
                      <ColorSelector
                        bikeName={currentBike.name}
                        colors={currentBike.colorOptions}
                        selectedColor={selectedColors[currentBike.id] || currentBike.colorOptions[0]}
                        onColorChange={(color) => onColorChange(currentBike.id, color)}
                      />
                    ) : (
                      <div className="flex gap-2">
                        {currentBike.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-2xl font-old-english text-gray-800 mb-6">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Engine</h4>
                    <p className="text-gray-600">{currentBike.specifications.engine}</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Mileage</h4>
                    <p className="text-gray-600">{currentBike.specifications.mileage}</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Fuel Capacity</h4>
                    <p className="text-gray-600">{currentBike.specifications.fuelCapacity}</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Transmission</h4>
                    <p className="text-gray-600">{currentBike.specifications.transmission}</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Power</h4>
                    <p className="text-gray-600">{currentBike.specifications.power}</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Weight</h4>
                    <p className="text-gray-600">{currentBike.specifications.weight}</p>
                  </Card>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-2xl font-old-english text-gray-800 mb-6">Get This Bike</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Call Us</h4>
                    <p className="text-gray-600">+94 11 234 5678</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Email Us</h4>
                    <p className="text-gray-600">info@akrsons.lk</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Visit Us</h4>
                    <p className="text-gray-600">Colombo, Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {currentIndex + 1} of {bikes.length} bikes
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              className="bg-gradient-primary hover:bg-gradient-primary/90"
              onClick={() => onBookNow && onBookNow({ name: currentBike.name, price: currentBike.price })}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 