import React from "react";
import { motion } from "framer-motion";
import MobileNavigation from "../components/MobileNavigation";
import { 
  Row, Col, Card, Typography, Space, Divider, Avatar, 
  Layout, theme, ConfigProvider, Collapse, List
} from 'antd';
import { 
  EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined,
  FacebookOutlined, InstagramOutlined, TwitterOutlined, LinkedinOutlined,
  ArrowLeftOutlined, SafetyOutlined, LockOutlined, EyeOutlined,
  UserOutlined, SafetyCertificateOutlined, FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;
const { Panel } = Collapse;

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

// Privacy sections data
const PRIVACY_SECTIONS = [
  {
    key: '1',
    header: 'Information We Collect',
    content: [
      'Personal information (name, email, phone number)',
      'Business information (company name, position)',
      'Usage data (website interactions, preferences)',
      'Technical data (IP address, browser type, device information)'
    ]
  },
  {
    key: '2',
    header: 'How We Use Your Information',
    content: [
      'To provide and maintain our services',
      'To communicate with you about our products and services',
      'To improve our website and user experience',
      'To comply with legal obligations',
      'To protect our rights and prevent fraud'
    ]
  },
  {
    key: '3',
    header: 'Information Sharing',
    content: [
      'We do not sell, trade, or rent your personal information',
      'We may share information with trusted service providers',
      'We may disclose information if required by law',
      'We may share information to protect our rights and safety'
    ]
  },
  {
    key: '4',
    header: 'Data Security',
    content: [
      'We implement appropriate security measures',
      'We use encryption to protect sensitive data',
      'We regularly review and update our security practices',
      'We limit access to personal information to authorized personnel'
    ]
  },
  {
    key: '5',
    header: 'Your Rights',
    content: [
      'Right to access your personal information',
      'Right to correct inaccurate information',
      'Right to delete your personal information',
      'Right to opt-out of marketing communications',
      'Right to lodge a complaint with authorities'
    ]
  },
  {
    key: '6',
    header: 'Cookies and Tracking',
    content: [
      'We use cookies to improve website functionality',
      'We use analytics to understand user behavior',
      'You can control cookie settings in your browser',
      'We do not use cookies for advertising purposes'
    ]
  }
];

const PrivacyPolicy = () => {
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
        {/* Mobile Header */}
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
            
            {/* Mobile Navigation */}
            <MobileNavigation />
          </div>
        </Header>

        <Content className="pt-16 lg:pt-0">
          {/* Page Title Section */}
          <motion.section 
            className="py-12 sm:py-16 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div variants={fadeInUp} className="text-center">
                <Title level={1} className="mb-4 sm:mb-6 !text-3xl sm:!text-4xl md:!text-5xl text-gray-900">
                  Privacy Policy
                </Title>
                <Paragraph className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                  Your privacy is important to us. Learn how AKR Group collects, uses, and protects your personal information.
                </Paragraph>
                <div className="mt-4 sm:mt-6">
                  <Text className="text-gray-500 text-sm sm:text-base">
                    Last updated: August 2025
                  </Text>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Introduction */}
          <motion.section 
            className="py-16 sm:py-20 bg-white"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div variants={fadeInUp}>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <SafetyCertificateOutlined className="text-3xl text-green-600" />
                  </div>
                  <Title level={2} className="mb-6 text-gray-900">
                    Our Commitment to Privacy
                  </Title>
                  <Paragraph className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                    At AKR Group, we are committed to protecting your privacy and ensuring the security of your personal information. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
                    or use our services.
                  </Paragraph>
                </div>
                
                <Row gutter={[32, 32]} className="mb-12">
                  <Col xs={24} sm={8}>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <LockOutlined className="text-2xl text-green-600" />
                      </div>
                      <Title level={4} className="mb-3 text-gray-900">
                        Secure
                      </Title>
                      <Paragraph className="text-gray-600">
                        We implement industry-standard security measures to protect your data.
                      </Paragraph>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <EyeOutlined className="text-2xl text-blue-600" />
                      </div>
                      <Title level={4} className="mb-3 text-gray-900">
                        Transparent
                      </Title>
                      <Paragraph className="text-gray-600">
                        We are clear about how we collect and use your information.
                      </Paragraph>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <UserOutlined className="text-2xl text-purple-600" />
                      </div>
                      <Title level={4} className="mb-3 text-gray-900">
                        Respectful
                      </Title>
                      <Paragraph className="text-gray-600">
                        We respect your rights and give you control over your data.
                      </Paragraph>
                    </div>
                  </Col>
                </Row>
              </motion.div>
            </div>
          </motion.section>

          {/* Privacy Sections */}
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
                  Privacy Policy Details
                </Title>
                <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Comprehensive information about how we handle your personal data and protect your privacy.
                </Paragraph>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Collapse 
                  defaultActiveKey={['1']} 
                  size="large"
                  className="bg-white shadow-lg"
                >
                  {PRIVACY_SECTIONS.map((section) => (
                    <Panel 
                      header={
                        <div className="flex items-center">
                          <FileTextOutlined className="mr-3 text-green-600" />
                          <span className="font-semibold">{section.header}</span>
                        </div>
                      } 
                      key={section.key}
                    >
                      <List
                        dataSource={section.content}
                        renderItem={(item) => (
                          <List.Item>
                            <div className="flex items-start">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-gray-700">{item}</span>
                            </div>
                          </List.Item>
                        )}
                      />
                    </Panel>
                  ))}
                </Collapse>
              </motion.div>
            </div>
          </motion.section>

          {/* Contact Information */}
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
                <Title level={2} className="mb-4">
                  Contact Us
                </Title>
                <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
                  If you have any questions about this Privacy Policy or our data practices, please contact us.
                </Paragraph>
              </motion.div>

              <Row gutter={[48, 48]}>
                <Col xs={24} lg={12}>
                  <motion.div variants={scaleIn}>
                    <Card className="h-full shadow-lg">
                      <Title level={3} className="mb-6">
                        Privacy Officer
                      </Title>
                      <Space direction="vertical" size="large" className="w-full">
                        <div className="flex items-center">
                          <MailOutlined className="mr-3 text-green-600 text-xl" />
                          <div>
                            <Text strong>Email:</Text>
                            <br />
                            <Text>akrfuture@gmail.com</Text>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <PhoneOutlined className="mr-3 text-green-600 text-xl" />
                          <div>
                            <Text strong>Phone:</Text>
                            <br />
                            <Text>0773111266</Text>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <EnvironmentOutlined className="mr-3 text-green-600 text-xl" />
                          <div>
                            <Text strong>Address:</Text>
                            <br />
                            <Text>Main street Murunkan, Mannar, Sri Lanka</Text>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </motion.div>
                </Col>
                
                <Col xs={24} lg={12}>
                  <motion.div variants={scaleIn}>
                    <Card className="h-full shadow-lg">
                      <Title level={3} className="mb-6">
                        Your Rights
                      </Title>
                      <Paragraph className="text-gray-600 mb-4">
                        You have the right to:
                      </Paragraph>
                      <List
                        dataSource={[
                          'Access your personal information',
                          'Correct inaccurate data',
                          'Request deletion of your data',
                          'Object to data processing',
                          'Data portability',
                          'Withdraw consent'
                        ]}
                        renderItem={(item) => (
                          <List.Item>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                              <span className="text-gray-700">{item}</span>
                            </div>
                          </List.Item>
                        )}
                      />
                      <Paragraph className="text-gray-600 mt-4">
                        To exercise these rights, please contact our Privacy Officer using the information provided.
                      </Paragraph>
                    </Card>
                  </motion.div>
                </Col>
              </Row>
            </div>
          </motion.section>

          {/* Updates Section */}
          <motion.section 
            className="py-16 bg-gray-50"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div variants={fadeInUp}>
                <Card className="text-center shadow-lg">
                                     <Avatar 
                     size={80} 
                     icon={<SafetyCertificateOutlined />} 
                     className="mb-6 mx-auto bg-green-100 text-green-600"
                   />
                  <Title level={2} className="mb-4">
                    Policy Updates
                  </Title>
                  <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
                    legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page 
                    and updating the "Last updated" date.
                  </Paragraph>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <Paragraph className="text-blue-800 font-semibold mb-2">
                      Stay Informed
                    </Paragraph>
                    <Paragraph className="text-blue-700">
                      We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                    </Paragraph>
                  </div>
                </Card>
              </motion.div>
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

export default PrivacyPolicy; 