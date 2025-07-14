"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, ShoppingCart, Eye, Heart, Star } from "lucide-react"

// Sample bike data with different brands and models
const bikeData = {
  bajaj: [
    {
      id: 1,
      name: "Bajaj Pulsar NS200",
      price: 145000,
      category: "Sport",
      stock: 15,
      colors: ["Red", "Black", "Blue", "White"],
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.5,
      features: ["200cc Engine", "Liquid Cooled", "ABS", "LED Headlight"],
    },
    {
      id: 2,
      name: "Bajaj Pulsar N160",
      price: 125000,
      category: "Street",
      stock: 22,
      colors: ["Black", "Red", "Blue"],
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.3,
      features: ["160cc Engine", "Oil Cooled", "Single Channel ABS", "LED DRL"],
    },
    {
      id: 3,
      name: "Bajaj CT100",
      price: 65000,
      category: "Commuter",
      stock: 35,
      colors: ["Black", "Red", "Blue", "Silver"],
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.1,
      features: ["100cc Engine", "Fuel Efficient", "Electric Start", "Tubeless Tyres"],
    },
    {
      id: 4,
      name: "Bajaj N16 Premium",
      price: 95000,
      category: "Premium",
      stock: 18,
      colors: ["Black", "Silver", "Red"],
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.4,
      features: ["160cc Engine", "Premium Design", "Digital Console", "Alloy Wheels"],
    },
  ],
  honda: [
    {
      id: 5,
      name: "Honda CB Shine",
      price: 75000,
      category: "Commuter",
      stock: 28,
      colors: ["Black", "Red", "Silver"],
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.2,
      features: ["125cc Engine", "HET Technology", "CBS", "LED Headlight"],
    },
    {
      id: 6,
      name: "Honda Hornet 2.0",
      price: 135000,
      category: "Sport",
      stock: 12,
      colors: ["Red", "Black", "Yellow"],
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.6,
      features: ["184cc Engine", "LED Setup", "Single Channel ABS", "Digital Display"],
    },
  ],
  yamaha: [
    {
      id: 7,
      name: "Yamaha FZ-S",
      price: 115000,
      category: "Street",
      stock: 20,
      colors: ["Blue", "Black", "Red"],
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.4,
      features: ["149cc Engine", "Fuel Injection", "LED Headlight", "ABS"],
    },
    {
      id: 8,
      name: "Yamaha R15 V4",
      price: 175000,
      category: "Sport",
      stock: 8,
      colors: ["Blue", "Black", "Red"],
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.7,
      features: ["155cc Engine", "VVA Technology", "Slipper Clutch", "Dual Channel ABS"],
    },
  ],
}

const allBikes = Object.values(bikeData).flat()

export default function AKRSonsBikeStore() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBike, setSelectedBike] = useState(null)
  const [selectedColor, setSelectedColor] = useState("")

  const categories = ["All", "Sport", "Street", "Commuter", "Premium"]
  const brands = ["All", "Bajaj", "Honda", "Yamaha"]

  const filteredBikes = allBikes.filter((bike) => {
    const matchesCategory = selectedCategory === "All" || bike.category === selectedCategory
    const matchesBrand = selectedBrand === "All" || bike.name.toLowerCase().includes(selectedBrand.toLowerCase())
    const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesBrand && matchesSearch
  })

  const handleBikeClick = (bike) => {
    setSelectedBike(bike)
    setSelectedColor(bike.colors[0])
  }

  const handleBackToStore = () => {
    setSelectedBike(null)
    setSelectedColor("")
  }

  if (selectedBike) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-lg border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBackToStore}
                className="flex items-center space-x-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Store</span>
              </Button>
              <div className="flex items-center space-x-4">
                <img src="/images/company-logo.png" alt="AKR Logo" className="h-10 w-10" />
                <h1 className="text-2xl font-bold gradient-text">AKR & SONS Bike Store</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Bike Detail Page */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Bike Images */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <img
                  src={selectedBike.image || "/placeholder.svg"}
                  alt={selectedBike.name}
                  className="w-full h-96 object-cover rounded-xl"
                />
              </div>

              {/* Color Selection */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4">Available Colors</h3>
                <div className="flex space-x-3">
                  {selectedBike.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                        selectedColor === color
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bike Details */}
            <div className="space-y-6">
              <div className="glass-card p-8 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {selectedBike.category}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{selectedBike.rating}</span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-4 gradient-text">{selectedBike.name}</h1>
                <p className="text-2xl font-bold text-primary mb-6">Rs. {selectedBike.price.toLocaleString()}</p>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBike.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span>Stock Available:</span>
                    <Badge variant={selectedBike.stock > 10 ? "default" : "destructive"}>
                      {selectedBike.stock} units
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-lg py-6">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Book Now
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="py-3 bg-transparent">
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Wishlist
                    </Button>
                    <Button variant="outline" className="py-3 bg-transparent">
                      <Eye className="w-4 h-4 mr-2" />
                      Test Drive
                    </Button>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Engine:</span>
                    <span className="font-medium">{selectedBike.features[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cooling:</span>
                    <span className="font-medium">{selectedBike.features[1]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Brakes:</span>
                    <span className="font-medium">{selectedBike.features[2]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lighting:</span>
                    <span className="font-medium">{selectedBike.features[3]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to AKR Group</span>
            </Button>
            <div className="flex items-center space-x-4">
              <img src="/images/company-logo.png" alt="AKR Logo" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold gradient-text">AKR & SONS (PVT) LTD</h1>
                <p className="text-sm text-gray-600">Premium Bike Store & Management System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Premium Bike Collection</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover our extensive range of motorcycles from top brands. Quality, performance, and style combined.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold">200+</div>
              <div className="text-sm opacity-90">NS Series</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">160+</div>
              <div className="text-sm opacity-90">N Series</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100+</div>
              <div className="text-sm opacity-90">CT Series</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">16+</div>
              <div className="text-sm opacity-90">Premium Models</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bikes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Bike Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBikes.map((bike) => (
              <Card
                key={bike.id}
                className="glass-card overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={bike.image || "/placeholder.svg"}
                    alt={bike.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary text-white">{bike.category}</Badge>
                  <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{bike.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 group-hover:gradient-text transition-all duration-300">
                    {bike.name}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-4">Rs. {bike.price.toLocaleString()}</p>

                  {/* Colors */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Available Colors:</p>
                    <div className="flex space-x-2">
                      {bike.colors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border-2 border-gray-300"
                          style={{
                            backgroundColor: color.toLowerCase() === "silver" ? "#C0C0C0" : color.toLowerCase(),
                          }}
                          title={color}
                        />
                      ))}
                      {bike.colors.length > 4 && (
                        <span className="text-xs text-gray-500">+{bike.colors.length - 4}</span>
                      )}
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="mb-4">
                    <Badge variant={bike.stock > 10 ? "default" : "destructive"} className="text-xs">
                      {bike.stock} in stock
                    </Badge>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-1">
                      {bike.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
                      onClick={() => handleBikeClick(bike)}
                    >
                      View Details
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4 mr-1" />
                        Wishlist
                      </Button>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-4">Why Choose AKR & SONS?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive bike solutions with exceptional service and support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center glass-card p-8 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Booking</h3>
              <p className="text-gray-600">Simple online booking system with instant confirmation</p>
            </div>

            <div className="text-center glass-card p-8 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Test Drive</h3>
              <p className="text-gray-600">Free test drive facility for all our premium bikes</p>
            </div>

            <div className="text-center glass-card p-8 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">After Sales Service</h3>
              <p className="text-gray-600">Comprehensive maintenance and support services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/images/company-logo.png" alt="AKR Logo" className="h-8 w-8" />
                <h3 className="text-xl font-bold">AKR & SONS</h3>
              </div>
              <p className="text-gray-400">Your trusted partner for premium motorcycles and exceptional service.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    All Bikes
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Test Drive
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Brands</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Bajaj
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Honda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Yamaha
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    TVS
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Phone: 0773111266</li>
                <li>Email: akrfuture@gmail.com</li>
                <li>Address: Murunkan, Sri Lanka</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AKR & SONS (PVT) LTD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
