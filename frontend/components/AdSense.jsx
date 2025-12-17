import React, { useEffect } from 'react';

const AdSense = ({ 
  adSlot, 
  adFormat = 'auto', 
  adLayout = '', 
  style = {},
  className = '',
  fullWidthResponsive = true 
}) => {
  useEffect(() => {
    try {
      // Push ads after component mounts
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5873648104004417"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive={fullWidthResponsive.toString()}
      ></ins>
    </div>
  );
};

export default AdSense;