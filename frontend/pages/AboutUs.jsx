import React from "react";
import { motion } from "framer-motion";
import { 
  Row, Col, Card, Typography, Space, Divider, Avatar, 
  Layout, theme, ConfigProvider, Timeline, Statistic
} from 'antd';
import { 
  TrophyOutlined, TeamOutlined, HeartOutlined, BuildOutlined,
  SafetyOutlined, StarOutlined, RiseOutlined, UserOutlined,
  EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined,
  FacebookOutlined, InstagramOutlined, TwitterOutlined, LinkedinOutlined,
  ArrowLeftOutlined, BulbOutlined
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

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

// Timeline data
const TIMELINE_DATA = [
  {
    year: '1978',
    title: 'The Beginning',
    description: 'Mr. Anton, a humble bus driver, started his entrepreneurial journey with mobile fuel sales.',
    color: '#52c41a'
  },
  {
    year: '1985',
    title: 'First Business Venture',
    description: 'Established the first filling station, marking the beginning of AKR Group.',
    color: '#1890ff'
  },
  {
    year: '1995',
    title: 'Expansion Phase',
    description: 'Diversified into construction materials and automotive dealership.',
    color: '#faad14'
  },
  {
    year: '2005',
    title: 'Multicomplex Development',
    description: 'Launched AKR Multicomplex, creating a comprehensive business hub.',
    color: '#722ed1'
  },
  {
    year: '2015',
    title: 'Social Impact',
    description: 'Founded AKR\'s Amma Organization to serve communities.',
    color: '#eb2f96'
  },
  {
    year: '2024',
    title: 'Modern Era',
    description: 'Led by Mr. Rojar Stalin, AKR Group continues to innovate and grow.',
    color: '#13c2c2'
  }
];

// Team data
const LEADERSHIP_TEAM = [
  {
    name: 'Mr. Rojar Stalin',
    position: 'CEO & Managing Director',
    description: 'Leading AKR Group with visionary leadership and commitment to community development. Under his guidance, AKR Group has expanded its portfolio and strengthened its position as a trusted business partner in Sri Lanka.'
  },
  {
    name: 'Mr. Anton',
    position: 'Founder & Chairman',
    description: 'The visionary founder who started AKR Group in 1978 with a dream to serve the community. His humble beginnings as a bus driver transformed into a legacy of excellence, innovation, and community service that continues to inspire generations.'
  }
];

// Values data
const VALUES = [
  {
    icon: SafetyOutlined,
    title: 'Integrity',
    description: 'We conduct business with honesty, transparency, and ethical practices.',
    color: '#52c41a'
  },
  {
    icon: StarOutlined,
    title: 'Excellence',
    description: 'We strive for the highest quality in all our products and services.',
    color: '#faad14'
  },
  {
    icon: TeamOutlined,
    title: 'Community',
    description: 'We are committed to uplifting and empowering local communities.',
    color: '#1890ff'
  },
  {
    icon: RiseOutlined,
    title: 'Innovation',
    description: 'We embrace new ideas and technologies to drive sustainable growth.',
    color: '#722ed1'
  }
];

const AboutUs = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();

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
        <Content className="pt-0">
          {/* Page Title Section */}
          <motion.section 
            className="py-12 sm:py-16 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div variants={fadeInUp} className="text-center">
                <Title level={1} className="mb-6 !text-3xl sm:!text-4xl md:!text-5xl text-gray-900">
                  About AKR Group
                </Title>
                <Paragraph className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  A legacy of excellence, innovation, and community service spanning over four decades of dedicated service to Sri Lanka.
                </Paragraph>
              </motion.div>
            </div>
          </motion.section>

          {/* Mission & Vision */}
          <motion.section 
            className="py-16 sm:py-20 bg-white"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center mb-12"
                variants={fadeInUp}
              >
                <Title level={2} className="mb-4 text-gray-900">
                  Mission & Vision
                </Title>
                <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Our guiding principles that drive our commitment to excellence and community service.
                </Paragraph>
              </motion.div>
              
              <Row gutter={[32, 32]}>
                <Col xs={24} lg={12}>
                  <motion.div variants={fadeInUp}>
                    <div className="h-full p-8 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-lg shadow-lg">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                        <BulbOutlined className="text-2xl text-white" />
                      </div>
                      <Title level={3} className="text-white mb-6">
                        Our Mission
                      </Title>
                      <Paragraph className="text-green-100 text-lg leading-relaxed">
                        To deliver exceptional services with integrity, innovation, and community impact. We strive to be the most trusted business group in Sri Lanka, fostering sustainable progress and empowering communities through our diverse portfolio of businesses.
                      </Paragraph>
                    </div>
                  </motion.div>
                </Col>
                <Col xs={24} lg={12}>
                  <motion.div variants={fadeInUp}>
                    <div className="h-full p-8 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg shadow-lg">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                        <StarOutlined className="text-2xl text-white" />
                      </div>
                      <Title level={3} className="text-white mb-6">
                        Our Vision
                      </Title>
                      <Paragraph className="text-blue-100 text-lg leading-relaxed">
                        To be Sri Lanka's most trusted business group, fostering sustainable progress and creating lasting positive impact in the communities we serve. We envision a future where AKR Group continues to lead by example in business excellence and social responsibility.
                      </Paragraph>
                    </div>
                  </motion.div>
                </Col>
              </Row>
            </div>
          </motion.section>

          {/* Timeline */}
          <motion.section 
            className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white"
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
                  Our Journey
                </Title>
                <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  From humble beginnings to a diversified business empire, discover the milestones that shaped AKR Group's remarkable journey.
                </Paragraph>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Timeline
                  mode="alternate"
                  items={TIMELINE_DATA.map((item, index) => ({
                    children: (
                      <Card className="shadow-md">
                        <div className="text-center">
                          <div 
                            className="inline-block px-4 py-2 rounded-full text-white font-bold mb-3"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.year}
                          </div>
                          <Title level={4} className="mb-2">
                            {item.title}
                          </Title>
                          <Paragraph className="text-gray-600">
                            {item.description}
                          </Paragraph>
                        </div>
                      </Card>
                    ),
                  }))}
                />
              </motion.div>
            </div>
          </motion.section>

          {/* Leadership */}
          <motion.section 
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
                  Leadership Team
                </Title>
                <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Meet the visionary leaders who guide AKR Group towards continued success and community impact.
                </Paragraph>
              </motion.div>

              {/* Family Image */}
              <motion.div 
                className="mb-16"
                variants={fadeInUp}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                  <img
                    src="/images/image copy.png"
                    alt="AKR Group Family"
                    className="w-full h-auto max-h-[600px] object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <Title level={3} className="text-white mb-2 drop-shadow-lg text-xl sm:text-2xl md:text-3xl font-bold">
                      The AKR Family
                    </Title>
                    <Paragraph className="text-white/95 drop-shadow-lg text-base sm:text-lg font-medium">
                      United in vision, committed to excellence
                    </Paragraph>
                  </div>
                </div>
              </motion.div>

              <Row gutter={[24, 24]} justify="center">
                {LEADERSHIP_TEAM.map((member, index) => (
                  <Col xs={24} lg={12} key={index}>
                    <motion.div variants={scaleIn}>
                      <Card className="text-center h-full hover:shadow-lg transition-shadow">
                        <Title level={3} className="mb-3 text-lg sm:text-xl lg:text-2xl">
                          {member.name}
                        </Title>
                        <Text type="secondary" className="text-base sm:text-lg mb-4 sm:mb-6 block">
                          {member.position}
                        </Text>
                        <Paragraph className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          {member.description}
                        </Paragraph>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </div>
          </motion.section>

          {/* Values */}
          <motion.section 
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
                  Our Core Values
                </Title>
                <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  The principles that guide every decision and action at AKR Group.
                </Paragraph>
              </motion.div>

              <Row gutter={[32, 32]}>
                {VALUES.map((value, index) => {
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
                            size={80} 
                            icon={<IconComponent />} 
                            className="mb-6 mx-auto"
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
          </motion.section>

          {/* Statistics */}
          <motion.section 
            className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white"
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
                  AKR Group by the Numbers
                </Title>
                <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Our impact and reach across Sri Lanka.
                </Paragraph>
              </motion.div>

              <Row gutter={[32, 32]} justify="center">
                {[
                  { title: 'Years of Excellence', value: 46, suffix: '+', icon: TrophyOutlined },
                  { title: 'Companies', value: 8, suffix: '', icon: BuildOutlined },
                  { title: 'Team Members', value: 500, suffix: '+', icon: TeamOutlined },
                  { title: 'Communities Served', value: 50, suffix: '+', icon: HeartOutlined }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Col xs={12} sm={6} key={index}>
                      <motion.div variants={scaleIn}>
                        <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                          <Statistic
                            title={stat.title}
                            value={stat.value}
                            suffix={stat.suffix}
                            prefix={<IconComponent className="text-green-600 text-2xl" />}
                            valueStyle={{ color: token.colorPrimary, fontSize: '2rem', fontWeight: 'bold' }}
                          />
                        </Card>
                      </motion.div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </motion.section>
        </Content>

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
                  <a onClick={() => navigate('/')} className="hover:underline cursor-pointer">Home</a>
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

export default AboutUs; 