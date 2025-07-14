"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "AKR Group of Companies",
    subtitle: "Building Excellence Across Industries",
    description:
      "Empowering diverse industries through innovation, excellence, and commitment to sustainable growth across multiple business sectors.",
    image: "/placeholder.svg?height=400&width=800",
    cta: "Explore Our Companies",
  },
  {
    id: 2,
    title: "25+ Years of Excellence",
    subtitle: "Trusted Leadership in Business",
    description:
      "With over two decades of experience, we've built a reputation for quality, reliability, and innovation across all our ventures.",
    image: "/placeholder.svg?height=400&width=800",
    cta: "Our Story",
  },
  {
    id: 3,
    title: "Diverse Business Portfolio",
    subtitle: "From Construction to Beauty Services",
    description:
      "Our companies span multiple industries including construction, retail, agriculture, beauty services, and financial solutions.",
    image: "/placeholder.svg?height=400&width=800",
    cta: "View Companies",
  },
  {
    id: 4,
    title: "Community Focused",
    subtitle: "Making a Positive Impact",
    description:
      "Through AKR's Amma Organization, we're committed to community development and supporting underprivileged families.",
    image: "/placeholder.svg?height=400&width=800",
    cta: "Learn More",
  },
]

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Auto-advance every 5 seconds

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative h-[500px] rounded-2xl overflow-hidden glass-card">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-8">
                <div className="max-w-2xl">
                  <div className="space-y-4 text-white">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                      <span className="gradient-text-light">{slide.title}</span>
                    </h2>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-teal-200">{slide.subtitle}</h3>
                    <p className="text-base md:text-lg leading-relaxed text-gray-200 max-w-xl">{slide.description}</p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button size="lg" className="bg-gradient-primary hover:bg-gradient-primary/90 text-white">
                        {slide.cta}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white/50 hover:bg-white/10 bg-transparent text-white border-2"
                      >
                        Contact Us
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 z-20 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-sm font-medium">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>
    </div>
  )
}
