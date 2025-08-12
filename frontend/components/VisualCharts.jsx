import React from 'react';
import { Card } from 'antd';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const VisualCharts = ({ data, title, type = 'bar' }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const renderChart = () => {
    if (type === 'revenue') {
      const revenueData = [
        { name: 'Collected', value: data.collected || 0, color: '#00C49F' },
        { name: 'Upcoming', value: data.upcoming || 0, color: '#FFBB28' },
        { name: 'Discounts', value: data.discounts || 0, color: '#FF8042' }
      ].filter(item => item.value > 0);

      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={revenueData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {revenueData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'occupancy') {
      const occupancyData = [
        { name: 'Available', value: data.available || 0, color: '#00C49F' },
        { name: 'Occupied', value: data.occupied || 0, color: '#FF8042' },
        { name: 'Cleaning', value: data.cleaning || 0, color: '#FFBB28' }
      ].filter(item => item.value > 0);

      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={occupancyData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {occupancyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'bookings') {
      const bookingData = [
        { name: 'Confirmed', value: data.confirmed || 0, color: '#00C49F' },
        { name: 'Pending', value: data.pending || 0, color: '#FFBB28' },
        { name: 'Cancelled', value: data.cancelled || 0, color: '#FF8042' }
      ].filter(item => item.value > 0);

      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={bookingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8">
              {bookingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'revenue-trend') {
      const trendData = [
        { month: 'Jan', revenue: data.jan || 0 },
        { month: 'Feb', revenue: data.feb || 0 },
        { month: 'Mar', revenue: data.mar || 0 },
        { month: 'Apr', revenue: data.apr || 0 },
        { month: 'May', revenue: data.may || 0 },
        { month: 'Jun', revenue: data.jun || 0 }
      ];

      return (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Default bar chart
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card 
      title={title} 
      style={{ 
        borderRadius: 12, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '100%'
      }}
    >
      {renderChart()}
    </Card>
  );
};

export default VisualCharts; 