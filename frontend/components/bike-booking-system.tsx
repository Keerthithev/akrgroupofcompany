"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, Phone, Mail, MapPin, Check } from "lucide-react"

interface BookingFormData {
  customerName: string
  email: string
  phone: string
  address: string
  bikeModel: string
  color: string
  bookingDate: string
  paymentMethod: string
  downPayment: number
}

export function BikeBookingSystem({ bike, onClose }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    bikeModel: bike?.name || "",
    color: bike?.colors[0] || "",
    bookingDate: "",
    paymentMethod: "full",
    downPayment: 0,
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    // Handle booking submission
    console.log("Booking submitted:", formData)
    setStep(5) // Success step
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Customer Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name *</label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => handleInputChange("customerName", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email Address *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Address *</label>
        <textarea
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={3}
          placeholder="Enter your complete address"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Bike Selection</h3>

      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center space-x-4 mb-4">
          <img src={bike.image || "/placeholder.svg"} alt={bike.name} className="w-20 h-20 object-cover rounded-lg" />
          <div>
            <h4 className="text-lg font-semibold">{bike.name}</h4>
            <p className="text-2xl font-bold text-primary">Rs. {bike.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Select Color *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bike.colors.map((color) => (
            <button
              key={color}
              onClick={() => handleInputChange("color", color)}
              className={`p-3 border-2 rounded-lg transition-all duration-300 ${
                formData.color === color
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 hover:border-primary"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Preferred Delivery Date</label>
        <input
          type="date"
          value={formData.bookingDate}
          onChange={(e) => handleInputChange("bookingDate", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Payment Options</h3>

      <div className="space-y-4">
        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
            formData.paymentMethod === "full" ? "border-primary bg-primary/5" : "border-gray-300"
          }`}
          onClick={() => handleInputChange("paymentMethod", "full")}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Full Payment</h4>
              <p className="text-sm text-gray-600">Pay the complete amount now</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Rs. {bike.price.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
            formData.paymentMethod === "installment" ? "border-primary bg-primary/5" : "border-gray-300"
          }`}
          onClick={() => handleInputChange("paymentMethod", "installment")}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Installment Plan</h4>
              <p className="text-sm text-gray-600">Pay in monthly installments</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Rs. {Math.round(bike.price / 12).toLocaleString()}/month</p>
              <p className="text-xs text-gray-500">for 12 months</p>
            </div>
          </div>
        </div>

        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
            formData.paymentMethod === "down" ? "border-primary bg-primary/5" : "border-gray-300"
          }`}
          onClick={() => handleInputChange("paymentMethod", "down")}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Down Payment</h4>
              <p className="text-sm text-gray-600">Pay partial amount now</p>
            </div>
            <div className="text-right">
              <input
                type="number"
                value={formData.downPayment}
                onChange={(e) => handleInputChange("downPayment", Number.parseInt(e.target.value))}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                placeholder="Amount"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

      <div className="glass-card p-6 rounded-lg space-y-4">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-500" />
          <span className="font-medium">{formData.customerName}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Phone className="w-5 h-5 text-gray-500" />
          <span>{formData.phone}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-gray-500" />
          <span>{formData.email}</span>
        </div>

        <div className="flex items-start space-x-2">
          <MapPin className="w-5 h-5 text-gray-500 mt-1" />
          <span>{formData.address}</span>
        </div>
      </div>

      <div className="glass-card p-6 rounded-lg">
        <h4 className="font-semibold mb-3">Bike Details</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="font-medium">{formData.bikeModel}</span>
          </div>
          <div className="flex justify-between">
            <span>Color:</span>
            <span className="font-medium">{formData.color}</span>
          </div>
          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-bold text-primary">Rs. {bike.price.toLocaleString()}</span>
          </div>
          {formData.bookingDate && (
            <div className="flex justify-between">
              <span>Delivery Date:</span>
              <span className="font-medium">{formData.bookingDate}</span>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6 rounded-lg">
        <h4 className="font-semibold mb-3">Payment Details</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-medium capitalize">{formData.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-bold text-primary">
              Rs.{" "}
              {formData.paymentMethod === "full"
                ? bike.price.toLocaleString()
                : formData.paymentMethod === "installment"
                  ? Math.round(bike.price / 12).toLocaleString() + "/month"
                  : formData.downPayment.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-white" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600">Your bike booking has been successfully submitted.</p>
      </div>

      <div className="glass-card p-6 rounded-lg">
        <h4 className="font-semibold mb-3">Booking Reference</h4>
        <p className="text-2xl font-bold text-primary">AKR-{Date.now().toString().slice(-6)}</p>
        <p className="text-sm text-gray-600 mt-2">Please save this reference number for future communication.</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Our team will contact you within 24 hours to confirm the details and arrange delivery.
        </p>
        <Button onClick={onClose} className="bg-gradient-primary">
          Close
        </Button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">Book Your Bike</h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Progress Steps */}
          {step < 5 && (
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-12 h-1 mx-2 ${step > stepNumber ? "bg-primary" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step Content */}
          <div className="mb-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </div>

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={step === 1}>
                Previous
              </Button>

              {step < 4 ? (
                <Button onClick={handleNext} className="bg-gradient-primary">
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-gradient-primary">
                  Confirm Booking
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
