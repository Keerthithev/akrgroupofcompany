import React, { useEffect, useState, useRef } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import MobileNavigation from "../components/MobileNavigation";
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
            <MobileNavigation />
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
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"></div>
            )}
            {/* Professional overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
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
                  className="mb-8"
                >
                  <div className="inline-flex items-center px-6 py-3 bg-white/15 backdrop-blur-md rounded-full border border-white/25 shadow-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-semibold text-white tracking-wide">Established 1978</span>
                  </div>
                </motion.div>

                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="mb-10 sm:mb-12"
                >
                  <Title 
                    level={1} 
                    className="text-white mb-6 sm:mb-8 !text-4xl sm:!text-5xl md:!text-6xl lg:!text-7xl xl:!text-8xl font-bold leading-tight tracking-tight drop-shadow-2xl"
                    style={{ color: settings.akrGroupHeadingColor || '#fff' }}
                  >
                    {settings.akrGroupHeading || 'AKR Group of Companies'}
                  </Title>
                </motion.div>

                {/* Subtitle */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="mb-12 sm:mb-16 md:mb-20"
                >
                  <Paragraph 
                    className="text-gray-100 mb-6 sm:mb-8 text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-4xl mx-auto font-light drop-shadow-lg"
                    style={{ color: settings.akrGroupSubheadingColor || '#f3f4f6' }}
                  >
                    {settings.akrGroupSubheading || 'A legacy of excellence spanning over four decades, delivering quality services across diverse industries while building stronger communities.'}
                  </Paragraph>
                </motion.div>
                
                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center mb-16"
                >
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="h-12 sm:h-14 md:h-16 px-8 sm:px-12 md:px-16 text-base sm:text-lg md:text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 border-0 w-full sm:w-auto"
                    style={{ background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', borderColor: '#52c41a' }}
                  >
                    Explore
                  </Button>
                  <Button 
                    size="large"
                    ghost
                    onClick={() => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="h-12 sm:h-14 md:h-16 px-8 sm:px-12 md:px-16 text-base sm:text-lg md:text-xl font-bold border-2 border-white/40 hover:bg-white/10 hover:border-white/60 transform hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
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

        {/* Our Portfolio Section */}
        <motion.section 
          className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center"
              variants={fadeInUp}
            >
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-lg">
                <Title level={2} className="mb-6 text-slate-800">
                  Our Portfolio
                </Title>
                <Paragraph className="text-lg sm:text-xl text-slate-700 leading-relaxed max-w-5xl mx-auto">
                  Discover the diverse portfolio of companies that make up the AKR Group family. Each division reflects our unwavering commitment to excellence, innovation, and community impact — driving progress across industries while staying rooted in our core values. Together, they form a vibrant ecosystem dedicated to serving people, empowering growth, and building a stronger future.
                </Paragraph>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* AKR Group Story Section */}
        <motion.section 
          id="story-section" 
          className="py-16 sm:py-20 bg-white"
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
              <Title level={2} className="mb-6 text-gray-900">
                The Story of AKR Group
              </Title>
              <Title level={3} className="mb-8 text-green-600 font-light">
                From Humble Beginnings to Regional Leadership
              </Title>
              <Paragraph className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                The story of AKR Group is more than a business journey — it is a legacy of vision, resilience, and a deep commitment to uplift the community.
              </Paragraph>
            </motion.div>

            <Row gutter={[48, 48]} align="middle" className="mb-16">
              <Col xs={24} lg={12}>
                <motion.div variants={fadeInUp}>
                  <Title level={3} className="mb-6 text-gray-900">
                    The Beginning (1978-1990)
                  </Title>
                  <Paragraph className="text-lg text-gray-700 leading-relaxed mb-6">
                    In 1978, Mr. Anton began his professional life as a bus driver with the Sri Lanka Transport Board. With unyielding determination and a dream to build something greater, he ventured abroad in 1984. After returning to Sri Lanka in 1989, he set his sights on transforming the regional commercial landscape.
                  </Paragraph>
                  <Paragraph className="text-lg text-gray-700 leading-relaxed mb-6">
                    In 1990, he founded AKA, initially focusing on transport services and innovative mobile fuel sales using containers. Beyond business, Mr. Anton remained devoted to public welfare, launching initiatives to improve community well-being.
                  </Paragraph>
                </motion.div>
              </Col>
              
              <Col xs={24} lg={12}>
                <motion.div variants={scaleIn}>
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 h-full">
                    <Title level={4} className="text-gray-800 mb-6">
                      The Evolution to AKR
                    </Title>
                    <Paragraph className="text-gray-700 text-lg leading-relaxed mb-6">
                      This relentless spirit of progress soon led to the rebranding of AKA as AKR, marking a pivotal phase of growth with the launch of the AKR Filling Station and AKR Wine Store, further expanding the company's commercial reach and impact.
                    </Paragraph>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <Title level={5} className="text-green-800 mb-3">
                        Our Guiding Principle
                      </Title>
                      <Paragraph className="text-green-700 italic text-lg mb-0">
                        "Eradicate poverty, empower through knowledge."
                      </Paragraph>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Family Legacy */}
            <Row gutter={[48, 48]} align="middle" className="mb-16">
              <Col xs={24} lg={12}>
                <motion.div variants={fadeInUp}>
                  <Title level={3} className="mb-6 text-gray-900">
                    Our Family Legacy
                  </Title>
                  <Paragraph className="text-lg text-gray-700 leading-relaxed mb-6">
                    AKR's strength lies in its roots — a family legacy built on integrity, hard work, and visionary leadership.
                  </Paragraph>
                  <Paragraph className="text-lg text-gray-700 leading-relaxed mb-6">
                    As the torchbearer of this legacy, Mr. Rojar Stalin, Mr. Anton's son, took over the leadership and propelled the company into a new era. His forward-thinking mindset and commitment to community development have driven AKR to new heights while staying true to the values instilled by his father.
                  </Paragraph>
                  <Paragraph className="text-lg text-gray-700 leading-relaxed">
                    Together, the family's collective dedication continues to guide AKR's mission: empowering communities, fostering economic growth, and creating sustainable value for future generations.
                  </Paragraph>
                </motion.div>
              </Col>
              
              <Col xs={24} lg={12}>
                <motion.div variants={scaleIn}>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 h-full">
                    <Title level={4} className="text-blue-800 mb-6">
                      AKR Today: A Pillar of Progress
                    </Title>
                    <Paragraph className="text-blue-700 text-lg leading-relaxed mb-6">
                      Today, AKR Group stands as a leading, integrated commercial powerhouse in Sri Lanka's Northern Province. Our diverse range of divisions reflects our commitment to serving a wide spectrum of community and customer needs:
                    </Paragraph>
                    <div className="grid grid-cols-1 gap-2 text-blue-700">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span>AKR & Sons (Pvt) Ltd</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span>AKR Multi Complex</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span>AKR Construction</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span>AKR Lanka Filling Station</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span>AKR Wine Store</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span>AKR Farm</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span>AKR's Amma Organization</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span>AKR Easy Credit (Pvt) Ltd</span>
                      </div>
                    </div>
                    <Paragraph className="text-blue-700 text-lg leading-relaxed mt-6">
                      With each endeavor, we aim to set new standards of quality, reliability, and innovation.
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* AKR Family Portrait */}
            <motion.div 
              className="mb-16 flex justify-center"
              variants={fadeInUp}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100 max-w-2xl">
                <img
                  src="/images/image copy.png"
                  alt="AKR Group Family"
                  className="w-full h-auto max-h-[400px] object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <Title level={4} className="text-white mb-1 drop-shadow-lg text-lg sm:text-xl font-bold">
                    The AKR Family
                  </Title>
                  <Paragraph className="text-white/95 drop-shadow-lg text-sm sm:text-base font-medium mb-0">
                    United in vision, committed to excellence
                  </Paragraph>
                </div>
              </div>
            </motion.div>

            {/* Our Guiding Principle */}
            <Row gutter={[48, 48]} align="middle" className="mb-16">
              <Col xs={24} lg={12}>
                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 h-full">
                    <Title level={4} className="text-green-800 mb-6">
                      Our Guiding Principle
                    </Title>
                    <div className="text-center mb-6 bg-green-100 rounded-lg p-4 border border-green-300">
                      <Paragraph className="text-green-800 text-2xl font-bold italic leading-relaxed mb-0">
                        "Eradicate poverty, empower through knowledge."
                      </Paragraph>
                    </div>
                    <Paragraph className="text-green-700 text-lg leading-relaxed mb-4">
                      This ethos reflects our unwavering dedication to community development, education, and creating opportunities for growth.
                    </Paragraph>
                    <Paragraph className="text-green-700 text-lg leading-relaxed">
                      Through various public service initiatives and regional development projects, we strive to make a meaningful impact — transforming lives and building a future where every individual can thrive.
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
              
              <Col xs={24} lg={12}>
                <motion.div variants={scaleIn}>
                  <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 h-full">
                    <Title level={4} className="text-slate-800 mb-6">
                      Our Pride & Promise
                    </Title>
                    <Paragraph className="text-slate-700 text-lg leading-relaxed mb-4">
                      From humble beginnings to becoming a beacon of progress, AKR Group's journey embodies the spirit of resilience and shared success.
                    </Paragraph>
                    <Paragraph className="text-slate-700 text-lg leading-relaxed mb-6">
                      We take immense pride in our history and even greater pride in the future we continue to build — together with our family, our employees, and the communities we serve.
                    </Paragraph>
                    <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-center">
                      <Paragraph className="text-slate-800 text-xl font-semibold italic mb-0">
                        Join us as we continue to write this extraordinary story, one chapter at a time.
                      </Paragraph>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Mission & Vision */}
            <motion.div 
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <Title level={2} className="mb-6 text-gray-900">
                Our Mission & Vision
              </Title>
            </motion.div>
            
            <Row gutter={[32, 32]} className="mb-16">
              <Col xs={24} lg={12}>
                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 h-full">
                    <Title level={3} className="text-blue-800 mb-6">
                      Mission
                    </Title>
                    <Paragraph className="text-blue-700 text-lg leading-relaxed">
                      To deliver exceptional products and services across diverse industries, while setting new standards in quality, innovation, and customer care — all driven by a deep commitment to uplifting communities and empowering lives.
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
              
              <Col xs={24} lg={12}>
                <motion.div variants={scaleIn}>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 h-full">
                    <Title level={3} className="text-green-800 mb-6">
                      Vision
                    </Title>
                    <Paragraph className="text-green-700 text-lg leading-relaxed">
                      To become Sri Lanka's most trusted and admired business group, recognized for our unwavering dedication to excellence, sustainable growth, and a meaningful impact on every community we serve.
                    </Paragraph>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Values */}
            <Row gutter={[32, 32]}>
              <Col xs={24}>
                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                    <Title level={3} className="text-gray-800 mb-8 text-center">
                      Values
                    </Title>
                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={12}>
                        <div className="flex items-start mb-6">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                          <div>
                            <Title level={5} className="text-gray-800 mb-2">
                              Integrity & Transparency
                            </Title>
                            <Paragraph className="text-gray-700 text-base leading-relaxed mb-0">
                              We build trust through honesty and openness in everything we do.
                            </Paragraph>
                          </div>
                        </div>
                        <div className="flex items-start mb-6">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                          <div>
                            <Title level={5} className="text-gray-800 mb-2">
                              Excellence in Service
                            </Title>
                            <Paragraph className="text-gray-700 text-base leading-relaxed mb-0">
                              We go beyond expectations, delivering value at every touchpoint.
                            </Paragraph>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <div className="flex items-start mb-6">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                          <div>
                            <Title level={5} className="text-gray-800 mb-2">
                              Community Development
                            </Title>
                            <Paragraph className="text-gray-700 text-base leading-relaxed mb-0">
                              We believe in giving back and nurturing strong, resilient communities.
                            </Paragraph>
                          </div>
                        </div>
                        <div className="flex items-start mb-6">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                          <div>
                            <Title level={5} className="text-gray-800 mb-2">
                              Sustainable Growth
                            </Title>
                            <Paragraph className="text-gray-700 text-base leading-relaxed mb-0">
                              We grow responsibly, with a focus on long-term impact and environmental stewardship.
                            </Paragraph>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Leadership Team */}
            <motion.div 
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <Title level={2} className="mb-6 text-gray-900">
                Our Leadership Team
              </Title>
            </motion.div>
            
            <Row gutter={[32, 32]} className="mb-16">
              {/* Founder */}
              <Col xs={24} lg={12}>
                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 h-full">
                    <div className="text-center">
                      <Avatar 
                        size={80} 
                        icon={<UserOutlined />} 
                        className="mb-4 bg-gradient-to-r from-purple-500 to-purple-600"
                        style={{ color: 'white' }}
                      />
                      <Title level={3} className="text-purple-800 mb-2">
                        Founder of AKR
                      </Title>
                      <Title level={4} className="text-purple-700 mb-3">
                        S. Anton
                      </Title>
                    </div>
                  </Card>
                </motion.div>
              </Col>
              
              {/* CEO */}
              <Col xs={24} lg={12}>
                <motion.div variants={scaleIn}>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 h-full">
                    <div className="text-center">
                      <Avatar 
                        size={80} 
                        icon={<UserOutlined />} 
                        className="mb-4 bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ color: 'white' }}
                      />
                      <Title level={3} className="text-blue-800 mb-2">
                        CEO of AKR
                      </Title>
                      <Title level={4} className="text-blue-700 mb-3">
                        Anton Rojar Stalin
                      </Title>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <PhoneOutlined className="text-blue-600" />
                          <a href="tel:0773111266" className="text-blue-700 hover:text-blue-800 underline">
                            0773111266
                          </a>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <MailOutlined className="text-blue-600" />
                          <a href="mailto:antonrojarstalin@gmail.com" className="text-blue-700 hover:text-blue-800 underline">
                            antonrojarstalin@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Directors Board */}
            <Row gutter={[32, 32]} className="mb-16">
              <Col xs={24}>
                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <Title level={3} className="text-green-800 mb-8 text-center">
                      Directors Board
                    </Title>
                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={8}>
                        <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                          <Avatar 
                            size={60} 
                            icon={<UserOutlined />} 
                            className="mb-3 bg-gradient-to-r from-green-500 to-green-600"
                            style={{ color: 'white' }}
                          />
                          <Title level={5} className="text-green-800 mb-2">
                            1. ANTON FLOREDA GAMINI
                          </Title>
                          <div className="flex items-center justify-center gap-2">
                            <MailOutlined className="text-green-600" />
                            <a href="mailto:antonfloridagamini@gmail.com" className="text-green-700 hover:text-green-800 underline text-sm">
                              antonfloridagamini@gmail.com
                            </a>
                          </div>
                        </div>
                      </Col>
                      
                      <Col xs={24} md={8}>
                        <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                          <Avatar 
                            size={60} 
                            icon={<UserOutlined />} 
                            className="mb-3 bg-gradient-to-r from-green-500 to-green-600"
                            style={{ color: 'white' }}
                          />
                          <Title level={5} className="text-green-800 mb-2">
                            2. Anton Andrew Rajan
                          </Title>
                          <div className="flex items-center justify-center gap-2">
                            <MailOutlined className="text-green-600" />
                            <a href="mailto:antonandrewrajan29@gmail.com" className="text-green-700 hover:text-green-800 underline text-sm">
                              antonandrewrajan29@gmail.com
                            </a>
                          </div>
                        </div>
                      </Col>
                      
                      <Col xs={24} md={8}>
                        <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                          <Avatar 
                            size={60} 
                            icon={<UserOutlined />} 
                            className="mb-3 bg-gradient-to-r from-green-500 to-green-600"
                            style={{ color: 'white' }}
                          />
                          <Title level={5} className="text-green-800 mb-2">
                            3. Anton Anbu Rajan
                          </Title>
                          <div className="flex items-center justify-center gap-2">
                            <MailOutlined className="text-green-600" />
                            <a href="mailto:antonanburajan14@gmail.com" className="text-green-700 hover:text-green-800 underline text-sm">
                              antonanburajan14@gmail.com
                            </a>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </motion.div>
              </Col>
            </Row>


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