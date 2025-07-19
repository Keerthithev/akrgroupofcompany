import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { motion } from 'framer-motion';
import { User, Mail, Phone, IdCard, Home, Bike, StickyNote, Calendar, Info } from 'lucide-react';

const steps = [
  { label: 'Fill Details' },
  { label: 'Confirm' },
  { label: 'Success' },
];

export default function PreBook() {
  const [models, setModels] = useState<string[]>([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    address: '',
    vehicleModel: '',
    notes: '',
    agree: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0); // 0: form, 1: confirm, 2: success
  const [bookingId, setBookingId] = useState('');
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ mode: 'online', bannerImage: '', bannerText: '' });

  console.log('PreBook settings.mode:', settings.mode);

  useEffect(() => {
    async function fetchModels() {
      try {
        const vehiclesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles`);
        const vehiclesData = await vehiclesRes.json();
        if (Array.isArray(vehiclesData)) {
          setModels(vehiclesData.filter((v: any) => v.available !== false).map((v: any) => v.name));
        } else if (Array.isArray(vehiclesData.vehicles)) {
          setModels(vehiclesData.vehicles.filter((v: any) => v.available !== false).map((v: any) => v.name));
        } else {
          setModels([]);
        }
      } catch {
        setModels([]);
      }
    }
    fetchModels();
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  // Validation helpers
  const validate = () => {
    if (!form.fullName || !form.email || !form.phone || !form.nationalId || !form.address || !form.vehicleModel || !form.agree) {
      setError('Please fill all required fields and agree to the terms.');
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError('Please enter a valid email.');
      return false;
    }
    if (!/^\+?\d{9,15}$/.test(form.phone)) {
      setError('Please enter a valid phone number.');
      return false;
    }
    setError('');
    return true;
  };

  // Step 1: Form submit
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep(1);
  };

  // Step 2: Confirm and submit to backend
  const handleConfirm = async () => {
    console.log('Submitting booking...'); // Log at the start
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/prebookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      console.log('PreBook API response:', data); // Debug log
      if (res.ok && data.bookingId) {
        setBookingId(data.bookingId);
        setStep(2);
      } else {
        setError(data.error || 'Failed to submit pre-booking.');
        setStep(0);
      }
    } catch {
      setError('Failed to submit pre-booking.');
      setStep(0);
    }
    setLoading(false);
  };

  // Enhanced StepsIndicator with sticky and more prominent style
  const StepsIndicator = () => (
    <div className="flex justify-center items-center gap-4 mb-8 mt-8 sticky top-0 z-20 bg-gradient-to-r from-emerald-200/40 via-blue-200/40 to-green-200/40 py-2 rounded-xl shadow-md">
      {steps.map((s, idx) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className={`rounded-full w-9 h-9 flex items-center justify-center font-bold text-white transition-all duration-300 text-lg ${step === idx ? 'bg-blue-600 scale-110 shadow-lg' : step > idx ? 'bg-green-500' : 'bg-gray-300'}`}>{idx + 1}</div>
          <span className={`text-base font-semibold ${step === idx ? 'text-blue-700' : 'text-gray-500'}`}>{s.label}</span>
          {idx < steps.length - 1 && <div className="w-8 h-1 bg-gray-200 rounded-full" />}
        </div>
      ))}
    </div>
  );

  // Step 0: Booking Form
  const bookingForm = (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-emerald-200/40 via-blue-200/40 to-green-200/40 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl px-2 py-2 sm:px-6 sm:py-4">
      <StepsIndicator />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-2xl">
        <Card className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-emerald-700">Pre-Book Your Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Use a responsive grid for the form fields */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleContinue} autoComplete="off">
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2"><User className="h-4 w-4" /> Full Name</Label>
                <Input id="fullName" name="fullName" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required autoComplete="name" placeholder="Enter your full name" className="focus:ring-2 focus:ring-emerald-400" />
                {error.includes('full name') && <div className="text-red-600 text-xs mt-1 flex items-center gap-1"><Info className="w-4 h-4" /> {error}</div>}
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email <span className="text-xs text-gray-400 ml-2">(We'll never share your email)</span></Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="email" placeholder="you@email.com" className="focus:ring-2 focus:ring-emerald-400" />
                {error.includes('email') && <div className="text-red-600 text-xs mt-1 flex items-center gap-1"><Info className="w-4 h-4" /> {error}</div>}
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Number</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required autoComplete="tel" placeholder="e.g. +94771234567" className="focus:ring-2 focus:ring-emerald-400" />
                {error.includes('phone') && <div className="text-red-600 text-xs mt-1 flex items-center gap-1"><Info className="w-4 h-4" /> {error}</div>}
              </div>
              <div>
                <Label htmlFor="nationalId" className="flex items-center gap-2"><IdCard className="h-4 w-4" /> National ID / Passport</Label>
                <Input id="nationalId" name="nationalId" value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} required autoComplete="off" placeholder="NIC or Passport Number" className="focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="flex items-center gap-2"><Home className="h-4 w-4" /> Full Delivery Address</Label>
                <Textarea id="address" name="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required rows={2} placeholder="Delivery address" className="focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="vehicleModel" className="flex items-center gap-2"><Bike className="h-4 w-4" /> Select Vehicle Model</Label>
                <Select value={form.vehicleModel} onValueChange={val => setForm({ ...form, vehicleModel: val })} required>
                  <SelectTrigger id="vehicleModel">
                    <SelectValue placeholder="Choose a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes" className="flex items-center gap-2"><StickyNote className="h-4 w-4" /> Optional Notes / Requests</Label>
                <Textarea id="notes" name="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Any special requests?" className="focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div className="md:col-span-2 flex items-center gap-2 mt-2">
                <input type="checkbox" id="agree" checked={form.agree} onChange={e => setForm({ ...form, agree: e.target.checked })} className="h-4 w-4" required />
                <Label htmlFor="agree" className="text-sm font-semibold">
                  I have read and agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">Terms and Conditions</a>.
                </Label>
              </div>
              {error && !error.includes('email') && !error.includes('phone') && !error.includes('full name') && <div className="md:col-span-2 text-red-600 text-sm font-medium flex items-center gap-1 mt-2"><Info className="w-4 h-4" /> {error}</div>}
              <div className="md:col-span-2">
                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl px-4 py-3 text-base sm:text-lg shadow-lg hover:scale-105 transition flex items-center justify-center gap-2" disabled={loading}>
                  {loading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
                  {loading ? 'Submitting...' : 'Continue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  // Confirmation step: add a success icon and clear message
  const confirmStep = (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-emerald-200/40 via-blue-200/40 to-green-200/40 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl px-2 py-6 sm:px-4 sm:py-12">
      <StepsIndicator />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-lg">
        <Card className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
              <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Booking Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6 text-center">
              <div className="text-lg font-semibold text-emerald-700">Thank you for your booking.</div>
              <div className="text-base text-gray-700">Your booking ID is <span className="font-bold text-blue-700">{bookingId}</span></div>
              <div className="text-sm text-gray-600">We will contact you soon with further details.</div>
            </div>
            <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl px-4 py-3 text-base shadow-lg hover:scale-105 transition mt-4" onClick={() => { console.log('Confirm & Book clicked'); handleConfirm(); }}>Confirm & Book</Button>
            <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl px-4 py-3 text-base shadow-lg hover:scale-105 transition mt-4" onClick={() => navigate('/')}>Back to Home</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  // Step 2: Success
  const successStep = (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <StepsIndicator />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Pre-Booking Confirmed!</h2>
        <p className="mb-2">Thank you for your pre-booking. Your Booking ID is:</p>
        <div className="text-xl font-mono font-bold text-blue-700 mb-6">{bookingId}</div>
        <Button onClick={() => { setStep(0); setForm({ fullName: '', email: '', phone: '', nationalId: '', address: '', vehicleModel: '', notes: '', agree: false }); }} className="w-full">New Pre-Booking</Button>
        <Button onClick={() => navigate('/')} className="w-full mt-2">Back to Home</Button>
      </motion.div>
    </div>
  );

  if (settings.mode === 'maintenance') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-emerald-200/40 via-blue-200/40 to-green-200/40 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl px-2 py-6 sm:px-4 sm:py-12">
        {settings.bannerImage && <img src={settings.bannerImage} alt="Banner" className="max-h-48 mx-auto mb-4 rounded-xl shadow-lg" />}
        <h2 className="text-3xl font-bold mb-2 text-center">Maintenance Mode</h2>
        <p className="text-lg font-semibold mb-2 text-center">{settings.bannerText || 'The booking form is currently disabled for maintenance. Please check back soon.'}</p>
      </div>
    );
  }

  return (
    <div>
      {step === 0 && bookingForm}
      {step === 1 && confirmStep}
      {step === 2 && successStep}
    </div>
  );
} 