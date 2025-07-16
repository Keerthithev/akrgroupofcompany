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

// 1. Add the grouped specs definition at the top of the file (outside the component):
const VEHICLE_SPEC_GROUPS = [
  {
    group: 'Engine',
    fields: [
      { key: 'Engine Type', label: 'Engine Type' },
      { key: 'Max Power', label: 'Max Power' },
      { key: 'Max Torque', label: 'Max Torque' },
      { key: 'Displacement', label: 'Displacement' },
      { key: 'Clutch', label: 'Clutch' },
    ]
  },
  {
    group: 'Performance',
    fields: [
      { key: 'Power', label: 'Power' },
      { key: 'Torque', label: 'Torque' },
      { key: 'Mileage', label: 'Mileage' },
    ]
  },
  {
    group: 'Brakes & Tyres',
    fields: [
      { key: 'Front Brakes', label: 'Front Brakes' },
      { key: 'Rear Brakes', label: 'Rear Brakes' },
      { key: 'Front Tyres', label: 'Front Tyres' },
      { key: 'Rear Tyres', label: 'Rear Tyres' },
      { key: 'Brakes Type', label: 'Brakes Type' },
    ]
  },
  {
    group: 'Electricals',
    fields: [
      { key: 'Head Lamp', label: 'Head Lamp' },
      { key: 'Tail Lamp', label: 'Tail Lamp' },
      { key: 'Instrument Cluster', label: 'Instrument Cluster' },
    ]
  },
  {
    group: 'Vehicle',
    fields: [
      { key: 'Fuel Tank', label: 'Fuel Tank' },
      { key: 'Ground Clearance', label: 'Ground Clearance' },
      { key: 'Kerb Weight', label: 'Kerb Weight' },
      { key: 'Suspension Front', label: 'Suspension Front' },
      { key: 'Suspension Rear', label: 'Suspension Rear' },
      { key: 'Wheel Base', label: 'Wheel Base' },
    ]
  }
];

// 2. Add the GroupedSpecsInput component:
function GroupedSpecsInput({ value = {}, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const [openGroups, setOpenGroups] = React.useState<string[]>(VEHICLE_SPEC_GROUPS.map(g => g.group));
  const handleInput = (key: string, val: string) => {
    onChange({ ...value, [key]: val });
  };
  return (
    <div className="space-y-4">
      {VEHICLE_SPEC_GROUPS.map(group => (
        <div key={group.group} className="border rounded-lg bg-gray-50">
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer select-none bg-gray-100 rounded-t-lg"
            onClick={() => setOpenGroups(open => open.includes(group.group) ? open.filter(g => g !== group.group) : [...open, group.group])}
          >
            <span className="font-semibold text-gray-800">{group.group}</span>
            <span>{openGroups.includes(group.group) ? '▲' : '▼'}</span>
          </div>
          {openGroups.includes(group.group) && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.fields.map(field => (
                <div key={field.key} className="flex flex-col">
                  <label className="text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                  <input
                    type="text"
                    className="border px-3 py-2 rounded"
                    value={value[field.key] || ''}
                    onChange={e => handleInput(field.key, e.target.value)}
                    placeholder={`Enter ${field.label}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
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
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
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
    specs: {},
    colors: [],
    variants: [],
    faqs: [],
    images: [],
    galleryImages: [],
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
  const [akrTab, setAkrTab] = useState<'vehicles' | 'prebookings' | ''>('vehicles');
  // Add state for search and filter
  const [preBookingSearch, setPreBookingSearch] = useState('');
  const [preBookingStatus, setPreBookingStatus] = useState('All');
  // Add state for selected AKR Multi Complex facility tab
  const [akrFacilityTab, setAkrFacilityTab] = useState<string | null>(null);

  // Add state for rooms
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomForm, setRoomForm] = useState<any>({
    type: '',
    name: '',
    price: '',
    description: '',
    features: [],
    specs: [],
    images: [],
    amenities: [],
    status: 'Available',
  });
  const [roomImageFiles, setRoomImageFiles] = useState<File[]>([]);
  const [roomImagePreviews, setRoomImagePreviews] = useState<string[]>([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  const [showRoomSuccess, setShowRoomSuccess] = useState(false);
  const [editRoomModalOpen, setEditRoomModalOpen] = useState(false);
  const [editRoomData, setEditRoomData] = useState<any>(null);
  const [editRoomLoading, setEditRoomLoading] = useState(false);
  const [editRoomError, setEditRoomError] = useState('');

  // Add state for gallery images
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]);

  // 1. Add a stepper state and logic for add/edit vehicle forms
  const [addStep, setAddStep] = useState(0);
  const [editStep, setEditStep] = useState(0);
  // Use short names for the stepper
  const ADD_STEPS = [
    'Basic',
    'Specs',
    'Colors',
    'Variants',
    'Gallery',
  ];
  const EDIT_STEPS = [
    'Basic',
    'Specs',
    'Colors',
    'Variants',
    'Gallery',
  ];

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryImageFiles(files);
      setGalleryImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const uploadGalleryImagesToCloudinary = async () => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of galleryImageFiles) {
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

  // Fetch rooms
  useEffect(() => {
    if (akrFacilityTab === 'hotel-rooms') {
      setRoomLoading(true);
      fetch('http://localhost:5050/api/rooms')
        .then(res => res.json())
        .then(data => { setRooms(data); setRoomLoading(false); })
        .catch(() => { setRoomError('Failed to load rooms'); setRoomLoading(false); });
    }
  }, [akrFacilityTab, showAddRoomForm, showRoomSuccess, editRoomModalOpen]);

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

  const handleAddVehicle = async () => {
    setAddError("");
    setAddLoading(true);
    // Pre-submit validation
    if (!vehicleForm.colors || !Array.isArray(vehicleForm.colors) || vehicleForm.colors.length === 0) {
      setAddError("Please add at least one color with at least one image.");
      setAddLoading(false);
      return;
    }
    for (const color of vehicleForm.colors) {
      if (!color.name || !color.hex || !Array.isArray(color.images) || color.images.length === 0) {
        setAddError("Each color must have a name, hex, and at least one image.");
        setAddLoading(false);
        return;
      }
    }
    if (!vehicleForm.price || isNaN(Number(vehicleForm.price)) || Number(vehicleForm.price) <= 0) {
      setAddError("Please enter a valid price (must be a positive number).");
      setAddLoading(false);
      return;
    }
    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImagesToCloudinary();
      }
      let galleryImageUrls: string[] = [];
      if (galleryImageFiles.length > 0) {
        galleryImageUrls = await uploadGalleryImagesToCloudinary();
        setVehicleForm(f => ({ ...f, galleryImages: galleryImageUrls }));
      }
      const payload = {
        ...vehicleForm,
        price: Number(vehicleForm.price),
        specs: vehicleForm.specs,
        images: imageUrls,
        galleryImages: galleryImageUrls.length > 0 ? galleryImageUrls : vehicleForm.galleryImages || [],
        colors: vehicleForm.colors,
        company: selectedCompany._id, // Add company field for backend validation
      };
      console.log("Add Vehicle Payload:", payload);
      const res = await fetch(`http://localhost:5050/api/vehicles/company/${selectedCompany._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to add vehicle");
      setVehicleForm({ name: "", category: "", price: "", performance: "", features: [], variants: [], description: "", specs: {}, colors: [], faqs: [], images: [], galleryImages: [], rating: "" });
      setImageFiles([]);
      setImagePreviews([]);
      setGalleryImageFiles([]);
      setGalleryImagePreviews([]);
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
    setEditVehicleData({ ...vehicle, specs: vehicle.specs || {} })
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
    // Price validation
    if (!editVehicleData.price || isNaN(Number(editVehicleData.price)) || Number(editVehicleData.price) <= 0) {
      setEditError("Please enter a valid price (must be a positive number).")
      setEditLoading(false)
      return
    }
    try {
      let galleryImageUrls: string[] = [];
      if (galleryImageFiles.length > 0) {
        galleryImageUrls = await uploadGalleryImagesToCloudinary();
      }
      // Merge existing gallery images with new uploads
      const allGalleryImages = [
        ...(editVehicleData.galleryImages || []),
        ...galleryImageUrls
      ];
      setEditVehicleData(f => ({ ...f, galleryImages: allGalleryImages }));
      const res = await fetch(`http://localhost:5050/api/vehicles/${editVehicleData._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editVehicleData, price: Number(editVehicleData.price), specs: editVehicleData.specs, galleryImages: allGalleryImages })
      })
      if (!res.ok) throw new Error("Failed to update vehicle")
      setEditModalOpen(false)
      setEditVehicleData(null)
      setGalleryImageFiles([])
      setGalleryImagePreviews([])
      fetchVehicles(selectedCompany._id)
      message.success("Vehicle updated successfully")
    } catch (err) {
      setEditError("Failed to update vehicle. Check your input format.")
    } finally {
      setEditLoading(false)
    }
  }

  // Room form handlers (similar to vehicle form handlers)
  const handleRoomFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRoomForm(f => ({ ...f, [name]: value }));
  };
  const handleRoomFeatureChange = (features: string[]) => setRoomForm(f => ({ ...f, features }));
  const handleRoomSpecsChange = (specs: any[]) => setRoomForm(f => ({ ...f, specs }));
  const handleRoomAmenitiesChange = (amenities: string[]) => setRoomForm(f => ({ ...f, amenities }));
  const handleRoomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setRoomImageFiles(files);
      setRoomImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };
  const uploadRoomImagesToCloudinary = async () => {
    setRoomLoading(true);
    const urls: string[] = [];
    for (const file of roomImageFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) urls.push(data.secure_url);
    }
    setRoomLoading(false);
    return urls;
  };
  const handleAddRoom = async (values: any) => {
    setRoomLoading(true);
    setRoomError('');
    try {
      const imageUrls = await uploadRoomImagesToCloudinary();
      const specsObj = {};
      roomForm.specs.forEach(s => {
        if (s.key && s.value) specsObj[s.key] = s.value;
      });
      const payload = { ...roomForm, specs: specsObj, images: imageUrls };
      const res = await fetch('http://localhost:5050/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to add room');
      setShowRoomSuccess(true);
      setShowAddRoomForm(false);
      setRoomForm({ type: '', name: '', price: '', description: '', features: [], specs: [], images: [], amenities: [], status: 'Available' });
      setRoomImageFiles([]);
      setRoomImagePreviews([]);
      setTimeout(() => setShowRoomSuccess(false), 2000);
    } catch (err) {
      setRoomError('Failed to add room');
    } finally {
      setRoomLoading(false);
    }
  };
  const openEditRoomModal = (room: any) => {
    setEditRoomData({ ...room, specs: Object.entries(room.specs || {}).map(([key, value]) => ({ key, value })) });
    setEditRoomModalOpen(true);
    setEditRoomError('');
  };
  const closeEditRoomModal = () => {
    setEditRoomModalOpen(false);
    setEditRoomData(null);
    setEditRoomError('');
  };
  const handleEditRoomChange = (e: any) => {
    const { name, value } = e.target;
    setEditRoomData((f: any) => ({ ...f, [name]: value }));
  };
  const handleEditRoomFeatureChange = (features: string[]) => setEditRoomData((f: any) => ({ ...f, features }));
  const handleEditRoomSpecsChange = (specs: any[]) => setEditRoomData((f: any) => ({ ...f, specs }));
  const handleEditRoomAmenitiesChange = (amenities: string[]) => setEditRoomData((f: any) => ({ ...f, amenities }));
  const handleEditRoomSubmit = async () => {
    setEditRoomLoading(true);
    setEditRoomError('');
    try {
      const res = await fetch(`http://localhost:5050/api/rooms/${editRoomData._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editRoomData, specs: Object.fromEntries(editRoomData.specs.map((s: any) => [s.key, s.value])) })
      });
      if (!res.ok) throw new Error('Failed to update room');
      setEditRoomModalOpen(false);
      setEditRoomData(null);
    } catch (err) {
      setEditRoomError('Failed to update room');
    } finally {
      setEditRoomLoading(false);
    }
  };
  const deleteRoom = async (id: string) => {
    setRoomLoading(true);
    try {
      const res = await fetch(`http://localhost:5050/api/rooms/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete room');
    } catch {
      setRoomError('Failed to delete room');
    } finally {
      setRoomLoading(false);
    }
  };

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
                  company.name === 'AKR Multi Complex' ? {
                  key: company._id,
                  label: company.name,
                    children: [
                      {
                        key: `${company._id}-shopping-center`,
                        label: 'Shopping Center',
                        onClick: () => {
                          setSelectedCompany(company);
                          setAkrFacilityTab('shopping-center');
                          setAkrTab(''); // Ensure only facility content shows
                        }
                      },
                      {
                        key: `${company._id}-party-hall`,
                        label: 'Party Hall & Restaurant',
                        onClick: () => {
                          setSelectedCompany(company);
                          setAkrFacilityTab('party-hall');
                          setAkrTab('');
                        }
                      },
                      {
                        key: `${company._id}-hotel-rooms`,
                        label: 'Hotel & Rooms',
                        onClick: () => {
                          setSelectedCompany(company);
                          setAkrFacilityTab('hotel-rooms');
                          setAkrTab('');
                        }
                      },
                      {
                        key: `${company._id}-gym-theatre`,
                        label: 'Gym & Theatre',
                        onClick: () => {
                          setSelectedCompany(company);
                          setAkrFacilityTab('gym-theatre');
                          setAkrTab('');
                        }
                      },
                      {
                        key: `${company._id}-service-center`,
                        label: 'AKR Service Center',
                        onClick: () => {
                          setSelectedCompany(company);
                          setAkrFacilityTab('service-center');
                          setAkrTab('');
                        }
                      },
                    ]
                  } :
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
                          setAkrFacilityTab(null); // Ensure only vehicles content shows
                          fetchVehicles(company._id);
                        }
                      },
                      {
                        key: `${company._id}-prebookings`,
                        label: 'Pre-Bookings',
                        onClick: () => {
                          setSelectedCompany(company);
                          setAkrTab('prebookings');
                          setAkrFacilityTab(null);
                        }
                      }
                    ]
                  } : {
                    key: company._id,
                    label: company.name,
                    onClick: () => {
                      setSelectedCompany(company);
                      setAkrTab('vehicles');
                      setAkrFacilityTab(null);
                      if (company.name === AKR_COMPANY_NAME) fetchVehicles(company._id);
                      setVehicleForm({
                        vehicleType: "Motorcycle",
                        name: "",
                        category: "",
                        price: "",
                        description: "",
                        features: [],
                        specs: {},
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
                          {/* Key Specs: Engine, Mileage, Transmission only */}
                          <div className="flex flex-col gap-1 mb-1">
                            {vehicle.specs && typeof vehicle.specs === 'object' && (
                              <>
                                {vehicle.specs.Engine && <div className="text-xs text-gray-500"><span className="font-semibold">Engine:</span> <span className="text-gray-700">{vehicle.specs.Engine}</span></div>}
                                {vehicle.specs.Mileage && <div className="text-xs text-gray-500"><span className="font-semibold">Mileage:</span> <span className="text-gray-700">{vehicle.specs.Mileage}</span></div>}
                                {vehicle.specs.Transmission && <div className="text-xs text-gray-500"><span className="font-semibold">Transmission:</span> <span className="text-gray-700">{vehicle.specs.Transmission}</span></div>}
                              </>
                            )}
                          </div>
                          {/* Colors */}
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
                          <div className="flex-1" />
                          <Button type="primary" block className="mt-2 font-semibold" onClick={() => showVehicleDetails(vehicle)}>
                            View Details
                          </Button>
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
                      <form
                        className="space-y-4 mt-4"
                        onSubmit={async e => {
                          e.preventDefault();
                          await handleAddVehicle();
                        }}
                        autoComplete="off"
                      >
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            {ADD_STEPS.map((label, idx) => (
                              <div key={label} className={`flex-1 flex flex-col items-center ${addStep === idx ? 'font-bold text-emerald-700' : 'text-gray-400'}`}> 
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${addStep === idx ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>{idx + 1}</div>
                                <span className="text-xs">{label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="h-1 w-full bg-gray-200 rounded-full">
                            <div className="h-1 bg-emerald-600 rounded-full transition-all" style={{ width: `${((addStep + 1) / ADD_STEPS.length) * 100}%` }} />
                          </div>
                        </div>
                        {addStep === 0 && (
                          <>
                            <label className="block font-medium mb-1">Vehicle Type</label>
                            <select
                              className="border px-3 py-2 rounded w-full mb-3"
                              value={vehicleForm.vehicleType}
                              onChange={e => setVehicleForm(f => ({ ...f, vehicleType: e.target.value }))}
                            >
                              <option value="">Select a vehicle type</option>
                              {VEHICLE_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                            <label className="block font-medium mb-1">Name</label>
                            <input
                              type="text"
                              className="border px-3 py-2 rounded w-full mb-3"
                              value={vehicleForm.name}
                              onChange={e => setVehicleForm(f => ({ ...f, name: e.target.value }))}
                            />
                            <label className="block font-medium mb-1">Category</label>
                            <input
                              type="text"
                              className="border px-3 py-2 rounded w-full mb-3"
                              value={vehicleForm.category}
                              onChange={e => setVehicleForm(f => ({ ...f, category: e.target.value }))}
                            />
                            <label className="block font-medium mb-1">Price (LKR)</label>
                            <input
                              type="number"
                              className="border px-3 py-2 rounded w-full mb-3"
                              value={vehicleForm.price}
                              onChange={e => setVehicleForm(f => ({ ...f, price: e.target.value }))}
                            />
                            <label className="block font-medium mb-1">Description</label>
                            <textarea
                              className="border px-3 py-2 rounded w-full mb-3"
                              value={vehicleForm.description}
                              onChange={e => setVehicleForm(f => ({ ...f, description: e.target.value }))}
                            />
                          </>
                        )}
                        {addStep === 1 && (
                          <>
                            <label className="block font-medium mb-1">Features</label>
                            <FeatureInput value={vehicleForm.features} onChange={handleFeatureChange} />
                            <label className="block font-medium mb-1">Specifications</label>
                            <GroupedSpecsInput value={vehicleForm.specs} onChange={v => setVehicleForm(f => ({ ...f, specs: v }))} />
                          </>
                        )}
                        {addStep === 2 && (
                          <>
                            <label className="block font-medium mb-1">Colors</label>
                            <ColorInput value={vehicleForm.colors} onChange={handleColorsChange} />
                          </>
                        )}
                        {addStep === 3 && (
                          <>
                            <label className="block font-medium mb-1">Variants</label>
                            <VariantInput value={vehicleForm.variants} onChange={handleVariantChange} />
                          </>
                        )}
                        {addStep === 4 && (
                          <>
                            <label className="block font-medium mb-1">FAQs</label>
                            <FaqsInput value={vehicleForm.faqs} onChange={handleFaqsChange} />
                            <label className="block font-medium mb-1">Gallery Images</label>
                            <input type="file" multiple accept="image/*" onChange={handleGalleryImageChange} />
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {galleryImagePreviews.map((src, i) => (
                                <div key={i} className="relative group">
                                  <img src={src} alt="gallery-preview" className="w-16 h-16 object-cover rounded" />
                                  <button type="button" className="absolute top-0 right-0 bg-white bg-opacity-80 text-red-500 rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition" onClick={() => { setGalleryImageFiles(files => files.filter((_, idx) => idx !== i)); setGalleryImagePreviews(previews => previews.filter((_, idx) => idx !== i)); }} title="Remove image">&times;</button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        <div className="flex justify-between mt-6">
                          {addStep > 0 && <button type="button" className="btn" onClick={() => setAddStep(addStep - 1)}>Back</button>}
                          {addStep < ADD_STEPS.length - 1 && <button type="button" className="btn btn-primary" onClick={() => setAddStep(addStep + 1)}>Next</button>}
                          {addStep === ADD_STEPS.length - 1 && <button type="submit" className="btn btn-primary w-full" disabled={addLoading || uploading}>{addLoading ? "Adding..." : "Add Vehicle"}</button>}
                        </div>
                        {addError && <div className="text-xs text-red-500 mt-2">{addError}</div>}
                      </form>
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
                    <form
                      className="space-y-4 mt-4"
                      onSubmit={async e => {
                        e.preventDefault();
                        await handleAddVehicle();
                      }}
                      autoComplete="off"
                    >
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          {ADD_STEPS.map((label, idx) => (
                            <div key={label} className={`flex-1 flex flex-col items-center ${addStep === idx ? 'font-bold text-emerald-700' : 'text-gray-400'}`}> 
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${addStep === idx ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>{idx + 1}</div>
                              <span className="text-xs">{label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="h-1 w-full bg-gray-200 rounded-full">
                          <div className="h-1 bg-emerald-600 rounded-full transition-all" style={{ width: `${((addStep + 1) / ADD_STEPS.length) * 100}%` }} />
                        </div>
                      </div>
                      {addStep === 0 && (
                        <>
                          <label className="block font-medium mb-1">Vehicle Type</label>
                          <select
                            className="border px-3 py-2 rounded w-full mb-3"
                            value={vehicleForm.vehicleType}
                            onChange={e => setVehicleForm(f => ({ ...f, vehicleType: e.target.value }))}
                          >
                            <option value="">Select a vehicle type</option>
                            {VEHICLE_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <label className="block font-medium mb-1">Name</label>
                          <input
                            type="text"
                            className="border px-3 py-2 rounded w-full mb-3"
                            value={vehicleForm.name}
                            onChange={e => setVehicleForm(f => ({ ...f, name: e.target.value }))}
                          />
                          <label className="block font-medium mb-1">Category</label>
                          <input
                            type="text"
                            className="border px-3 py-2 rounded w-full mb-3"
                            value={vehicleForm.category}
                            onChange={e => setVehicleForm(f => ({ ...f, category: e.target.value }))}
                          />
                          <label className="block font-medium mb-1">Price (LKR)</label>
                          <input
                            type="number"
                            className="border px-3 py-2 rounded w-full mb-3"
                            value={vehicleForm.price}
                            onChange={e => setVehicleForm(f => ({ ...f, price: e.target.value }))}
                          />
                          <label className="block font-medium mb-1">Description</label>
                          <textarea
                            className="border px-3 py-2 rounded w-full mb-3"
                            value={vehicleForm.description}
                            onChange={e => setVehicleForm(f => ({ ...f, description: e.target.value }))}
                          />
                        </>
                      )}
                      {addStep === 1 && (
                        <>
                          <Form.Item label="Features" name="features"> <FeatureInput value={vehicleForm.features} onChange={handleFeatureChange} /> </Form.Item>
                          <Form.Item label="Specifications" name="specs"> <GroupedSpecsInput value={vehicleForm.specs} onChange={v => setVehicleForm(f => ({ ...f, specs: v }))} /> </Form.Item>
                        </>
                      )}
                      {addStep === 2 && (
                        <>
                          <Form.Item label="Colors" name="colors"> <ColorInput value={vehicleForm.colors} onChange={handleColorsChange} /> </Form.Item>
                        </>
                      )}
                      {addStep === 3 && (
                        <>
                          <Form.Item label="Variants" name="variants"> <VariantInput value={vehicleForm.variants} onChange={handleVariantChange} /> </Form.Item>
                        </>
                      )}
                      {addStep === 4 && (
                        <>
                          <Form.Item label="FAQs" name="faqs"> <FaqsInput value={vehicleForm.faqs} onChange={handleFaqsChange} /> </Form.Item>
                          <Form.Item label="Gallery Images" name="galleryImages"> <input type="file" multiple accept="image/*" onChange={handleGalleryImageChange} /> <div className="flex gap-2 mt-2 flex-wrap"> {galleryImagePreviews.map((src, i) => (<div key={i} className="relative group"><img src={src} alt="gallery-preview" className="w-16 h-16 object-cover rounded" /><button type="button" className="absolute top-0 right-0 bg-white bg-opacity-80 text-red-500 rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition" onClick={() => { setGalleryImageFiles(files => files.filter((_, idx) => idx !== i)); setGalleryImagePreviews(previews => previews.filter((_, idx) => idx !== i)); }} title="Remove image">&times;</button></div>))} </div> </Form.Item>
                        </>
                      )}
                      <div className="flex justify-between mt-6">
                        {addStep > 0 && <Button type="default" onClick={() => setAddStep(addStep - 1)}>Back</Button>}
                        {addStep < ADD_STEPS.length - 1 && <Button type="primary" onClick={() => setAddStep(addStep + 1)}>Next</Button>}
                        {addStep === ADD_STEPS.length - 1 && <Button type="primary" htmlType="submit" loading={addLoading || uploading} block size="large">{addLoading ? "Adding..." : "Add Vehicle"}</Button>}
                      </div>
                      {addError && <div className="text-xs text-red-500 mt-2">{addError}</div>}
                    </form>
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
          {akrFacilityTab === 'hotel-rooms' && akrTab !== 'prebookings' && (
            <>
              <div className="col-span-full xl:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-3xl font-bold gradient-text">Hotel & Rooms</span>
                  {isMobile && (
                    <Button type="primary" onClick={() => setShowAddRoomForm(true)} className="bg-blue-600 text-white font-semibold border-0 hover:bg-blue-700">Add New Room</Button>
                  )}
                </div>
                {roomLoading ? <Spin /> : rooms.length === 0 ? (
                  <div className="text-gray-500">No rooms found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room: any) => (
                      <div key={room._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col overflow-hidden group">
                        <div className="relative w-full h-40 md:h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {room.images && room.images.length > 0 ? (
                            <img src={room.images[0]} alt="room" className="object-cover w-full h-full" />
                          ) : (
                            <div className="text-gray-300">No Image</div>
                          )}
                  </div>
                        <div className="p-4 flex-1 flex flex-col gap-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-lg truncate" title={room.name}>{room.name}</div>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold ml-2">{room.type}</span>
                  </div>
                          <div className="flex flex-wrap gap-2 mb-1">
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">LKR {room.price}</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{room.status}</span>
                  </div>
                          <div className="text-sm text-gray-600 line-clamp-2 mb-1">{room.description}</div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">Features:</span>
                            <span className="text-xs text-gray-700">{room.features?.join(', ') || '-'}</span>
                </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">Amenities:</span>
                            <span className="text-xs text-gray-700">{room.amenities?.join(', ') || '-'}</span>
              </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">Specs:</span>
                            <span className="text-xs text-gray-700">{room.specs && typeof room.specs === 'object' ? Object.entries(room.specs).map(([k, v]) => `${k}: ${v}`).join(', ') : '-'}</span>
                </div>
                          <div className="flex-1" />
                          <Button type="primary" block className="mt-2 font-semibold" onClick={() => openEditRoomModal(room)}>
                            Edit
                          </Button>
                          <Button type="default" danger block className="mt-2" onClick={() => deleteRoom(room._id)}>
                            Delete
                          </Button>
                          <div className="text-xs text-gray-400 mt-2">Created: {room.createdAt ? new Date(room.createdAt).toLocaleString() : '-'}</div>
              </div>
                </div>
                    ))}
                </div>
                )}
              </div>
              {/* Add Room Form (Desktop) */}
              {!isMobile && (
                <div className="glass-card rounded-2xl shadow-lg p-3 md:p-6 flex flex-col gap-4 relative animate-fadeIn xl:col-span-1">
                  <div className="font-bold text-lg gradient-text mb-2">Add New Room</div>
                  {showRoomSuccess && (
                    <div className="text-green-600 text-center font-semibold py-2">Uploaded successfully</div>
                  )}
                  {!showRoomSuccess && (
                    <form className="space-y-4 mt-4" onSubmit={async e => {
                      e.preventDefault();
                      // Custom validation
                      let error = '';
                      if (!roomForm.type) error = 'Type is required';
                      else if (!roomForm.name) error = 'Name is required';
                      else if (!roomForm.price) error = 'Price is required';
                      else if (roomImageFiles.length === 0) error = 'At least one image is required';
                      if (error) { setRoomError(error); return; }
                      await handleAddRoom(roomForm);
                    }}>
                      <div>
                        <label className="block font-medium mb-1">Type *</label>
                        <input type="text" name="type" value={roomForm.type} onChange={handleRoomFormChange} className="border px-3 py-2 rounded w-full" placeholder="Room Type (e.g. Deluxe, Suite)" />
                </div>
                      <div>
                        <label className="block font-medium mb-1">Name *</label>
                        <input type="text" name="name" value={roomForm.name} onChange={handleRoomFormChange} className="border px-3 py-2 rounded w-full" placeholder="Room Name" />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Price *</label>
                        <input type="number" name="price" value={roomForm.price} onChange={handleRoomFormChange} className="border px-3 py-2 rounded w-full" placeholder="Price (LKR)" />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Description</label>
                        <textarea name="description" value={roomForm.description} onChange={handleRoomFormChange} className="border px-3 py-2 rounded w-full" placeholder="Description" />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Features</label>
                        <FeatureInput value={roomForm.features} onChange={handleRoomFeatureChange} />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Specs</label>
                        <GroupedSpecsInput value={roomForm.specs || {}} onChange={specs => setRoomForm(f => ({ ...f, specs }))} />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Amenities</label>
                        <FeatureInput value={roomForm.amenities} onChange={handleRoomAmenitiesChange} />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Images</label>
                        <input type="file" multiple accept="image/*" onChange={handleRoomImageChange} />
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {roomImagePreviews.map((src, i) => (
                            <img key={i} src={src} alt="preview" className="w-16 h-16 object-cover rounded" />
                          ))}
                        </div>
                      </div>
                      {roomError && <div className="text-xs text-red-500">{roomError}</div>}
                      <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition">{roomLoading ? "Adding..." : "Add Room"}</button>
                    </form>
                  )}
              </div>
              )}
              {/* Add Room Modal (Mobile) */}
              {isMobile && (
                <Modal
                  open={showAddRoomForm || showRoomSuccess}
                  onCancel={() => setShowAddRoomForm(false)}
                  footer={null}
                  centered
                  width={360}
                  closeIcon={<CloseOutlined />}
                  bodyStyle={{ padding: 24 }}
                >
                  <div className="font-bold text-lg gradient-text mb-2">Add New Room</div>
                  {showRoomSuccess && (
                    <div className="text-green-600 text-center font-semibold py-2">Uploaded successfully</div>
                  )}
                  {!showRoomSuccess && (
                    <form className="space-y-4 mt-4" onSubmit={async e => {
                      e.preventDefault();
                      let error = '';
                      if (!roomForm.type) error = 'Type is required';
                      else if (!roomForm.name) error = 'Name is required';
                      else if (!roomForm.price) error = 'Price is required';
                      else if (roomImageFiles.length === 0) error = 'At least one image is required';
                      if (error) { setRoomError(error); return; }
                      await handleAddRoom(roomForm);
                    }}>
                      <div>
                        <label className="block font-medium mb-1">Type *</label>
                        <input type="text" name="type" value={roomForm.type} onChange={handleRoomFormChange} className="border px-3 py-2 rounded w-full" placeholder="Room Type (e.g. Deluxe, Suite)" />
              </div>
                      <div>
                        <label className="block font-medium mb-1">Name *</label>
                        <input type="text" name="name" value={roomForm.name} onChange={handleRoomFormChange} className="border px-3 py-2 rounded w-full" placeholder="Room Name" />
                </div>
                      <div>
                        <label className="block font-medium mb-1">Price *</label>
                        <input type="number" name="price" value={roomForm.price} onChange={handleRoomFormChange} className="border px-3 py-2 rounded w-full" placeholder="Price (LKR)" />
              </div>
                      <div>
                        <label className="block font-medium mb-1">Description</label>
                        <textarea name="description" value={roomForm.description} onChange={handleRoomFormChange} className="border px-3 py-2 rounded w-full" placeholder="Description" />
                </div>
                      <div>
                        <label className="block font-medium mb-1">Features</label>
                        <FeatureInput value={roomForm.features} onChange={handleRoomFeatureChange} />
              </div>
                      <div>
                        <label className="block font-medium mb-1">Specs</label>
                        <GroupedSpecsInput value={roomForm.specs || {}} onChange={specs => setRoomForm(f => ({ ...f, specs }))} />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Amenities</label>
                        <FeatureInput value={roomForm.amenities} onChange={handleRoomAmenitiesChange} />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Images</label>
                        <input type="file" multiple accept="image/*" onChange={handleRoomImageChange} />
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {roomImagePreviews.map((src, i) => (
                            <img key={i} src={src} alt="preview" className="w-16 h-16 object-cover rounded" />
                          ))}
                        </div>
                      </div>
                      {roomError && <div className="text-xs text-red-500">{roomError}</div>}
                      <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition">{roomLoading ? "Adding..." : "Add Room"}</button>
                    </form>
                  )}
                </Modal>
              )}
              {/* Edit Room Modal */}
              <Modal
                open={editRoomModalOpen}
                onCancel={closeEditRoomModal}
                footer={null}
                centered
                width={480}
                closeIcon={<CloseOutlined />}
                bodyStyle={{ padding: 24 }}
              >
                <div className="font-bold text-lg gradient-text mb-2">Edit Room</div>
                {editRoomError && <div className="text-xs text-red-500">{editRoomError}</div>}
                {editRoomData && (
                  <Form onFinish={handleEditRoomSubmit} layout="vertical" className="space-y-4 mt-4">
                    <Form.Item label="Type" name="type" initialValue={editRoomData.type} rules={[{ required: true, message: 'Please enter room type!' }]}> <Input placeholder="Room Type" value={editRoomData.type} onChange={handleEditRoomChange} name="type" /> </Form.Item>
                    <Form.Item label="Name" name="name" initialValue={editRoomData.name} rules={[{ required: true, message: 'Please enter room name!' }]}> <Input placeholder="Room Name" value={editRoomData.name} onChange={handleEditRoomChange} name="name" /> </Form.Item>
                    <Form.Item label="Price" name="price" initialValue={editRoomData.price} rules={[{ required: true, message: 'Please enter room price!' }]}> <Input placeholder="Price (LKR)" value={editRoomData.price} onChange={handleEditRoomChange} name="price" /> </Form.Item>
                    <Form.Item label="Description" name="description" initialValue={editRoomData.description}> <Input.TextArea placeholder="Description" value={editRoomData.description} onChange={handleEditRoomChange} name="description" /> </Form.Item>
                    <Form.Item label="Features" name="features"> <FeatureInput value={editRoomData.features} onChange={handleEditRoomFeatureChange} /> </Form.Item>
                    <Form.Item label="Specs" name="specs"> <GroupedSpecsInput value={editRoomData.specs || {}} onChange={specs => setEditRoomData(f => ({ ...f, specs }))} /> </Form.Item>
                    <Form.Item label="Amenities" name="amenities"> <FeatureInput value={editRoomData.amenities} onChange={handleEditRoomAmenitiesChange} /> </Form.Item>
                    {/* Images editing can be added here if needed */}
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={editRoomLoading} block size="large">
                        {editRoomLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </Form.Item>
                  </Form>
                )}
              </Modal>
            </>
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
            {selectedVehicle.galleryImages && selectedVehicle.galleryImages.length > 0 && (
              <div>
                <b>Photo Gallery:</b>
                <div className="flex gap-2 flex-wrap mt-2">
                  {selectedVehicle.galleryImages.map((img: string, idx: number) => (
                    <img key={idx} src={img} alt="gallery" className="w-32 h-24 object-cover rounded border" />
                  ))}
                </div>
              </div>
            )}
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
        {editVehicleData && (
          <form
            className="space-y-4 mt-4"
            onSubmit={async e => {
              e.preventDefault();
              await handleEditVehicleSubmit();
            }}
            autoComplete="off"
          >
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                {EDIT_STEPS.map((label, idx) => (
                  <div key={label} className={`flex-1 flex flex-col items-center ${editStep === idx ? 'font-bold text-emerald-700' : 'text-gray-400'}`}> 
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${editStep === idx ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>{idx + 1}</div>
                    <span className="text-xs">{label}</span>
                  </div>
                ))}
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full">
                <div className="h-1 bg-emerald-600 rounded-full transition-all" style={{ width: `${((editStep + 1) / EDIT_STEPS.length) * 100}%` }} />
              </div>
            </div>
            {editStep === 0 && (
              <>
                <label className="block font-medium mb-1">Vehicle Type</label>
                <select
                  className="border px-3 py-2 rounded w-full mb-3"
                  value={editVehicleData.vehicleType}
                  onChange={e => setEditVehicleData(f => ({ ...f, vehicleType: e.target.value }))}
                >
                  <option value="">Select a vehicle type</option>
                  {VEHICLE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <label className="block font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded w-full mb-3"
                  value={editVehicleData.name}
                  onChange={e => setEditVehicleData(f => ({ ...f, name: e.target.value }))}
                />
                <label className="block font-medium mb-1">Category</label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded w-full mb-3"
                  value={editVehicleData.category}
                  onChange={e => setEditVehicleData(f => ({ ...f, category: e.target.value }))}
                />
                <label className="block font-medium mb-1">Price (LKR)</label>
                <input
                  type="number"
                  className="border px-3 py-2 rounded w-full mb-3"
                  value={editVehicleData.price}
                  onChange={e => setEditVehicleData(f => ({ ...f, price: e.target.value }))}
                />
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  className="border px-3 py-2 rounded w-full mb-3"
                  value={editVehicleData.description}
                  onChange={e => setEditVehicleData(f => ({ ...f, description: e.target.value }))}
                />
              </>
            )}
            {editStep === 1 && (
              <>
                <label className="block font-medium mb-1">Features</label>
                <FeatureInput value={editVehicleData.features} onChange={handleEditFeatureChange} />
                <label className="block font-medium mb-1">Specifications</label>
                <GroupedSpecsInput value={editVehicleData.specs} onChange={v => setEditVehicleData(f => ({ ...f, specs: v }))} />
              </>
            )}
            {editStep === 2 && (
              <>
                <label className="block font-medium mb-1">Colors</label>
                <ColorInput value={editVehicleData.colors} onChange={handleEditColorsChange} />
              </>
            )}
            {editStep === 3 && (
              <>
                <label className="block font-medium mb-1">Variants</label>
                <VariantInput value={editVehicleData.variants} onChange={handleEditVariantChange} />
              </>
            )}
            {editStep === 4 && (
              <>
                <label className="block font-medium mb-1">FAQs</label>
                <FaqsInput value={editVehicleData.faqs} onChange={handleEditFaqsChange} />
                <label className="block font-medium mb-1">Gallery Images</label>
                <input type="file" multiple accept="image/*" onChange={handleGalleryImageChange} />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {galleryImagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="gallery-preview" className="w-16 h-16 object-cover rounded" />
                      <button type="button" className="absolute top-0 right-0 bg-white bg-opacity-80 text-red-500 rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition" onClick={() => { setGalleryImageFiles(files => files.filter((_, idx) => idx !== i)); setGalleryImagePreviews(previews => previews.filter((_, idx) => idx !== i)); }} title="Remove image">&times;</button>
                    </div>
                  ))}
                  {/* Existing gallery images (from backend) */}
                  {editVehicleData.galleryImages && editVehicleData.galleryImages.map((img: string, idx: number) => (
                    <div key={"existing-" + idx} className="relative group">
                      <img src={img} alt="gallery-existing" className="w-16 h-16 object-cover rounded border" />
                      <button type="button" className="absolute top-0 right-0 bg-white bg-opacity-80 text-red-500 rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition" onClick={() => setEditVehicleData(f => ({ ...f, galleryImages: f.galleryImages.filter((_: string, i: number) => i !== idx) }))} title="Remove image">&times;</button>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="flex justify-between mt-6">
              {editStep > 0 && <button type="button" className="btn" onClick={() => setEditStep(editStep - 1)}>Back</button>}
              {editStep < EDIT_STEPS.length - 1 && <button type="button" className="btn btn-primary" onClick={() => setEditStep(editStep + 1)}>Next</button>}
              {editStep === EDIT_STEPS.length - 1 && <button type="submit" className="btn btn-primary w-full" disabled={editLoading || uploading}>{editLoading ? "Saving..." : "Save Changes"}</button>}
            </div>
            {editError && <div className="text-xs text-red-500 mt-2">{editError}</div>}
          </form>
        )}
      </Modal>
    </Layout>
  );
} 