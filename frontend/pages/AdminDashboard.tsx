import React, { useEffect, useState, useRef } from "react";
import { Chart } from "../components/ui/chart";
import { User, Bell, Activity, Home, Building2, Store, Leaf, HeartHandshake, Wine, Fuel, Wrench, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Layout, Menu, Form, Input, Select, Upload, Button, Modal, message, Row, Col, Table, List, Card, Space, Tag, Rate, Spin, Descriptions } from "antd";
import { UserOutlined, BellOutlined, HomeOutlined, BuildOutlined, MoreOutlined, LeftOutlined, LineOutlined, WechatOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { UploadOutlined } from "@ant-design/icons";
import { UploadFile } from "antd/es/upload/interface";
import { MenuOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import Swal from 'sweetalert2';
import saveAs from 'file-saver';
import { DownloadOutlined } from '@ant-design/icons';
import { Select as AntdSelect } from 'antd';

const AKR_COMPANY_NAME = "AKR & SONS (PVT) LTD";

// Old mock data for other companies
const oldCompanyInfo = {
  "AKR Multi Complex": {
    description: "Modern commercial and residential complex offering premium spaces for businesses and families with state-of-the-art facilities and services.",
    status: "Active",
    employees: [
      { id: 1, name: "Alice Johnson", role: "Manager" },
      { id: 2, name: "Bob Lee", role: "Receptionist" },
    ],
    services: ["Leasing", "Events", "Hospitality"],
    kpis: { revenue: "$800K", growth: "5%", employees: 12 },
  },
  "AKR Construction": {
    description: "Professional construction company delivering high-quality infrastructure projects, residential complexes, and commercial buildings with innovative designs.",
    status: "Active",
    employees: [
      { id: 1, name: "Chris Martin", role: "Engineer" },
      { id: 2, name: "Diana Prince", role: "Architect" },
    ],
    services: ["Building", "Design", "Consulting"],
    kpis: { revenue: "$1.1M", growth: "7%", employees: 18 },
  },
  // ...add more companies as needed
};
const notifications = [
  { id: 1, message: "New employee added to AKR & SONS.", time: "2 min ago" },
  { id: 2, message: "Monthly report for AKR Farm is ready.", time: "1 hr ago" },
  { id: 3, message: "Service update in AKR Construction.", time: "Today" },
];
const activities = [
  { id: 1, action: "Edited company info for AKR Wine Store.", time: "5 min ago" },
  { id: 2, action: "Deleted employee from AKR Multi Complex.", time: "30 min ago" },
  { id: 3, action: "Added new service to AKR Beauty Zone.", time: "Yesterday" },
];

// Cloudinary config via Vite environment variables
// Add these to your .env file in the project root:
// VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
// VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
const CLOUDINARY_UPLOAD_PRESET = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
// --- Professional Multi-Value Inputs ---
export function FeatureInput({ value = [], onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  return (
    <div>
      <label className="block text-sm mb-1 font-medium">Features</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((f, i) => (
          <span key={i} className="bg-emerald-100 px-2 py-1 rounded flex items-center gap-1">
            {f}
            <button type="button" className="ml-1 text-red-500" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          placeholder="Add feature"
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
              e.preventDefault();
              if (!value.includes(input.trim())) onChange([...value, input.trim()]);
              setInput("");
            }
          }}
        />
        <button type="button" className="bg-emerald-500 text-white px-3 py-2 rounded" onClick={() => {
          if (input.trim() && !value.includes(input.trim())) onChange([...value, input.trim()]);
          setInput("");
        }}>Add</button>
      </div>
    </div>
  );
}

export function VariantInput({ value = [], onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const [name, setName] = useState("");
  const [features, setFeatures] = useState("");
  return (
    <div>
      <label className="block text-sm mb-1 font-medium">Variants</label>
      <div className="flex flex-col gap-2 mb-2">
        {value.map((v, i) => (
          <div key={i} className="bg-cyan-50 rounded p-2 flex items-center gap-2">
            <span className="font-semibold">{v.name}</span>
            <span className="text-xs text-gray-500">{v.features?.join(", ")}</span>
            <button type="button" className="ml-2 text-red-500" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>&times;</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="border px-3 py-2 rounded w-1/3" placeholder="Variant name" />
        <input type="text" value={features} onChange={e => setFeatures(e.target.value)} className="border px-3 py-2 rounded w-2/3" placeholder="Features (comma separated)" />
        <button type="button" className="bg-cyan-500 text-white px-3 py-2 rounded" onClick={() => {
          if (name.trim()) {
            onChange([...value, { name: name.trim(), features: features.split(",").map(f => f.trim()).filter(Boolean) }]);
            setName("");
            setFeatures("");
          }
        }}>Add</button>
      </div>
    </div>
  );
}

export function SpecsInput({ value = [], onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");
  return (
    <div>
      <label className="block text-sm mb-1 font-medium">Specs</label>
      <div className="flex flex-col gap-2 mb-2">
        {value.map((s, i) => (
          <div key={i} className="bg-gray-50 rounded p-2 flex items-center gap-2">
            <span className="font-semibold">{s.key}:</span>
            <span>{s.value}</span>
            <button type="button" className="ml-2 text-red-500" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>&times;</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <input type="text" value={key} onChange={e => setKey(e.target.value)} className="border px-3 py-2 rounded w-1/3" placeholder="Spec name" />
        <input type="text" value={val} onChange={e => setVal(e.target.value)} className="border px-3 py-2 rounded w-2/3" placeholder="Value" />
        <button type="button" className="bg-gray-500 text-white px-3 py-2 rounded" onClick={() => {
          if (key.trim() && val.trim()) {
            onChange([...value, { key: key.trim(), value: val.trim() }]);
            setKey("");
            setVal("");
          }
        }}>Add</button>
      </div>
    </div>
  );
}

export function FaqsInput({ value = [], onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  return (
    <div>
      <label className="block text-sm mb-1 font-medium">FAQs</label>
      <div className="flex flex-col gap-2 mb-2">
        {value.map((f, i) => (
          <div key={i} className="bg-fuchsia-50 rounded p-2 flex items-center gap-2">
            <span className="font-semibold">Q:</span> {f.question}
            <span className="font-semibold ml-2">A:</span> {f.answer}
            <button type="button" className="ml-2 text-red-500" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>&times;</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <input type="text" value={q} onChange={e => setQ(e.target.value)} className="border px-3 py-2 rounded w-1/2" placeholder="Question" />
        <input type="text" value={a} onChange={e => setA(e.target.value)} className="border px-3 py-2 rounded w-1/2" placeholder="Answer" />
        <button type="button" className="bg-fuchsia-500 text-white px-3 py-2 rounded" onClick={() => {
          if (q.trim() && a.trim()) {
            onChange([...value, { question: q.trim(), answer: a.trim() }]);
            setQ("");
            setA("");
          }
        }}>Add</button>
      </div>
    </div>
  );
}

// --- Color Input for Colors with Image Upload ---
function ColorInput({ value = [], onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_PALETTE[0].hex);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (images.length >= 5) return false;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setUploading(false);
    if (data.secure_url) setImages(imgs => [...imgs, data.secure_url]);
    return false;
  };

  const selectedColorObj = COLOR_PALETTE.find(c => c.hex === selectedColor);

  // Reset images when color changes
  useEffect(() => { setImages([]); }, [selectedColor]);

  const handleAddColor = () => {
    if (!selectedColor || images.length === 0) return;
    if (value.length >= 5) return; // max 5 colors
    // Prevent duplicate color
    if (value.some(c => c.hex === selectedColor)) return;
    onChange([...value, { name: selectedColorObj?.name, hex: selectedColor, images }]);
    setImages([]);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm mb-1 font-medium">Available Colors (max 5)</label>
      <div className="flex gap-3 mb-2">
        {COLOR_PALETTE.map(c => (
          <button
            key={c.hex}
            type="button"
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === c.hex ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-gray-300'}`}
            style={{ background: c.hex }}
            title={c.name}
            onClick={() => { setSelectedColor(c.hex); }}
            disabled={!!value.find(v => v.hex === c.hex)}
          >
            {selectedColor === c.hex && <span className="w-3 h-3 bg-white rounded-full border border-emerald-500"></span>}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center mb-2">
        <span className="text-xs text-gray-600 w-16">{selectedColorObj?.name}</span>
        <Upload
          listType="picture-card"
          fileList={images.map((img, idx) => ({
            uid: String(idx),
            name: `image${idx+1}`,
            status: 'done',
            url: img,
            thumbUrl: img
          }))}
          onRemove={file => {
            setImages(imgs => imgs.filter((_, idx) => idx !== Number(file.uid)));
            return true;
          }}
          customRequest={async ({ file, onSuccess, onError }) => {
            try {
              if (images.length >= 5) return;
              setUploading(true);
              const formData = new FormData();
              formData.append('file', file);
              formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
              const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
              });
              const data = await res.json();
              setUploading(false);
              if (data.secure_url) {
                setImages(imgs => [...imgs, data.secure_url]);
                onSuccess && onSuccess(data, file);
              } else {
                onError && onError(new Error('Upload failed'));
                message.error('Image upload failed. Please check your Cloudinary config.');
              }
            } catch (err) {
              setUploading(false);
              onError && onError(err);
              message.error('Image upload failed. Please try again.');
            }
          }}
          multiple
          showUploadList={{
            showPreviewIcon: true,
            showRemoveIcon: true,
          }}
        >
          {images.length < 5 && (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
        <button type="button" className="bg-emerald-500 text-white px-3 py-2 rounded" onClick={handleAddColor} disabled={images.length === 0 || value.length >= 5}>
          Add
        </button>
      </div>
      {/* Preview uploaded images for the selected color before adding */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={img} alt={`preview-${idx}`} className="w-16 h-16 object-cover rounded border" />
              <button
                type="button"
                className="absolute top-0 right-0 bg-white bg-opacity-80 text-red-500 rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
                onClick={() => setImages(imgs => imgs.filter((_, i) => i !== idx))}
                title="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Preview for already-added colors and their images */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((c, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
            <span className="w-4 h-4 rounded-full border" style={{ background: c.hex }}></span>
            <span>{c.name}</span>
            <div className="flex gap-1">
              {c.images && c.images.map((img: string, idx: number) => (
                <img key={idx} src={img} alt={c.name} className="w-8 h-8 object-cover rounded border" />
              ))}
            </div>
            <button type="button" className="ml-1 text-red-500" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>&times;</button>
          </div>
        ))}
      </div>
      {value.length >= 5 && <div className="text-xs text-red-500">Maximum 5 colors allowed.</div>}
    </div>
  );
}

// Move these to the top of the file, outside the component:
const VEHICLE_TYPES = [
  "Motorcycle", "Car", "Three Wheeler", "Truck", "Bus", "Van", "SUV", "Other"
];
// 1. Update COLOR_PALETTE to Sri Lankan bike colors:
const COLOR_PALETTE = [
  { name: "Red", hex: "#E53935" },
  { name: "Black", hex: "#222" },
  { name: "White", hex: "#FFF" },
  { name: "Blue", hex: "#1E88E5" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Grey", hex: "#757575" },
  { name: "Green", hex: "#43A047" },
  { name: "Yellow", hex: "#FDD835" },
  { name: "Maroon", hex: "#800000" },
];

// Custom hook to detect if screen is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// CSV Export Function
function exportPreBookingsToCSV(bookings) {
  if (!bookings.length) return;
  const header = [
    'Booking ID', 'Customer', 'Email', 'Phone', 'National ID', 'Address', 'Vehicle Model', 'Status', 'Notes', 'Created At'
  ];
  const rows = bookings.map(b => [
    b.bookingId, b.fullName, b.email, b.phone, b.nationalId, b.address, b.vehicleModel, b.status, b.notes || '', new Date(b.createdAt).toLocaleString()
  ]);
  const csv = [header, ...rows].map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'prebookings.csv');
}

export default function AdminDashboard() {
  console.log("Cloudinary config:", CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET);
  // Redirect if not admin
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('isAdmin') !== 'true') {
      window.location.href = '/';
    }
  }, []);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleForm, setVehicleForm] = useState<any>({
    vehicleType: "Motorcycle",
    name: "",
    category: "",
    price: "",
    description: "",
    features: [],
    specs: [
      { key: "Engine", value: "" },
      { key: "Mileage", value: "" },
      { key: "Fuel Capacity", value: "" },
      { key: "Transmission", value: "" },
      { key: "Power", value: "" },
      { key: "Weight", value: "" },
    ],
    colors: [],
    variants: [],
    faqs: [],
    images: [],
    rating: ""
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  // For old dashboard employees
  const [employees, setEmployees] = useState<any[]>([]);
  const [newEmp, setNewEmp] = useState({ name: "", role: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editVehicleData, setEditVehicleData] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")

  // Add state for pre-bookings
  const [preBookings, setPreBookings] = useState<any[]>([]);
  const [preBookingLoading, setPreBookingLoading] = useState(false);
  const [preBookingError, setPreBookingError] = useState("");
  const [selectedPreBooking, setSelectedPreBooking] = useState<any>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  // Add state to track selected AKR tab
  const [akrTab, setAkrTab] = useState<'vehicles' | 'prebookings'>('vehicles');
  // Add state for search and filter
  const [preBookingSearch, setPreBookingSearch] = useState('');
  const [preBookingStatus, setPreBookingStatus] = useState('All');

  useEffect(() => {
    fetch("http://localhost:5050/api/companies")
      .then(res => res.json())
      .then(data => {
        setCompanies(data);
        const akr = data.find((c: any) => c.name === AKR_COMPANY_NAME);
        setSelectedCompany(akr || (data[0] || null));
        if (akr) fetchVehicles(akr._id);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load companies");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedCompany && selectedCompany.name !== AKR_COMPANY_NAME) {
      // Set employees for old dashboard
      setEmployees(oldCompanyInfo[selectedCompany.name]?.employees || []);
    }
  }, [selectedCompany]);

  // Fetch pre-bookings on mount
  useEffect(() => {
    setPreBookingLoading(true);
    fetch("http://localhost:5050/api/prebookings")
      .then(res => res.json())
      .then(data => {
        setPreBookings(data);
        setPreBookingLoading(false);
      })
      .catch(() => {
        setPreBookingError("Failed to load pre-bookings");
        setPreBookingLoading(false);
      });
  }, []);

  const fetchVehicles = (companyId: string) => {
    fetch(`http://localhost:5050/api/vehicles/company/${companyId}`)
      .then(res => res.json())
      .then(setVehicles)
      .catch(() => setVehicles([]));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const uploadImagesToCloudinary = async () => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) urls.push(data.secure_url);
    }
    setUploading(false);
    return urls;
  };

  const handleVehicleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVehicleForm(f => ({ ...f, [name]: value }));
  };

  const handleFeatureChange = (features: string[]) => setVehicleForm(f => ({ ...f, features }));
  const handleVariantChange = (variants: any[]) => setVehicleForm(f => ({ ...f, variants }));
  const handleSpecsChange = (specs: any[]) => setVehicleForm(f => ({ ...f, specs }));
  const handleFaqsChange = (faqs: any[]) => setVehicleForm(f => ({ ...f, faqs }));
  const handleColorsChange = (colors: any[]) => setVehicleForm(f => ({ ...f, colors }));

  const handleAddVehicle = async (values: any) => {
    setAddError("");
    setAddLoading(true);
    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImagesToCloudinary();
      }
      // Convert specs array to object
      const specsObj: Record<string, string> = {};
      if (Array.isArray(values.specs)) {
        values.specs.forEach((s: any) => {
          if (s.key && s.value) specsObj[s.key] = s.value;
        });
      }
      const res = await fetch(`http://localhost:5050/api/vehicles/company/${selectedCompany._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          specs: specsObj,
          images: imageUrls
        })
      });
      if (!res.ok) throw new Error("Failed to add vehicle");
      setVehicleForm({ name: "", category: "", price: "", performance: "", features: [], variants: [], description: "", specs: [], colors: [], faqs: [], images: [], rating: "" });
      setImageFiles([]);
      setImagePreviews([]);
      fetchVehicles(selectedCompany._id);
      setShowAddForm(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setAddError("Failed to add vehicle. Check your input format.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVehicleForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Add this handler for vehicleType Select:
  const handleVehicleTypeChange = (value: string) => {
    setVehicleForm(f => ({ ...f, vehicleType: value }));
  };

  // Old dashboard employee add/delete
  const handleAddEmp = () => {
    if (newEmp.name && newEmp.role) {
      setEmployees([...employees, { id: Date.now(), ...newEmp }]);
      setNewEmp({ name: "", role: "" });
    }
  };
  const handleDeleteEmp = (id: number) => setEmployees(employees.filter(e => e.id !== id));

  // Show vehicle details in a Drawer with color selection
  const showVehicleDetails = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setSelectedColorIdx(vehicle.colors && vehicle.colors.length > 0 ? 0 : null);
    setDetailDrawerOpen(true);
  };
  const closeVehicleDetails = () => {
    setDetailDrawerOpen(false);
    setSelectedVehicle(null);
    setSelectedColorIdx(null);
  };

  // Add placeholder functions for actions if not implemented:
  const editVehicle = (record: any) => message.info(`Edit vehicle ${record.name}`);
  // Update deleteVehicle to handle actual deletion and confirmation
  const deleteVehicle = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the vehicle.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5050/api/vehicles/${id}`, { method: 'DELETE' });
        if (res.ok) {
          Swal.fire('Deleted!', 'Vehicle has been deleted.', 'success');
          setDetailDrawerOpen(false);
          fetchVehicles(selectedCompany._id);
        } else {
          Swal.fire('Error', 'Failed to delete vehicle.', 'error');
        }
      } catch {
        Swal.fire('Error', 'Failed to delete vehicle.', 'error');
      }
    }
  };

  // Edit vehicle handler
  const openEditModal = (vehicle: any) => {
    setEditVehicleData({ ...vehicle, specs: Object.entries(vehicle.specs || {}).map(([key, value]) => ({ key, value })) })
    setEditModalOpen(true)
    setEditError("")
  }
  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditVehicleData(null)
    setEditError("")
  }
  const handleEditVehicleChange = (e: any) => {
    const { name, value } = e.target
    setEditVehicleData((f: any) => ({ ...f, [name]: value }))
  }
  const handleEditFeatureChange = (features: string[]) => setEditVehicleData((f: any) => ({ ...f, features }))
  const handleEditVariantChange = (variants: any[]) => setEditVehicleData((f: any) => ({ ...f, variants }))
  const handleEditSpecsChange = (specs: any[]) => setEditVehicleData((f: any) => ({ ...f, specs }))
  const handleEditFaqsChange = (faqs: any[]) => setEditVehicleData((f: any) => ({ ...f, faqs }))
  const handleEditColorsChange = (colors: any[]) => setEditVehicleData((f: any) => ({ ...f, colors }))

  const handleEditVehicleSubmit = async () => {
    setEditLoading(true)
    setEditError("")
    try {
      // Convert specs array to object
      const specsObj: Record<string, string> = {}
      if (Array.isArray(editVehicleData.specs)) {
        editVehicleData.specs.forEach((s: any) => {
          if (s.key && s.value) specsObj[s.key] = s.value
        })
      }
      const res = await fetch(`http://localhost:5050/api/vehicles/${editVehicleData._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editVehicleData, specs: specsObj })
      })
      if (!res.ok) throw new Error("Failed to update vehicle")
      setEditModalOpen(false)
      setEditVehicleData(null)
      fetchVehicles(selectedCompany._id)
      message.success("Vehicle updated successfully")
    } catch (err) {
      setEditError("Failed to update vehicle. Check your input format.")
    } finally {
      setEditLoading(false)
    }
  }

  // Responsive sidebar for mobile and desktop
  const renderSidebar = (isMobile = false) => (
    <div className="h-full flex flex-col justify-between">
        <div>
        <div className="p-4 flex items-center gap-3 border-b border-white/10 justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/image copy 2.png" alt="AKR Admin Logo" className="h-12 w-12 object-contain mb-2" />
            <BellOutlined className="ml-auto w-6 h-6 text-emerald-500 animate-bounce-slow cursor-pointer" />
          </div>
          <Button
            icon={<CloseOutlined />}
            shape="circle"
            size="small"
            onClick={() => {
              if (isMobile) setSidebarOpen(false);
              else setSidebarCollapsed(true);
            }}
            className="ml-2"
          />
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ borderRight: 0 }}
            items={[
              {
                key: '1',
                label: 'Companies',
                icon: <HomeOutlined />,
                children: companies.map(company =>
                  company.name === AKR_COMPANY_NAME ? {
                    key: company._id,
                    label: company.name,
                    children: [
                      {
                        key: `${company._id}-vehicles`,
                        label: 'Vehicles',
                        onClick: () => {
                          setSelectedCompany(company);
                          setAkrTab('vehicles');
                          fetchVehicles(company._id);
                        }
                      },
                      {
                        key: `${company._id}-prebookings`,
                        label: 'Pre-Bookings',
                        onClick: () => {
                          setSelectedCompany(company);
                          setAkrTab('prebookings');
                        }
                      }
                    ]
                  } : {
                    key: company._id,
                    label: company.name,
                    onClick: () => {
                      setSelectedCompany(company);
                      setAkrTab('vehicles');
                      if (company.name === AKR_COMPANY_NAME) fetchVehicles(company._id);
                      setVehicleForm({
                        vehicleType: "Motorcycle",
                        name: "",
                        category: "",
                        price: "",
                        description: "",
                        features: [],
                        specs: [
                          { key: "Engine", value: "" },
                          { key: "Mileage", value: "" },
                          { key: "Fuel Capacity", value: "" },
                          { key: "Transmission", value: "" },
                          { key: "Power", value: "" },
                          { key: "Weight", value: "" },
                        ],
                        colors: [],
                        variants: [],
                        faqs: [],
                      });
                      setImageFiles([]);
                      setImagePreviews([]);
                      setSidebarOpen(false);
                    }
                  }
                )
              },
            { key: '2', label: 'Employees', icon: <UserOutlined /> },
            { key: '3', label: 'Activity', icon: <Activity /> },
            { key: '4', label: 'Reports', icon: <LineOutlined /> },
            { key: '5', label: 'Settings', icon: <WechatOutlined /> },
            ]}
          />
        </div>
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <UserOutlined className="w-8 h-8 text-emerald-600 bg-emerald-100 rounded-full p-1" />
            <div>
              <div className="font-semibold text-emerald-900">admin@akr.com</div>
              <Button type="text" onClick={() => setLogoutOpen(true)}>Logout</Button>
            </div>
          </div>
        </div>
    </div>
  );

  const isMobile = useIsMobile();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!selectedCompany) return <div className="p-8 text-center text-gray-500">No companies found.</div>;

  // 2. Before rendering the Table, define:
  const columns = [
    { title: 'Type', dataIndex: 'vehicleType', key: 'vehicleType', responsive: ['md'] },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'category', responsive: ['md'] },
    { title: 'Price', dataIndex: 'price', key: 'price', responsive: ['md'] },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Features', dataIndex: 'features', key: 'features', render: (features) => features?.length ? features.join(', ') : '-', responsive: ['lg'] },
    {
      title: 'Specs',
      dataIndex: 'specs',
      key: 'specs',
      render: (specs) =>
        specs && typeof specs === 'object' && Object.keys(specs).length
          ? Object.entries(specs).map(([key, value]) => `${key}: ${value}`).join(', ')
          : '-',
      responsive: ['lg'],
    },
    { title: 'Colors', dataIndex: 'colors', key: 'colors', render: (colors) => (
      <span style={{ display: 'flex', gap: 4 }}>
        {colors?.map((c, i) => (
          <span key={i} title={c.name} style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '50%', background: c.hex, border: '1px solid #ccc' }} />
        ))}
      </span>
    ) },
    { title: 'Variants', dataIndex: 'variants', key: 'variants', render: (variants) => variants?.length ? variants.map(v => v.name).join(', ') : '-', responsive: ['lg'] },
    { title: 'FAQs', dataIndex: 'faqs', key: 'faqs', render: (faqs) => faqs?.length ? faqs.length : '-', responsive: ['lg'] },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => showVehicleDetails(record)}>View</Button>
          <Button type="link" onClick={() => openEditModal(record)}>Edit</Button>
          <Button type="link" danger onClick={() => deleteVehicle(record._id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  // Add pre-booking columns for Table
  const preBookingColumns = [
    { title: 'Booking ID', dataIndex: 'bookingId', key: 'bookingId' },
    { title: 'Customer', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Vehicle Model', dataIndex: 'vehicleModel', key: 'vehicleModel' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <AntdSelect
          value={status}
          style={{ width: 130 }}
          onChange={async (val) => {
            setStatusUpdating(true);
            try {
              const res = await fetch(`http://localhost:5050/api/prebookings/${record._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: val })
              });
              if (res.ok) {
                setPreBookings(preBookings => preBookings.map(b => b._id === record._id ? { ...b, status: val } : b));
                message.success('Status updated');
              } else {
                message.error('Failed to update status');
              }
            } catch {
              message.error('Failed to update status');
            }
            setStatusUpdating(false);
          }}
          loading={statusUpdating}
          options={['Pending', 'Ordered', 'Delivered', 'Cancelled'].map(s => ({ value: s, label: s }))}
        />
      )
    },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleString() },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => setSelectedPreBooking(record)}>View Details</Button>
      )
    }
  ];

  // Filtered bookings
  const filteredPreBookings = preBookings.filter(b =>
    (preBookingStatus === 'All' || b.status === preBookingStatus) &&
    (b.fullName.toLowerCase().includes(preBookingSearch.toLowerCase()) || b.vehicleModel.toLowerCase().includes(preBookingSearch.toLowerCase()))
  );

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-100 flex">
      {/* Sidebar: Drawer for mobile, Sider for desktop */}
      {/* Show menu icon if sidebar is collapsed on desktop or always on mobile */}
      {((sidebarCollapsed && window.innerWidth >= 768) || window.innerWidth < 768) && (
        <div className="fixed top-4 left-4 z-50">
          <Button icon={<MenuOutlined />} shape="circle" size="large" onClick={() => {
            if (window.innerWidth < 768) setSidebarOpen(true);
            else setSidebarCollapsed(false);
          }} />
        </div>
      )}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setSidebarOpen(false)}
        open={sidebarOpen}
        width={260}
        styles={{ body: { padding: 0 } }}
        className="md:hidden"
      >
        {renderSidebar(true)}
      </Drawer>
      <Layout.Sider
        className="w-72 glass-card shadow-2xl border-r border-white/20 flex-col justify-between min-h-screen hidden md:flex"
        width={288}
        breakpoint="md"
        collapsedWidth={0}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      >
        {renderSidebar(false)}
      </Layout.Sider>
      {/* Main Content */}
      <Layout className="flex-1 flex flex-col min-h-screen">
        <Layout.Header className="glass-card sticky top-0 z-30 flex items-center justify-between px-8 py-5 border-b border-white/10 shadow-md">
          <span className="text-2xl font-bold gradient-text">Admin Dashboard</span>
        </Layout.Header>
        <Layout.Content className="flex-1 p-4 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* AKR & SONS (PVT) LTD: New Concept */}
          {selectedCompany.name === AKR_COMPANY_NAME && akrTab === 'vehicles' && (
            <>
              <div className="glass-card rounded-2xl shadow-lg p-3 md:p-6 flex flex-col gap-4 xl:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold gradient-text">{selectedCompany.name} Vehicles</span>
                </div>
                {vehicles.length === 0 ? (
                  <div className="text-gray-500">No vehicles found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle: any) => (
                      <div key={vehicle._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col overflow-hidden group">
                        {/* Main image */}
                        <div className="relative w-full h-40 md:h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {vehicle.colors && vehicle.colors.length > 0 && vehicle.colors[0].images && vehicle.colors[0].images.length > 0 ? (
                            <img src={vehicle.colors[0].images[0]} alt="vehicle" className="object-cover w-full h-full" />
                          ) : vehicle.images && vehicle.images.length > 0 ? (
                            <img src={vehicle.images[0]} alt="vehicle" className="object-cover w-full h-full" />
                          ) : (
                            <div className="text-gray-300">No Image</div>
                )}
              </div>
                        <div className="p-4 flex-1 flex flex-col gap-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-lg truncate" title={vehicle.name}>{vehicle.name}</div>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold ml-2">{vehicle.vehicleType}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-1">
                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded">{vehicle.category}</span>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">LKR {vehicle.price}</span>
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2 mb-1">{vehicle.description}</div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">Colors:</span>
                            {vehicle.colors && vehicle.colors.length > 0 ? (
                              <span style={{ display: 'flex', gap: 6 }}>
                                {vehicle.colors.map((c: any, i: number) => (
                                  <span key={i} title={c.name} style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '50%', background: c.hex, border: '1px solid #ccc' }} />
                                ))}
                              </span>
                            ) : <span className="text-xs text-gray-400">-</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-1">
                            <span className="text-xs text-gray-500">Specs:</span>
                            <span className="text-xs text-gray-700">{vehicle.specs && typeof vehicle.specs === 'object' ? Object.entries(vehicle.specs).map(([k, v]) => `${k}: ${v}`).join(', ') : '-'}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-1">
                            <span className="text-xs text-gray-500">Features:</span>
                            <span className="text-xs text-gray-700">{vehicle.features?.join(', ') || '-'}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-1">
                            <span className="text-xs text-gray-500">Variants:</span>
                            <span className="text-xs text-gray-700">{vehicle.variants?.map((v: any) => v.name).join(', ') || '-'}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-1">
                            <span className="text-xs text-gray-500">FAQs:</span>
                            <span className="text-xs text-gray-700">{vehicle.faqs?.length ? vehicle.faqs.map((f: any, i: number) => (<span key={i}><b>Q:</b> {f.question} <b>A:</b> {f.answer}; </span>)) : '-'}</span>
                          </div>
                          <div className="flex-1" />
                          <Button type="primary" block className="mt-2 font-semibold" onClick={() => showVehicleDetails(vehicle)}>
                            View Details
                          </Button>
                          <div className="text-xs text-gray-400 mt-2">Created: {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleString() : '-'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Only show the Add New Vehicle card if the form is open or a success message is shown */}
              {isMobile ? (
                <>
                  {/* FAB for mobile */}
                  {!showAddForm && !showSuccess && (
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<PlusOutlined />}
                      size="large"
                      className="fixed bottom-8 right-8 z-50 shadow-lg animate-bounce"
                      style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => setShowAddForm(true)}
                    />
                  )}
                  {/* Modal for mobile */}
                  <Modal
                    open={showAddForm || showSuccess}
                    onCancel={() => setShowAddForm(false)}
                    footer={null}
                    centered
                    width={360}
                    closeIcon={<CloseOutlined />}
                    bodyStyle={{ padding: 24 }}
                  >
                <div className="font-bold text-lg gradient-text mb-2">Add New Vehicle</div>
                    {showSuccess && (
                      <div className="text-green-600 text-center font-semibold py-2">Uploaded successfully</div>
                    )}
                    {!showSuccess && (
                      <Form onFinish={handleAddVehicle} layout="vertical" className="space-y-4 mt-4">
                  <Form.Item label="Vehicle Type" name="vehicleType" rules={[{ required: true, message: 'Please select a vehicle type!' }]}>
                    <Select
                      placeholder="Select a vehicle type"
                      onChange={handleVehicleTypeChange}
                      options={VEHICLE_TYPES.map(type => ({ value: type, label: type }))}
                    />
                  </Form.Item>
                  <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter vehicle name!' }]}>
                    <Input placeholder="Bike Name" onChange={handleVehicleFormChange} />
                  </Form.Item>
                  <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please enter vehicle category!' }]}>
                    <Input placeholder="Category (e.g. Pulsar, CT 100)" onChange={handleVehicleFormChange} />
                  </Form.Item>
                  <Form.Item label="Price" name="price" rules={[{ required: true, message: 'Please enter vehicle price!' }]}>
                    <Input placeholder="Price (LKR)" onChange={handleVehicleFormChange} />
                  </Form.Item>
                  <Form.Item label="Description" name="description">
                    <Input.TextArea placeholder="Description" onChange={handleVehicleFormChange} />
                  </Form.Item>
                  <Form.Item label="Features" name="features">
                    <FeatureInput value={vehicleForm.features} onChange={handleFeatureChange} />
                  </Form.Item>
                  <Form.Item label="Specs" name="specs">
                    <SpecsInput value={vehicleForm.specs} onChange={handleSpecsChange} />
                  </Form.Item>
                  <Form.Item label="Colors" name="colors">
                    <ColorInput value={vehicleForm.colors} onChange={handleColorsChange} />
                  </Form.Item>
                  <Form.Item label="Variants" name="variants">
                    <VariantInput value={vehicleForm.variants} onChange={handleVariantChange} />
                  </Form.Item>
                  <Form.Item label="FAQs" name="faqs">
                    <FaqsInput value={vehicleForm.faqs} onChange={handleFaqsChange} />
                  </Form.Item>
                  {/* 2. Remove the 'Rating' and last 'Images' upload fields from the Add Vehicle form. */}
                  {addError && <div className="text-xs text-red-500">{addError}</div>}
                  <Form.Item>
                          <Button type="primary" htmlType="submit" loading={addLoading || uploading} block size="large">
                      {addLoading ? "Adding..." : "Add Vehicle"}
                    </Button>
                  </Form.Item>
                </Form>
                    )}
                  </Modal>
                </>
              ) : (
                // Desktop: always show the form
                <div className="glass-card rounded-2xl shadow-lg p-3 md:p-6 flex flex-col gap-4 relative">
                  <div className="font-bold text-lg gradient-text mb-2">Add New Vehicle</div>
                  {showSuccess && (
                    <div className="text-green-600 text-center font-semibold py-2">Uploaded successfully</div>
                  )}
                  {!showSuccess && (
                    <Form onFinish={handleAddVehicle} layout="vertical" className="space-y-4 mt-4">
                      <Form.Item label="Vehicle Type" name="vehicleType" rules={[{ required: true, message: 'Please select a vehicle type!' }]}>
                        <Select
                          placeholder="Select a vehicle type"
                          onChange={handleVehicleTypeChange}
                          options={VEHICLE_TYPES.map(type => ({ value: type, label: type }))}
                        />
                      </Form.Item>
                      <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter vehicle name!' }]}>
                        <Input placeholder="Bike Name" onChange={handleVehicleFormChange} />
                      </Form.Item>
                      <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please enter vehicle category!' }]}>
                        <Input placeholder="Category (e.g. Pulsar, CT 100)" onChange={handleVehicleFormChange} />
                      </Form.Item>
                      <Form.Item label="Price" name="price" rules={[{ required: true, message: 'Please enter vehicle price!' }]}>
                        <Input placeholder="Price (LKR)" onChange={handleVehicleFormChange} />
                      </Form.Item>
                      <Form.Item label="Description" name="description">
                        <Input.TextArea placeholder="Description" onChange={handleVehicleFormChange} />
                      </Form.Item>
                      <Form.Item label="Features" name="features">
                        <FeatureInput value={vehicleForm.features} onChange={handleFeatureChange} />
                      </Form.Item>
                      <Form.Item label="Specs" name="specs">
                        <SpecsInput value={vehicleForm.specs} onChange={handleSpecsChange} />
                      </Form.Item>
                      <Form.Item label="Colors" name="colors">
                        <ColorInput value={vehicleForm.colors} onChange={handleColorsChange} />
                      </Form.Item>
                      <Form.Item label="Variants" name="variants">
                        <VariantInput value={vehicleForm.variants} onChange={handleVariantChange} />
                      </Form.Item>
                      <Form.Item label="FAQs" name="faqs">
                        <FaqsInput value={vehicleForm.faqs} onChange={handleFaqsChange} />
                      </Form.Item>
                      {/* 2. Remove the 'Rating' and last 'Images' upload fields from the Add Vehicle form. */}
                      {addError && <div className="text-xs text-red-500">{addError}</div>}
                      <Form.Item>
                        <Button type="primary" htmlType="submit" loading={addLoading || uploading} block size="large">
                          {addLoading ? "Adding..." : "Add Vehicle"}
                        </Button>
                      </Form.Item>
                    </Form>
                  )}
              </div>
              )}
            </>
          )}
          {selectedCompany.name === AKR_COMPANY_NAME && akrTab === 'prebookings' && (
            <div className="w-full mt-8 px-4 md:px-8 col-span-full xl:col-span-3">
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                  <div>
                    <span className="text-3xl font-bold gradient-text">Pre-Bookings</span>
                    <div className="text-gray-600 mt-1 text-base">Manage and review all customer pre-bookings. Use the search, filter, and export to quickly find and download bookings.</div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto mt-2 md:mt-0">
                    <input
                      type="text"
                      placeholder="Search by customer or model..."
                      value={preBookingSearch}
                      onChange={e => setPreBookingSearch(e.target.value)}
                      className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 shadow w-full sm:w-64"
                    />
                    <select
                      value={preBookingStatus}
                      onChange={e => setPreBookingStatus(e.target.value)}
                      className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 shadow w-full sm:w-40"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Ordered">Ordered</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => exportPreBookingsToCSV(filteredPreBookings)}
                      className="bg-blue-600 text-white font-semibold border-0 hover:bg-blue-700"
                      style={{ minWidth: 120 }}
                    >
                      Export CSV
                    </Button>
                  </div>
                </div>
              </div>
              <div className="w-full">
                {preBookingLoading ? (
                  <div className="text-center py-8"><Spin /></div>
                ) : preBookingError ? (
                  <div className="text-center text-red-500">{preBookingError}</div>
                ) : (
                  <Table
                    dataSource={filteredPreBookings}
                    columns={preBookingColumns}
                    rowKey="_id"
                    pagination={{ pageSize: 8 }}
                    className="rounded-xl overflow-hidden shadow-lg bg-white w-full"
                  />
                )}
              </div>
              {/* Pre-booking details modal */}
              <Modal
                open={!!selectedPreBooking}
                onCancel={() => setSelectedPreBooking(null)}
                footer={null}
                title={selectedPreBooking ? `Booking: ${selectedPreBooking.bookingId}` : ''}
                width={600}
                centered
                bodyStyle={{ padding: 32 }}
              >
                {selectedPreBooking && (
                  <Descriptions
                    bordered
                    column={1}
                    size="middle"
                    labelStyle={{ fontWeight: 600, width: 180 }}
                    contentStyle={{ background: '#fff' }}
                  >
                    <Descriptions.Item label="Customer Name">{selectedPreBooking.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{selectedPreBooking.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{selectedPreBooking.phone}</Descriptions.Item>
                    <Descriptions.Item label="National ID">{selectedPreBooking.nationalId}</Descriptions.Item>
                    <Descriptions.Item label="Address">{selectedPreBooking.address}</Descriptions.Item>
                    <Descriptions.Item label="Vehicle Model">{selectedPreBooking.vehicleModel}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={selectedPreBooking.status === 'Pending' ? 'orange' : selectedPreBooking.status === 'Ordered' ? 'blue' : selectedPreBooking.status === 'Delivered' ? 'green' : 'red'}>{selectedPreBooking.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Notes">{selectedPreBooking.notes || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Created At">{new Date(selectedPreBooking.createdAt).toLocaleString()}</Descriptions.Item>
                  </Descriptions>
                )}
              </Modal>
            </div>
          )}
        </Layout.Content>
      </Layout>
      {/* Logout Confirmation Dialog */}
      <Modal
        title="Confirm Logout"
        open={logoutOpen}
        onOk={() => {
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminName');
          localStorage.removeItem('adminEmail');
          window.location.href = '/';
        }}
        onCancel={() => setLogoutOpen(false)}
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
      {/* Vehicle Details Drawer */}
      <Drawer
        title={selectedVehicle?.name || 'Vehicle Details'}
        placement="right"
        width={window.innerWidth < 768 ? '100vw' : 600}
        onClose={closeVehicleDetails}
        open={detailDrawerOpen}
        closeIcon={<CloseOutlined />}
        bodyStyle={{ padding: 24 }}
      >
        {selectedVehicle && (
          <div className="space-y-4">
            {/* Color selector */}
            {selectedVehicle.colors && selectedVehicle.colors.length > 0 && (
              <div className="flex gap-2 mb-4 items-center">
                <span className="font-semibold">Select Color:</span>
                {selectedVehicle.colors.map((c: any, i: number) => (
                  <span
                    key={i}
                    title={c.name}
                    style={{
                      display: 'inline-block',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: c.hex,
                      border: selectedColorIdx === i ? '3px solid #1890ff' : '1px solid #ccc',
                      marginRight: 4,
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedColorIdx(i)}
                  />
                ))}
                {selectedColorIdx !== null && (
                  <Button size="small" onClick={() => setSelectedColorIdx(null)} className="ml-2">Show All</Button>
                )}
              </div>
            )}
            {/* Images by color or all */}
            <div className="flex gap-2 flex-wrap mb-2">
              {(selectedColorIdx !== null && selectedVehicle.colors[selectedColorIdx]?.images?.length > 0
                ? selectedVehicle.colors[selectedColorIdx].images
                : selectedVehicle.images
              )?.map((img: string, idx: number) => (
                <img key={idx} src={img} alt="vehicle" className="w-32 h-24 object-cover rounded border" />
              ))}
            </div>
            <div><b>Type:</b> {selectedVehicle.vehicleType}</div>
            <div><b>Category:</b> {selectedVehicle.category}</div>
            <div><b>Price:</b> {selectedVehicle.price}</div>
            <div><b>Description:</b> {selectedVehicle.description}</div>
            <div><b>Features:</b> {selectedVehicle.features?.join(', ')}</div>
            <div><b>Specs:</b> {selectedVehicle.specs && typeof selectedVehicle.specs === 'object' ? Object.entries(selectedVehicle.specs).map(([k, v]) => `${k}: ${v}`).join(', ') : '-'}</div>
            <div><b>Colors:</b> {selectedVehicle.colors && selectedVehicle.colors.length > 0 ? (
              <span style={{ display: 'flex', gap: 8 }}>
                {selectedVehicle.colors.map((c: any, i: number) => (
                  <span key={i} title={c.name} style={{ display: 'inline-block', width: 24, height: 24, borderRadius: '50%', background: c.hex, border: '1px solid #ccc', marginRight: 4 }} />
                ))}
              </span>
            ) : '-'}</div>
            <div><b>Variants:</b> {selectedVehicle.variants?.map((v: any) => v.name).join(', ')}</div>
            <div><b>FAQs:</b> {selectedVehicle.faqs?.length ? selectedVehicle.faqs.map((f: any, i: number) => (<div key={i}><b>Q:</b> {f.question} <b>A:</b> {f.answer}</div>)) : '-'}</div>
            <div><b>Created At:</b> {selectedVehicle.createdAt ? new Date(selectedVehicle.createdAt).toLocaleString() : '-'}</div>
            <div className="flex gap-2 mt-6 justify-end">
              <Button type="default" onClick={() => openEditModal(selectedVehicle)}>Edit</Button>
              <Button type="primary" danger onClick={() => deleteVehicle(selectedVehicle._id)}>Delete</Button>
            </div>
          </div>
        )}
      </Drawer>
      {/* Edit Vehicle Modal */}
      <Modal
        title={editVehicleData?.name ? `Edit Vehicle: ${editVehicleData.name}` : 'Edit Vehicle'}
        open={editModalOpen}
        onCancel={closeEditModal}
        footer={null}
        width={700}
        centered
      >
        {editVehicleData ? (
          <Form layout="vertical" onFinish={handleEditVehicleSubmit} initialValues={editVehicleData}>
            <Form.Item label="Vehicle Type" name="vehicleType" rules={[{ required: true, message: 'Please select a vehicle type!' }]}>
              <Select
                value={editVehicleData.vehicleType}
                onChange={val => setEditVehicleData((f: any) => ({ ...f, vehicleType: val }))}
                options={VEHICLE_TYPES.map(type => ({ value: type, label: type }))}
              />
            </Form.Item>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter vehicle name!' }]}>
              <Input name="name" value={editVehicleData.name} onChange={handleEditVehicleChange} />
            </Form.Item>
            <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please enter vehicle category!' }]}>
              <Input name="category" value={editVehicleData.category} onChange={handleEditVehicleChange} />
            </Form.Item>
            <Form.Item label="Price" name="price" rules={[{ required: true, message: 'Please enter vehicle price!' }]}>
              <Input name="price" value={editVehicleData.price} onChange={handleEditVehicleChange} />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea name="description" value={editVehicleData.description} onChange={handleEditVehicleChange} />
            </Form.Item>
            <Form.Item label="Features" name="features">
              <FeatureInput value={editVehicleData.features} onChange={handleEditFeatureChange} />
            </Form.Item>
            <Form.Item label="Specs" name="specs">
              <SpecsInput value={editVehicleData.specs} onChange={handleEditSpecsChange} />
            </Form.Item>
            <Form.Item label="Colors" name="colors">
              <ColorInput value={editVehicleData.colors} onChange={handleEditColorsChange} />
            </Form.Item>
            <Form.Item label="Variants" name="variants">
              <VariantInput value={editVehicleData.variants} onChange={handleEditVariantChange} />
            </Form.Item>
            <Form.Item label="FAQs" name="faqs">
              <FaqsInput value={editVehicleData.faqs} onChange={handleEditFaqsChange} />
            </Form.Item>
            {editError && <div className="text-xs text-red-500 mb-2">{editError}</div>}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={editLoading} block size="large">
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </Form.Item>
          </Form>
        ) : <Spin />}
      </Modal>
    </Layout>
  );
} 