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
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailBike, setDetailBike] = useState<any>(null)
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

  const openDetailModal = (bike: any) => {
    setDetailBike(bike)
    setDetailModalOpen(true)
  }
  const closeDetailModal = () => {
    setDetailModalOpen(false)
    setDetailBike(null)
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
              ).map(([type, bikes]: [string, any[]]) => (
                <div key={type} style={{ marginBottom: 40 }}>
                  <Title level={3} style={{ margin: '24px 0 16px 0', color: '#1890ff', fontWeight: 700 }}>{type}</Title>
                  <Row gutter={[24, 24]}>
                    {bikes.map((bike) => (
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
                          bodyStyle={{ padding: 20 }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>{bike.name}</Title>
                            <Badge color="#d9d9d9" text={bike.category} style={{ fontSize: 12 }} />
                          </div>
                          {/* Removed rating display */}
                          <div style={{ marginBottom: 8 }}>
                            {bike.features && bike.features.map((feature: string, idx: number) => (
                              <Tag color="green" key={idx} style={{ marginBottom: 4 }}>{feature}</Tag>
                            ))}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 18, color: "#222", marginBottom: 8 }}>
                            {bike.price ? `LKR ${bike.price}` : ""}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Button
                              icon={<EyeOutlined />}
                              onClick={() => openDetailModal(bike)}
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
              ))
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
                          bodyStyle={{ padding: 20 }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>{bike.name}</Title>
                            <Badge color="#d9d9d9" text={bike.category} style={{ fontSize: 12 }} />
                          </div>
                          {/* Removed rating display */}
                          <div style={{ marginBottom: 8 }}>
                            {bike.features && bike.features.map((feature: string, idx: number) => (
                              <Tag color="green" key={idx} style={{ marginBottom: 4 }}>{feature}</Tag>
                            ))}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 18, color: "#222", marginBottom: 8 }}>
                            {bike.price ? `LKR ${bike.price}` : ""}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Button
                              icon={<EyeOutlined />}
                              onClick={() => openDetailModal(bike)}
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

      {/* Vehicle Detail Modal */}
      <Modal
        open={detailModalOpen}
        onCancel={closeDetailModal}
        footer={null}
        width={700}
        centered
        title={detailBike?.name}
      >
        {detailBike && (
          <div style={{ padding: 8 }}>
            {/* Color Gallery */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, justifyContent: 'center' }}>
                {detailBike.colors?.map((color: any) => (
                  <div
                    key={color.value || color.name}
                    style={{
                      border: (selectedColors[detailBike._id]?.value || detailBike.colors[0]?.value) === color.value ? '2px solid #1890ff' : '1px solid #eee',
                      borderRadius: 12,
                      padding: 6,
                      cursor: 'pointer',
                      background: '#f6faff',
                      minWidth: 60,
                      textAlign: 'center',
                      boxShadow: (selectedColors[detailBike._id]?.value || detailBike.colors[0]?.value) === color.value ? '0 2px 8px #e6f7ff' : 'none',
                      transition: 'box-shadow 0.2s',
                    }}
                    onClick={() => handleColorChange(detailBike._id, color)}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: color.hex, margin: '0 auto 6px auto', border: '1.5px solid #ccc', boxShadow: '0 1px 4px #eee' }} />
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{color.name}</div>
                  </div>
                ))}
              </div>
              {/* Images for selected color */}
              <Image.PreviewGroup
                preview={{
                  visible: imagePreviewOpen,
                  onVisibleChange: (vis) => setImagePreviewOpen(vis),
                  current: 0,
                  items: (selectedColors[detailBike._id]?.images || detailBike.colors?.[0]?.images || detailBike.images || []).map((img: string) => ({ src: img })),
                }}
              >
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, overflowX: 'auto', justifyContent: 'center' }}>
                  {(selectedColors[detailBike._id]?.images || detailBike.colors?.[0]?.images || detailBike.images || []).map((img: string, idx: number) => (
                    <Image
                      key={idx}
                      src={img}
                      alt="vehicle"
                      style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #e6e6e6', boxShadow: '0 2px 8px #f0f1f2', cursor: 'pointer' }}
                      preview={{ src: img }}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            </div>
            {/* Details Section */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 18, marginBottom: 18, boxShadow: '0 1px 6px #f0f1f2' }}>
              <div style={{ marginBottom: 10 }}>
                <Text strong>Description: </Text>{detailBike.description || '-'}
              </div>
              {detailBike.specs && typeof detailBike.specs === 'object' && Object.keys(detailBike.specs).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <Text strong>Specs: </Text>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {Object.entries(detailBike.specs).map(([k, v]) => (
                      <li key={k} style={{ marginBottom: 2 }}><b>{k}:</b> {v}</li>
                    ))}
                  </ul>
                </div>
              )}
              {detailBike.features && detailBike.features.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <Text strong>Features: </Text>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {detailBike.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {detailBike.variants && detailBike.variants.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <Text strong>Variants: </Text>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {detailBike.variants.map((v: any, i: number) => <li key={i}><b>{v.name}</b>{v.features && v.features.length ? `: ${v.features.join(', ')}` : ''}</li>)}
                  </ul>
                </div>
              )}
              {detailBike.faqs && detailBike.faqs.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <Text strong>FAQs: </Text>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {detailBike.faqs.map((f: any, i: number) => (
                      <li key={i}><b>Q:</b> {f.question} <b>A:</b> {f.answer}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: 20, color: "#1890ff", marginBottom: 8, marginTop: 12 }}>
                {detailBike.price ? `LKR ${detailBike.price}` : ""}
              </div>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                style={{ width: '100%', fontWeight: 600, fontSize: 16 }}
                onClick={() => { handleBookNow(detailBike); closeDetailModal(); }}
              >
                Book Now
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Image Preview Modal for Card Images */}
      <Image.PreviewGroup
        preview={{
          visible: imagePreviewOpen,
          onVisibleChange: (vis) => setImagePreviewOpen(vis),
        }}
      >
        {previewImages.map((img, idx) => (
          <Image key={idx} src={img} alt="vehicle" style={{ display: 'none' }} />
        ))}
      </Image.PreviewGroup>
    </div>
  )
} 