import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { BarChartOutlined, HomeOutlined, TrophyOutlined, BellOutlined } from '@ant-design/icons';

const SimpleChart = ({ data, title, type = 'bar' }) => {
  const renderChart = () => {
    if (type === 'revenue') {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginBottom: '10px' }}>
            Rs. {data.total?.toLocaleString() || '0'}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            {data.period || 'Total Revenue'}
          </div>
          {data.breakdown && (
            <div style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>
              <div>Collected: Rs. {data.breakdown.collected?.toLocaleString() || '0'}</div>
              <div>Upcoming: Rs. {data.breakdown.upcoming?.toLocaleString() || '0'}</div>
            </div>
          )}
        </div>
      );
    }

    if (type === 'occupancy') {
      const occupancyRate = data.total > 0 ? ((data.total - data.available) / data.total * 100).toFixed(1) : 0;
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a', marginBottom: '10px' }}>
            {occupancyRate}%
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Occupancy Rate
          </div>
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>
            <div>Available: {data.available || 0} rooms</div>
            <div>Occupied: {data.total - data.available || 0} rooms</div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginBottom: '10px' }}>
          {data.value || '0'}
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          {title}
        </div>
      </div>
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

export default SimpleChart; 