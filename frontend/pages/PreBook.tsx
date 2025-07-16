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

  useEffect(() => {
    async function fetchModels() {
      try {
        const companiesRes = await fetch("http://localhost:5050/api/companies");
        const companies = await companiesRes.json();
        const akr = companies.find((c: any) => c.name === "AKR & SONS (PVT) LTD");
        if (!akr) {
          setModels([]);
          return;
        }
        const vehiclesRes = await fetch(`http://localhost:5050/api/vehicles/company/${akr._id}`);
        const vehiclesData = await vehiclesRes.json();
        if (Array.isArray(vehiclesData)) {
          setModels(vehiclesData.map((v: any) => v.name));
        } else if (Array.isArray(vehiclesData.vehicles)) {
          setModels(vehiclesData.vehicles.map((v: any) => v.name));
        } else {
          setModels([]);
        }
      } catch {
        setModels([]);
      }
    }
    fetchModels();
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
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5050/api/prebookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
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

  // Custom Steps Indicator
  const StepsIndicator = () => (
    <div className="flex justify-center items-center gap-4 mb-8 mt-8">
      {steps.map((s, idx) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white transition-all duration-300 ${step === idx ? 'bg-blue-600 scale-110 shadow-lg' : step > idx ? 'bg-green-500' : 'bg-gray-300'}`}>{idx + 1}</div>
          <span className={`text-sm font-medium ${step === idx ? 'text-blue-700' : 'text-gray-500'}`}>{s.label}</span>
          {idx < steps.length - 1 && <div className="w-8 h-1 bg-gray-200 rounded-full" />}
        </div>
      ))}
    </div>
  );

  // Step 0: Booking Form
  const bookingForm = (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-emerald-200/40 via-blue-200/40 to-green-200/40 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl px-4 py-12">
      <StepsIndicator />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-lg">
        <Card className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-emerald-700">Pre-Book Your Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleContinue} autoComplete="off">
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2"><User className="h-4 w-4" /> Full Name</Label>
                <Input id="fullName" name="fullName" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required autoComplete="off" placeholder="Enter your full name" />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email <span className="text-xs text-gray-400 ml-2">(We'll never share your email)</span></Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="off" placeholder="you@email.com" />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Number</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required autoComplete="off" placeholder="e.g. +94771234567" />
              </div>
              <div>
                <Label htmlFor="nationalId" className="flex items-center gap-2"><IdCard className="h-4 w-4" /> National ID / Passport</Label>
                <Input id="nationalId" name="nationalId" value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} required autoComplete="off" placeholder="NIC or Passport Number" />
              </div>
              <div>
                <Label htmlFor="address" className="flex items-center gap-2"><Home className="h-4 w-4" /> Full Delivery Address</Label>
                <Textarea id="address" name="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required rows={2} placeholder="Delivery address" />
              </div>
              <div>
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
              <div>
                <Label htmlFor="notes" className="flex items-center gap-2"><StickyNote className="h-4 w-4" /> Optional Notes / Requests</Label>
                <Textarea id="notes" name="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Any special requests?" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="agree" checked={form.agree} onChange={e => setForm({ ...form, agree: e.target.checked })} className="h-4 w-4" required />
                <Label htmlFor="agree" className="text-sm font-semibold">
                  I have read and agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">Terms and Conditions</a>.
                </Label>
              </div>
              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl px-8 py-3 text-lg shadow-lg hover:scale-105 transition" disabled={loading}>{loading ? 'Submitting...' : 'Continue'}</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  // Step 1: Confirmation
  const confirmStep = (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-emerald-200/40 via-blue-200/40 to-green-200/40 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl px-4 py-12">
      <StepsIndicator />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-lg">
        <Card className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-emerald-700">Confirm Your Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div><b>Full Name:</b> {form.fullName}</div>
              <div><b>Email:</b> {form.email}</div>
              <div><b>Phone:</b> {form.phone}</div>
              <div><b>National ID / Passport:</b> {form.nationalId}</div>
              <div><b>Address:</b> {form.address}</div>
              <div><b>Vehicle Model:</b> {form.vehicleModel}</div>
              <div><b>Notes:</b> {form.notes || '-'}</div>
              <div><b>Agreed to Terms:</b> {form.agree ? 'Yes' : 'No'}</div>
            </div>
            {error && <div className="text-red-600 text-sm font-medium mb-2">{error}</div>}
            <div className="flex gap-4">
              <Button type="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={handleConfirm} className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl px-8 py-3 text-lg shadow-lg hover:scale-105 transition" disabled={loading}>{loading ? 'Booking...' : 'Confirm & Book'}</Button>
            </div>
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

  return (
    <div>
      {step === 0 && bookingForm}
      {step === 1 && confirmStep}
      {step === 2 && successStep}
    </div>
  );
} 