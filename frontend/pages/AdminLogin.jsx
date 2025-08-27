import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { Form, Input, Button, Typography, message, Tabs } from "antd";

const { Title } = Typography;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post("/api/admin/login", values);
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      message.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onConstructionFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post("/api/construction-admin/login", values);
      localStorage.setItem("constructionAdminToken", res.data.token);
      localStorage.setItem("adminRole", res.data.role);
      navigate("/construction-admin/dashboard");
    } catch (err) {
      message.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: '1',
      label: 'Hotel Admin',
      children: (
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please enter your username' }]}> 
            <Input size="large" placeholder="Username" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}> 
            <Input.Password size="large" placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading}
              style={{ background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)', border: 'none' }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '2',
      label: 'Construction Admin',
      children: (
        <Form layout="vertical" onFinish={onConstructionFinish} autoComplete="off">
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please enter your username' }]}> 
            <Input size="large" placeholder="Username" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}> 
            <Input.Password size="large" placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading}
              style={{ background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)', border: 'none' }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-akr-green-1 to-akr-green-2">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4">
        <Title level={2} style={{ color: '#11998e', textAlign: 'center', marginBottom: 16 }}>Admin Login</Title>
        <Tabs 
          defaultActiveKey="1" 
          items={items}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default AdminLogin; 