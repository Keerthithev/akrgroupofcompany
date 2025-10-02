const axios = require('axios');

class SMSService {
  constructor() {
    this.username = process.env.TEXTWARE_USERNAME || 'TW01056_akr_tr';
    this.password = process.env.TEXTWARE_PASSWORD || 'Vsj5d@OCMeLsk';
    this.src = process.env.TEXTWARE_SENDER_ID || 'MyBiz';
    // Use env override if provided by provider; fallback to docs URL
    this.baseUrl = process.env.TEXTWARE_BASE_URL || 'https://textware.lk/send_sms.php';
  }

  async sendSMS(phoneNumber, message) {
    try {
      // Format phone number (remove any non-digits and ensure it starts with 94)
      let formattedNumber = phoneNumber.replace(/\D/g, '');
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '94' + formattedNumber.substring(1);
      } else if (!formattedNumber.startsWith('94')) {
        formattedNumber = '94' + formattedNumber;
      }

      console.log('Sending SMS to:', formattedNumber);
      console.log('Message:', message);

      // Try multiple provider URL variants (some accounts need different hosts or a '.?' quirk)
      const base = this.baseUrl.replace(/\/?$/,'');
      const candidateUrls = Array.from(new Set([
        base,
        `${base}.?`,
        base.includes('message.text-ware.com') ? base : 'https://message.text-ware.com/send_sms.php',
        'https://www.textware.lk/send_sms.php',
        'https://textware.lk/send_sms.php',
        'https://message.text-ware.com/send_sms.php.?'
      ]));

      let last = null;
      for (const url of candidateUrls) {
        try {
          console.log('Trying provider URL:', url);
          const response = await axios.get(url, {
            params: {
              username: this.username,
              password: this.password,
              src: this.src,
              dst: formattedNumber,
              msg: message,
              dr: 1,
            },
            validateStatus: () => true,
            timeout: 15000,
          });

          console.log('SMS Response Status:', response.status);
          console.log('SMS Response Data:', response.data);

          const rawStr = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
          const looksHtml = /<\s*html/i.test(rawStr) || /EMG V2/i.test(rawStr) || /404/i.test(rawStr);
          if (response.status !== 200 || looksHtml) {
            last = { success: false, message: 'Provider returned non-200', details: response.data, status: response.status };
            continue;
          }

          const dataStr = rawStr.toLowerCase();
          const successIndicators = ['success', 'sent', 'ok', 'accepted', 'queued'];
          const errorIndicators = ['error', 'fail', 'invalid', 'rejected', 'denied'];
          const hasSuccess = successIndicators.some(indicator => dataStr.includes(indicator));
          const hasError = errorIndicators.some(indicator => dataStr.includes(indicator));

          if (hasError) {
            last = { success: false, message: 'SMS sending failed', details: response.data };
            continue;
          }
          return { success: true, message: 'SMS sent successfully', provider: response.data };
        } catch (err) {
          last = { success: false, message: 'Network/endpoint error', error: err.message };
          continue;
        }
      }
      return last || { success: false, message: 'Unknown SMS error' };

    } catch (error) {
      console.error('SMS Error:', error.message);
      return { 
        success: false, 
        message: 'SMS sending failed', 
        error: error.message 
      };
    }
  }

  async sendThankYouMessage(phoneNumber, customerName) {
    const message = `Thank you for contacting AKR Construction. Contact 0773111226 for any inquiries.`;
    return await this.sendSMS(phoneNumber, message);
  }
}

module.exports = new SMSService();
