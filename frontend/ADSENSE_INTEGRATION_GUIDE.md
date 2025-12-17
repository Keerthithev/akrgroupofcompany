# Google AdSense Integration Guide

This guide shows you how to display ads on all pages of your AKR Group website.

## 1. AdSense Component Usage

The `AdSense` component is already created in `components/AdSense.jsx`. Here's how to use it:

### Basic Usage
```jsx
import AdSense from "../components/AdSense";

// Add this where you want to display ads
<AdSense 
  adSlot="YOUR_AD_SLOT_ID" 
  adFormat="auto"
/>
```

### Different Ad Formats

#### Banner Ad (728x90)
```jsx
<AdSense 
  adSlot="1234567890"
  adFormat="horizontal"
  style={{ margin: '20px 0' }}
/>
```

#### Square Ad (300x300)
```jsx
<AdSense 
  adSlot="1234567891"
  adFormat="square"
  style={{ margin: '20px auto', maxWidth: '300px' }}
/>
```

#### Responsive Ad
```jsx
<AdSense 
  adSlot="1234567892"
  adFormat="auto"
  style={{ margin: '20px 0' }}
/>
```

## 2. Adding Ads to Specific Pages

### Home Page (`pages/Home.jsx`)

Add these imports at the top:
```jsx
import AdSense from "../components/AdSense";
```

Then add ads in strategic locations:

#### After Hero Section:
```jsx
{/* Hero Section */}
<section className="relative overflow-hidden min-h-screen pt-16 lg:pt-0">
  {/* ... existing hero content ... */}
</section>

{/* AdSense Ad */}
<AdSense 
  adSlot="1234567890"
  adFormat="horizontal"
  style={{ margin: '40px 0', textAlign: 'center' }}
/>

{/* AKR Group Companies Section */}
<motion.section id="companies-section" className="py-16 bg-gray-50">
  {/* ... existing companies content ... */}
</motion.section>
```

#### After Companies Section:
```jsx
{/* AKR Group Companies Section */}
<motion.section id="companies-section" className="py-16 bg-gray-50">
  {/* ... existing companies content ... */}
</motion.section>

{/* AdSense Ad */}
<AdSense 
  adSlot="1234567891"
  adFormat="square"
  style={{ margin: '40px auto', maxWidth: '300px' }}
/>

{/* Portfolio Section */}
<motion.section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white">
  {/* ... existing portfolio content ... */}
</motion.section>
```

#### Before Footer:
```jsx
{/* ... existing story section content ... */}
</motion.section>

{/* AdSense Ad */}
<AdSense 
  adSlot="1234567892"
  adFormat="auto"
  style={{ margin: '40px 0' }}
/>

{/* Footer */}
<Footer className="bg-gradient-to-r from-green-700 to-green-400 text-white pt-10 pb-6 mt-16" id="contact">
  {/* ... existing footer content ... */}
</Footer>
```

## 3. Other Pages Examples

### For Company Pages (e.g., `AkrSons.jsx`, `AkrConstruction.jsx`)

```jsx
import React from 'react';
import { Typography, Layout } from 'antd';
import AdSense from '../components/AdSense';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const AkrSons = () => {
  return (
    <Layout className="min-h-screen">
      <Content style={{ padding: '24px' }}>
        <div className="max-w-7xl mx-auto">
          {/* Page Content */}
          <Title>AKR Sons (Pvt) Ltd</Title>
          <Paragraph>Your content here...</Paragraph>
          
          {/* AdSense Ad */}
          <AdSense 
            adSlot="1234567893"
            adFormat="auto"
            style={{ margin: '30px 0' }}
          />
          
          {/* More Content */}
          <Paragraph>More content...</Paragraph>
        </div>
      </Content>
    </Layout>
  );
};

export default AkrSons;
```

### For Hotel/Room Pages

```jsx
import React from 'react';
import { Typography, Card, Row, Col } from 'antd';
import AdSense from '../components/AdSense';

const { Title } = Typography;

const Hotel = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Title level={1}>Hotel & Accommodation</Title>
      
      {/* AdSense Ad */}
      <AdSense 
        adSlot="1234567894"
        adFormat="horizontal"
        style={{ margin: '30px 0' }}
      />
      
      <Row gutter={[24, 24]}>
        {/* Room cards and content */}
      </Row>
    </div>
  );
};

export default Hotel;
```

## 4. Important Notes

### Ad Slot IDs
- Replace `1234567890`, `1234567891`, etc. with your actual AdSense ad slot IDs
- You need to create these in your Google AdSense dashboard

### Best Practices
1. **Don't place ads too close to the top** - Keep them below the fold
2. **Use responsive ads** for better user experience
3. **Test different positions** to find what works best
4. **Follow AdSense policies** - avoid placing ads in navigation areas

### CSS Styling
Add this to your CSS if needed:
```css
.adsense-container {
  text-align: center;
  margin: 20px 0;
}

.adsbygoogle {
  display: block !important;
}
```

## 5. Creating Ad Units in AdSense

1. Go to your Google AdSense dashboard
2. Click "Ads" → "Ad units"
3. Create new ad units:
   - **Display ads** (728x90, 320x50, etc.)
   - **Responsive ads** (recommended)
4. Copy the ad slot IDs and replace them in your code

## 6. Testing

1. Deploy your site
2. Check the AdSense dashboard for impressions
3. Monitor performance and adjust ad placement as needed

Remember: AdSense approval and ad serving may take some time after adding the verification code.