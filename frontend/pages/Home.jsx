import React, { useEffect, useState, useRef } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";
import { 
  Carousel, Row, Col, Card, Button, Typography, Space, Divider, 
  Statistic, Avatar, Tag, Layout, theme, ConfigProvider, Badge, Menu, Dropdown
} from 'antd';
import { 
  EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined,
  FacebookOutlined, InstagramOutlined, TwitterOutlined, LinkedinOutlined,
  CarOutlined, ShoppingOutlined, BuildOutlined, FireOutlined, 
  GiftOutlined, HeartOutlined, CreditCardOutlined, StarOutlined,
  SafetyOutlined, TeamOutlined, RiseOutlined, RightOutlined,
  TrophyOutlined, BulbOutlined, HeartFilled, UserOutlined,
  MenuOutlined, HomeOutlined, InfoCircleOutlined, FileTextOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

// AKR Group Companies Data - Professional color scheme
const AKR_COMPANIES = [
  {
    id: 'akr-sons',
    name: 'AKR Sons (Pvt) Ltd',
    description: 'A trusted premium dealership for Bajaj motorcycles and three-wheelers, offering a diverse range of reliable, fuel-efficient models perfect for every commute and adventure.',
    route: '/akr-sons',
    image: '/images/65D8EAD7-4DFC-4C1A-A902-EC3B7463C756.jpg',
    category: 'Automotive'
  },
  {
    id: 'akr-multicomplex',
    name: 'AKR Multicomplex',
    description: 'A vibrant, all-in-one destination offering premium shopping, dining, entertainment, fitness, hospitality, and vehicle services.',
    route: '/multicomplex',
    image: '/images/akr-multi-complex.jpg',
    category: 'Retail & Entertainment'
  },
  {
    id: 'akr-construction',
    name: 'AKR Construction',
    description: 'Your reliable source for premium construction materials — including sea sand, red soil, metal, gravel, and more.',
    route: '/construction',
    image: '/images/akr-construction.jpg',
    category: 'Construction'
  },
  {
    id: 'akr-filling-station',
    name: 'AKR Lanka Filling Station',
    description: 'Your dependable stop for high-quality fuel, petroleum products, and full automotive services.',
    route: '/filling-station',
    image: '/images/akr-fuel-station.jpg',
    category: 'Energy'
  },
  {
    id: 'akr-wine-store',
    name: 'AKR Wine Store',
    description: 'A refined retail destination offering a curated selection of fine wines from around the world.',
    route: '/wine-store',
    image: '/images/akr-wine-store.jpg',
    category: 'Beverages'
  },
  {
    id: 'akr-farm',
    name: 'AKR Farm',
    description: 'A forward-thinking agricultural initiative promoting sustainable, organic farming practices.',
    route: '/farm',
    image: '/images/akr-farm.jpg',
    category: 'Agriculture'
  },
  {
    id: 'akr-amma',
    name: 'AKR\'s Amma Organization',
    description: 'A heartfelt social initiative dedicated to uplifting communities through charitable projects.',
    route: '/amma',
    image: '/images/AKR AMMA.jpg',
    category: 'Social Impact'
  },
  {
    id: 'akr-easy-credit',
    name: 'AKR Easy Credit (Pvt) Ltd',
    description: 'Your trusted partner for flexible credit solutions and personal loans.',
    route: '/easy-credit',
    image: '/images/akr-easy-credit.jpg',
    category: 'Financial Services'
  }
];

// Core Values Data
const CORE_VALUES = [
  {
    icon: SafetyOutlined,
    title: 'Integrity & Transparency',
    description: 'Building trust through honest business practices and clear communication.',
    color: '#52c41a'
  },
  {
    icon: StarOutlined,
    title: 'Excellence in Service',
    description: 'Delivering exceptional quality in every interaction and transaction.',
    color: '#faad14'
  },
  {
    icon: TeamOutlined,
    title: 'Community Development',
    description: 'Empowering local communities through sustainable initiatives and support.',
    color: '#1890ff'
  },
  {
    icon: RiseOutlined,
    title: 'Sustainable Growth',
    description: 'Fostering long-term success through responsible business practices.',
    color: '#722ed1'
  }
];

const Home = () => {
  const [settings, setSettings] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const slideInterval = useRef(null);
  const navigate = useNavigate();
  const { token } = theme.useToken();

  useEffect(() => {
    api.get("/api/settings").then(res => setSettings(res.data));
  }, []);

  useEffect(() => {
    if (!settings?.akrGroupBanners || settings.akrGroupBanners.length === 0) return;
    if (slideInterval.current) clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setSlideIndex(idx => (idx + 1) % settings.akrGroupBanners.length);
    }, 5000);
    return () => clearInterval(slideInterval.current);
  }, [settings]);

  const handleCompanyClick = (company) => {
    if (company.id === 'akr-sons') {
      window.open('https://sons.akr.lk/', '_blank');
    } else {
      navigate(company.route);
    }
  };

  const menuItems = [
    {
      key: 'companies',
      icon: <BuildOutlined />,
      label: 'Our Companies',
      onClick: () => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      key: 'story',
      icon: <InfoCircleOutlined />,
      label: 'Our Story',
      onClick: () => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: 'About Us',
      onClick: () => navigate('/about')
    },
    {
      key: 'privacy',
      icon: <FileTextOutlined />,
      label: 'Privacy Policy',
      onClick: () => navigate('/privacy')
    }
  ];

  const mobileMenuItems = [
    {
      key: 'companies',
      icon: <BuildOutlined />,
      label: 'Our Companies',
      onClick: () => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      key: 'story',
      icon: <InfoCircleOutlined />,
      label: 'Our Story',
      onClick: () => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: 'About Us',
      onClick: () => navigate('/about')
    }
  ];

  if (!settings) return <LoadingSpinner fullScreen={true} text="Loading AKR Group..." />;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#52c41a',
          borderRadius: 8,
        },
      }}
    >
      <Layout className="min-h-screen">
        {/* Header - Hidden on Desktop */}
        <Header className="bg-white shadow-lg border-b border-gray-200 fixed w-full z-50 px-4 lg:px-8 lg:hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between h-18 md:h-22">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3 sm:space-x-4"
            >
              <img
                src="/images/image copy 2.png"
                alt="AKR Group Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-green-500"
              />
              <div>
                <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">AKR GROUP OF COMPANIES</div>
                <div className="text-xs sm:text-sm text-gray-600">Excellence in every venture</div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:block"
            >
              <Menu
                mode="horizontal"
                items={menuItems}
                className="border-0 bg-transparent"
                style={{ lineHeight: '64px' }}
              />
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:hidden"
            >
              <Dropdown
                menu={{
                  items: mobileMenuItems,
                  onClick: ({ key }) => {
                    const item = mobileMenuItems.find(item => item.key === key);
                    if (item) {
                      item.onClick();
                    }
                  }
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  className="text-green-600"
                />
              </Dropdown>
            </motion.div>
          </div>
        </Header>

        {/* Desktop Navigation Menu - Floating */}
        <div className="hidden lg:block fixed top-8 right-8 z-40">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'companies',
                    icon: <BuildOutlined />,
                    label: 'Our Companies',
                    onClick: () => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })
                  },
                  {
                    key: 'story',
                    icon: <InfoCircleOutlined />,
                    label: 'Our Story',
                    onClick: () => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })
                  },
                  {
                    key: 'about',
                    icon: <InfoCircleOutlined />,
                    label: 'About Us',
                    onClick: () => navigate('/about')
                  },
                  {
                    key: 'privacy',
                    icon: <FileTextOutlined />,
                    label: 'Privacy Policy',
                    onClick: () => navigate('/privacy')
                  }
                ],
                onClick: ({ key }) => {
                  const item = menuItems.find(item => item.key === key);
                  if (item) {
                    item.onClick();
                  }
                }
              }}
              placement="bottomRight"
              trigger={['hover']}
            >
              <Button
                type="primary"
                icon={<MenuOutlined />}
                className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white shadow-lg hover:shadow-xl"
                style={{ background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
              >
                Menu
              </Button>
            </Dropdown>
          </motion.div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen pt-16 lg:pt-0">
          {/* Background Image Slideshow */}
          <div className="absolute inset-0">
            {settings.akrGroupBanners && settings.akrGroupBanners.length > 0 ? (
              <Carousel
                autoplay
                dots={false}
                effect="fade"
                autoplaySpeed={5000}
                className="h-full"
                infinite
              >
                {settings.akrGroupBanners.map((img, i) => (
                  <div key={i} className="h-screen">
                    <img
                      src={img}
                      alt="AKR Group Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-green-900"></div>
            )}
            {/* Professional overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
          </div>

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32 flex items-center min-h-screen">
            <div className="w-full">
              <motion.div 
                className="text-white text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
              >
                {/* Professional Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="mb-6"
                >
                  <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium text-white/90">Established 1978</span>
                  </div>
                </motion.div>

                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="mb-8 sm:mb-10"
                >
                  <Title 
                    level={1} 
                    className="text-white mb-6 sm:mb-8 !text-4xl sm:!text-5xl md:!text-6xl lg:!text-7xl xl:!text-8xl font-bold leading-tight tracking-tight drop-shadow-2xl"
                    style={{ color: settings.akrGroupHeadingColor || '#fff' }}
                  >
                    {settings.akrGroupHeading || 'Welcome to AKR Group'}
                  </Title>
                </motion.div>

                {/* Subtitle */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="mb-10 sm:mb-12 md:mb-16"
                >
                  <Paragraph 
                    className="text-gray-100 mb-6 sm:mb-8 text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-5xl mx-auto font-light drop-shadow-lg"
                    style={{ color: settings.akrGroupSubheadingColor || '#f3f4f6' }}
                  >
                    {settings.akrGroupSubheading || 'Discover our diverse portfolio of businesses, each committed to excellence and innovation. Experience the legacy of trust and community service since 1978.'}
                  </Paragraph>
                </motion.div>
                
                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center mb-16"
                >
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="h-14 sm:h-16 px-10 sm:px-12 text-lg sm:text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 border-0"
                    style={{ background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', borderColor: '#52c41a' }}
                  >
                    Explore Our Companies
                  </Button>
                  <Button 
                    size="large"
                    ghost
                    onClick={() => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="h-14 sm:h-16 px-10 sm:px-12 text-lg sm:text-xl font-bold border-2 border-white/30 hover:bg-white hover:text-gray-900 hover:border-white transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm"
                  >
                    Our Legacy
                  </Button>
                </motion.div>



                {/* Enhanced Scroll Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 1.1 }}
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                  <div className="flex flex-col items-center text-white/80">
                    <span className="text-sm font-medium mb-3 tracking-wide">Scroll to explore</span>
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center backdrop-blur-sm"
                    >
                      <motion.div
                        animate={{ y: [0, 16, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-4 bg-white/80 rounded-full mt-2"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AKR Group Companies Section */}
        <motion.section 
          id="companies-section" 
          className="py-16 bg-gray-50"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={fadeInUp}
            >
              <Title level={2} className="mb-4">
                Our Companies
              </Title>
              <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover our diverse portfolio of businesses, each committed to excellence and innovation in their respective fields.
              </Paragraph>
            </motion.div>

            <Row gutter={[24, 24]}>
              {AKR_COMPANIES.map((company, index) => (
                <Col xs={24} sm={12} lg={6} key={company.id}>
                  <motion.div
                    variants={scaleIn}
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <Card
                      hoverable
                      className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col"
                      cover={
                        <div className="h-48 overflow-hidden">
                          <img 
                            alt={company.name}
                            src={company.image}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      }
                      onClick={() => handleCompanyClick(company)}
                      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                    >
                      <div className="text-center flex flex-col h-full">
                        <Title level={4} className="mb-2">
                          {company.name}
                        </Title>
                        <Paragraph className="text-gray-600 text-sm mb-4 flex-grow">
                          {company.description}
                        </Paragraph>
                        <div className="mt-auto">
                          <Button 
                            type="link" 
                            icon={<RightOutlined />}
                            className="p-0 h-auto text-green-600 hover:text-green-700"
                          >
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </motion.section>

        {/* AKR Group Story Section */}
        <motion.section 
          id="story-section" 
          className="py-16 bg-white"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={fadeInUp}
            >
              <Title level={2} className="mb-4">
                Our Legacy
              </Title>
              <Paragraph className="text-lg text-gray-600 max-w-4xl mx-auto">
                AKR Group's legacy began in 1978 with Mr. Anton, a humble bus driver who later transformed Sri Lanka's northern region with his entrepreneurial spirit.
              </Paragraph>
            </motion.div>

            <Row gutter={[48, 48]} align="middle" className="mb-16">
              <Col xs={24} lg={12}>
                <motion.div variants={fadeInUp}>
                  <Title level={3} className="mb-6">
                    A Family Legacy
                  </Title>
                  <Paragraph className="text-lg text-gray-700 leading-relaxed mb-6">
                    From mobile fuel sales to today's diverse ventures, the group reflects decades of resilience, innovation, and commitment to uplifting communities. Now led by Mr. Rojar Stalin, AKR continues to thrive under visionary leadership rooted in integrity and service to society.
                  </Paragraph>
                  <Card className="bg-green-50 border-l-4 border-green-500">
                    <Paragraph className="font-semibold text-green-800 mb-2">
                      Our Guiding Principle
                    </Paragraph>
                    <Paragraph className="text-green-700 italic">
                      "Eradicate poverty, empower through knowledge."
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
              
              <Col xs={24} lg={12}>
                <motion.div variants={scaleIn}>
                  <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
                    <Title level={4} className="text-white mb-6">
                      Mission & Vision
                    </Title>
                    <Space direction="vertical" size="large" className="w-full">
                      <div>
                        <Title level={5} className="text-white mb-3">
                          Mission
                        </Title>
                        <Paragraph className="text-green-100">
                          Deliver exceptional services with integrity, innovation, and community impact.
                        </Paragraph>
                      </div>
                      <div>
                        <Title level={5} className="text-white mb-3">
                          Vision
                        </Title>
                        <Paragraph className="text-green-100">
                          Be Sri Lanka's most trusted business group, fostering sustainable progress.
                        </Paragraph>
                      </div>
                    </Space>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Core Values */}
            <div className="text-center">
              <motion.div variants={fadeInUp}>
                <Title level={3} className="mb-12">
                  Our Core Values
                </Title>
              </motion.div>
              <Row gutter={[24, 24]}>
                {CORE_VALUES.map((value, index) => {
                  const IconComponent = value.icon;
                  return (
                    <Col xs={24} sm={12} lg={6} key={index}>
                      <motion.div
                        variants={scaleIn}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="text-center h-full hover:shadow-lg transition-shadow">
                          <Avatar 
                            size={64} 
                            icon={<IconComponent />} 
                            className="mb-4 bg-green-100 text-green-600"
                            style={{ backgroundColor: value.color + '20', color: value.color }}
                          />
                          <Title level={4} className="mb-3">
                            {value.title}
                          </Title>
                          <Paragraph className="text-gray-600">
                            {value.description}
                          </Paragraph>
                        </Card>
                      </motion.div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <Footer className="bg-gradient-to-r from-green-700 to-green-400 text-white pt-10 pb-6 mt-16" id="contact">
          <div className="max-w-7xl mx-auto px-6">
            <Row gutter={[32, 32]}>
              <Col xs={24} sm={12} lg={6}>
                <div className="flex flex-col items-center sm:items-start">
                  <img
                    src="/images/image copy 2.png"
                    alt="AKR Group Logo"
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: '2px solid #fff', background: '#fff' }}
                  />
                  <div className="text-lg font-bold mb-2">AKR Group of Companies</div>
                  <div className="text-sm opacity-90 mb-2 text-center sm:text-left">Excellence in every venture, committed to serving our community with integrity and innovation since 1978.</div>
                  <div className="flex gap-3 mt-2">
                    <a href="#" className="hover:text-green-200 transition-colors">
                      <FacebookOutlined className="text-xl" />
                    </a>
                    <a href="#" className="hover:text-green-200 transition-colors">
                      <InstagramOutlined className="text-xl" />
                    </a>
                    <a href="#" className="hover:text-green-200 transition-colors">
                      <TwitterOutlined className="text-xl" />
                    </a>
                    <a href="#" className="hover:text-green-200 transition-colors">
                      <LinkedinOutlined className="text-xl" />
                    </a>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <div className="flex flex-col gap-2 items-center sm:items-start">
                  <div className="font-semibold mb-1">Contact</div>
                  <div className="flex items-center gap-2">
                    <EnvironmentOutlined />
                    <span>Main street Murunkan, Mannar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneOutlined />
                    <a href="tel:0773111266" className="underline hover:text-green-200">0773111266</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MailOutlined />
                    <a href="mailto:akrfuture@gmail.com" className="underline hover:text-green-200">akrfuture@gmail.com</a>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <div className="flex flex-col gap-2 items-center sm:items-start">
                  <div className="font-semibold mb-1">Business Hours</div>
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    <span>Sunday: 9:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <div className="flex flex-col gap-2 items-center sm:items-start">
                  <div className="font-semibold mb-1">Quick Links</div>
                  <a onClick={() => navigate('/about')} className="hover:underline cursor-pointer">About Us</a>
                  <a onClick={() => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:underline cursor-pointer">Our Companies</a>
                  <a href="#contact" className="hover:underline">Contact</a>
                  <a onClick={() => navigate('/privacy')} className="hover:underline cursor-pointer">Privacy Policy</a>
                </div>
              </Col>
            </Row>
            
            <div className="text-center text-xs opacity-80 mt-8">
              © {new Date().getFullYear()} AKR Group of Companies. All rights reserved.
            </div>
          </div>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default Home; 