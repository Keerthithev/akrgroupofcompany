const https = require('https');
const http = require('http');

// Your Render backend URL
const BACKEND_URL = 'https://akrgroupofcompany-bjvw.onrender.com'; // Your actual backend URL

function pingServer() {
  const url = new URL(BACKEND_URL + '/health');
  const client = url.protocol === 'https:' ? https : http;
  
  const req = client.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Ping successful - Status: ${res.statusCode}`);
      try {
        const response = JSON.parse(data);
        console.log(`[${timestamp}] Server uptime: ${Math.round(response.uptime)}s`);
      } catch (e) {
        console.log(`[${timestamp}] Response: ${data}`);
      }
    });
  });
  
  req.on('error', (err) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Ping failed: ${err.message}`);
  });
  
  req.setTimeout(10000, () => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Ping timeout`);
    req.destroy();
  });
}

// Ping every 5 minutes (300,000 milliseconds)
const PING_INTERVAL = 5 * 60 * 1000;

console.log(`Starting ping service for: ${BACKEND_URL}`);
console.log(`Ping interval: ${PING_INTERVAL / 1000} seconds`);

// Initial ping
pingServer();

// Set up recurring pings
setInterval(pingServer, PING_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nPing service stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nPing service stopped');
  process.exit(0);
}); 