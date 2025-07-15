import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Terms and Conditions</h1>
        <div className="text-sm text-gray-500 mb-6">Last updated: May 2024</div>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-gray-700">By submitting a pre-booking through this website, you agree to the following terms and conditions. Please read them carefully before proceeding.</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Pre-Booking Policy</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Pre-booking does not guarantee immediate delivery. All bookings are subject to availability and confirmation by AKR & SONS (PVT) LTD.</li>
            <li>We reserve the right to cancel or modify bookings at our discretion. You will be notified in such cases.</li>
            <li>Any advance payments (if applicable) are refundable only as per our refund policy.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. Privacy and Data</h2>
          <p className="text-gray-700">Your personal information will be used solely for processing your booking and will not be shared with third parties except as required by law. For more details, see our Privacy Policy.</p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Customer Responsibilities</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Provide accurate and complete information in the booking form.</li>
            <li>Respond promptly to any communication from our team regarding your booking.</li>
            <li>Comply with all applicable laws and regulations.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Contact Information</h2>
          <p className="text-gray-700">If you have any questions about these terms, please contact us at <a href="mailto:admin@akr.com" className="underline text-blue-700">admin@akr.com</a>.</p>
        </section>
        <div className="text-xs text-gray-400 mt-8">&copy; {new Date().getFullYear()} AKR & SONS (PVT) LTD. All rights reserved.</div>
      </div>
    </div>
  );
} 