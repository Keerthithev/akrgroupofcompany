import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "AKR Group of Companies",
    subtitle: "Empowering diverse industries through innovation and excellence",
    image: "/images/akr-sons.jpg",
    description: "Leading private enterprise providing comprehensive business solutions"
  },
  {
    id: 2,
    title: "AKR Multi Complex",
    subtitle: "Modern commercial and residential spaces",
    image: "/images/akr-multi-complex.jpg",
    description: "Premium spaces for businesses and families"
  },
  {
    id: 3,
    title: "AKR Construction",
    subtitle: "Building the future with quality and innovation",
    image: "/images/akr-construction.jpg",
    description: "High-quality infrastructure and commercial projects"
  },
  {
    id: 4,
    title: "AKR Farm",
    subtitle: "Sustainable agriculture for a better tomorrow",
    image: "/images/akr-farm.jpg",
    description: "Organic farming practices and fresh produce"
  },
  {
    id: 5,
    title: "Our Family Legacy",
    subtitle: "Built on strong family values and traditions",
    image: "/images/image copy.png",
    description: "Meet the family behind AKR Group's success story"
  }
]

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Change slide every 5 seconds

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
    <div className="relative h-96 w-3/4 mx-auto overflow-hidden rounded-xl">
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
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/20 to-background/60" />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center max-w-xl mx-auto px-4">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-lg">
                  <span className="text-white">{slide.title}</span>
                </h1>
                <p className="text-base md:text-lg text-white font-semibold max-w-lg mx-auto leading-relaxed">
                  {slide.subtitle}
                </p>
                <p className="text-sm md:text-base text-white font-medium max-w-md mx-auto">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-3">
                  <Button 
                    size="sm" 
                    className="text-sm px-4 py-2 bg-gradient-primary hover:bg-gradient-primary/90"
                    onClick={() => {
                      if (slide.id === 5) {
                        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        document.getElementById('companies')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    {slide.id === 5 ? "Meet Our Family" : "Explore Our Companies"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm px-4 py-2 border-white/50 hover:bg-white/10 bg-transparent text-white"
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300 backdrop-blur-sm"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300 backdrop-blur-sm"
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 z-20 text-white/80 text-xs">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  )
} 