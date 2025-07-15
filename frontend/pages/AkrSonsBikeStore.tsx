import React from "react"
import { useEffect, useState } from "react"
import { Row, Col, Card, Button, Typography, Badge, Spin, message, Modal, Tag, Select, Image, Grid } from "antd"
import { ArrowLeftOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, EyeOutlined, CalendarOutlined, StarFilled, ShoppingCartOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { BikeSlideshow } from "@/components/BikeSlideshow"
import { BookingForm } from "@/components/BookingForm"
import { ColorSelector } from "@/components/ColorSelector"

const { Title, Text } = Typography
const AKR_COMPANY_NAME = "AKR & SONS (PVT) LTD"

export default function AkrSonsBikeStore() {
  const navigate = useNavigate()
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedBike, setSelectedBike] = useState<any>(null)
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: any }>({})
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [company, setCompany] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<string>('All')
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const screens = Grid.useBreakpoint()

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

  const handleBookNow = (bike: any) => {
    setSelectedBike(bike)
    setShowBookingForm(true)
  }

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

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)" }}>
      {/* Navigation */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #f0f0f0", boxShadow: "0 2px 8px #f0f1f2" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate("/")} style={{ fontSize: 16, padding: 0 }}>
            Back to Home
          </Button>
          <div style={{ textAlign: "center" }}>
            <Title level={4} style={{ margin: 0, color: "#222", fontWeight: 700 }}>AKR & SONS</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Premium Motorcycle Dealership</Text>
          </div>
          <Button icon={<PhoneOutlined />} type="default" size="middle">
            Contact
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 16px 0 16px", textAlign: "center" }}>
        <Title level={2} style={{ fontWeight: 700, marginBottom: 8 }}>Premium Motorcycles</Title>
        <Text style={{ fontSize: 18, color: "#555" }}>
          Discover our collection of reliable, fuel-efficient motorcycles perfect for your daily commute and adventures.
        </Text>
        {/* Real location if available */}
        {company?.location && (
          <div style={{ margin: "24px 0 0 0", color: '#888', fontSize: 16 }}>
            <EnvironmentOutlined style={{ color: '#fa541c', marginRight: 6 }} />
            {company.location}
          </div>
        )}
      </div>

      {/* Bikes Grid - Categorized by vehicleType */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px", position: 'relative' }}>
        {/* Vehicle Type Selector - left side on desktop, top on mobile */}
        {screens.md ? (
          <div style={{ position: 'absolute', left: 0, top: 0, width: 220, zIndex: 10, paddingTop: 8 }}>
            <div style={{ position: 'sticky', top: 90 }}>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: 200 }}
                options={[{ value: 'All', label: 'All Vehicle Types' }, ...vehicleTypes.map(type => ({ value: type, label: type }))]}
                placement="bottomLeft"
              />
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ minWidth: 180, width: '100%' }}
              options={[{ value: 'All', label: 'All Vehicle Types' }, ...vehicleTypes.map(type => ({ value: type, label: type }))]}
              placement="bottomLeft"
            />
          </div>
        )}
        <div style={{ marginLeft: screens.md ? 240 : 0 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}><Spin size="large" /></div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "#f5222d", fontSize: 18 }}>{error}</div>
        ) : vehicles.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888", fontSize: 18 }}>No vehicles found for AKR & SONS (PVT) LTD.</div>
        ) : (
          (selectedType === 'All'
            ? Object.entries(
                vehicles.reduce((acc: any, v: any) => {
                  if (!acc[v.vehicleType]) acc[v.vehicleType] = [];
                  acc[v.vehicleType].push(v);
                  return acc;
                }, {})
              ).map(([type, bikes]: [string, any]) => {
                const bikesArr = bikes as any[];
                return (
                  <div key={type} style={{ marginBottom: 40 }}>
                    <Title level={3} style={{ margin: '24px 0 16px 0', color: '#1890ff', fontWeight: 700 }}>{type}</Title>
                    <Row gutter={[24, 24]}>
                      {bikesArr.map((bike) => (
                        <Col xs={24} sm={12} md={8} key={bike._id}>
                          <Card
                            hoverable
                            cover={
                              <Image
                                alt={bike.name}
                                src={getBikeImage(bike)}
                                style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 8, cursor: 'pointer' }}
                                onClick={e => { e.stopPropagation(); openImagePreview(bike); }}
                                preview={false}
                                onError={e => (e.currentTarget.src = "/images/placeholder.svg")}
                              />
                            }
                            style={{ borderRadius: 16, boxShadow: "0 2px 8px #f0f1f2" }}
                            styles={{ body: { padding: 20 } }}
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
                            {/* Model Name and Brand */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>{bike.name}</Title>
                              <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{bike.category}</span>
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
                                style={{ flex: 1 }}
                              >
                                View Details
                              </Button>
                              <Button
                                type="primary"
                                icon={<CalendarOutlined />}
                                style={{ flex: 1 }}
                                onClick={() => handleBookNow(bike)}
                              >
                                Book Now
                              </Button>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                );
              })
            : (
                <div style={{ marginBottom: 40 }}>
                  <Title level={3} style={{ margin: '24px 0 16px 0', color: '#1890ff', fontWeight: 700 }}>{selectedType}</Title>
                  <Row gutter={[24, 24]}>
                    {vehicles.filter(v => v.vehicleType === selectedType).map((bike) => (
                      <Col xs={24} sm={12} md={8} key={bike._id}>
                        <Card
                          hoverable
                          cover={
                            <Image
                              alt={bike.name}
                              src={getBikeImage(bike)}
                              style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 8, cursor: 'pointer' }}
                              onClick={e => { e.stopPropagation(); openImagePreview(bike); }}
                              preview={false}
                              onError={e => (e.currentTarget.src = "/images/placeholder.svg")}
                            />
                          }
                          style={{ borderRadius: 16, boxShadow: "0 2px 8px #f0f1f2" }}
                          styles={{ body: { padding: 20 } }}
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
                          {/* Model Name and Brand */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>{bike.name}</Title>
                            <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{bike.category}</span>
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
                              style={{ flex: 1 }}
                            >
                              View Details
                            </Button>
                            <Button
                              type="primary"
                              icon={<CalendarOutlined />}
                              style={{ flex: 1 }}
                              onClick={() => handleBookNow(bike)}
                            >
                              Book Now
                            </Button>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )
          )
        )}
        </div>
      </div>

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
          bikes={vehicles}
          onClose={() => setShowSlideshow(false)}
          onBookNow={handleBookNow}
          selectedColors={selectedColors}
          onColorChange={handleColorChange}
        />
      )}

      {/* Booking Form */}
      {showBookingForm && selectedBike && (
        <BookingForm
          bikeName={selectedBike.name}
          bikePrice={selectedBike.price}
          onClose={() => {
            setShowBookingForm(false)
            setSelectedBike(null)
          }}
        />
      )}

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
    </div>
  )
} 