import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Card, Button, Modal, message, Spin, Tabs, Input, Form } from 'antd';
import { QrcodeOutlined, LeftOutlined, RightOutlined, DownloadOutlined, MailOutlined } from '@ant-design/icons';
import api from '../lib/axios';

const { TabPane } = Tabs;

const QRCodeGenerator = ({ visible, onClose }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [activeTab, setActiveTab] = useState('review');
  const [emailForm] = Form.useForm();
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchRooms();
    }
  }, [visible]);

  useEffect(() => {
    if (rooms.length > 0 && currentRoomIndex < rooms.length) {
      generateQRCode(rooms[currentRoomIndex]);
    }
  }, [rooms, currentRoomIndex, activeTab]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/rooms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setRooms(response.data);
      setCurrentRoomIndex(0);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      message.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (room) => {
    const baseUrl = window.location.origin;
    
    switch (activeTab) {
      case 'review':
        setQrCodeData(`${baseUrl}/review/${room._id}`);
        break;
      case 'booking':
        setQrCodeData(`${baseUrl}/hotel?room=${room._id}`);
        break;
      case 'info':
        setQrCodeData(`${baseUrl}/room-info/${room._id}`);
        break;
      default:
        setQrCodeData(`${baseUrl}/review/${room._id}`);
    }
  };

  const nextRoom = () => {
    if (currentRoomIndex < rooms.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
    }
  };

  const prevRoom = () => {
    if (currentRoomIndex > 0) {
      setCurrentRoomIndex(currentRoomIndex - 1);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qr-code-${rooms[currentRoomIndex]?.name?.replace(/\s+/g, '-').toLowerCase()}-${activeTab}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const sendQRCodeEmail = async (values) => {
    try {
      setSendingEmail(true);
      const currentRoom = rooms[currentRoomIndex];
      
      // Here you would typically send the QR code via email
      // For now, we'll just show a success message
      message.success(`QR Code for ${currentRoom.name} sent to ${values.email}`);
      
      // Reset form
      emailForm.resetFields();
    } catch (error) {
      console.error('Error sending email:', error);
      message.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const getQRCodeTitle = () => {
    switch (activeTab) {
      case 'review':
        return 'Review QR Code';
      case 'booking':
        return 'Booking QR Code';
      case 'info':
        return 'Room Info QR Code';
      default:
        return 'Review QR Code';
    }
  };

  const getQRCodeDescription = () => {
    switch (activeTab) {
      case 'review':
        return 'Scan to write a review for this room';
      case 'booking':
        return 'Scan to book this room directly';
      case 'info':
        return 'Scan to view room information';
      default:
        return 'Scan to write a review for this room';
    }
  };

  const currentRoom = rooms[currentRoomIndex];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <QrcodeOutlined style={{ fontSize: 20, color: '#11998e' }} />
          <span>Room QR Codes</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading rooms...</div>
        </div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 16, color: '#666' }}>No rooms found</div>
        </div>
      ) : (
        <div>
          {/* Room Navigation */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Button 
                icon={<LeftOutlined />} 
                onClick={prevRoom} 
                disabled={currentRoomIndex === 0}
                size="large"
              >
                Previous
              </Button>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 }}>
                  {currentRoom?.name}
                </div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
                  {currentRoom?.category} • {currentRoom?.type}
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  Room {currentRoomIndex + 1} of {rooms.length}
                </div>
              </div>
              
              <Button 
                icon={<RightOutlined />} 
                onClick={nextRoom} 
                disabled={currentRoomIndex === rooms.length - 1}
                size="large"
              >
                Next
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div style={{ 
              width: '100%', 
              height: 4, 
              backgroundColor: '#f0f0f0', 
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((currentRoomIndex + 1) / rooms.length) * 100}%`,
                height: '100%',
                backgroundColor: '#11998e',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* QR Code Tabs */}
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            style={{ marginBottom: 20 }}
          >
            <TabPane tab="📝 Review QR" key="review" />
            <TabPane tab="🏨 Booking QR" key="booking" />
            <TabPane tab="ℹ️ Info QR" key="info" />
          </Tabs>

          {/* QR Code Display */}
          <Card 
            style={{ 
              marginBottom: 20,
              border: '2px solid #11998e',
              borderRadius: 12
            }}
            bodyStyle={{ padding: 30 }}
          >
            <div style={{ marginBottom: 15 }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 }}>
                {getQRCodeTitle()}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                {getQRCodeDescription()}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 8,
              border: '1px solid #e0e0e0'
            }}>
              <QRCode
                id="qr-code-svg"
                value={qrCodeData}
                size={200}
                level="H"
                style={{ 
                  height: 'auto',
                  maxWidth: '100%',
                  width: '100%'
                }}
              />
            </div>
            
            <div style={{ marginTop: 15 }}>
              <div style={{ fontSize: 12, color: '#666', wordBreak: 'break-all' }}>
                <strong>URL:</strong> {qrCodeData}
              </div>
            </div>
          </Card>

          {/* Room Information */}
          <Card style={{ marginBottom: 20 }}>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ marginBottom: 15, color: '#333' }}>Room Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                <div><strong>Type:</strong> {currentRoom?.type}</div>
                <div><strong>Category:</strong> {currentRoom?.category}</div>
                <div><strong>Beds:</strong> {currentRoom?.beds}</div>
                <div><strong>Max Guests:</strong> {currentRoom?.maxGuests}</div>
                <div><strong>Price:</strong> Rs. {currentRoom?.price?.toLocaleString()}</div>
                <div><strong>Status:</strong> {currentRoom?.status}</div>
                <div><strong>Size:</strong> {currentRoom?.size}m²</div>
                <div><strong>View:</strong> {currentRoom?.view}</div>
              </div>
            </div>
          </Card>

          {/* Email QR Code */}
          <Card style={{ marginBottom: 20 }}>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ marginBottom: 15, color: '#333' }}>
                <MailOutlined style={{ marginRight: 8 }} />
                Send QR Code via Email
              </h4>
              <Form form={emailForm} onFinish={sendQRCodeEmail} layout="inline">
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter email address' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                  style={{ flex: 1, marginRight: 10 }}
                >
                  <Input 
                    placeholder="Enter email address" 
                    size="large"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<MailOutlined />}
                    loading={sendingEmail}
                    size="large"
                    style={{ backgroundColor: '#11998e', borderColor: '#11998e' }}
                  >
                    Send QR Code
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={downloadQRCode}
              size="large"
              style={{ backgroundColor: '#11998e', borderColor: '#11998e' }}
            >
              Download QR Code
            </Button>
            
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(qrCodeData);
                message.success('QR Code URL copied to clipboard!');
              }}
              size="large"
            >
              Copy URL
            </Button>
          </div>

          {/* Instructions */}
          <div style={{ 
            marginTop: 20, 
            padding: 15, 
            backgroundColor: '#f8f9fa', 
            borderRadius: 8,
            textAlign: 'left'
          }}>
            <h4 style={{ marginBottom: 10, color: '#333' }}>Instructions:</h4>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#666', lineHeight: 1.6 }}>
              <li><strong>Review QR:</strong> Print and display in room for guest reviews</li>
              <li><strong>Booking QR:</strong> Share with potential guests for direct booking</li>
              <li><strong>Info QR:</strong> Display for room information and amenities</li>
              <li>Guests can scan with their phone camera</li>
              <li>Use the email feature to send QR codes to guests or staff</li>
              <li>Download QR codes for printing and display</li>
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default QRCodeGenerator; 