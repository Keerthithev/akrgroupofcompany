import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Palette } from "lucide-react"

interface ColorOption {
  name: string
  value: string
  hex: string
  image: string
  available: boolean
}

interface ColorSelectorProps {
  bikeName: string
  colors: ColorOption[]
  onColorChange: (color: ColorOption) => void
  selectedColor: ColorOption
}

export function ColorSelector({ bikeName, colors, onColorChange, selectedColor }: ColorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Color Display */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Color:</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <span className="text-sm text-gray-800 font-medium">{selectedColor.name}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto"
        >
          Change Color
        </Button>
      </div>

      {/* Color Picker Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2">
          <Card className="p-4 shadow-xl border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">Select Color for {bikeName}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {colors.map((color) => (
                  <div
                    key={color.value}
                    className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                      selectedColor.value === color.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!color.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (color.available) {
                        onColorChange(color)
                        setIsOpen(false)
                      }
                    }}
                  >
                    <div className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{color.name}</div>
                          {!color.available && (
                            <Badge variant="secondary" className="text-xs">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                        {selectedColor.value === color.value && (
                          <Check className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
} 