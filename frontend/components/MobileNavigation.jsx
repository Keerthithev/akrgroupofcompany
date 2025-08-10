import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Button, Drawer, Avatar
} from 'antd';
import { 
  MenuOutlined, CloseOutlined, DownOutlined, HomeOutlined,
  BuildOutlined, InfoCircleOutlined, PhoneOutlined,
  EnvironmentOutlined, MailOutlined
} from '@ant-design/icons';

const MobileNavigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const navigate = useNavigate();

  const mobileMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'HOME',
      onClick: () => {
        navigate('/');
        setMobileMenuOpen(false);
      }
    },
    {
      key: 'companies',
      icon: <BuildOutlined />,
      label: 'OUR COMPANIES',
      children: [
        {
          key: 'akr-sons',
          label: 'AKR Sons (Pvt) Ltd',
          onClick: () => {
            window.open('https://sons.akr.lk/', '_blank');
            setMobileMenuOpen(false);
          }
        },
        {
          key: 'multicomplex',
          label: 'AKR Multicomplex',
          children: [
            {
              key: 'multicomplex-main',
              label: 'Multicomplex Overview',
              onClick: () => {
                navigate('/multicomplex');
                setMobileMenuOpen(false);
              }
            },
            {
              key: 'shopping-center',
              label: 'Shopping Center',
              onClick: () => {
                navigate('/shopping');
                setMobileMenuOpen(false);
              }
            },
            {
              key: 'party-hall',
              label: 'Party Hall & Restaurant',
              onClick: () => {
                navigate('/partyhall');
                setMobileMenuOpen(false);
              }
            },
            {
              key: 'hotel-rooms',
              label: 'Hotel & Rooms',
              onClick: () => {
                navigate('/hotel');
                setMobileMenuOpen(false);
              }
            },
            {
              key: 'gym-theater',
              label: 'Gym & Theater',
              onClick: () => {
                navigate('/gym');
                setMobileMenuOpen(false);
              }
            },
            {
              key: 'service-center',
              label: 'AKR Service Center',
              onClick: () => {
                navigate('/servicecenter');
                setMobileMenuOpen(false);
              }
            }
          ]
        },
        {
          key: 'construction',
          label: 'AKR Construction',
          onClick: () => {
            navigate('/construction');
            setMobileMenuOpen(false);
          }
        },
        {
          key: 'filling-station',
          label: 'AKR Lanka Filling Station',
          onClick: () => {
            navigate('/filling-station');
            setMobileMenuOpen(false);
          }
        },
        {
          key: 'wine-store',
          label: 'AKR Wine Store',
          onClick: () => {
            navigate('/wine-store');
            setMobileMenuOpen(false);
          }
        },
        {
          key: 'farm',
          label: 'AKR Farm',
          onClick: () => {
            navigate('/farm');
            setMobileMenuOpen(false);
          }
        },
        {
          key: 'amma',
          label: 'AKR\'s Amma Organization',
          onClick: () => {
            navigate('/amma');
            setMobileMenuOpen(false);
          }
        },
        {
          key: 'easy-credit',
          label: 'AKR Easy Credit (Pvt) Ltd',
          onClick: () => {
            navigate('/easy-credit');
            setMobileMenuOpen(false);
          }
        }
      ]
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: 'ABOUT',
      children: [
        {
          key: 'about-us',
          label: 'Our Story',
          onClick: () => {
            navigate('/');
            setTimeout(() => {
              document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            setMobileMenuOpen(false);
          }
        },
        {
          key: 'about-page',
          label: 'About Us',
          onClick: () => {
            navigate('/about');
            setMobileMenuOpen(false);
          }
        },
        {
          key: 'privacy',
          label: 'Privacy Policy',
          onClick: () => {
            navigate('/privacy');
            setMobileMenuOpen(false);
          }
        }
      ]
    },
    {
      key: 'contact',
      icon: <PhoneOutlined />,
      label: 'CONTACT US',
      onClick: () => {
        navigate('/');
        setTimeout(() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        setMobileMenuOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="md:hidden"
      >
        <Button
          type="text"
          icon={<MenuOutlined />}
          className="text-green-600"
          onClick={() => setMobileMenuOpen(true)}
        />
      </motion.div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        placement="left"
        width="85%"
        className="mobile-nav-drawer"
        styles={{
          body: { padding: 0 },
          header: { display: 'none' }
        }}
      >
        <div className="bg-gradient-to-b from-blue-900 to-blue-800 h-full text-white">
          {/* Header with Logo and Close Button */}
          <div className="flex items-center justify-between p-6 border-b border-blue-700">
            <div className="flex items-center space-x-3">
              <img
                src="/images/image copy 2.png"
                alt="AKR Group Logo"
                className="w-12 h-12 rounded-full object-cover border-2 border-green-400"
              />
              <div>
                <div className="text-lg font-bold text-white">AKR GROUP OF COMPANIES</div>
                <div className="text-xs text-blue-200">Excellence in every venture</div>
              </div>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              className="text-green-400 hover:text-green-300"
              onClick={() => setMobileMenuOpen(false)}
            />
          </div>

          {/* Navigation Menu */}
          <div className="p-4 space-y-2">
            {mobileMenuItems.map((item) => (
              <div key={item.key}>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    item.children ? 'hover:bg-blue-700' : 'hover:bg-blue-700'
                  }`}
                  onClick={() => {
                    if (item.children) {
                      setExpandedItems(prev => ({
                        ...prev,
                        [item.key]: !prev[item.key]
                      }));
                    } else {
                      item.onClick();
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.children && (
                    <DownOutlined 
                      className={`text-green-400 transition-transform ${
                        expandedItems[item.key] ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </div>
                
                {/* Sub-menu items */}
                {item.children && expandedItems[item.key] && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <div key={child.key}>
                        <div
                          className={`flex items-center justify-between p-2 pl-6 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${
                            child.children ? 'hover:bg-blue-700' : 'hover:bg-blue-700'
                          }`}
                          onClick={() => {
                            if (child.children) {
                              setExpandedItems(prev => ({
                                ...prev,
                                [child.key]: !prev[child.key]
                              }));
                            } else {
                              child.onClick();
                            }
                          }}
                        >
                          <span className="text-blue-200 text-sm">{child.label}</span>
                          {child.children && (
                            <DownOutlined 
                              className={`text-green-400 transition-transform text-xs ${
                                expandedItems[child.key] ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </div>
                        
                        {/* Sub-sub-menu items */}
                        {child.children && expandedItems[child.key] && (
                          <div className="ml-8 mt-1 space-y-1">
                            {child.children.map((grandchild) => (
                              <div
                                key={grandchild.key}
                                className="flex items-center p-2 pl-6 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                                onClick={() => {
                                  grandchild.onClick();
                                }}
                              >
                                <span className="text-blue-100 text-xs">{grandchild.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Info at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-700">
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <PhoneOutlined className="text-green-400" />
                <span className="text-blue-200">0773111266</span>
              </div>
              <div className="flex items-center space-x-2">
                <MailOutlined className="text-green-400" />
                <span className="text-blue-200">akrfuture@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvironmentOutlined className="text-green-400" />
                <span className="text-blue-200">Main street Murunkan, Mannar</span>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default MobileNavigation; 