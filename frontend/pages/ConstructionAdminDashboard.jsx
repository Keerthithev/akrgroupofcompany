import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Button, Typography, message, Input, Modal, List, Space, Row, Col, Empty, Spin, Table, Form, InputNumber, Popconfirm, Switch, Alert, Drawer, DatePicker, Tabs, Statistic, Card, Divider, Progress, Select, Tag } from "antd";
import {
  DashboardOutlined,
  CarOutlined,
  DollarOutlined,
  LogoutOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  BarChartOutlined,
  CalendarOutlined,
  UserOutlined,
  SettingOutlined,
  PrinterOutlined,
  DownloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  HistoryOutlined,
  SaveOutlined,
  WalletOutlined
} from '@ant-design/icons';
import api from "../lib/axios";
import dayjs from 'dayjs';
import ExcelLikeTable from '../components/ExcelLikeTable';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: 'employees', label: 'Employees', icon: <TeamOutlined /> },
  { key: 'suppliers', label: 'Suppliers', icon: <TeamOutlined /> },
  { key: 'vehicle-logs', label: 'Vehicle Logs', icon: <CarOutlined /> },
  { key: 'customers', label: 'Customers', icon: <UserOutlined /> },
  { key: 'items', label: 'Items', icon: <FileTextOutlined /> },
  { key: 'fuel-management', label: 'Fuel Management', icon: <CarOutlined /> },
  { key: 'shed-wallet', label: 'Shed Wallet', icon: <WalletOutlined /> },
  { key: 'add-vehicle', label: 'Add Vehicle', icon: <PlusOutlined /> },
  { key: 'credit-management', label: 'Credit Management', icon: <DollarOutlined /> },
  { key: 'reports', label: 'Reports', icon: <BarChartOutlined /> },
  { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
];

const ConstructionAdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [employeePositions, setEmployeePositions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [vehiclesDisplay, setVehiclesDisplay] = useState([]);
  const [creditPayments, setCreditPayments] = useState([]);
  const [creditOverview, setCreditOverview] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [employeePagination, setEmployeePagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});
  const [employeeFilters, setEmployeeFilters] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [creditPaymentModalVisible, setCreditPaymentModalVisible] = useState(false);
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleHistory, setVehicleHistory] = useState(null);
  const [showEmployeeLogs, setShowEmployeeLogs] = useState(false);
  const [selectedEmployeeForLogs, setSelectedEmployeeForLogs] = useState(null);
  const [lockEmployeeField, setLockEmployeeField] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [monthDetailVisible, setMonthDetailVisible] = useState(false);
  const [monthDetailTitle, setMonthDetailTitle] = useState('');
  const [monthDetailRows, setMonthDetailRows] = useState([]);
  const [employeeMonthKey, setEmployeeMonthKey] = useState(null);
  const [vehicleSheetVisible, setVehicleSheetVisible] = useState(false);
  const [selectedVehicleForSheet, setSelectedVehicleForSheet] = useState(null);
  const [sheetRows, setSheetRows] = useState([]);
  const [supplierRows, setSupplierRows] = useState([]);
  const [supplierPaid, setSupplierPaid] = useState(0);
  const [supplierPaymentDescription, setSupplierPaymentDescription] = useState('');
  const [sheetSupplierId, setSheetSupplierId] = useState();
  
  // Fuel Management States
  const [fuelLogs, setFuelLogs] = useState([]);
  const [fuelSummary, setFuelSummary] = useState(null);
  const [fuelModalVisible, setFuelModalVisible] = useState(false);
  const [editingFuelLog, setEditingFuelLog] = useState(null);
  const [fuelForm] = Form.useForm();
  const [selectedVehicleForFuel, setSelectedVehicleForFuel] = useState(null);
  const [fuelEfficiency, setFuelEfficiency] = useState(null);
  const [fuelPaymentModalVisible, setFuelPaymentModalVisible] = useState(false);
  const [selectedFuelLogForPayment, setSelectedFuelLogForPayment] = useState(null);
  const [fuelPaymentForm] = Form.useForm();
  
  // Shed Wallet Management States
  const [shedWallet, setShedWallet] = useState(null);
  const [shedTransactions, setShedTransactions] = useState([]);
  const [pendingDetails, setPendingDetails] = useState(null);
  const [shedWalletModalVisible, setShedWalletModalVisible] = useState(false);
  const [shedTransactionModalVisible, setShedTransactionModalVisible] = useState(false);
  const [shedTransactionForm] = Form.useForm();
  const [shedWalletForm] = Form.useForm();
  const [datePickerModalVisible, setDatePickerModalVisible] = useState(false);
  const [datePickerForm] = Form.useForm();
  
  const [salaryRows, setSalaryRows] = useState([]);
  const [expenseRows, setExpenseRows] = useState([]);
  const [yesterdayBalance, setYesterdayBalance] = useState(0);
  const [setCashTaken, setSetCashTaken] = useState();
  const [selectedEmployeeForSalary, setSelectedEmployeeForSalary] = useState('');
  const [selectedEmployeeForExpense, setSelectedEmployeeForExpense] = useState('');
  const [salaryPaymentMethod, setSalaryPaymentMethod] = useState(''); // 'balance' or 'salary'
  const [salaryAmount, setSalaryAmount] = useState(0);
  const [salaryPaid, setSalaryPaid] = useState(false);
  const [salaryPaymentModalVisible, setSalaryPaymentModalVisible] = useState(false);
  const [expensesSaved, setExpensesSaved] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [selectedEmployeeForWallet, setSelectedEmployeeForWallet] = useState(null);
  const [walletHistory, setWalletHistory] = useState([]);
  const [walletMarkPaidAmount, setWalletMarkPaidAmount] = useState();
  const [smsModalVisible, setSmsModalVisible] = useState(false);
  const [smsCustomerName, setSmsCustomerName] = useState('');
  const [smsCustomerPhone, setSmsCustomerPhone] = useState('');
  const [supplierWalletVisible, setSupplierWalletVisible] = useState(false);
  const [selectedSupplierForWallet, setSelectedSupplierForWallet] = useState(null);
  const [supplierWalletByItem, setSupplierWalletByItem] = useState([]);

  const getEmployeeTripAndMonthlyStats = (employeeId) => {
    const logs = vehicleLogs.filter(l => l.employeeId === employeeId);
    const totalTrips = logs.length;
    const totalKm = logs.reduce((sum, l) => sum + (l.workingKm || 0), 0);
    const totalFuel = logs.reduce((sum, l) => sum + (l.fuel?.liters || 0), 0);
    const totalExpenses = logs.reduce((sum, l) => {
      const expenses = (l.expenses || []).reduce((s, e) => {
        // Exclude salary from expenses
        if (e.description && e.description.toLowerCase().includes('salary')) {
          return s;
        }
        return s + (e.amount || 0);
      }, 0);
      return sum + expenses;
    }, 0);
    const months = {};
    logs.forEach(l => {
      const key = dayjs(l.date).format('YYYY-MM');
      if (!months[key]) months[key] = { key, month: dayjs(l.date).format('MMM YYYY'), trips: 0, totalKm: 0, totalFuel: 0, expenses: 0 };
      months[key].trips += 1;
      months[key].totalKm += l.workingKm || 0;
      months[key].totalFuel += l.fuel?.liters || 0;
      const exp = (l.expenses || []).reduce((s, e) => {
        // Exclude salary from expenses
        if (e.description && e.description.toLowerCase().includes('salary')) {
          return s;
        }
        return s + (e.amount || 0);
      }, 0);
      // Only operational expenses; exclude any payments/credits
      months[key].expenses += exp;
    });
    const monthlyRows = Object.values(months).sort((a, b) => new Date(a.key + '-01') - new Date(b.key + '-01'));
    return { totalTrips, totalKm, totalFuel, totalExpenses, monthlyRows };
  };

  const openMonthExpenseDetail = (employeeId, monthKey) => {
    // Show ONLY operational expenses (exclude payments/credits)
    const rows = vehicleLogs
      .filter(l => l.employeeId === employeeId && dayjs(l.date).format('YYYY-MM') === monthKey)
      .flatMap(l => (l.expenses || []).map(exp => ({
        date: dayjs(l.date).format('DD/MM/YYYY'),
        description: exp.description,
        amount: exp.amount || 0
      })));
    const total = rows.reduce((s, r) => s + (r.amount || 0), 0);
    setMonthDetailRows(rows);
    setMonthDetailTitle(`${dayjs(monthKey + '-01').format('MMM YYYY')} • Total Expenses: Rs. ${Number(total).toLocaleString()}`);
    setMonthDetailVisible(true);
  };
  const [form] = Form.useForm();
  const [employeeForm] = Form.useForm();
  const [customerForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [supplierForm] = Form.useForm();
  const [creditPaymentForm] = Form.useForm();
  const [addVehicleForm] = Form.useForm();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
    loadVehicles();
    loadEmployees();
    loadSuppliers();
    loadEmployeePositions();
    loadCustomers();
    loadItems();
    loadCreditOverview();
    loadCreditPayments();
    loadFuelLogs();
    loadFuelSummary();
    loadFuelEfficiency();
    loadShedWallet();
    loadShedTransactions();
    loadPendingDetails();
  }, []);

  useEffect(() => {
    if (selectedSection === 'vehicle-logs') {
      loadVehicleLogs();
    }
    if (selectedSection === 'employees') {
      loadEmployees();
    }
    if (selectedSection === 'reports') {
      loadVehicleLogs();
      loadEmployees();
    }
  }, [selectedSection, pagination.current, pagination.pageSize, filters, employeePagination.current, employeePagination.pageSize, employeeFilters]);

  const checkAuth = () => {
    const token = localStorage.getItem('constructionAdminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/construction-admin/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const response = await api.get('/api/construction-admin/vehicles', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      const raw = Array.isArray(response.data) ? response.data : [];
      // Preserve full list for display (objects preferred)
      const displayList = raw.map(v => (typeof v === 'string' ? { vehicleNumber: v, name: '' } : { vehicleNumber: v?.vehicleNumber, name: v?.name || '' }))
        .filter(v => v.vehicleNumber);
      // Deduplicate by vehicleNumber
      const seen = new Set();
      const uniqueDisplay = displayList.filter(v => {
        if (seen.has(v.vehicleNumber)) return false;
        seen.add(v.vehicleNumber);
        return true;
      }).sort((a,b) => String(a.vehicleNumber).localeCompare(String(b.vehicleNumber)));
      setVehiclesDisplay(uniqueDisplay);

      // Normalize to strings for dropdowns and other usage
      const normalized = uniqueDisplay.map(v => v.vehicleNumber);
      setVehicles(normalized);
    } catch (error) {
      message.error('Failed to load vehicles');
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await api.get('/api/construction-admin/suppliers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      message.error('Failed to load suppliers');
    }
  };

  const loadFuelLogs = async () => {
    try {
      const response = await api.get('/api/construction-admin/fuel-logs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setFuelLogs(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      message.error('Failed to load fuel logs');
    }
  };

  const loadFuelSummary = async () => {
    try {
      const response = await api.get('/api/construction-admin/fuel-summary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setFuelSummary(response.data);
    } catch (e) {
      message.error('Failed to load fuel summary');
    }
  };

  const loadFuelEfficiency = async () => {
    try {
      const response = await api.get('/api/construction-admin/vehicles-fuel-efficiency', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setFuelEfficiency(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      message.error('Failed to load fuel efficiency');
    }
  };

  const loadShedWallet = async () => {
    try {
      const response = await api.get('/api/construction-admin/shed-wallet', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setShedWallet(response.data);
    } catch (e) {
      message.error('Failed to load shed wallet');
    }
  };

  const loadShedTransactions = async () => {
    try {
      const response = await api.get('/api/construction-admin/shed-wallet/transactions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setShedTransactions(response.data.transactions || []);
    } catch (e) {
      message.error('Failed to load shed transactions');
    }
  };

  const loadPendingDetails = async () => {
    try {
      const response = await api.get('/api/construction-admin/shed-wallet/pending-details', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setPendingDetails(response.data);
    } catch (e) {
      message.error('Failed to load pending details');
    }
  };

  const handleAddVehicle = async (values) => {
    try {
      await api.post('/api/construction-admin/vehicles', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      message.success('Vehicle added');
      addVehicleForm.resetFields();
      await loadVehicles();
    } catch (error) {
      const err = error?.response?.data?.error || 'Failed to add vehicle';
      message.error(err);
    }
  };

  const handleDeleteVehicle = async (vehicleNumber) => {
    Modal.confirm({
      title: 'Delete Vehicle',
      content: `Are you sure you want to delete vehicle "${vehicleNumber}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/api/construction-admin/vehicles/${vehicleNumber}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
          });
          message.success('Vehicle deleted successfully');
          await loadVehicles();
        } catch (error) {
          const err = error?.response?.data?.error || 'Failed to delete vehicle';
          message.error(err);
        }
      }
    });
  };

  const loadEmployees = async () => {
    try {
      const params = {
        page: employeePagination.current,
        limit: employeePagination.pageSize,
        ...employeeFilters
      };
      
      const response = await api.get('/api/construction-admin/employees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` },
        params
      });
      
      setEmployees(response.data.employees);
      setEmployeePagination(prev => ({
        ...prev,
        total: response.data.total
      }));
    } catch (error) {
      message.error('Failed to load employees');
    }
  };

  const loadEmployeePositions = async () => {
    try {
      const response = await api.get('/api/construction-admin/employees/positions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setEmployeePositions(response.data);
    } catch (error) {
      message.error('Failed to load employee positions');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/api/construction-admin/customers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadItems = async () => {
    try {
      const response = await api.get('/api/construction-admin/items', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadCreditOverview = async () => {
    try {
      const response = await api.get('/api/construction-admin/credit-overview', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setCreditOverview(response.data);
    } catch (error) {
      console.error('Error loading credit overview:', error);
    }
  };

  const loadCreditPayments = async () => {
    try {
      const response = await api.get('/api/construction-admin/credit-payments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setCreditPayments(response.data);
    } catch (error) {
      console.error('Error loading credit payments:', error);
    }
  };

  const loadEmployeeHistory = async (employeeId) => {
    try {
      const response = await api.get(`/api/construction-admin/employees/${employeeId}/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      setEmployeeHistory(response.data);
    } catch (error) {
      message.error('Failed to load employee history');
    }
  };

  const loadVehicleHistory = async (vehicleNumber) => {
    try {
      const response = await api.get(`/api/construction-admin/vehicles/${vehicleNumber}/logs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      console.log('Vehicle history data received:', response.data);
      console.log('Vehicle history logs:', response.data.logs);
      setVehicleHistory(response.data);
    } catch (error) {
      message.error('Failed to load vehicle history');
    }
  };

  const loadVehicleLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      const response = await api.get('/api/construction-admin/vehicle-logs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` },
        params
      });
      
      setVehicleLogs(response.data.logs);
      setPagination(prev => ({
        ...prev,
        total: response.data.total
      }));
      
      console.log('Loaded vehicle logs:', response.data.logs.length);
      console.log('Sample log:', response.data.logs[0]);
    } catch (error) {
      message.error('Failed to load vehicle logs');
    } finally {
      setLoading(false);
    }
  };

  const fixYesterdayBalances = async () => {
    try {
      const response = await api.post('/api/construction-admin/fix-yesterday-balances', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      message.success(response.data.message);
      await loadVehicleLogs(); // Reload logs to show updated balances
    } catch (error) {
      console.error('Failed to fix yesterday balances:', error);
      message.error('Failed to fix yesterday balances');
    }
  };

  const clearAllData = async () => {
    try {
      const response = await api.post('/api/construction-admin/clear-vehicle-logs', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      message.success(response.data.message);
      await loadVehicleLogs(); // Reload logs to show empty state
      await loadEmployees(); // Reload employees to show reset wallet data
    } catch (error) {
      console.error('Failed to clear all data:', error);
      message.error('Failed to clear all data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('constructionAdminToken');
    localStorage.removeItem('adminRole');
    navigate('/admin-login');
  };

  const handleAddLog = () => {
    setEditingLog(null);
    form.resetFields();
    setLockEmployeeField(false);
    setModalVisible(true);
  };

  const handleAddLogForEmployee = (employee) => {
    setEditingLog(null);
    form.resetFields();
    form.setFieldsValue({ employeeId: employee.employeeId });
    setLockEmployeeField(true);
    setModalVisible(true);
  };

  const handleEditLog = (record) => {
    setEditingLog(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
      expenses: record.expenses || []
    });
    setModalVisible(true);
  };

  const handleDeleteLog = async (id) => {
    try {
      await api.delete(`/api/construction-admin/vehicle-logs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      message.success('Vehicle log deleted successfully');
      loadVehicleLogs();
    } catch (error) {
      message.error('Failed to delete vehicle log');
    }
  };

  const sendSMS = async () => {
    try {
      if (!smsCustomerPhone) {
        message.error('Please enter customer phone number');
        return;
      }

      await api.post('/api/construction-admin/send-sms', {
        phoneNumber: smsCustomerPhone,
        customerName: smsCustomerName
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });

      message.success('SMS sent successfully!');
      setSmsModalVisible(false);
      setSmsCustomerName('');
      setSmsCustomerPhone('');
    } catch (error) {
      message.error('Failed to send SMS: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Find employee name
      const employee = employees.find(emp => emp.employeeId === values.employeeId);
      
      const logData = {
        ...values,
        date: values.date.toDate(),
        employeeName: employee?.name || '',
        expenses: values.expenses || []
      };

      if (editingLog) {
        await api.put(`/api/construction-admin/vehicle-logs/${editingLog._id}`, logData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
        });
        message.success('Vehicle log updated successfully');
        setModalVisible(false);
        loadVehicleLogs();
        loadDashboardData();
      } else {
        const response = await api.post('/api/construction-admin/vehicle-logs', logData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
        });
        
        if (response.data.suggestSMS) {
          // Customer didn't use credit, show SMS suggestion
          const found = customers.find(c => c.name === response.data.customerName);
          setSmsCustomerName(response.data.customerName);
          setSmsCustomerPhone(found?.phone || '');
          setModalVisible(false);
          setSmsModalVisible(true);
        } else {
          message.success('Vehicle log created successfully');
          setModalVisible(false);
        }
        
        loadVehicleLogs();
        loadDashboardData();
      }
    } catch (error) {
      message.error('Failed to save vehicle log');
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    employeeForm.resetFields();
    setEmployeeModalVisible(true);
  };

  const handleEditEmployee = (record) => {
    setEditingEmployee(record);
    employeeForm.setFieldsValue({
      ...record,
      joiningDate: dayjs(record.joiningDate)
    });
    setEmployeeModalVisible(true);
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await api.delete(`/api/construction-admin/employees/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      message.success('Employee deleted successfully');
      loadEmployees();
      loadDashboardData();
    } catch (error) {
      message.error('Failed to delete employee');
    }
  };

  const handleEmployeeSubmit = async (values) => {
    try {
      const employeeData = {
        ...values,
        joiningDate: values.joiningDate?.toDate()
      };

      if (editingEmployee) {
        await api.put(`/api/construction-admin/employees/${editingEmployee._id}`, employeeData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
        });
        message.success('Employee updated successfully');
      } else {
        await api.post('/api/construction-admin/employees', employeeData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
        });
        message.success('Employee created successfully');
      }
      
      setEmployeeModalVisible(false);
      loadEmployees();
      loadDashboardData();
    } catch (error) {
      message.error('Failed to save employee');
    }
  };

  const handleCustomerSubmit = async (values) => {
    try {
      if (editingCustomer) {
        await api.put(`/api/construction-admin/customers/${editingCustomer._id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
        });
        message.success('Customer updated successfully');
      } else {
        await api.post('/api/construction-admin/customers', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
        });
        message.success('Customer created successfully');
      }
      
      setCustomerModalVisible(false);
      loadCustomers();
      loadCreditOverview();
    } catch (error) {
      message.error('Failed to save customer');
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await api.delete(`/api/construction-admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      message.success('Customer deleted successfully');
      loadCustomers();
      loadCreditOverview();
    } catch (error) {
      message.error('Failed to delete customer');
    }
  };

  const handleItemSubmit = async (values) => {
    try {
      if (editingItem) {
        await api.put(`/api/construction-admin/items/${editingItem._id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
        });
        message.success('Item updated successfully');
      } else {
        await api.post('/api/construction-admin/items', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
        });
        message.success('Item created successfully');
      }
      
      setItemModalVisible(false);
      loadItems();
    } catch (error) {
      message.error('Failed to save item');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/api/construction-admin/items/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      message.success('Item deleted successfully');
      loadItems();
    } catch (error) {
      message.error('Failed to delete item');
    }
  };

  const handleCreditPaymentSubmit = async (values) => {
    try {
      // Validate required fields
      if (!values.customerId || !values.paymentAmount || !values.paymentDate) {
        message.error('Please fill in all required fields');
        return;
      }
  
      // Validate payment amount
      if (values.paymentAmount <= 0) {
        message.error('Payment amount must be greater than 0');
        return;
      }
  
      // Ensure originalCreditAmount is included
      if (!values.originalCreditAmount && values.originalCreditAmount !== 0) {
        message.error('Original credit amount is required');
        return;
      }
  
      const paymentData = {
        customerId: values.customerId,
        customerName: values.customerName,
        paymentAmount: parseFloat(values.paymentAmount),
        paymentDate: values.paymentDate?.toDate() || new Date(),
        paymentMethod: values.paymentMethod || 'cash',
        referenceNumber: values.referenceNumber || '',
        notes: values.notes || '',
        originalCreditAmount: parseFloat(values.originalCreditAmount), // Add this field
      };
  
      console.log('Submitting credit payment:', paymentData);
  
      const response = await api.post('/api/construction-admin/credit-payments', paymentData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      
      console.log('Credit payment response:', response.data);
      
      message.success('Credit payment recorded successfully');
      setCreditPaymentModalVisible(false);
      creditPaymentForm.resetFields();
      loadCreditOverview();
      loadDashboardData();
      // Refresh vehicle logs so credit status updates reflect in UI
      await loadVehicleLogs();
    } catch (error) {
      console.error('Credit payment error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to record credit payment';
      message.error(errorMessage);
    }
  };

  const handleViewEmployeeHistory = async (employee) => {
    setSelectedEmployee(employee);
    await loadEmployeeHistory(employee._id);
  };

  const loadWalletHistory = async (employeeId) => {
    try {
      const response = await api.get(`/api/construction-admin/employees/${employeeId}/wallet-history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
      });
      // Update the employee object with wallet data
      setSelectedEmployeeForWallet(prev => ({
        ...prev,
        pendingSalary: response.data.pendingSalary,
        yesterdayBalance: response.data.yesterdayBalance,
        lastSalaryPaid: response.data.lastSalaryPaid,
        lastSalaryAmount: response.data.lastSalaryAmount
      }));
    } catch (error) {
      console.error('Failed to load wallet history:', error);
      message.error('Failed to load wallet history');
    }
  };

  const handleViewWallet = async (employee) => {
    setSelectedEmployeeForWallet(employee);
    await loadWalletHistory(employee.employeeId);
    setWalletModalVisible(true);
  };

  const handleViewVehicleHistory = async (vehicleNumber) => {
    setSelectedVehicle(vehicleNumber);
    await loadVehicleHistory(vehicleNumber);
  };

  // Helper functions for reports
  const getMonthlyData = () => {
    const months = {};
    vehicleLogs.forEach(log => {
      const month = dayjs(log.date).format('YYYY-MM');
      if (!months[month]) {
        months[month] = { trips: 0, totalKm: 0, fuel: 0, expenses: 0 };
      }
      months[month].trips++;
      months[month].totalKm += log.workingKm || 0;
      months[month].fuel += log.fuel?.liters || 0;
      const logExpenses = log.expenses?.reduce((sum, exp) => {
        // Exclude salary from expenses
        if (exp.description && exp.description.toLowerCase().includes('salary')) {
          return sum;
        }
        return sum + exp.amount;
      }, 0) || 0;
      months[month].expenses += logExpenses;
    });
    
    return Object.entries(months).map(([month, data]) => ({
      month: dayjs(month).format('MMMM YYYY'),
      ...data
    }));
  };

  const getDutyData = () => {
    const duties = {};
    vehicleLogs.forEach(log => {
      log.duties?.forEach(duty => {
        if (!duties[duty]) {
          duties[duty] = { count: 0, employees: new Set() };
        }
        duties[duty].count++;
        duties[duty].employees.add(log.employeeId);
      });
    });
    
    return Object.entries(duties).map(([duty, data]) => ({
      duty,
      count: data.count,
      employees: data.employees.size
    }));
  };

  const getEmployeePositionData = () => {
    const positions = {};
    employees.forEach(emp => {
      positions[emp.position] = (positions[emp.position] || 0) + 1;
    });
    
    return Object.entries(positions).map(([position, count]) => ({
      position,
      count
    }));
  };

  const exportToExcel = () => {
    // Create comprehensive CSV data with employee details and their vehicle logs
    const csvData = [
      // Employee Details Section
      ['EMPLOYEE DETAILS REPORT'],
      ['Generated on:', dayjs().format('DD/MM/YYYY HH:mm:ss')],
      [],
      ['Employee ID', 'Name', 'Position', 'Phone', 'Email', 'Address', 'Emergency Contact', 'Emergency Phone', 'Assigned Vehicles', 'Duties', 'Status', 'Join Date'],
      ...employees.map(emp => [
        emp.employeeId,
        emp.name,
        emp.position,
        emp.phone,
        emp.email || '',
        emp.address || '',
        emp.emergencyContact || '',
        emp.emergencyPhone || '',
        emp.assignedVehicles?.join('; ') || '',
        emp.duties?.join('; ') || '',
        emp.status,
        emp.joinDate ? dayjs(emp.joinDate).format('DD/MM/YYYY') : ''
      ]),
      [],
      [],
      // Employee Vehicle Logs Section
      ['EMPLOYEE VEHICLE LOGS DETAILED REPORT'],
      [],
      ['Employee ID', 'Employee Name', 'Vehicle Number', 'Date', 'Start Place', 'End Place', 'Start Meter', 'End Meter', 'Working KM', 'Duties', 'Total Payment (Rs)', 'Fuel (L)', 'Fuel Cost (Rs)', 'Other Expenses (Rs)', 'Total Expenses (Rs)', 'Status', 'Driver Signature', 'Supervisor Signature'],
      ...vehicleLogs.map(log => {
        const fuelExpense = log.expenses?.find(exp => exp.description.toLowerCase().includes('fuel'))?.amount || 0;
        const otherExpenses = log.expenses?.reduce((sum, exp) => {
          if (!exp.description.toLowerCase().includes('fuel')) {
            return sum + exp.amount;
          }
          return sum;
        }, 0) || 0;
        const totalExpenses = fuelExpense + otherExpenses;
        
        return [
          log.employeeId,
          log.employeeName,
          log.vehicleNumber,
          dayjs(log.date).format('DD/MM/YYYY'),
          log.startPlace,
          log.endPlace,
          log.startMeter,
          log.endMeter,
          log.workingKm,
          log.duties?.join('; ') || '',
          log.payments?.total || 0,
          log.fuel?.liters || 0,
          fuelExpense,
          otherExpenses,
          totalExpenses,
          log.status,
          log.driverSignature || '',
          log.supervisorSignature || ''
        ];
      }),
      [],
      [],
      // Employee Summary Statistics
      ['EMPLOYEE SUMMARY STATISTICS'],
      [],
      ['Employee ID', 'Employee Name', 'Position', 'Total Trips', 'Total KM', 'Total Fuel (L)', 'Total Expenses (Rs)', 'Average Trip Cost (Rs)', 'Most Used Vehicle', 'Most Common Duty'],
      ...employees.map(emp => {
        const empLogs = vehicleLogs.filter(log => log.employeeId === emp.employeeId);
        const totalTrips = empLogs.length;
        const totalKm = empLogs.reduce((sum, log) => sum + (log.workingKm || 0), 0);
        const totalFuel = empLogs.reduce((sum, log) => sum + (log.fuel?.liters || 0), 0);
        const totalExpenses = empLogs.reduce((sum, log) => {
          const logExpenses = log.expenses?.reduce((logSum, expense) => {
            // Exclude salary from expenses
            if (expense.description && expense.description.toLowerCase().includes('salary')) {
              return logSum;
            }
            return logSum + expense.amount;
          }, 0) || 0;
          return sum + logExpenses;
        }, 0);
        const avgTripCost = totalTrips > 0 ? Math.round(totalExpenses / totalTrips) : 0;
        
        // Most used vehicle
        const vehicleCounts = {};
        empLogs.forEach(log => {
          vehicleCounts[log.vehicleNumber] = (vehicleCounts[log.vehicleNumber] || 0) + 1;
        });
        const mostUsedVehicle = Object.keys(vehicleCounts).length > 0 
          ? Object.keys(vehicleCounts).reduce((a, b) => vehicleCounts[a] > vehicleCounts[b] ? a : b)
          : '';
        
        // Most common duty
        const dutyCounts = {};
        empLogs.forEach(log => {
          log.duties?.forEach(duty => {
            dutyCounts[duty] = (dutyCounts[duty] || 0) + 1;
          });
        });
        const mostCommonDuty = Object.keys(dutyCounts).length > 0
          ? Object.keys(dutyCounts).reduce((a, b) => dutyCounts[a] > dutyCounts[b] ? a : b)
          : '';
        
        return [
          emp.employeeId,
          emp.name,
          emp.position,
          totalTrips,
          totalKm,
          totalFuel,
          totalExpenses,
          avgTripCost,
          mostUsedVehicle,
          mostCommonDuty
        ];
      }),
      [],
      [],
      // Vehicle Summary Statistics
      ['VEHICLE SUMMARY STATISTICS'],
      [],
      ['Vehicle Number', 'Total Trips', 'Total KM', 'Total Fuel (L)', 'Total Expenses (Rs)', 'Assigned Employees', 'Most Active Employee', 'Average Trip Distance (KM)'],
      ...vehicles.map(vehicle => {
        const logsForVehicle = vehicleLogs.filter(log => log.vehicleNumber === vehicle);
        const totalTrips = logsForVehicle.length;
        const totalKm = logsForVehicle.reduce((sum, log) => sum + (log.workingKm || 0), 0);
        const totalFuel = logsForVehicle.reduce((sum, log) => sum + (log.fuel?.liters || 0), 0);
        const totalExpenses = logsForVehicle.reduce((sum, log) => {
          const logExpenses = log.expenses?.reduce((logSum, expense) => {
            // Exclude salary from expenses
            if (expense.description && expense.description.toLowerCase().includes('salary')) {
              return logSum;
            }
            return logSum + expense.amount;
          }, 0) || 0;
          return sum + logExpenses;
        }, 0);
        const avgTripDistance = totalTrips > 0 ? Math.round(totalKm / totalTrips) : 0;
        
        // Most active employee for this vehicle
        const employeeCounts = {};
        logsForVehicle.forEach(log => {
          employeeCounts[log.employeeId] = (employeeCounts[log.employeeId] || 0) + 1;
        });
        const mostActiveEmployee = Object.keys(employeeCounts).length > 0
          ? employees.find(emp => emp.employeeId === Object.keys(employeeCounts).reduce((a, b) => employeeCounts[a] > employeeCounts[b] ? a : b))?.name || ''
          : '';
        
        return [
          vehicle,
          totalTrips,
          totalKm,
          totalFuel,
          totalExpenses,
          employees.filter(emp => emp.assignedVehicles?.includes(vehicle)).length,
          mostActiveEmployee,
          avgTripDistance
        ];
      }),
      [],
      [],
      // Financial Summary
      ['FINANCIAL SUMMARY'],
      [],
      ['Category', 'Amount (Rs)', 'Details'],
      ['Total Expenses', vehicleLogs.reduce((sum, log) => {
        const logExpenses = log.expenses?.reduce((logSum, expense) => logSum + expense.amount, 0) || 0;
        return sum + logExpenses + (log.payments?.total || 0);
      }, 0), 'Sum of all vehicle log expenses and payments'],
      ['Fuel Expenses', vehicleLogs.reduce((sum, log) => {
        const fuelExpense = log.expenses?.find(exp => exp.description.toLowerCase().includes('fuel'))?.amount || 0;
        return sum + fuelExpense;
      }, 0), 'Total fuel-related expenses'],
      ['Other Expenses', vehicleLogs.reduce((sum, log) => {
        const otherExpenses = log.expenses?.reduce((logSum, exp) => {
          if (!exp.description.toLowerCase().includes('fuel')) {
            return logSum + exp.amount;
          }
          return logSum;
        }, 0) || 0;
        return sum + otherExpenses;
      }, 0), 'Total non-fuel expenses'],
      ['Total Payments', vehicleLogs.reduce((sum, log) => sum + (log.payments?.total || 0), 0), 'Total payments received'],
      ['Average Trip Cost', Math.round(vehicleLogs.reduce((sum, log) => {
        const logExpenses = log.expenses?.reduce((logSum, expense) => logSum + expense.amount, 0) || 0;
        return sum + logExpenses + (log.payments?.total || 0);
      }, 0) / vehicleLogs.length), 'Average cost per trip']
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `construction_employee_details_${dayjs().format('YYYY-MM-DD_HH-mm')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    message.success('Comprehensive employee report exported successfully!');
  };

  const printReport = () => {
    window.print();
  };

  // Employee PDF Export
  const exportEmployeesAsPDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(emp => emp.status === 'active').length;
      const inactiveEmployees = employees.filter(emp => emp.status === 'inactive').length;
      const onLeaveEmployees = employees.filter(emp => emp.status === 'on_leave').length;
      
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
          <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
            <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
            <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px;">
            <div style="color: #2e7d32; font-size: 20px;">Employee Details Report</div>
            <div>Date: ${dayjs().format('DD/MM/YYYY')}</div>
          </div>

          <div style="display: flex; justify-content: space-around; margin-bottom: 25px; background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">${totalEmployees}</div>
              <div style="font-size: 14px; color: #666;">Total Employees</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #52c41a;">${activeEmployees}</div>
              <div style="font-size: 14px; color: #666;">Active</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #ff4d4f;">${inactiveEmployees}</div>
              <div style="font-size: 14px; color: #666;">Inactive</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #faad14;">${onLeaveEmployees}</div>
              <div style="font-size: 14px; color: #666;">On Leave</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Full Name</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Phone Number</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Email</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Position</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Salary</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Joining Date</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Status</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Department</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Address</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => `
                <tr>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; font-weight: bold;">${emp.name || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.phone || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.email || 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.position || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">Rs. ${emp.salary ? emp.salary.toLocaleString() : 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.joiningDate ? dayjs(emp.joiningDate).format('DD/MM/YYYY') : 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">
                    <span style="color: ${emp.status === 'active' ? '#52c41a' : emp.status === 'inactive' ? '#ff4d4f' : '#faad14'}; font-weight: bold;">
                      ${(emp.status || 'active').toUpperCase()}
                    </span>
                  </td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.department || 'Construction'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px;">${emp.address || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${employees.some(emp => emp.emergencyContact?.name || emp.duties?.length > 0) ? `
          <div style="margin-top: 30px;">
            <h3 style="color: #2e7d32; font-size: 18px; margin-bottom: 20px; text-align: center; border-bottom: 2px solid #2e7d32; padding-bottom: 10px;">Additional Employee Information</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Employee Name</th>
                  <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Emergency Contact</th>
                  <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Contact Phone</th>
                  <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Relationship</th>
                  <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Assigned Duties</th>
                </tr>
              </thead>
              <tbody>
                ${employees.filter(emp => emp.emergencyContact?.name || emp.duties?.length > 0).map(emp => `
                  <tr>
                    <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; font-weight: bold;">${emp.name || ''}</td>
                    <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.emergencyContact?.name || 'N/A'}</td>
                    <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.emergencyContact?.phone || 'N/A'}</td>
                    <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.emergencyContact?.relationship || 'N/A'}</td>
                    <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px;">${(emp.duties || []).join(', ') || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div style="margin-top: 35px; display: flex; justify-content: space-between;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                HR Manager Signature
              </div>
            </div>
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Admin Signature
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall for one page, split into multiple pages
      if (imgHeight > (pdfHeight - 20)) {
        const pageHeight = pdfHeight - 20; // Available height per page
        let yOffset = 0;
        let pageNumber = 1;
        
        while (yOffset < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          // Calculate the portion of image to show on this page
          const sourceY = (yOffset * canvas.height) / imgHeight;
          const sourceHeight = Math.min((pageHeight * canvas.height) / imgHeight, canvas.height - sourceY);
          
          // Create a temporary canvas for this page portion
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          // Draw the portion of the original canvas
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          // Add this portion to the PDF
          const pageImgData = pageCanvas.toDataURL('image/png');
          const actualPageHeight = (sourceHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, actualPageHeight);
          
          yOffset += pageHeight;
          pageNumber++;
        }
      } else {
        // Content fits on one page
        const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      // Save the PDF
      const fileName = `Employee_Details_Report_${dayjs().format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success('Employee details PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

  // Customer PDF Export
  const exportCustomersAsPDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      
      
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
          <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
            <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
            <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px;">
            <div style="color: #2e7d32; font-size: 20px;">Customer Details Report</div>
            <div>Date: ${dayjs().format('DD/MM/YYYY')}</div>
          </div>


          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Name</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Phone</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Email</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Address</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(cust => `
                <tr>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; font-weight: bold;">${cust.name || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${cust.phone || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${cust.email || 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${cust.address || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 35px; display: flex; justify-content: flex-end;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Admin Signature
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall for one page, split into multiple pages
      if (imgHeight > (pdfHeight - 20)) {
        const pageHeight = pdfHeight - 20; // Available height per page
        let yOffset = 0;
        let pageNumber = 1;
        
        while (yOffset < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          // Calculate the portion of image to show on this page
          const sourceY = (yOffset * canvas.height) / imgHeight;
          const sourceHeight = Math.min((pageHeight * canvas.height) / imgHeight, canvas.height - sourceY);
          
          // Create a temporary canvas for this page portion
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          // Draw the portion of the original canvas
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          // Add this portion to the PDF
          const pageImgData = pageCanvas.toDataURL('image/png');
          const actualPageHeight = (sourceHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, actualPageHeight);
          
          yOffset += pageHeight;
          pageNumber++;
        }
      } else {
        // Content fits on one page
        const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      // Save the PDF
      const fileName = `Customer_Details_Report_${dayjs().format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success('Customer details PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

  // Items PDF Export
  const exportItemsAsPDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      
      const totalItems = items.length;
      const activeItems = items.filter(item => item.status === 'active').length;
      const inactiveItems = items.filter(item => item.status === 'inactive').length;
      const categories = [...new Set(items.map(item => item.category))];
      const totalValue = items.reduce((sum, item) => sum + (item.pricePerUnit || 0), 0);
      
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
          <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
            <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
            <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px;">
            <div style="color: #2e7d32; font-size: 20px;">Items Catalog Report</div>
            <div>Date: ${dayjs().format('DD/MM/YYYY')}</div>
          </div>

          <div style="display: flex; justify-content: space-around; margin-bottom: 25px; background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">${totalItems}</div>
              <div style="font-size: 14px; color: #666;">Total Items</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #52c41a;">${activeItems}</div>
              <div style="font-size: 14px; color: #666;">Active</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #ff4d4f;">${inactiveItems}</div>
              <div style="font-size: 14px; color: #666;">Inactive</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #1890ff;">${categories.length}</div>
              <div style="font-size: 14px; color: #666;">Categories</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Item Name</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Category</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Unit</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Price per Unit</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Description</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Status</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 12px; font-weight: bold;">${item.name || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 12px;">${item.category || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 12px;">${item.unit || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 12px; font-weight: bold; color: #2e7d32;">Rs. ${(item.pricePerUnit || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${item.description || 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 12px;">
                    <span style="color: ${item.status === 'active' ? '#52c41a' : '#ff4d4f'}; font-weight: bold;">
                      ${(item.status || 'active').toUpperCase()}
                    </span>
                  </td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 12px;">${item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY') : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 35px; display: flex; justify-content: space-between;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Inventory Manager Signature
              </div>
            </div>
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Admin Signature
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall for one page, split into multiple pages
      if (imgHeight > (pdfHeight - 20)) {
        const pageHeight = pdfHeight - 20; // Available height per page
        let yOffset = 0;
        let pageNumber = 1;
        
        while (yOffset < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          // Calculate the portion of image to show on this page
          const sourceY = (yOffset * canvas.height) / imgHeight;
          const sourceHeight = Math.min((pageHeight * canvas.height) / imgHeight, canvas.height - sourceY);
          
          // Create a temporary canvas for this page portion
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          // Draw the portion of the original canvas
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          // Add this portion to the PDF
          const pageImgData = pageCanvas.toDataURL('image/png');
          const actualPageHeight = (sourceHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, actualPageHeight);
          
          yOffset += pageHeight;
          pageNumber++;
        }
      } else {
        // Content fits on one page
        const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      // Save the PDF
      const fileName = `Items_Catalog_Report_${dayjs().format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success('Items catalog PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

  // Credit Management PDF Export
  const exportCreditManagementAsPDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      
      const totalPendingCredit = creditOverview.reduce((sum, customer) => sum + (customer.remainingCredit || 0), 0);
      const totalCreditGiven = creditOverview.reduce((sum, customer) => sum + (customer.totalCredit || 0), 0);
      const totalPaid = creditOverview.reduce((sum, customer) => sum + (customer.totalPaid || 0), 0);
      const customersWithCredit = creditOverview.length;
      
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
          <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
            <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
            <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px;">
            <div style="color: #2e7d32; font-size: 20px;">Credit Management Report</div>
            <div>Date: ${dayjs().format('DD/MM/YYYY')}</div>
          </div>

          <div style="display: flex; justify-content: space-around; margin-bottom: 25px; background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #cf1322;">Rs. ${totalPendingCredit.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Pending Credit</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #2e7d32;">${customersWithCredit}</div>
              <div style="font-size: 12px; color: #666;">Customers with Credit</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #1890ff;">Rs. ${totalCreditGiven.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Credit Given</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #3f8600;">Rs. ${totalPaid.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Paid</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Customer Name</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Phone</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Total Credit</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Total Paid</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Remaining Credit</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Total Deliveries</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Status</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Last Payment</th>
              </tr>
            </thead>
            <tbody>
              ${creditOverview.map(credit => `
                <tr>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; font-weight: bold;">${credit.customerName || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${credit.customerPhone || 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #1890ff; font-weight: bold;">Rs. ${(credit.totalCredit || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #3f8600; font-weight: bold;">Rs. ${(credit.totalPaid || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #cf1322; font-weight: bold;">Rs. ${(credit.remainingCredit || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${credit.totalDeliveries || 0}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">
                    <span style="color: ${credit.creditStatus === 'pending' ? '#cf1322' : '#faad14'}; font-weight: bold;">
                      ${(credit.creditStatus || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${credit.lastPayment ? dayjs(credit.lastPayment).format('DD/MM/YYYY') : 'No payments'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 35px; display: flex; justify-content: flex-end;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Admin Signature
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall for one page, split into multiple pages
      if (imgHeight > (pdfHeight - 20)) {
        const pageHeight = pdfHeight - 20; // Available height per page
        let yOffset = 0;
        let pageNumber = 1;
        
        while (yOffset < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          // Calculate the portion of image to show on this page
          const sourceY = (yOffset * canvas.height) / imgHeight;
          const sourceHeight = Math.min((pageHeight * canvas.height) / imgHeight, canvas.height - sourceY);
          
          // Create a temporary canvas for this page portion
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          // Draw the portion of the original canvas
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          // Add this portion to the PDF
          const pageImgData = pageCanvas.toDataURL('image/png');
          const actualPageHeight = (sourceHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, actualPageHeight);
          
          yOffset += pageHeight;
          pageNumber++;
        }
      } else {
        // Content fits on one page
        const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      // Save the PDF
      const fileName = `Credit_Management_Report_${dayjs().format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success('Credit management PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

  // Export All Vehicle Logs History PDF
  const exportAllVehicleLogsAsPDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      
      const totalLogs = vehicleLogs.length;
      const totalRevenue = vehicleLogs.reduce((sum, log) => sum + ((log.payments?.cash || 0) + (log.payments?.credit || 0)), 0);
      const totalExpenses = vehicleLogs.reduce((sum, log) => sum + (log.expenses || []).reduce((expSum, exp) => expSum + (exp.amount || 0), 0), 0);
      const uniqueVehicles = [...new Set(vehicleLogs.map(log => log.vehicleNumber))].length;
      const uniqueEmployees = [...new Set(vehicleLogs.map(log => log.employeeId))].length;
      
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
          <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
            <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
            <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px;">
            <div style="color: #2e7d32; font-size: 20px;">Complete Vehicle Logs History</div>
            <div>Date: ${dayjs().format('DD/MM/YYYY')}</div>
          </div>

          <div style="display: flex; justify-content: space-around; margin-bottom: 25px; background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #2e7d32;">${totalLogs}</div>
              <div style="font-size: 12px; color: #666;">Total Logs</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #1890ff;">${uniqueVehicles}</div>
              <div style="font-size: 12px; color: #666;">Vehicles</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #722ed1;">${uniqueEmployees}</div>
              <div style="font-size: 12px; color: #666;">Employees</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #52c41a;">Rs. ${totalRevenue.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Revenue</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #ff4d4f;">Rs. ${totalExpenses.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Expenses</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Date</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Vehicle</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Employee</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">From</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">To</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Items</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Customer</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Cash</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Credit</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${vehicleLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).map(log => `
                <tr>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${dayjs(log.date).format('DD/MM/YYYY')}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; font-weight: bold;">${log.vehicleNumber || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 10px;">
                    <div style="font-weight: bold;">${log.employeeName || ''}</div>
                    <div style="color: #666;">${log.employeeId || ''}</div>
                  </td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${log.startPlace || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${log.endPlace || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 10px;">${(log.itemsLoading || []).join(', ') || 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${log.customerName || 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; color: #52c41a; font-weight: bold;">Rs. ${(log.payments?.cash || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; color: #1890ff; font-weight: bold;">Rs. ${(log.payments?.credit || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; color: #2e7d32; font-weight: bold;">Rs. ${((log.payments?.cash || 0) + (log.payments?.credit || 0)).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 35px; display: flex; justify-content: flex-end;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Admin Signature
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall for one page, split into multiple pages
      if (imgHeight > (pdfHeight - 20)) {
        const pageHeight = pdfHeight - 20; // Available height per page
        let yOffset = 0;
        let pageNumber = 1;
        
        while (yOffset < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          // Calculate the portion of image to show on this page
          const sourceY = (yOffset * canvas.height) / imgHeight;
          const sourceHeight = Math.min((pageHeight * canvas.height) / imgHeight, canvas.height - sourceY);
          
          // Create a temporary canvas for this page portion
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          // Draw the portion of the original canvas
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          // Add this portion to the PDF
          const pageImgData = pageCanvas.toDataURL('image/png');
          const actualPageHeight = (sourceHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, actualPageHeight);
          
          yOffset += pageHeight;
          pageNumber++;
        }
      } else {
        // Content fits on one page
        const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      // Save the PDF
      const fileName = `All_Vehicle_Logs_History_${dayjs().format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success('All vehicle logs history PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

  // Export Fuel Management PDF
  const exportFuelManagementAsPDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      
      const totalFuelLogs = fuelLogs.length;
      const totalFuelAmount = fuelLogs.reduce((sum, log) => sum + (log.fuelAmount || 0), 0);
      const totalFuelCost = fuelLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
      const totalPaidByEmployee = fuelLogs.reduce((sum, log) => sum + (log.paidAmount || 0), 0);
      const totalOverallPaid = fuelLogs.reduce((sum, log) => sum + (log.overallPaidAmount || 0), 0);
      const totalPending = fuelLogs.reduce((sum, log) => sum + (log.remainingAmount || 0), 0);
      const uniqueVehicles = [...new Set(fuelLogs.map(log => log.vehicleNumber))].length;
      const uniqueEmployees = [...new Set(fuelLogs.map(log => log.employeeId))].length;
      
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
          <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
            <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
            <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px;">
            <div style="color: #2e7d32; font-size: 20px;">Fuel Management Report</div>
            <div>Date: ${dayjs().format('DD/MM/YYYY')}</div>
          </div>

          <div style="display: flex; justify-content: space-around; margin-bottom: 25px; background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #2e7d32;">${totalFuelLogs}</div>
              <div style="font-size: 12px; color: #666;">Total Logs</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #1890ff;">${uniqueVehicles}</div>
              <div style="font-size: 12px; color: #666;">Vehicles</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #722ed1;">${uniqueEmployees}</div>
              <div style="font-size: 12px; color: #666;">Employees</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #52c41a;">${totalFuelAmount.toLocaleString()}L</div>
              <div style="font-size: 12px; color: #666;">Total Fuel</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #ff4d4f;">Rs. ${totalFuelCost.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Cost</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #fa8c16;">Rs. ${totalPending.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Pending</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Date</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Vehicle</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Employee</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Fuel Amount</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Price/L</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Total Cost</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Paid by Employee</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Overall Paid</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${fuelLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).map(log => `
                <tr>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${dayjs(log.date).format('DD/MM/YYYY')}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; font-weight: bold;">${log.vehicleNumber || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 10px;">
                    <div style="font-weight: bold;">${log.employeeName || ''}</div>
                    <div style="color: #666;">${log.employeeId || ''}</div>
                  </td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; font-weight: bold;">${(log.fuelAmount || 0).toLocaleString()}L</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">Rs. ${(log.fuelPrice || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; color: #2e7d32; font-weight: bold;">Rs. ${(log.totalCost || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; color: #52c41a; font-weight: bold;">Rs. ${(log.paidAmount || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; color: #1890ff; font-weight: bold;">Rs. ${(log.overallPaidAmount || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">
                    <span style="
                      padding: 4px 8px; 
                      border-radius: 4px; 
                      font-size: 10px; 
                      font-weight: bold;
                      color: white;
                      background-color: ${log.paymentStatus === 'paid' ? '#52c41a' : log.paymentStatus === 'partial' ? '#fa8c16' : '#ff4d4f'};
                    ">
                      ${(log.paymentStatus || 'pending').toUpperCase()}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 35px; display: flex; justify-content: flex-end;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Admin Signature
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall for one page, split into multiple pages
      if (imgHeight > (pdfHeight - 20)) {
        const pageHeight = pdfHeight - 20; // Available height per page
        let yOffset = 0;
        let pageNumber = 1;
        
        while (yOffset < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          // Calculate the portion of image to show on this page
          const sourceY = (yOffset * canvas.height) / imgHeight;
          const sourceHeight = Math.min((pageHeight * canvas.height) / imgHeight, canvas.height - sourceY);
          
          // Create a temporary canvas for this page portion
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          // Draw the portion of the original canvas
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          // Add this portion to the PDF
          const pageImgData = pageCanvas.toDataURL('image/png');
          const actualPageHeight = (sourceHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, actualPageHeight);
          
          yOffset += pageHeight;
          pageNumber++;
        }
      } else {
        // Content fits on one page
        const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      // Save the PDF
      const fileName = `Fuel_Management_Report_${dayjs().format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success('Fuel management PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

  // Export Date-wise Vehicle Logs PDF
  const exportDateWiseVehicleLogsAsPDF = async (selectedDate) => {
    try {
      // Filter vehicle logs for the selected date
      const dateLogs = vehicleLogs.filter(log => {
        const logDate = dayjs(log.date).format('YYYY-MM-DD');
        const targetDate = dayjs(selectedDate).format('YYYY-MM-DD');
        return logDate === targetDate;
      });

      if (dateLogs.length === 0) {
        message.warning('No vehicle logs found for the selected date.');
        return;
      }

      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      
      const totalLogs = dateLogs.length;
      const totalRevenue = dateLogs.reduce((sum, log) => sum + ((log.payments?.cash || 0) + (log.payments?.credit || 0)), 0);
      const totalExpenses = dateLogs.reduce((sum, log) => sum + (log.expenses || []).reduce((expSum, exp) => expSum + (exp.amount || 0), 0), 0);
      const uniqueVehicles = [...new Set(dateLogs.map(log => log.vehicleNumber))].length;
      const uniqueEmployees = [...new Set(dateLogs.map(log => log.employeeId))].length;
      
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
          <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
            <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
            <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px;">
            <div style="color: #2e7d32; font-size: 20px;">Vehicle Logs Report - ${dayjs(selectedDate).format('DD/MM/YYYY')}</div>
            <div>Generated: ${dayjs().format('DD/MM/YYYY HH:mm')}</div>
          </div>

          <div style="display: flex; justify-content: space-around; margin-bottom: 25px; background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #2e7d32;">${totalLogs}</div>
              <div style="font-size: 12px; color: #666;">Total Logs</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #1890ff;">${uniqueVehicles}</div>
              <div style="font-size: 12px; color: #666;">Vehicles</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #722ed1;">${uniqueEmployees}</div>
              <div style="font-size: 12px; color: #666;">Employees</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #52c41a;">Rs. ${totalRevenue.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Revenue</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #ff4d4f;">Rs. ${totalExpenses.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Expenses</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Time</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Vehicle</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Employee</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">From</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">To</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Items</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Customer</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Cash</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Credit</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${dateLogs.sort((a, b) => new Date(a.date) - new Date(b.date)).map(log => `
                <tr>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${dayjs(log.date).format('HH:mm')}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; font-weight: bold;">${log.vehicleNumber || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 10px;">
                    <div style="font-weight: bold;">${log.employeeName || ''}</div>
                    <div style="color: #666;">${log.employeeId || ''}</div>
                  </td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${log.startPlace || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${log.endPlace || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 10px;">${(log.itemsLoading || []).join(', ') || 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${log.customerName || 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; color: #52c41a; font-weight: bold;">Rs. ${(log.payments?.cash || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; color: #1890ff; font-weight: bold;">Rs. ${(log.payments?.credit || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; color: #2e7d32; font-weight: bold;">Rs. ${((log.payments?.cash || 0) + (log.payments?.credit || 0)).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 35px; display: flex; justify-content: flex-end;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Admin Signature
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall for one page, split into multiple pages
      if (imgHeight > (pdfHeight - 20)) {
        const pageHeight = pdfHeight - 20; // Available height per page
        let yOffset = 0;
        let pageNumber = 1;
        
        while (yOffset < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          // Calculate the portion of image to show on this page
          const sourceY = (yOffset * canvas.height) / imgHeight;
          const sourceHeight = Math.min((pageHeight * canvas.height) / imgHeight, canvas.height - sourceY);
          
          // Create a temporary canvas for this page portion
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          // Draw the portion of the original canvas
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          // Add this portion to the PDF
          const pageImgData = pageCanvas.toDataURL('image/png');
          const actualPageHeight = (sourceHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, actualPageHeight);
          
          yOffset += pageHeight;
          pageNumber++;
        }
      } else {
        // Content fits on one page
        const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      // Save the PDF
      const fileName = `Vehicle_Logs_${dayjs(selectedDate).format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success(`Vehicle logs PDF for ${dayjs(selectedDate).format('DD/MM/YYYY')} exported successfully!`);
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

  // Export Shed Wallet PDF
  const exportShedWalletAsPDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      
      const totalTransactions = shedTransactions.length;
      const totalSent = shedTransactions.filter(t => t.type === 'payment_sent').reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalReceived = shedTransactions.filter(t => t.type === 'payment_received').reduce((sum, t) => sum + (t.amount || 0), 0);
      const currentBalance = shedWallet?.currentBalance || 0;
      const pendingAmount = pendingDetails?.totalPendingAmount || 0;
      const fuelPending = pendingDetails?.totalPendingFuel || 0;
      const setCashPending = pendingDetails?.totalSetCashTaken || 0;
      
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
          <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
            <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
            <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px;">
            <div style="color: #2e7d32; font-size: 20px;">Shed Wallet Report</div>
            <div>Date: ${dayjs().format('DD/MM/YYYY')}</div>
          </div>

          <div style="display: flex; justify-content: space-around; margin-bottom: 25px; background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #2e7d32;">${totalTransactions}</div>
              <div style="font-size: 12px; color: #666;">Total Transactions</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #52c41a;">Rs. ${currentBalance.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Current Balance</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #1890ff;">Rs. ${totalReceived.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Received</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #ff4d4f;">Rs. ${totalSent.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Sent</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #fa8c16;">Rs. ${pendingAmount.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Pending Amount</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-around; margin-bottom: 25px; background-color: #e6f7ff; padding: 15px; border-radius: 8px; border: 1px solid #91d5ff;">
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: bold; color: #ff4d4f;">Rs. ${fuelPending.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Fuel Pending</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: bold; color: #fa8c16;">Rs. ${setCashPending.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Set Cash Pending</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Date</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Type</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Amount</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Description</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Payment Method</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Status</th>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 12px; color: #2e7d32; font-weight: bold; background-color: white;">Processed By</th>
              </tr>
            </thead>
            <tbody>
              ${shedTransactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)).map(transaction => `
                <tr>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${dayjs(transaction.transactionDate).format('DD/MM/YYYY HH:mm')}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">
                    <span style="
                      padding: 4px 8px; 
                      border-radius: 4px; 
                      font-size: 10px; 
                      font-weight: bold;
                      color: white;
                      background-color: ${transaction.type === 'payment_sent' ? '#ff4d4f' : 
                                       transaction.type === 'payment_received' ? '#52c41a' : 
                                       transaction.type === 'fuel_purchase' ? '#1890ff' : '#fa8c16'};
                    ">
                      ${(transaction.type || '').replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px; font-weight: bold; color: ${transaction.amount > 0 ? '#52c41a' : '#ff4d4f'};">Rs. ${(transaction.amount || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${transaction.description || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">
                    <span style="
                      padding: 2px 6px; 
                      border-radius: 3px; 
                      font-size: 9px; 
                      font-weight: bold;
                      color: white;
                      background-color: ${transaction.paymentMethod === 'cash' ? '#52c41a' : 
                                       transaction.paymentMethod === 'transfer' ? '#1890ff' : 
                                       transaction.paymentMethod === 'cheque' ? '#fa8c16' : '#666'};
                    ">
                      ${(transaction.paymentMethod || 'cash').toUpperCase()}
                    </span>
                  </td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">
                    <span style="
                      padding: 2px 6px; 
                      border-radius: 3px; 
                      font-size: 9px; 
                      font-weight: bold;
                      color: white;
                      background-color: ${transaction.status === 'completed' ? '#52c41a' : 
                                       transaction.status === 'pending' ? '#fa8c16' : '#ff4d4f'};
                    ">
                      ${(transaction.status || 'completed').toUpperCase()}
                    </span>
                  </td>
                  <td style="border: 1px solid #2e7d32; padding: 8px; text-align: center; font-size: 11px;">${transaction.processedBy || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 35px; display: flex; justify-content: flex-end;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Admin Signature
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall for one page, split into multiple pages
      if (imgHeight > (pdfHeight - 20)) {
        const pageHeight = pdfHeight - 20; // Available height per page
        let yOffset = 0;
        let pageNumber = 1;
        
        while (yOffset < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          // Calculate the portion of image to show on this page
          const sourceY = (yOffset * canvas.height) / imgHeight;
          const sourceHeight = Math.min((pageHeight * canvas.height) / imgHeight, canvas.height - sourceY);
          
          // Create a temporary canvas for this page portion
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          // Draw the portion of the original canvas
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          // Add this portion to the PDF
          const pageImgData = pageCanvas.toDataURL('image/png');
          const actualPageHeight = (sourceHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, actualPageHeight);
          
          yOffset += pageHeight;
          pageNumber++;
        }
      } else {
        // Content fits on one page
        const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      // Save the PDF
      const fileName = `Shed_Wallet_Report_${dayjs().format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success('Shed wallet PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

  // Export All Employee Wallet Details PDF
  const exportAllEmployeeWalletsAsPDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      
      const totalEmployees = employees.length;
      const totalPendingSalary = employees.reduce((sum, emp) => sum + (emp.pendingSalary || 0), 0);
      const totalYesterdayBalance = employees.reduce((sum, emp) => sum + (emp.yesterdayBalance || 0), 0);
      const employeesWithPendingSalary = employees.filter(emp => (emp.pendingSalary || 0) > 0).length;
      
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
          <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
            <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
            <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px;">
            <div style="color: #2e7d32; font-size: 20px;">Employee Wallet Details Report</div>
            <div>Date: ${dayjs().format('DD/MM/YYYY')}</div>
          </div>

          <div style="display: flex; justify-content: space-around; margin-bottom: 25px; background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">${totalEmployees}</div>
              <div style="font-size: 14px; color: #666;">Total Employees</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #1890ff;">${employeesWithPendingSalary}</div>
              <div style="font-size: 14px; color: #666;">With Pending Salary</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #faad14;">Rs. ${totalPendingSalary.toLocaleString()}</div>
              <div style="font-size: 14px; color: #666;">Total Pending Salary</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #2e7d32;">Rs. ${totalYesterdayBalance.toLocaleString()}</div>
              <div style="font-size: 14px; color: #666;">Total Yesterday Balance</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Employee ID</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Name</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Position</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Phone</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Pending Salary</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 14px; color: #2e7d32; font-weight: bold; background-color: white;">Yesterday Balance</th>
              </tr>
            </thead>
            <tbody>
              ${employees.sort((a, b) => (b.pendingSalary || 0) - (a.pendingSalary || 0)).map(emp => `
                <tr>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.employeeId || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; font-weight: bold;">${emp.name || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.position || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${emp.phone || ''}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: ${(emp.pendingSalary || 0) > 0 ? '#faad14' : '#666'}; font-weight: bold;">Rs. ${(emp.pendingSalary || 0).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold;">Rs. ${(emp.yesterdayBalance || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 35px; display: flex; justify-content: flex-end;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Admin Signature
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall for one page, split into multiple pages
      if (imgHeight > (pdfHeight - 20)) {
        const pageHeight = pdfHeight - 20; // Available height per page
        let yOffset = 0;
        let pageNumber = 1;
        
        while (yOffset < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          // Calculate the portion of image to show on this page
          const sourceY = (yOffset * canvas.height) / imgHeight;
          const sourceHeight = Math.min((pageHeight * canvas.height) / imgHeight, canvas.height - sourceY);
          
          // Create a temporary canvas for this page portion
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          // Draw the portion of the original canvas
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          // Add this portion to the PDF
          const pageImgData = pageCanvas.toDataURL('image/png');
          const actualPageHeight = (sourceHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, actualPageHeight);
          
          yOffset += pageHeight;
          pageNumber++;
        }
      } else {
        // Content fits on one page
        const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      // Save the PDF
      const fileName = `All_Employee_Wallets_${dayjs().format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success('All employee wallet details PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

  const exportSuppliersAsPDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
          <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
            <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
            <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #2e7d32; margin: 0;">Suppliers Report</h2>
            <p style="color: #666; margin: 5px 0;">Generated on: ${dayjs().format('DD/MM/YYYY HH:mm')}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: #f8f9fa;">Supplier Name</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: #f8f9fa;">Phone</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: #f8f9fa;">Items Supplied</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: #f8f9fa;">Pending Amount</th>
                <th style="border: 1px solid #2e7d32; padding: 12px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: #f8f9fa;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${suppliers.map(supplier => `
                <tr>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: left; font-size: 13px; font-weight: bold;">${supplier.name}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${supplier.phone || 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: left; font-size: 13px;">${(supplier.items || []).join(', ') || 'N/A'}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: right; font-size: 13px; font-weight: bold; color: ${Number(supplier.walletBalance || 0) < 0 ? '#ff4d4f' : '#52c41a'};">Rs. ${Math.abs(Number(supplier.walletBalance || 0)).toLocaleString()}</td>
                  <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; ${supplier.status === 'active' ? 'background-color: #f6ffed; color: #52c41a;' : 'background-color: #fff2e8; color: #fa8c16;'}">${supplier.status || 'active'}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 16px;">Summary</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong>Total Suppliers:</strong> ${suppliers.length}
              </div>
              <div>
                <strong>Active Suppliers:</strong> ${suppliers.filter(s => s.status === 'active' || !s.status).length}
              </div>
              <div>
                <strong>Total Pending Amount:</strong> Rs. ${suppliers.reduce((sum, s) => sum + Math.abs(Number(s.walletBalance || 0)), 0).toLocaleString()}
              </div>
              <div>
                <strong>Suppliers with Pending:</strong> ${suppliers.filter(s => Number(s.walletBalance || 0) < 0).length}
              </div>
            </div>
          </div>

          <div style="margin-top: 35px; display: flex; justify-content: flex-end;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Supervisor Signature
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image vertically if it's smaller than page height
      const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
      
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      
      // Save the PDF
      const fileName = `Suppliers_Report_${dayjs().format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success('Suppliers PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

  const exportVehicleLogAsPDF = async (log) => {
    try {
      const expenses = (log.expenses || []).filter(exp => 
        !exp.description.toLowerCase().includes('salary')
      );
      const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const salary = (log.salary || []);
      const totalSalary = salary.reduce((sum, sal) => sum + (sal.amount || 0), 0);

      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1200px'; // Landscape width
      tempDiv.innerHTML = `
         <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.3; padding: 20px;">
           <div style="text-align: center; background-color: #2e7d32; color: white; padding: 18px; margin-bottom: 25px;">
             <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">A.K.R & SON'S Construction & Suppliers</div>
             <div style="font-size: 16px; margin-bottom: 4px;">Main street, Murunkan, Mannar</div>
             <div style="font-size: 14px;">024 222 6899 / 077 311 1266 / 077 364 6999</div>
           </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; font-size: 16px;">
              <div>Vehicle No: ${log.vehicleNumber}</div>
              <div style="text-align: center;">
                <div style="color: #2e7d32; font-size: 18px; margin-bottom: 5px;">Log for Employee: ${log.employeeName}</div>
                <div style="color: #666; font-size: 14px;">(${log.employeeId})</div>
              </div>
              <div>Date: ${dayjs(log.date).format('DD/MM/YYYY')}</div>
            </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Employee</th>
                 <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">From</th>
                 <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">To</th>
                 <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Item</th>
                 <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Start(km)</th>
                 <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">End(km)</th>
                 <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Customer</th>
                 <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Cash</th>
                 <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Credit</th>
                 <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Yesterday Balance</th>
                 <th style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold; background-color: white;">Set</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${log.employeeName}</td>
                 <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${log.startPlace || ''}</td>
                 <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${log.endPlace || ''}</td>
                 <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${(log.itemsLoading || []).join(', ')}</td>
                 <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${log.startMeter || 0}</td>
                 <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${log.endMeter || 0}</td>
                 <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">${log.customerName || ''}</td>
                 <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">Rs. ${Number(log.payments?.cash || 0).toLocaleString()}</td>
                 <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">Rs. ${Number(log.payments?.credit || 0).toLocaleString()}</td>
                 <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">Rs. ${Number(log.yesterdayBalance || 0).toLocaleString()}</td>
                 <td style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;">Rs. ${Number(log.setCashTaken || 0).toLocaleString()}</td>
              </tr>
              ${(Number(log.payments?.cash || 0) + Number(log.setCashTaken || 0) + Number(log.yesterdayBalance || 0)) > 0 ? `
              <tr style="background-color: #f0f0f0; font-weight: bold;">
                <td colspan="7" style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;"><strong>Total</strong></td>
                <td colspan="4" style="border: 1px solid #2e7d32; padding: 10px; text-align: center; font-size: 13px;"><strong>Rs. ${(Number(log.payments?.cash || 0) + Number(log.setCashTaken || 0) + Number(log.yesterdayBalance || 0)).toLocaleString()}</strong></td>
              </tr>
              ` : ''}
            </tbody>
          </table>

           <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
             ${salary.length > 0 ? `
             <div style="border: 1px solid #2e7d32;">
               <div style="background-color: white; color: #2e7d32; text-align: center; font-weight: bold; padding: 12px; border-bottom: 1px solid #2e7d32; font-size: 15px;">Salary</div>
               <table style="width: 100%; border-collapse: collapse;">
                 <thead>
                   <tr>
                     <th style="background-color: white; color: #2e7d32; font-weight: bold; padding: 10px; border: 1px solid #2e7d32; text-align: center; font-size: 13px;">Item</th>
                     <th style="background-color: white; color: #2e7d32; font-weight: bold; padding: 10px; border: 1px solid #2e7d32; text-align: center; font-size: 13px;">Amount</th>
                   </tr>
                 </thead>
                 <tbody>
                   ${salary.map(sal => `
                     <tr>
                       <td style="padding: 10px; border: 1px solid #2e7d32; text-align: left; font-size: 13px;">${sal.item}</td>
                       <td style="padding: 10px; border: 1px solid #2e7d32; text-align: right; font-size: 13px;">Rs. ${Number(sal.amount || 0).toLocaleString()}</td>
                     </tr>
                   `).join('')}
                   ${totalSalary > 0 ? `
                   <tr style="background-color: #f0f0f0; font-weight: bold;">
                     <td style="padding: 10px; border: 1px solid #2e7d32; text-align: left; font-size: 13px;"><strong>Total</strong></td>
                     <td style="padding: 10px; border: 1px solid #2e7d32; text-align: right; font-size: 13px;"><strong>Rs. ${totalSalary.toLocaleString()}</strong></td>
                   </tr>
                   ` : ''}
                 </tbody>
               </table>
               ${totalSalary > 0 ? `
               <div style="padding: 12px; text-align: center; font-weight: bold; background-color: #f0f0f0; color: #2e7d32; font-size: 13px;">
                 ${log.salaryDeductedFromBalance && log.salaryDeductedFromBalance > 0 ? 'Deducted from Balance' : 'Added to Pending Salary'}
               </div>
               ` : ''}
             </div>
             ` : ''}
             
             <div style="border: 1px solid #2e7d32;">
               <div style="background-color: white; color: #2e7d32; text-align: center; font-weight: bold; padding: 12px; border-bottom: 1px solid #2e7d32; font-size: 15px;">Expenses</div>
               <table style="width: 100%; border-collapse: collapse;">
                 <thead>
                   <tr>
                     <th style="background-color: white; color: #2e7d32; font-weight: bold; padding: 10px; border: 1px solid #2e7d32; text-align: center; font-size: 13px;">Expenses</th>
                     <th style="background-color: white; color: #2e7d32; font-weight: bold; padding: 10px; border: 1px solid #2e7d32; text-align: center; font-size: 13px;">Cost</th>
                   </tr>
                 </thead>
                 <tbody>
                   ${expenses.length > 0 ? expenses.map(exp => `
                     <tr>
                       <td style="padding: 10px; border: 1px solid #2e7d32; text-align: left; font-size: 13px;">${exp.description}</td>
                       <td style="padding: 10px; border: 1px solid #2e7d32; text-align: right; font-size: 13px;">Rs. ${Number(exp.amount || 0).toLocaleString()}</td>
                     </tr>
                   `).join('') : '<tr><td colspan="2" style="padding: 10px; border: 1px solid #2e7d32; text-align: center; color: #666; font-size: 13px;">No expenses recorded</td></tr>'}
                   ${expenses.length > 0 && totalExpenses > 0 ? `
                   <tr style="background-color: #f0f0f0; font-weight: bold;">
                     <td style="padding: 10px; border: 1px solid #2e7d32; text-align: left; font-size: 13px;"><strong>Total Expenses</strong></td>
                     <td style="padding: 10px; border: 1px solid #2e7d32; text-align: right; font-size: 13px;"><strong>Rs. ${totalExpenses.toLocaleString()}</strong></td>
                   </tr>
                   ` : ''}
                 </tbody>
               </table>
             </div>
           </div>

           ${log.supplier && log.supplier.supplierName ? `
           <div style="border: 1px solid #2e7d32; margin-bottom: 25px;">
             <div style="background-color: white; color: #2e7d32; text-align: center; font-weight: bold; padding: 12px; border-bottom: 1px solid #2e7d32; font-size: 15px;">Supplier Details</div>
             <div style="padding: 15px;">
               <div style="margin-bottom: 15px;">
                 <strong>Supplier:</strong> ${log.supplier.supplierName || 'N/A'}
               </div>
               ${log.supplier.suppliedItems && log.supplier.suppliedItems.length > 0 ? `
               <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                 <thead>
                   <tr>
                     <th style="background-color: #f8f9fa; color: #2e7d32; font-weight: bold; padding: 8px; border: 1px solid #2e7d32; text-align: center; font-size: 12px;">Item</th>
                     <th style="background-color: #f8f9fa; color: #2e7d32; font-weight: bold; padding: 8px; border: 1px solid #2e7d32; text-align: center; font-size: 12px;">Quantity</th>
                     <th style="background-color: #f8f9fa; color: #2e7d32; font-weight: bold; padding: 8px; border: 1px solid #2e7d32; text-align: center; font-size: 12px;">Unit Price</th>
                     <th style="background-color: #f8f9fa; color: #2e7d32; font-weight: bold; padding: 8px; border: 1px solid #2e7d32; text-align: center; font-size: 12px;">Total Amount</th>
                   </tr>
                 </thead>
                 <tbody>
                   ${log.supplier.suppliedItems.map(item => `
                     <tr>
                       <td style="padding: 8px; border: 1px solid #2e7d32; text-align: left; font-size: 12px;">${item.item || 'N/A'}</td>
                       <td style="padding: 8px; border: 1px solid #2e7d32; text-align: center; font-size: 12px;">${item.quantity || 0}</td>
                       <td style="padding: 8px; border: 1px solid #2e7d32; text-align: right; font-size: 12px;">Rs. ${Number(item.unitPrice || 0).toLocaleString()}</td>
                       <td style="padding: 8px; border: 1px solid #2e7d32; text-align: right; font-size: 12px;">Rs. ${Number(item.totalAmount || 0).toLocaleString()}</td>
                     </tr>
                   `).join('')}
                 </tbody>
               </table>
               ` : ''}
               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
                 <div><strong>Amount Payable:</strong> Rs. ${Number(log.supplier.amountPayable || 0).toLocaleString()}</div>
                 <div><strong>Amount Paid:</strong> Rs. ${Number(log.supplier.amountPaid || 0).toLocaleString()}</div>
               </div>
               ${log.supplier.paymentDescription ? `
               <div style="margin-bottom: 10px;">
                 <strong>Payment Description:</strong> ${log.supplier.paymentDescription}
               </div>
               ` : ''}
               <div style="margin-top: 10px;">
                 <strong>Payment Status:</strong> ${log.supplier.paymentStatus || 'pending'}
               </div>
             </div>
           </div>
           ` : ''}

          <div style="background-color: white; border: 1px solid #2e7d32; color: #2e7d32; padding: 15px; text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 25px;">
            Balance: Rs. ${(() => {
              const total = Number(log.payments?.cash || 0) + Number(log.setCashTaken || 0) + Number(log.yesterdayBalance || 0);
              const salaryDeducted = (log.salaryDeductedFromBalance && log.salaryDeductedFromBalance > 0) ? totalSalary : 0;
              return (total - totalExpenses - salaryDeducted).toLocaleString();
            })()}
          </div>

          <div style="margin-top: 35px; display: flex; justify-content: flex-end;">
            <div style="width: 220px; text-align: center; border: 1px solid #000; padding: 45px 15px 15px 15px;">
              <div style="margin-top: 25px; border-top: 1px solid #2e7d32; padding-top: 8px; color: #2e7d32; font-weight: bold; font-size: 14px;">
                Supervisor Signature
              </div>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(tempDiv);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
      const { jsPDF } = await import('https://cdn.skypack.dev/jspdf');

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for landscape A4 (297mm x 210mm)
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image vertically if it's smaller than page height
      const yPosition = imgHeight < (pdfHeight - 20) ? (pdfHeight - imgHeight) / 2 : 10;
      
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      
      // Save the PDF
      const fileName = `Vehicle_Log_${log.vehicleNumber}_${dayjs(log.date).format('DD-MM-YYYY')}.pdf`;
      pdf.save(fileName);
      
      message.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };



  const vehicleLogColumns = [
    
    {
      title: 'Vehicle Number',
      dataIndex: 'vehicleNumber',
      key: 'vehicleNumber',
      width: 120,
      render: (vehicleNumber) => (
        <Tag 
          style={{ cursor: 'pointer' }}
          onClick={() => handleViewVehicleHistory(vehicleNumber)}
        >
          {vehicleNumber}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 120,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.employeeId}</div>
        </div>
      ),
    },
    {
      title: 'Start Place',
      dataIndex: 'startPlace',
      key: 'startPlace',
      width: 120,
    },
    {
      title: 'End Place',
      dataIndex: 'endPlace',
      key: 'endPlace',
      width: 120,
    },
    {
      title: 'Items Loading',
      dataIndex: 'itemsLoading',
      key: 'itemsLoading',
      width: 150,
      render: (items) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {items?.map(item => (
            <Tag key={item} size="small" color="blue">{item}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: 'Payment Method',
      dataIndex: 'payments',
      key: 'paymentMethod',
      width: 120,
      render: (payments) => {
        const method = payments?.paymentMethod || 'cash';
        const color = method === 'cash' ? 'green' : method === 'credit' ? 'red' : 'orange';
        return <Tag color={color} size="small">{method.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Cash',
      dataIndex: 'payments',
      key: 'cash',
      width: 100,
      render: (payments) => `Rs. ${payments?.cash || 0}`,
    },
    {
      title: 'Credit',
      dataIndex: 'payments',
      key: 'credit',
      width: 100,
      render: (payments) => `Rs. ${payments?.credit || 0}`,
    },
    {
      title: 'Total Payment',
      dataIndex: 'payments',
      key: 'totalPayment',
      width: 120,
      render: (payments) => `Rs. ${payments?.total || 0}`,
    },
    {
      title: 'Set Cash',
      dataIndex: 'setCashTaken',
      key: 'setCashTaken',
      width: 100,
      render: (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`,
    },
    {
      title: 'Expenses',
      dataIndex: 'expenses',
      key: 'expenses',
      width: 120,
      render: (expenses) => {
        const total = (expenses || []).reduce((sum, exp) => {
          // Exclude salary from expenses
          if (exp.description && exp.description.toLowerCase().includes('salary')) {
            return sum;
          }
          return sum + (exp.amount || 0);
        }, 0);
        return `Rs. ${total.toLocaleString()}`;
      },
    },
    {
      title: 'Yesterday Balance',
      dataIndex: 'yesterdayBalance',
      key: 'yesterdayBalance',
      width: 120,
      render: (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`,
    },
    
    

    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button 
            type="default" 
            size="small" 
            icon={<DownloadOutlined />}
            onClick={() => exportVehicleLogAsPDF(record)}
            title="Export as PDF"
          />
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditLog(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this log?"
            onConfirm={() => handleDeleteLog(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const employeeColumns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 120,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      width: 120,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    
    {
      title: 'Duties',
      dataIndex: 'duties',
      key: 'duties',
      width: 200,
      render: (duties) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {duties?.map(duty => (
            <Tag key={duty} size="small">{duty}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<HistoryOutlined />}
            onClick={() => handleViewEmployeeHistory(record)}
          />
          <Button 
            type="default" 
            size="small" 
            icon={<DollarOutlined />}
            onClick={() => handleViewWallet(record)}
            title="View Wallet"
          />
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditEmployee(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this employee?"
            onConfirm={() => handleDeleteEmployee(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderDashboard = () => (
    <div>
      {/* Vehicles Section */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Vehicles</span>
            <span style={{ 
              background: '#f0f9ff', 
              color: '#1890ff', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: '500' 
            }}>
              {(vehicles || []).length}
            </span>
          </div>
        }
        style={{ marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {(vehicles || []).map(v => {
            const vn = typeof v === 'string' ? v : v?.vehicleNumber;
            if (!vn) return null;
            return (
              <div
                key={vn}
                onClick={() => handleViewVehicleHistory(vn)}
                style={{ 
                  cursor: 'pointer', 
                  border: '2px solid #e6f7ff', 
                  borderRadius: '12px', 
                  padding: '16px 20px', 
                  minWidth: '180px', 
                  textAlign: 'center', 
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1890ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e6f7ff';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '16px', 
                  color: '#1890ff',
                  marginBottom: '4px'
                }}>
                  {vn}
                </div>
                <div style={{ 
                  color: '#8c8c8c', 
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Click to view history
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Modal
        title={selectedSupplierForWallet ? `Supplier Wallet • ${selectedSupplierForWallet.name}` : 'Supplier Wallet'}
        open={supplierWalletVisible}
        onCancel={() => setSupplierWalletVisible(false)}
        footer={null}
        width={500}
      >
        {selectedSupplierForWallet && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ 
                background: '#f0f2f5', 
                padding: '20px', 
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  Pending: Rs. {Math.abs(Number(selectedSupplierForWallet.walletBalance || 0)).toLocaleString()}
                </div>
              </div>
            </div>

            <Form
              layout="vertical"
              onFinish={async (values) => {
                try {
                  console.log('💳 Frontend: Recording payment for supplier:', selectedSupplierForWallet._id);
                  console.log('💳 Frontend: Payment values:', values);
                  
                  const response = await api.post(`/api/construction-admin/suppliers/${selectedSupplierForWallet._id}/wallet`, {
                    amount: values.amount,
                    type: 'payment',
                    description: values.description || 'Manual payment'
                  });
                  
                  console.log('💳 Frontend: Payment response:', response.data);
                  
                  if (response.data.success) {
                    message.success('Payment recorded successfully');
                    loadSuppliers();
                    setSupplierWalletVisible(false);
                  }
                } catch (error) {
                  console.error('💳 Frontend: Payment error:', error);
                  console.error('💳 Frontend: Error response:', error.response?.data);
                  message.error(`Failed to record payment: ${error.response?.data?.error || error.message}`);
                }
              }}
            >
              <Form.Item
                name="amount"
                label="Payment Amount"
                rules={[{ required: true, message: 'Please enter payment amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter payment amount"
                  formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/Rs.\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
              >
                <Input placeholder="Enter payment description (optional)" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Record Payment
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Employees Section */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Employees</span>
            <span style={{ 
              background: '#f6ffed', 
              color: '#52c41a', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: '500' 
            }}>
              {(employees || []).length}
            </span>
          </div>
        }
        style={{ marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {(employees || []).map(emp => (
            <div
              key={emp.employeeId}
              onClick={() => handleViewWallet(emp)}
              style={{ 
                cursor: 'pointer', 
                border: '2px solid #f6ffed', 
                borderRadius: '12px', 
                padding: '16px 20px', 
                minWidth: '200px', 
                background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#52c41a';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#f6ffed';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                fontWeight: '700', 
                fontSize: '16px', 
                color: '#52c41a',
                marginBottom: '4px'
              }}>
                {emp.name}
              </div>
              <div style={{ 
                color: '#8c8c8c', 
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                {emp.employeeId}
              </div>
              <div style={{ 
                color: '#8c8c8c', 
                fontSize: '11px',
                fontStyle: 'italic'
              }}>
                Click to view wallet
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Suppliers Section */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Suppliers</span>
            <span style={{ 
              background: '#fff7e6', 
              color: '#fa8c16', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: '500' 
            }}>
              {(suppliers || []).length}
            </span>
          </div>
        }
        style={{ marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {(suppliers || []).map(sup => (
            <div
              key={sup._id}
              onClick={() => {
                // Build pending amount by item from supplier transactions
                const tx = Array.isArray(sup.transactions) ? sup.transactions : [];
                const byItem = new Map();
                tx.forEach(t => {
                  if (t.type === 'supply') {
                    const key = t.item || 'Unknown';
                    byItem.set(key, (byItem.get(key)||0) + (Number(t.amount)||0));
                  } else if (t.type === 'payment' || t.type === 'adjustment') {
                    // amount could be negative for payment already
                    const key = t.item || 'All';
                    byItem.set(key, (byItem.get(key)||0) + (Number(t.amount)||0));
                  }
                });
                const rows = Array.from(byItem.entries()).map(([item, amount]) => ({ item, amount }));
                setSelectedSupplierForWallet(sup);
                setSupplierWalletByItem(rows);
                setSupplierWalletVisible(true);
              }}
              style={{ 
                cursor: 'default', 
                border: '2px solid #fff7e6', 
                borderRadius: '12px', 
                padding: '16px 20px', 
                minWidth: '200px', 
                textAlign: 'left', 
                background: 'linear-gradient(135deg, #fff7e6 0%, #fff1b8 100%)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '16px', color: '#fa8c16', marginBottom: 4 }}>{sup.name}</div>
              <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 8 }}>{(sup.items||[]).join(', ')}</div>
              <div style={{ fontSize: 14 }}><strong>Pending:</strong> Rs. {Number(Math.max(0, Number(sup.walletBalance||0))).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>


      {/* Credit Summary Section */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Credit Summary (Pending)</span>
            <span style={{ 
              background: '#fff7e6', 
              color: '#fa8c16', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: '500' 
            }}>
              {(dashboardData?.creditSummary || []).length}
            </span>
          </div>
        }
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <Table
          dataSource={(dashboardData?.creditSummary || []).sort((a,b) => b.remainingCredit - a.remainingCredit)}
          columns={[
            { 
              title: 'Customer', 
              dataIndex: 'customerName', 
              key: 'customerName', 
              width: 200,
              render: (text) => (
                <div style={{ 
                  fontWeight: '600', 
                  color: '#262626',
                  fontSize: '14px'
                }}>
                  {text}
                </div>
              )
            },
            { 
              title: 'Remaining', 
              dataIndex: 'remainingCredit', 
              key: 'remainingCredit', 
              render: (v) => (
                <div style={{ 
                  fontWeight: '700', 
                  color: '#cf1322',
                  fontSize: '14px'
                }}>
                  Rs. {Number(v||0).toLocaleString()}
                </div>
              )
            },
            { 
              title: 'Employee', 
              key: 'employee', 
              render: (_, r) => (
                <div style={{ fontSize: '13px' }}>
                  <div style={{ fontWeight: '500', color: '#262626' }}>
                    {r.lastEmployeeName || 'Unknown'}
                  </div>
                  <div style={{ color: '#8c8c8c', fontSize: '11px' }}>
                    {r.lastEmployeeId || 'N/A'}
                  </div>
                </div>
              )
            },
            { 
              title: 'Last Payment', 
              dataIndex: 'lastDate', 
              key: 'lastDate', 
              render: (d) => (
                <div style={{ 
                  color: d ? '#52c41a' : '#8c8c8c',
                  fontWeight: '500',
                  fontSize: '13px'
                }}>
                  {d ? dayjs(d).format('DD/MM/YYYY') : 'No payments'}
                </div>
              )
            }
          ]}
          pagination={false}
          size="small"
          rowKey={(r) => r.customerName}
          style={{ 
            background: '#fafafa',
            borderRadius: '8px'
          }}
        />
      </Card>


      
    </div>
  );

  const renderEmployees = () => (
    <div>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6}>
            <Input
              placeholder="Search employees..."
              prefix={<SearchOutlined />}
              onChange={(e) => setEmployeeFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by Position"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setEmployeeFilters(prev => ({ ...prev, position: value }))}
            >
              {employeePositions.map(position => (
                <Select.Option key={position} value={position}>{position}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by Status"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setEmployeeFilters(prev => ({ ...prev, status: value }))}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="on_leave">On Leave</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddEmployee}
              style={{ width: '100%' }}
            >
              Add Employee
            </Button>
          </Col>
          <Col xs={24} sm={3}>
            <Button 
              type="default" 
              icon={<DownloadOutlined />}
              onClick={exportEmployeesAsPDF}
              style={{ width: '100%' }}
            >
              Export PDF
            </Button>
          </Col>
          <Col xs={24} sm={3}>
            <Button 
              type="default" 
              icon={<DownloadOutlined />}
              onClick={exportAllEmployeeWalletsAsPDF}
              style={{ width: '100%' }}
            >
              Export Wallets
            </Button>
          </Col>
        </Row>

        <Table
          dataSource={employees}
          columns={employeeColumns}
          pagination={{
            ...employeePagination,
            onChange: (page, pageSize) => {
              setEmployeePagination(prev => ({ ...prev, current: page, pageSize }));
            },
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );

  const renderVehicleLogs = () => (
    <div>
      <Card title={'Vehicle Logs'}>
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            onClick={fixYesterdayBalances}
            style={{ marginRight: 8, marginBottom: 16 }}
          >
            Fix Yesterday Balances
          </Button>
          <Button 
            type="default" 
            icon={<DownloadOutlined />}
            onClick={exportAllVehicleLogsAsPDF}
            style={{ marginRight: 8, marginBottom: 16 }}
          >
            Export All Logs PDF
          </Button>
          <Button 
            type="default" 
            icon={<CalendarOutlined />}
            onClick={() => setDatePickerModalVisible(true)}
            style={{ marginRight: 8, marginBottom: 16 }}
          >
            Export by Date
          </Button>
          <Button 
            type="primary" 
            danger
            onClick={clearAllData}
            style={{ marginBottom: 16 }}
          >
            Clear All Data (Logs + Employee Wallets)
          </Button>
        </div>
        <Row gutter={[16,16]} style={{ marginBottom: 12 }}>
          <Col xs={24}>
            <Table
              dataSource={vehicles.map(v => ({ key: typeof v === 'string' ? v : v.vehicleNumber, vehicleNumber: typeof v === 'string' ? v : v.vehicleNumber }))}
              columns={[
                { title: 'Vehicle', dataIndex: 'vehicleNumber', key: 'vehicleNumber' },
                { title: 'Actions', key: 'actions', render: (_, r) => (
                  <Space>
                    <Button size="small" type="primary" onClick={() => openVehicleSheet(r.vehicleNumber)}>Open sheet</Button>
                    <Button size="small" onClick={() => handleViewVehicleHistory(r.vehicleNumber)}>View history</Button>
                  </Space>
                )}
              ]}
              pagination={{ pageSize: 10 }}
              rowKey={r => r.vehicleNumber}
            />
          </Col>
        </Row>
      </Card>
      <Modal
        title={`Vehicle Sheet • ${selectedVehicleForSheet || ''}`}
        open={vehicleSheetVisible}
        onCancel={() => setVehicleSheetVisible(false)}
        footer={null}
        width={1400}
      >
        <Row gutter={[12,12]}>
          <Col xs={24}>
            <Card size="small" title="Vehicle Log">
              <div style={{ marginBottom: 8 }}>
                <Space>
                  <Button size="small" type="primary" onClick={() => setSheetRows(prev => ([...prev, {
                    key: `new-${Date.now()}`,
                    date: dayjs().toDate(),
                    employeeId: '',
                    employee: '',
                    from: '',
                    to: '',
                    item: '',
                    startKm: 0,
                    endKm: 0,
                    customer: '',
                    yBal: 0,
                    setCash: 0,
                    cash: 0,
                    credit: 0,
                    saved: false
                  }]))}>Add row</Button>
                  <span style={{ color: '#6b7280' }}>Add and edit rows like a spreadsheet, then click Save on that row.</span>
                </Space>
              </div>
              <Table
                dataSource={sheetRows}
                columns={[
                  { title: 'supplier', dataIndex: 'supplier', key: 'supplier', width: 240, render: (v, r, i) => (
                    <Select
                      showSearch
                      placeholder="Select supplier"
                      value={r.supplierId || undefined}
                      onChange={(val) => {
                        const sup = suppliers.find(s=>s._id===val);
                        const copy=[...sheetRows];
                        copy[i]={...copy[i], supplierId:val, supplierName: sup?.name || ''};
                        setSheetRows(copy);
                      }}
                      style={{ width: 220 }}
                      optionFilterProp="children"
                    >
                      {suppliers.map(s => <Option key={s._id} value={s._id}>{s.name}</Option>)}
                    </Select>
                  ) },
                  { title: 'date', dataIndex: 'date', key: 'date', width: 120, render: (v, r, i) => (
                    <DatePicker value={v ? dayjs(v) : null} onChange={(d) => { const copy=[...sheetRows]; const newDate = d?.toDate()||null; const empId = copy[i].employeeId; copy[i]={...copy[i], date: newDate, yBal: computeEmployeeYesterdayBalance(empId, newDate)}; setSheetRows(copy); }} format="DD/MM/YYYY" />
                  ) },
                  { title: 'employee', dataIndex: 'employee', key: 'employee', width: 240, render: (v, r, i) => (
            <Select
                      showSearch
                      placeholder="Select employee"
                      value={r.employeeId || undefined}
                      onChange={(val) => { 
                        const emp = employees.find(e=>e.employeeId===val); 
                        const copy=[...sheetRows]; 
                        const baseDate = copy[i].date || new Date(); 
                        copy[i]={...copy[i], employeeId:val, employee: emp?.name || '', yBal: computeEmployeeYesterdayBalance(val, baseDate)}; 
                        setSheetRows(copy);
                        
                        // Auto-select employee for salary and expenses
                        if (val && !selectedEmployeeForSalary) {
                          setSelectedEmployeeForSalary(val);
                        }
                        if (val && !selectedEmployeeForExpense) {
                          setSelectedEmployeeForExpense(val);
                        }
                      }}
                      style={{ width: 220 }}
                      optionFilterProp="children"
                    >
                      {employees.map(e => <Option key={e.employeeId} value={e.employeeId}>{e.name} ({e.employeeId})</Option>)}
                    </Select>
                  ) },
                  { title: 'from', dataIndex: 'from', key: 'from', width: 160, render: (v,r,i)=>(<Input value={v} onChange={e=>{ const c=[...sheetRows]; c[i]={...c[i], from:e.target.value}; setSheetRows(c); }} />) },
                  { title: 'to', dataIndex: 'to', key: 'to', width: 160, render: (v,r,i)=>(<Input value={v} onChange={e=>{ const c=[...sheetRows]; c[i]={...c[i], to:e.target.value}; setSheetRows(c); }} />) },
                  { title: 'item', dataIndex: 'item', key: 'item', width: 180, render: (v,r,i)=>(
                    <Select
                      showSearch
                      placeholder="Select item"
                      value={v || undefined}
                      onChange={(val)=>{ const c=[...sheetRows]; c[i]={...c[i], item:val}; setSheetRows(c); }}
              style={{ width: '100%' }}
                      optionFilterProp="children"
              allowClear
                    >
                      {items.map(it => (
                        <Option key={it._id} value={it.name}>{it.name}</Option>
              ))}
            </Select>
                  ) },
                  { title: 'start(km)', dataIndex: 'startKm', key: 'startKm', width: 110, render: (v,r,i)=>(<InputNumber value={v} onChange={val=>{ const c=[...sheetRows]; c[i]={...c[i], startKm:Number(val||0)}; setSheetRows(c); }} style={{ width: '100%' }} />) },
                  { title: 'end(km)', dataIndex: 'endKm', key: 'endKm', width: 110, render: (v,r,i)=>(<InputNumber value={v} onChange={val=>{ const c=[...sheetRows]; c[i]={...c[i], endKm:Number(val||0)}; setSheetRows(c); }} style={{ width: '100%' }} />) },
                  { title: 'customer', dataIndex: 'customer', key: 'customer', width: 200, render: (v,r,i)=>(
            <Select
                      showSearch
                      placeholder="Select customer"
                      value={v || undefined}
                      onChange={(val)=>{ const c=[...sheetRows]; c[i]={...c[i], customer:val}; setSheetRows(c); }}
              style={{ width: '100%' }}
                      optionFilterProp="children"
              allowClear
            >
                      {customers.map(ct => (
                        <Option key={ct._id} value={ct.name}>{ct.name}</Option>
              ))}
            </Select>
                  ) },
                  { title: 'yesterday bal.', dataIndex: 'yBal', key: 'yBal', width: 140, render: (v)=> (<InputNumber value={v || 0} disabled style={{ width:'100%' }} />) },
                  { title: 'set cash', dataIndex: 'setCash', key: 'setCash', width: 120, render: (v,r,i)=> (
                    <InputNumber value={v} placeholder="enter" onChange={val=>{ const c=[...sheetRows]; c[i]={...c[i], setCash:Number(val||0)}; setSheetRows(c); }} style={{ width:'100%' }} />
                  ) },
                  { title: 'cash', dataIndex: 'cash', key: 'cash', width: 140, render: (v,r,i)=>(<InputNumber value={v} onChange={val=>{ const c=[...sheetRows]; c[i]={...c[i], cash:Number(val||0)}; setSheetRows(c); }} style={{ width: '100%' }} />) },
                  { title: 'credit', dataIndex: 'credit', key: 'credit', width: 140, render: (v,r,i)=>(<InputNumber value={v} onChange={val=>{ const c=[...sheetRows]; c[i]={...c[i], credit:Number(val||0)}; setSheetRows(c); }} style={{ width: '100%' }} />) }
                ]}
                pagination={false}
                size="small"
                rowKey="key"
                scroll={{ x: 1700 }}
              />
              {/* Removed separate totals row (set cash/yesterday) per request */}
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title="Salary">
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <span>Employee:</span>
                  <Select
                    placeholder="Select employee"
                    value={selectedEmployeeForSalary}
                    onChange={setSelectedEmployeeForSalary}
                    style={{ width: 200 }}
                  >
                    {employees.map(emp => (
                      <Option key={emp.employeeId} value={emp.employeeId}>{emp.name}</Option>
                    ))}
                  </Select>
                </Space>
              </div>
              <Table
                dataSource={salaryRows.map((r, i) => ({ key: i, ...r }))}
                columns={[
                  { title: 'item', dataIndex: 'item', key: 'item', render: (v, r, i) => (
                    <Select
                      showSearch
                      placeholder="Select item"
                      value={v || undefined}
                      onChange={(val)=>{ const copy=[...salaryRows]; copy[i]={...copy[i], item:val}; setSalaryRows(copy); }}
              style={{ width: '100%' }}
                      optionFilterProp="children"
                      allowClear
                    >
                      {items.map(it => (
                        <Option key={it._id} value={it.name}>{it.name}</Option>
                      ))}
                    </Select>
                  ) },
                  { title: 'amount', dataIndex: 'amount', key: 'amount', render: (v, r, i) => <InputNumber value={v} onChange={val => {
                    const copy=[...salaryRows]; copy[i]={...copy[i], amount:Number(val||0)}; setSalaryRows(copy);
                  }} style={{ width: '100%' }} /> },
                  { title: 'op', key: 'op', render: (_, __, i) => <Button size="small" danger onClick={()=>{ const copy=[...salaryRows]; copy.splice(i,1); setSalaryRows(copy); }}>Delete</Button> }
                ]}
                pagination={false}
                size="small"
                rowKey="key"
              />
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Button size="small" onClick={() => setSalaryRows(prev => [...prev, { item:'', amount:0 }])}>Add</Button>
                  <div>
                    <strong>Total:</strong> Rs. {sheetTotals.salaryTotal.toLocaleString()}
                    {selectedEmployeeForSalary && employees.find(emp => emp.employeeId === selectedEmployeeForSalary)?.pendingSalary > 0 && (
                      <span style={{ color: '#1890ff', fontSize: '12px', marginLeft: '8px' }}>
                        (includes Rs. {(employees.find(emp => emp.employeeId === selectedEmployeeForSalary)?.pendingSalary || 0).toLocaleString()} pending)
                      </span>
                    )}
                  </div>
                  {salaryPaid && (
                    <div style={{ color: salaryPaymentMethod === 'balance' ? '#52c41a' : '#1890ff' }}>
                      <strong>
                        {salaryPaymentMethod === 'balance' ? '✓ Deducted from Balance' : '✓ Added to Pending Salary'}
                      </strong>
                    </div>
                  )}
                  {!salaryPaid && (
                    <>
                      <Button type="primary" size="small" onClick={() => {
                        if (!selectedEmployeeForSalary) {
                          message.error('Please select an employee first');
                          return;
                        }
                        setSalaryPaymentMethod('balance');
                        // Deduct FULL amount (current rows + pending)
                        setSalaryAmount(sheetTotals.salaryTotal || 0);
                        setSalaryPaymentModalVisible(true);
                      }}>Deduct from Balance</Button>
                      <Button type="primary" size="small" onClick={() => {
                        if (!selectedEmployeeForSalary) {
                          message.error('Please select an employee first');
                          return;
                        }
                        setSalaryPaymentMethod('salary');
                        setSalaryAmount(sheetTotals.salaryFromRows || 0);
                        setSalaryPaymentModalVisible(true);
                      }}>Add to Pending Salary</Button>
                    </>
                  )}
                </Space>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title="Supplier Details">
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <span>Supplier:</span>
                  <Select
                    placeholder="Select supplier"
                    value={sheetSupplierId}
                    onChange={setSheetSupplierId}
                    style={{ width: 220 }}
                    showSearch
                    optionFilterProp="children"
                  >
                    {suppliers.map(s => (
                      <Option key={s._id} value={s._id}>{s.name}</Option>
                    ))}
                  </Select>
                </Space>
              </div>
              <Table
                dataSource={supplierRows.map((r,i)=>({ key:i, ...r }))}
                columns={[
                  { title: 'item', dataIndex: 'item', key: 'item', render: (v, r, i) => (
                    <Select
                      showSearch
                      placeholder="Select item"
                      value={v || undefined}
                      onChange={(val)=>{ const copy=[...supplierRows]; copy[i]={...copy[i], item:val}; setSupplierRows(copy); }}
                      style={{ width: '100%' }}
                      optionFilterProp="children"
                      allowClear
                    >
                      {items.map(it => (
                        <Option key={it._id} value={it.name}>{it.name}</Option>
                      ))}
                    </Select>
                  ) },
                  { title: 'qty', dataIndex: 'quantity', key: 'quantity', render: (v, r, i) => <InputNumber value={v} onChange={val => { const copy=[...supplierRows]; copy[i]={...copy[i], quantity:Number(val||0)}; setSupplierRows(copy); }} style={{ width:'100%' }} /> },
                  { title: 'unit', dataIndex: 'unitPrice', key: 'unitPrice', render: (v, r, i) => <InputNumber value={v} onChange={val => { const copy=[...supplierRows]; const unit=Number(val||0); const qty=Number(copy[i].quantity||0); copy[i]={...copy[i], unitPrice:unit, total: unit*qty}; setSupplierRows(copy); }} style={{ width:'100%' }} /> },
                  { title: 'total', dataIndex: 'total', key: 'total', render: (v) => <InputNumber value={v} disabled style={{ width:'100%' }} /> },
                  { title: 'op', key: 'op', render: (_, __, i) => <Button size="small" danger onClick={()=>{ const copy=[...supplierRows]; copy.splice(i,1); setSupplierRows(copy); }}>Delete</Button> }
                ]}
                pagination={false}
                size="small"
                rowKey="key"
              />
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Button size="small" onClick={() => setSupplierRows(prev => [...prev, { item:'', quantity:0, unitPrice:0, total:0 }])}>Add</Button>
                  <div><strong>Payable:</strong> Rs. {supplierRows.reduce((s,r)=> s + (Number(r.total)||0), 0).toLocaleString()}</div>
                </Space>
              </div>
              <div style={{ marginTop: 12 }}>
                <Row gutter={8}>
                  <Col span={8}>
                    <div>
                      <span style={{ marginRight: 8 }}>Paid:</span>
                      <InputNumber 
                        value={supplierPaid} 
                        onChange={val=>setSupplierPaid(Number(val||0))} 
                        style={{ width: '100%' }}
                      />
                    </div>
                  </Col>
                  <Col span={16}>
                    <div>
                      <span style={{ marginRight: 8 }}>Description:</span>
                      <Input 
                        placeholder="Payment description (optional)"
                        value={supplierPaymentDescription}
                        onChange={e => setSupplierPaymentDescription(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title="Expenses">
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <span>Employee:</span>
                  <Select
                    placeholder="Select employee"
                    value={selectedEmployeeForExpense}
                    onChange={setSelectedEmployeeForExpense}
                    style={{ width: 200 }}
                  >
                    {employees.map(emp => (
                      <Option key={emp.employeeId} value={emp.employeeId}>{emp.name}</Option>
                    ))}
                  </Select>
                </Space>
              </div>
        <Table
                dataSource={expenseRows.map((r,i)=>({ key:i, ...r }))}
                columns={[
                  { title: 'Expenses', dataIndex: 'expense', key: 'expense', render: (v, r, i) => <Input value={v} onChange={e => { const copy=[...expenseRows]; copy[i]={...copy[i], expense:e.target.value}; setExpenseRows(copy); }} /> },
                  { title: 'cost', dataIndex: 'cost', key: 'cost', render: (v, r, i) => <InputNumber value={v} onChange={val => { const copy=[...expenseRows]; copy[i]={...copy[i], cost:Number(val||0)}; setExpenseRows(copy); }} style={{ width:'100%' }} /> },
                  { title: 'op', key: 'op', render: (_, __, i) => <Button size="small" danger onClick={()=>{ const copy=[...expenseRows]; copy.splice(i,1); setExpenseRows(copy); }}>Delete</Button> }
                ]}
                pagination={false}
                size="small"
                rowKey="key"
              />
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Button size="small" onClick={() => setExpenseRows(prev => [...prev, { expense:'', cost:0 }])}>Add</Button>
                  <div><strong>Total:</strong> Rs. {sheetTotals.expenseTotal.toLocaleString()}</div>
                  {expensesSaved && (
                    <div style={{ color: '#52c41a' }}>
                      <strong>✓ Expenses Saved</strong>
                    </div>
                  )}
                  {!expensesSaved && (
                    <Button type="primary" size="small" onClick={saveExpenses}>Save Expenses</Button>
                  )}
                </Space>
              </div>
      </Card>
          </Col>
          <Col xs={24}>
            <Card size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14 }}><strong>Balance:</strong> Rs. {sheetTotals.balance.toLocaleString()}</div>
            <Button 
              type="primary" 
                  onClick={saveVehicleSheet}
                  style={{ marginLeft: 16 }}
            >
                  Save All
            </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );

  const renderReports = () => {
    // Debug calculations
    const totalExpenses = vehicleLogs.reduce((sum, log) => {
      const logExpenses = log.expenses?.reduce((logSum, expense) => {
        // Exclude salary from expenses
        if (expense.description && expense.description.toLowerCase().includes('salary')) {
          return logSum;
        }
        return logSum + expense.amount;
      }, 0) || 0;
      return sum + logExpenses;
    }, 0);
    
    const fuelExpenses = vehicleLogs.reduce((sum, log) => {
      const fuelExpense = log.expenses?.find(exp => exp.description.toLowerCase().includes('fuel'));
      return sum + (fuelExpense?.amount || 0);
    }, 0);
    
    const totalPayments = vehicleLogs.reduce((sum, log) => sum + (log.payments?.total || 0), 0);
    
    console.log('Reports Debug:', {
      vehicleLogsCount: vehicleLogs.length,
      totalExpenses,
      fuelExpenses,
      totalPayments,
      sampleLog: vehicleLogs[0]
    });
    
    return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Employee Performance Report">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Total Employees"
                  value={employees.length}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Active Employees"
                  value={employees.filter(emp => emp.status === 'active').length}
                  prefix={<UserOutlined />}
                />
              </Col>
            </Row>
            <Divider />
            <Table
              dataSource={employees}
              columns={[
                { title: 'Employee', dataIndex: 'name', key: 'name' },
                { title: 'Position', dataIndex: 'position', key: 'position' },
                { title: 'Status', dataIndex: 'status', key: 'status' },
                { title: 'Assigned Vehicles', dataIndex: 'assignedVehicles', key: 'assignedVehicles', 
                  render: (vehicles) => vehicles?.length || 0 },
                { title: 'Duties', dataIndex: 'duties', key: 'duties',
                  render: (duties) => duties?.length || 0 }
              ]}
              pagination={false}
              size="small"
              rowKey="_id"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Vehicle Performance Report">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Total Vehicles"
                  value={vehicles.length}
                  prefix={<CarOutlined />}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Active Vehicles"
                  value={vehicleLogs.length > 0 ? vehicles.length : 0}
                  prefix={<CarOutlined />}
                />
              </Col>
            </Row>
            <Divider />
            <Table
              dataSource={vehicles.map(vehicle => {
                const logsForVehicle = vehicleLogs.filter(log => log.vehicleNumber === vehicle);
                const totalKm = logsForVehicle.reduce((sum, log) => sum + (log.workingKm || 0), 0);
                const totalFuel = logsForVehicle.reduce((sum, log) => sum + (log.fuel?.liters || 0), 0);
                return {
                  key: vehicle,
                  vehicleNumber: vehicle,
                  totalTrips: logsForVehicle.length,
                  totalKm,
                  totalFuel,
                  assignedEmployees: employees.filter(emp => emp.assignedVehicles?.includes(vehicle)).length
                };
              })}
              columns={[
                { title: 'Vehicle', dataIndex: 'vehicleNumber', key: 'vehicleNumber' },
                { title: 'Total Trips', dataIndex: 'totalTrips', key: 'totalTrips' },
                { title: 'Total KM', dataIndex: 'totalKm', key: 'totalKm' },
                { title: 'Total Fuel (L)', dataIndex: 'totalFuel', key: 'totalFuel' },
                { title: 'Assigned Employees', dataIndex: 'assignedEmployees', key: 'assignedEmployees' }
              ]}
              pagination={false}
              size="small"
              rowKey="vehicleNumber"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Financial Report">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Total Expenses"
                  value={totalExpenses}
                  prefix={<DollarOutlined />}
                  suffix="Rs."
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Fuel Expenses"
                  value={fuelExpenses}
                  prefix={<DollarOutlined />}
                  suffix="Rs."
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Total Payments"
                  value={totalPayments}
                  prefix={<DollarOutlined />}
                  suffix="Rs."
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Average Trip Cost"
                  value={vehicleLogs.length > 0 ? Math.round(totalExpenses / vehicleLogs.length) : 0}
                  prefix={<DollarOutlined />}
                  suffix="Rs."
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Monthly Activity Report">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="trips" fill="#8884d8" name="Trips" />
                <Bar dataKey="totalKm" fill="#82ca9d" name="Total KM" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Duty Performance Report">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getDutyData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ duty, percent }) => `${duty} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {getDutyData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Monthly Expenses Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="expenses" stroke="#8884d8" name="Expenses (Rs.)" />
                <Line type="monotone" dataKey="fuel" stroke="#82ca9d" name="Fuel (L)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Employee Position Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getEmployeePositionData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ position, percent }) => `${position} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {getEmployeePositionData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Export Reports">
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => exportToExcel()}
              >
                Export to Excel
              </Button>
              <Button 
                type="primary" 
                icon={<PrinterOutlined />}
                onClick={() => printReport()}
              >
                Print Report
              </Button>

            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
  };

  const renderCustomers = () => (
    <div>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6}>
            <Input
              placeholder="Search customers..."
              prefix={<SearchOutlined />}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by Status"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="blocked">Blocked</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCustomer(null);
                customerForm.resetFields();
                setCustomerModalVisible(true);
              }}
              style={{ width: '100%' }}
            >
              Add Customer
            </Button>
          </Col>
          <Col xs={24} sm={4}>
            <Button 
              type="default" 
              icon={<DownloadOutlined />}
              onClick={exportCustomersAsPDF}
              style={{ width: '100%' }}
            >
              Export PDF
            </Button>
          </Col>
        </Row>

        <Table
          dataSource={customers}
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Phone', dataIndex: 'phone', key: 'phone' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Address', dataIndex: 'address', key: 'address' },
            
            { title: 'Status', dataIndex: 'status', key: 'status',
              render: (status) => (
                <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange'} size="small">
                  {status?.toUpperCase()}
                </Tag>
              ) },
            { title: 'Actions', key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button 
                    type="link" 
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingCustomer(record);
                      customerForm.setFieldsValue(record);
                      setCustomerModalVisible(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Are you sure you want to delete this customer?"
                    onConfirm={() => handleDeleteCustomer(record._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              ) }
          ]}
          pagination={false}
          rowKey="_id"
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );

  const renderItems = () => (
    <div>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6}>
            <Input
              placeholder="Search items..."
              prefix={<SearchOutlined />}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by Category"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <Select.Option value="construction">Construction</Select.Option>
              <Select.Option value="supplies">Supplies</Select.Option>
              <Select.Option value="materials">Materials</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null);
                itemForm.resetFields();
                setItemModalVisible(true);
              }}
              style={{ width: '100%' }}
            >
              Add Item
            </Button>
          </Col>
          <Col xs={24} sm={4}>
            <Button 
              type="default" 
              icon={<DownloadOutlined />}
              onClick={exportItemsAsPDF}
              style={{ width: '100%' }}
            >
              Export PDF
            </Button>
          </Col>
        </Row>

        <Table
          dataSource={items}
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Category', dataIndex: 'category', key: 'category' },
            { title: 'Unit', dataIndex: 'unit', key: 'unit' },
            { title: 'Price per Unit', dataIndex: 'pricePerUnit', key: 'pricePerUnit',
              render: (value) => `Rs. ${value?.toLocaleString() || 0}` },
            { title: 'Description', dataIndex: 'description', key: 'description' },
            { title: 'Status', dataIndex: 'status', key: 'status',
              render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'} size="small">
                  {status?.toUpperCase()}
                </Tag>
              ) },
            { title: 'Actions', key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button 
                    type="link" 
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingItem(record);
                      itemForm.setFieldsValue(record);
                      setItemModalVisible(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Are you sure you want to delete this item?"
                    onConfirm={() => handleDeleteItem(record._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              ) }
          ]}
          pagination={false}
          rowKey="_id"
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );

  const renderCreditManagement = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Credit Overview" size="small">
            <Statistic
              title="Total Pending Credit"
              value={creditOverview.reduce((sum, customer) => sum + customer.remainingCredit, 0)}
              prefix="Rs."
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Divider />
            <Statistic
              title="Customers with Credit"
              value={creditOverview.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Credit Details" 
        style={{ marginTop: 16 }}
        extra={
          <Button 
            type="default" 
            icon={<DownloadOutlined />}
            onClick={exportCreditManagementAsPDF}
          >
            Export PDF
          </Button>
        }
      >
        <Table
          dataSource={creditOverview}
          columns={[
            { 
              title: 'Customer Information', 
              key: 'customerInfo',
              width: 250,
              render: (_, record) => (
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1890ff' }}>
                    {record.customerName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    📞 {record.customerPhone}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                    🚚 {record.totalDeliveries || 0} deliveries
                  </div>
                </div>
              )
            },
            { 
              title: 'Credit Summary', 
              key: 'creditSummary',
              width: 300,
              render: (_, record) => (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>Total Credit:</span>
                    <span style={{ fontWeight: 'bold', color: '#cf1322' }}>
                      Rs. {record.totalCredit?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>Total Paid:</span>
                    <span style={{ fontWeight: 'bold', color: '#3f8600' }}>
                      Rs. {record.totalPaid?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>Remaining:</span>
                    <span style={{ fontWeight: 'bold', color: '#cf1322', fontSize: '14px' }}>
                      Rs. {record.remainingCredit?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              )
            },
            { 
              title: 'Delivery Employees', 
              key: 'deliveryEmployees',
              width: 200,
              render: (_, record) => (
                <div>
                  {record.deliveryEmployees?.map((employee, index) => (
                    <div key={index} style={{ 
                      marginBottom: '4px', 
                      padding: '4px 8px', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                        👤 {employee.name}
                      </div>
                      <div style={{ color: '#666', fontSize: '11px' }}>
                        ID: {employee.employeeId}
                      </div>
                    </div>
                  )) || (
                    <div style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
                      No employee info
                    </div>
                  )}
                </div>
              )
            },
            { 
              title: 'Status', 
              key: 'status',
              width: 120,
              render: (_, record) => (
                <div style={{ textAlign: 'center' }}>
                  <Tag 
                    color={record.creditStatus === 'pending' ? 'red' : 'orange'} 
                    size="small"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    {record.creditStatus?.toUpperCase() || 'PENDING'}
                  </Tag>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    {record.lastPayment ? 
                      `Last: ${dayjs(record.lastPayment).format('DD/MM/YYYY')}` : 
                      'No payments'
                    }
                  </div>
                </div>
              )
            },
            { 
              title: 'Actions', 
              key: 'actions',
              width: 150,
              render: (_, record) => (
                <div style={{ textAlign: 'center' }}>
                 <Button 
  type="primary" 
  size="small"
  icon={<DollarOutlined />}
  onClick={() => {
    creditPaymentForm.setFieldsValue({
      customerId: record.customerId,
      customerName: record.customerName,
      originalCreditAmount: record.remainingCredit || 0 // Ensure this is set
    });
    setCreditPaymentModalVisible(true);
  }}
  style={{ marginBottom: '8px', width: '100%' }}
>
  Record Payment
</Button>
                  <Button 
                    type="default" 
                    size="small"
                    icon={<UserOutlined />}
                    onClick={() => setSelectedSection('customers')}
                    style={{ width: '100%' }}
                  >
                    View Details
                  </Button>
                </div>
              )
            }
          ]}
          pagination={false}
          rowKey="customerId"
          scroll={{ x: 1200 }}
        />
      </Card>

      <Card title="Credit History" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={8}>
            <Select
              allowClear
              showSearch
              placeholder="Filter by customer"
              style={{ width: '100%' }}
              optionFilterProp="children"
              onChange={(val) => setFilters(prev => ({ ...prev, creditHistoryCustomer: val }))}
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {customers.map(c => (
                <Option key={c._id} value={c.name}>{c.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search notes or reference"
              prefix={<SearchOutlined />}
              onChange={(e) => setFilters(prev => ({ ...prev, creditHistoryQuery: e.target.value }))}
            />
          </Col>
        </Row>
        <Table
          bordered
          dataSource={creditPayments.filter(p => {
            const byCustomer = !filters.creditHistoryCustomer || p.customerName === filters.creditHistoryCustomer;
            const q = (filters.creditHistoryQuery || '').toLowerCase();
            const byQuery = !q || `${p.referenceNumber || ''} ${p.notes || ''}`.toLowerCase().includes(q);
            return byCustomer && byQuery;
          })}
          columns={[
            { title: 'Date', dataIndex: 'paymentDate', key: 'paymentDate', sorter: (a,b) => new Date(a.paymentDate) - new Date(b.paymentDate), render: (d) => d ? new Date(d).toLocaleDateString() : '' },
            { title: 'Customer', key: 'customer', render: (_, r) => r.customerName },
            { title: 'Payment Method', dataIndex: 'paymentMethod', key: 'paymentMethod', render: (m) => <Tag color={m === 'cash' ? 'green' : m === 'bank_transfer' ? 'blue' : m === 'cheque' ? 'orange' : 'default'}>{(m || '').toUpperCase()}</Tag> },
            { title: 'Reference', dataIndex: 'referenceNumber', key: 'referenceNumber' },
            { title: 'Amount', dataIndex: 'paymentAmount', key: 'paymentAmount', sorter: (a,b) => (a.paymentAmount||0) - (b.paymentAmount||0), render: (v) => <strong>{`Rs. ${Number(v || 0).toLocaleString()}`}</strong> },
            { title: 'Notes', dataIndex: 'notes', key: 'notes' },
            { title: 'Actions', key: 'actions', render: (_, r) => (
              <Popconfirm title="Delete this payment?" okText="Yes" cancelText="No" onConfirm={async () => {
                try {
                  await api.delete(`/api/construction-admin/credit-payments/${r._id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` } });
                  message.success('Payment deleted');
                  await loadCreditPayments();
                  await loadCreditOverview();
                  await loadVehicleLogs();
                } catch (e) {
                  message.error('Failed to delete payment');
                }
              }}>
                <Button danger size="small">Delete</Button>
              </Popconfirm>
            ) }
          ]}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
          rowKey={(r) => r._id}
          size="small"
          locale={{ emptyText: 'No credit payments recorded' }}
        />
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div>
      <Card title="Company Settings">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Company Information" size="small">
              <p><strong>Company:</strong> A.K.R & SON'S Construction & Suppliers</p>
              <p><strong>Address:</strong> Main Street, Murunkan, Mannar.</p>
              <p><strong>Phone:</strong> 024 222 6899/077 311 1266/077 364 6999</p>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="System Information" size="small">
              <p><strong>Admin Role:</strong> Construction Admin</p>
              <p><strong>Last Login:</strong> {new Date().toLocaleString()}</p>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const renderFuelManagement = () => {
    // Calculate pending fuel amounts
    const totalPending = fuelLogs.reduce((sum, log) => sum + (log.remainingAmount || 0), 0);
    const totalPaid = fuelLogs.reduce((sum, log) => sum + (log.paidAmount || 0), 0);
    const totalCost = fuelLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    const totalFuel = fuelLogs.reduce((sum, log) => sum + (log.fuelAmount || 0), 0);

    return (
      <div>
        {/* Amount Pending Card */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8} md={6}>
            <Card 
              style={{ cursor: totalPending > 0 ? 'pointer' : 'default' }}
              onClick={() => {
                if (totalPending > 0) {
                  fuelPaymentForm.setFieldsValue({ 
                    amount: totalPending,
                    description: 'Overall fuel payment'
                  }); 
                  setSelectedFuelLogForPayment(null); // null means overall payment
                  setFuelPaymentModalVisible(true);
                }
              }}
            >
              <Statistic
                title="Amount Pending"
                value={totalPending}
                precision={2}
                prefix="Rs."
                valueStyle={{ color: totalPending > 0 ? '#ff4d4f' : '#52c41a' }}
              />
              {totalPending > 0 && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <Button type="primary" size="small">
                    Click to Pay
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Fuel Logs Table */}
        <Card 
          title="Fuel Logs" 
          extra={
            <Space>
              <Button 
                icon={<FilePdfOutlined />} 
                onClick={exportFuelManagementAsPDF}
                title="Export as PDF"
              >
                Export PDF
              </Button>
              <Button type="primary" onClick={() => { setEditingFuelLog(null); fuelForm.resetFields(); setFuelModalVisible(true); }}>
                Add Fuel Log
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={fuelLogs}
            rowKey="_id"
            columns={[
              { title: 'Date', dataIndex: 'date', key: 'date', render: (date) => dayjs(date).format('DD/MM/YYYY') },
              { title: 'Vehicle', dataIndex: 'vehicleNumber', key: 'vehicleNumber' },
              { title: 'Employee', dataIndex: 'employeeName', key: 'employeeName' },
              { title: 'Fuel (L)', dataIndex: 'fuelAmount', key: 'fuelAmount', render: (val) => `${val || 0}L` },
              { title: 'Price/L', dataIndex: 'fuelPrice', key: 'fuelPrice', render: (val) => `Rs. ${(val || 0).toFixed(2)}` },
              { title: 'Total Cost', dataIndex: 'totalCost', key: 'totalCost', render: (val) => `Rs. ${(val || 0).toLocaleString()}` },
              { title: 'Paid by Employee', dataIndex: 'paidAmount', key: 'paidAmount', render: (val) => `Rs. ${(val || 0).toLocaleString()}` },
              { title: 'Overall Paid', dataIndex: 'overallPaidAmount', key: 'overallPaidAmount', render: (val) => `Rs. ${(val || 0).toLocaleString()}` },
              { title: 'Status', dataIndex: 'paymentStatus', key: 'paymentStatus', render: (status) => (
                <Tag color={status === 'paid' ? 'green' : status === 'partial' ? 'orange' : 'red'}>
                  {status?.toUpperCase() || 'PENDING'}
                </Tag>
              )},
              { title: 'Actions', key: 'actions', render: (_, record) => (
                <Space>
                  <Button size="small" onClick={() => { setEditingFuelLog(record); fuelForm.setFieldsValue({ ...record, date: dayjs(record.date) }); setFuelModalVisible(true); }}>
                    Edit
                  </Button>
                  <Popconfirm title="Delete fuel log?" onConfirm={async () => {
                    try {
                      await api.delete(`/api/construction-admin/fuel-logs/${record._id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                      });
                      message.success('Fuel log deleted');
                      loadFuelLogs();
                    } catch (e) {
                      message.error(e?.response?.data?.error || 'Failed to delete');
                    }
                  }}>
                    <Button danger size="small">Delete</Button>
                  </Popconfirm>
                </Space>
              )}
            ]}
            pagination={{ pageSize: 10 }}
          />
        </Card>


        {/* Fuel Log Modal */}
        <Modal
          title={editingFuelLog ? 'Edit Fuel Log' : 'Add Fuel Log'}
          open={fuelModalVisible}
          onCancel={() => setFuelModalVisible(false)}
          onOk={async () => {
            try {
              const values = await fuelForm.validateFields();
              const payload = {
                ...values,
                date: values.date?.toDate(),
                employeeName: employees.find(e => e._id === values.employeeId)?.name || values.employeeName
              };
              
              if (editingFuelLog) {
                await api.put(`/api/construction-admin/fuel-logs/${editingFuelLog._id}`, payload, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                });
                message.success('Fuel log updated');
              } else {
                await api.post('/api/construction-admin/fuel-logs', payload, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                });
                message.success('Fuel log added');
              }
              
              setFuelModalVisible(false);
              loadFuelLogs();
              loadFuelSummary();
              loadFuelEfficiency();
            } catch (e) {
              message.error(e?.response?.data?.error || 'Failed to save fuel log');
            }
          }}
        >
          <Form form={fuelForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="vehicleNumber" label="Vehicle Number" rules={[{ required: true, message: 'Select vehicle' }]}>
                  <Select placeholder="Select vehicle">
                    {vehicles.map(v => (
                      <Option key={v} value={v}>{v}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Select date' }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="employeeId" label="Employee" rules={[{ required: true, message: 'Select employee' }]}>
                  <Select placeholder="Select employee">
                    {employees.map(emp => (
                      <Option key={emp._id} value={emp._id}>{emp.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="fuelAmount" label="Fuel Amount (Liters)" rules={[{ required: true, message: 'Enter fuel amount' }]}>
                  <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="Liters" 
                    min={0} 
                    step={0.1}
                    onChange={(value) => {
                      const fuelPrice = fuelForm.getFieldValue('fuelPrice');
                      if (value && fuelPrice) {
                        fuelForm.setFieldsValue({ totalCost: value * fuelPrice });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="fuelPrice" label="Price per Liter">
                  <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="Rs. per liter" 
                    min={0} 
                    step={0.01}
                    onChange={(value) => {
                      const fuelAmount = fuelForm.getFieldValue('fuelAmount');
                      if (value && fuelAmount) {
                        fuelForm.setFieldsValue({ totalCost: value * fuelAmount });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="totalCost" label="Total Cost">
                  <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="Total cost" 
                    min={0} 
                    step={0.01}
                    onChange={(value) => {
                      // Allow manual override of total cost
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="paidAmount" label="Paid Amount">
                  <InputNumber style={{ width: '100%' }} placeholder="Amount paid" min={0} step={0.01} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="fuelStation" label="Fuel Station" initialValue="AKR Shed">
                  <Input placeholder="Fuel station name" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="notes" label="Notes">
              <Input.TextArea placeholder="Additional notes" rows={3} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Fuel Payment Modal */}
        <Modal
          title={selectedFuelLogForPayment ? `Fuel Payment - ${selectedFuelLogForPayment.vehicleNumber}` : 'Overall Fuel Payment'}
          open={fuelPaymentModalVisible}
          onCancel={() => setFuelPaymentModalVisible(false)}
          onOk={async () => {
            try {
              const values = await fuelPaymentForm.validateFields();
              const paymentAmount = Number(values.amount) || 0;
              
              if (paymentAmount <= 0) {
                message.error('Payment amount must be greater than 0');
                return;
              }

              if (selectedFuelLogForPayment) {
                // Individual fuel log payment
                const updatedFuelLog = {
                  ...selectedFuelLogForPayment,
                  overallPaidAmount: (selectedFuelLogForPayment.overallPaidAmount || 0) + paymentAmount
                };

                await api.put(`/api/construction-admin/fuel-logs/${selectedFuelLogForPayment._id}`, updatedFuelLog, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                });
              } else {
                // Overall payment - distribute across all pending fuel logs
                const pendingLogs = fuelLogs.filter(log => log.remainingAmount > 0);
                let remainingPayment = paymentAmount;
                
                for (const log of pendingLogs) {
                  if (remainingPayment <= 0) break;
                  
                  const paymentForThisLog = Math.min(remainingPayment, log.remainingAmount);
                  const updatedFuelLog = {
                    ...log,
                    overallPaidAmount: (log.overallPaidAmount || 0) + paymentForThisLog
                  };

                  await api.put(`/api/construction-admin/fuel-logs/${log._id}`, updatedFuelLog, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                  });

                  remainingPayment -= paymentForThisLog;
                }
              }

              message.success('Payment recorded successfully');
              setFuelPaymentModalVisible(false);
              loadFuelLogs();
            } catch (e) {
              message.error(e?.response?.data?.error || 'Failed to record payment');
            }
          }}
        >
          <div>
            {selectedFuelLogForPayment ? (
              // Individual fuel log payment
              <div>
                <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                  <div><strong>Vehicle:</strong> {selectedFuelLogForPayment.vehicleNumber}</div>
                  <div><strong>Employee:</strong> {selectedFuelLogForPayment.employeeName}</div>
                  <div><strong>Total Cost:</strong> Rs. {(selectedFuelLogForPayment.totalCost || 0).toLocaleString()}</div>
                  <div><strong>Paid by Employee:</strong> Rs. {(selectedFuelLogForPayment.paidAmount || 0).toLocaleString()}</div>
                  <div><strong>Overall Payments:</strong> Rs. {(selectedFuelLogForPayment.overallPaidAmount || 0).toLocaleString()}</div>
                  <div><strong>Total Paid:</strong> Rs. {((selectedFuelLogForPayment.paidAmount || 0) + (selectedFuelLogForPayment.overallPaidAmount || 0)).toLocaleString()}</div>
                  <div><strong>Remaining:</strong> Rs. {(selectedFuelLogForPayment.remainingAmount || 0).toLocaleString()}</div>
                </div>
              </div>
            ) : (
              // Overall payment
              <div>
                <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                  <div><strong>Total Pending Amount:</strong> Rs. {totalPending.toLocaleString()}</div>
                  <div><strong>Number of Pending Logs:</strong> {fuelLogs.filter(log => log.remainingAmount > 0).length}</div>
                  <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                    Payment will be distributed across all pending fuel logs
                  </div>
                </div>
              </div>
            )}

            <Form form={fuelPaymentForm} layout="vertical">
              <Form.Item
                name="amount"
                label="Payment Amount"
                rules={[{ required: true, message: 'Please enter payment amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter payment amount"
                  formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/Rs.\s?|(,*)/g, '')}
                  min={0}
                  max={selectedFuelLogForPayment ? selectedFuelLogForPayment.remainingAmount : totalPending}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
              >
                <Input placeholder="Payment description (optional)" />
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    );
  };

  const renderShedWallet = () => {
    return (
      <div>
        {/* Pending Amount Summary */}
        {pendingDetails && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <Statistic
                  title="Pending Amount for Fuel"
                  value={pendingDetails.totalPendingFuel || 0}
                  precision={2}
                  prefix="Rs."
                  valueStyle={{ color: (pendingDetails.totalPendingFuel || 0) > 0 ? '#ff4d4f' : '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <Statistic
                  title="Pending Amount for Shed by Employees"
                  value={pendingDetails.totalSetCashTaken || 0}
                  precision={2}
                  prefix="Rs."
                  valueStyle={{ color: (pendingDetails.totalSetCashTaken || 0) > 0 ? '#ff4d4f' : '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <Card 
                style={{ cursor: (pendingDetails?.totalPendingAmount || 0) > 0 ? 'pointer' : 'default' }}
                onClick={() => {
                  if ((pendingDetails?.totalPendingAmount || 0) > 0) {
                    shedTransactionForm.setFieldsValue({ 
                      amount: pendingDetails.totalPendingAmount,
                      description: 'Overall pending amount payment',
                      type: 'payment_sent'
                    }); 
                    setShedTransactionModalVisible(true);
                  }
                }}
              >
                <Statistic
                  title="Total Pending Amount"
                  value={pendingDetails.totalPendingAmount || 0}
                  precision={2}
                  prefix="Rs."
                  valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
                />
                {(pendingDetails?.totalPendingAmount || 0) > 0 && (
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <Button type="primary" size="small">
                      Click to Pay Overall
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        )}

        {/* Pending Details History */}
        {pendingDetails && (
          <Card 
            title="Pending Details" 
            extra={
              <Button 
                onClick={() => {
                  shedWalletForm.setFieldsValue(shedWallet);
                  setShedWalletModalVisible(true);
                }}
              >
                Edit Wallet Info
              </Button>
            }
          >
            <Table
              dataSource={[
                // Fuel logs
                ...pendingDetails.pendingByEmployee.flatMap(employee => 
                  employee.logs.map(log => ({
                    ...log,
                    employeeName: employee.employeeName,
                    employeeId: employee.employeeId,
                    key: `fuel_${log._id}`,
                    type: 'fuel'
                  }))
                ),
                // Vehicle logs with set cash
                ...(pendingDetails.vehicleLogsWithSetCash || []).map(log => ({
                  ...log,
                  key: `vehicle_${log._id}`,
                  type: 'set_cash',
                  fuelAmount: 0,
                  totalCost: 0,
                  paidAmount: 0,
                  overallPaidAmount: 0,
                  remainingAmount: log.remainingSetCash || log.setCashTaken,
                  paymentStatus: 'pending'
                }))
              ]}
              rowKey="key"
              columns={[
                { 
                  title: 'Date', 
                  dataIndex: 'date', 
                  key: 'date', 
                  render: (date) => dayjs(date).format('DD/MM/YYYY'),
                  sorter: (a, b) => new Date(a.date) - new Date(b.date)
                },
                { 
                  title: 'Employee', 
                  dataIndex: 'employeeName', 
                  key: 'employeeName',
                  render: (name, record) => (
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>ID: {record.employeeId}</div>
                    </div>
                  )
                },
                { 
                  title: 'Vehicle', 
                  dataIndex: 'vehicleNumber', 
                  key: 'vehicleNumber' 
                },
                { 
                  title: 'Type', 
                  dataIndex: 'type', 
                  key: 'type',
                  render: (type) => (
                    <Tag color={type === 'fuel' ? 'blue' : 'orange'}>
                      {type === 'fuel' ? 'FUEL' : 'SET CASH'}
                    </Tag>
                  )
                },
                { 
                  title: 'Fuel Amount', 
                  dataIndex: 'fuelAmount', 
                  key: 'fuelAmount', 
                  render: (val) => val > 0 ? `${val}L` : '-'
                },
                { 
                  title: 'Total Cost', 
                  dataIndex: 'totalCost', 
                  key: 'totalCost', 
                  render: (val) => val > 0 ? `Rs. ${val.toLocaleString()}` : '-'
                },
                { 
                  title: 'Paid by Employee', 
                  dataIndex: 'paidAmount', 
                  key: 'paidAmount', 
                  render: (val) => val > 0 ? `Rs. ${val.toLocaleString()}` : '-'
                },
                { 
                  title: 'Overall Paid', 
                  dataIndex: 'overallPaidAmount', 
                  key: 'overallPaidAmount', 
                  render: (val) => val > 0 ? `Rs. ${val.toLocaleString()}` : '-'
                },
                { 
                  title: 'Remaining/Set Cash', 
                  dataIndex: 'remainingAmount', 
                  key: 'remainingAmount', 
                  render: (val, record) => (
                    <span style={{ color: val > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
                      Rs. {(val || 0).toLocaleString()}
                    </span>
                  )
                },
                { 
                  title: 'Status', 
                  dataIndex: 'paymentStatus', 
                  key: 'paymentStatus', 
                  render: (status) => (
                    <Tag color={status === 'paid' ? 'green' : status === 'partial' ? 'orange' : 'red'}>
                      {status?.toUpperCase() || 'PENDING'}
                    </Tag>
                  )
                }
              ]}
              pagination={{ pageSize: 10 }}
              summary={(pageData) => {
                const totalRemaining = pageData.reduce((sum, item) => sum + (item.remainingAmount || 0), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={7}>
                      <strong>Total Pending Amount</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7}>
                      <strong style={{ color: '#ff4d4f' }}>
                        Rs. {totalRemaining.toLocaleString()}
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={8} />
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        )}

        {/* Transaction History */}
        <Card 
          title="Transaction History" 
          extra={
            <Space>
              <Button 
                icon={<FilePdfOutlined />} 
                onClick={exportShedWalletAsPDF}
                title="Export as PDF"
              >
                Export PDF
              </Button>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  shedTransactionForm.resetFields();
                  setShedTransactionModalVisible(true);
                }}
              >
                Add Transaction
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={shedTransactions}
            rowKey="_id"
            columns={[
              { 
                title: 'Date', 
                dataIndex: 'transactionDate', 
                key: 'transactionDate', 
                render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                sorter: (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
              },
              { 
                title: 'Type', 
                dataIndex: 'type', 
                key: 'type', 
                render: (type) => (
                  <Tag color={
                    type === 'payment_sent' ? 'red' : 
                    type === 'payment_received' ? 'green' : 
                    type === 'fuel_purchase' ? 'blue' : 
                    type === 'adjustment' ? 'orange' : 'default'
                  }>
                    {type?.replace('_', ' ').toUpperCase()}
                  </Tag>
                )
              },
              { 
                title: 'Amount', 
                dataIndex: 'amount', 
                key: 'amount', 
                render: (val) => (
                  <span style={{ 
                    color: val > 0 ? '#52c41a' : '#ff4d4f', 
                    fontWeight: 'bold' 
                  }}>
                    Rs. {(val || 0).toLocaleString()}
                  </span>
                )
              },
              { 
                title: 'Description', 
                dataIndex: 'description', 
                key: 'description',
                ellipsis: true
              },
              { 
                title: 'Fuel Details', 
                dataIndex: 'fuelLogDetails', 
                key: 'fuelLogDetails',
                render: (fuelLogDetails, record) => {
                  if (!fuelLogDetails || fuelLogDetails.length === 0) {
                    return '-';
                  }
                  
                  return (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        {fuelLogDetails.length} fuel log(s)
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {fuelLogDetails.slice(0, 2).map((log, index) => (
                          <div key={index}>
                            {log.vehicleNumber} - {log.employeeName} (Rs. {log.totalCost?.toLocaleString()})
                          </div>
                        ))}
                        {fuelLogDetails.length > 2 && (
                          <div>+{fuelLogDetails.length - 2} more...</div>
                        )}
                      </div>
                    </div>
                  );
                }
              },
              { 
                title: 'Payment Method', 
                dataIndex: 'paymentMethod', 
                key: 'paymentMethod',
                render: (method) => (
                  <Tag color={
                    method === 'cash' ? 'green' : 
                    method === 'transfer' ? 'blue' : 
                    method === 'cheque' ? 'orange' : 'default'
                  }>
                    {method?.toUpperCase()}
                  </Tag>
                )
              },
              { 
                title: 'Status', 
                dataIndex: 'status', 
                key: 'status', 
                render: (status) => (
                  <Tag color={status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
                    {status?.toUpperCase()}
                  </Tag>
                )
              },
              { 
                title: 'Processed By', 
                dataIndex: 'processedBy', 
                key: 'processedBy' 
              }
            ]}
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender: (record) => {
                if (!record.fuelLogDetails || record.fuelLogDetails.length === 0) {
                  return <div style={{ padding: '16px' }}>No fuel details available</div>;
                }
                
                return (
                  <div style={{ padding: '16px' }}>
                    <h4>Fuel Log Details:</h4>
                    <Table
                      dataSource={record.fuelLogDetails}
                      rowKey="fuelLogId"
                      size="small"
                      columns={[
                        { title: 'Vehicle', dataIndex: 'vehicleNumber', key: 'vehicleNumber' },
                        { title: 'Employee', dataIndex: 'employeeName', key: 'employeeName' },
                        { title: 'Fuel Amount', dataIndex: 'fuelAmount', key: 'fuelAmount', render: (val) => `${val || 0}L` },
                        { title: 'Total Cost', dataIndex: 'totalCost', key: 'totalCost', render: (val) => `Rs. ${(val || 0).toLocaleString()}` },
                        { title: 'Paid by Employee', dataIndex: 'paidAmount', key: 'paidAmount', render: (val) => `Rs. ${(val || 0).toLocaleString()}` },
                        { title: 'Overall Paid', dataIndex: 'overallPaidAmount', key: 'overallPaidAmount', render: (val) => `Rs. ${(val || 0).toLocaleString()}` },
                        { title: 'Status', dataIndex: 'paymentStatus', key: 'paymentStatus', render: (status) => (
                          <Tag color={status === 'paid' ? 'green' : status === 'partial' ? 'orange' : 'red'}>
                            {status?.toUpperCase()}
                          </Tag>
                        )}
                      ]}
                      pagination={false}
                    />
                  </div>
                );
              },
              rowExpandable: (record) => record.fuelLogDetails && record.fuelLogDetails.length > 0
            }}
          />
        </Card>

        {/* Shed Wallet Info Modal */}
        <Modal
          title="Shed Wallet Information"
          open={shedWalletModalVisible}
          onCancel={() => setShedWalletModalVisible(false)}
          onOk={async () => {
            try {
              const values = await shedWalletForm.validateFields();
              await api.put('/api/construction-admin/shed-wallet', values, {
                headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
              });
              message.success('Shed wallet updated');
              setShedWalletModalVisible(false);
              loadShedWallet();
            } catch (e) {
              message.error(e?.response?.data?.error || 'Failed to update shed wallet');
            }
          }}
        >
          <Form form={shedWalletForm} layout="vertical">
            <Form.Item name="shedName" label="Shed Name" rules={[{ required: true, message: 'Enter shed name' }]}>
              <Input placeholder="Shed name" />
            </Form.Item>
            <Form.Item name="contactPerson" label="Contact Person">
              <Input placeholder="Contact person name" />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Phone Number">
              <Input placeholder="Phone number" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Add Transaction Modal */}
        <Modal
          title={shedTransactionForm.getFieldValue('type') === 'payment_sent' && shedTransactionForm.getFieldValue('description') === 'Overall pending amount payment' ? 'Pay Overall Pending Amount' : 'Add Transaction'}
          open={shedTransactionModalVisible}
          onCancel={() => setShedTransactionModalVisible(false)}
          onOk={async () => {
            try {
              const values = await shedTransactionForm.validateFields();
              
              // If this is an overall payment, we need to update the fuel logs and vehicle logs
              if (values.type === 'payment_sent' && values.description === 'Overall pending amount payment') {
                const paymentAmount = Number(values.amount) || 0;
                
                // Update fuel logs with overall payments
                const pendingFuelLogs = await api.get('/api/construction-admin/fuel-logs', {
                  headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                });
                
                const fuelLogsToUpdate = pendingFuelLogs.data.filter(log => 
                  log.paymentStatus === 'pending' || log.paymentStatus === 'partial'
                );
                
                let remainingPayment = paymentAmount;
                
                // First, pay fuel logs
                for (const log of fuelLogsToUpdate) {
                  if (remainingPayment <= 0) break;
                  
                  const paymentForThisLog = Math.min(remainingPayment, log.remainingAmount || 0);
                  if (paymentForThisLog > 0) {
                    const updatedFuelLog = {
                      ...log,
                      overallPaidAmount: (log.overallPaidAmount || 0) + paymentForThisLog
                    };
                    
                    await api.put(`/api/construction-admin/fuel-logs/${log._id}`, updatedFuelLog, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                    });
                    
                    remainingPayment -= paymentForThisLog;
                  }
                }
                
                // Then, pay set cash amounts
                if (remainingPayment > 0 && pendingDetails.vehicleLogsWithSetCash) {
                  for (const log of pendingDetails.vehicleLogsWithSetCash) {
                    if (remainingPayment <= 0) break;
                    
                    const setCashPaidBack = log.setCashPaidBack || 0;
                    const remainingSetCash = Math.max(0, (log.setCashTaken || 0) - setCashPaidBack);
                    const paymentForThisLog = Math.min(remainingPayment, remainingSetCash);
                    
                    if (paymentForThisLog > 0) {
                      const updatedVehicleLog = {
                        setCashPaidBack: setCashPaidBack + paymentForThisLog
                      };
                      
                      await api.put(`/api/construction-admin/vehicle-logs/${log._id}`, updatedVehicleLog, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                      });
                      
                      remainingPayment -= paymentForThisLog;
                    }
                  }
                }
                
                // Record the transaction with fuel log details
                const transactionData = {
                  ...values,
                  fuelLogDetails: fuelLogsToUpdate.map(log => ({
                    fuelLogId: log._id,
                    vehicleNumber: log.vehicleNumber,
                    employeeName: log.employeeName,
                    fuelAmount: log.fuelAmount,
                    totalCost: log.totalCost,
                    paidAmount: log.paidAmount,
                    overallPaidAmount: log.overallPaidAmount,
                    remainingAmount: log.remainingAmount,
                    paymentStatus: log.paymentStatus
                  }))
                };
                
                await api.post('/api/construction-admin/shed-wallet/transaction', transactionData, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                });
                
                message.success('Overall payment processed successfully');
              } else {
                // Regular transaction
                await api.post('/api/construction-admin/shed-wallet/transaction', values, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                });
                message.success('Transaction added');
              }
              
              setShedTransactionModalVisible(false);
              loadShedWallet();
              loadShedTransactions();
              loadPendingDetails();
              loadFuelLogs();
            } catch (e) {
              message.error(e?.response?.data?.error || 'Failed to process transaction');
            }
          }}
        >
          {shedTransactionForm.getFieldValue('type') === 'payment_sent' && shedTransactionForm.getFieldValue('description') === 'Overall pending amount payment' && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <div><strong>Overall Payment Summary:</strong></div>
              <div><strong>Fuel Pending:</strong> Rs. {(pendingDetails?.totalPendingFuel || 0).toLocaleString()}</div>
              <div><strong>Set Cash Taken:</strong> Rs. {(pendingDetails?.totalSetCashTaken || 0).toLocaleString()}</div>
              <div><strong>Total Amount:</strong> Rs. {(pendingDetails?.totalPendingAmount || 0).toLocaleString()}</div>
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                This payment will be distributed across all pending fuel logs and recorded as a shed transaction.
              </div>
            </div>
          )}
          
          <Form form={shedTransactionForm} layout="vertical">
            <Form.Item name="type" label="Transaction Type" rules={[{ required: true, message: 'Select transaction type' }]}>
              <Select placeholder="Select type">
                <Option value="payment_sent">Payment Sent to Shed</Option>
                <Option value="payment_received">Payment Received from Shed</Option>
                <Option value="fuel_purchase">Fuel Purchase</Option>
                <Option value="adjustment">Adjustment</Option>
                <Option value="refund">Refund</Option>
              </Select>
            </Form.Item>
            <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Enter amount' }]}>
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="Amount" 
                min={0} 
                step={0.01}
                formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/Rs.\s?|(,*)/g, '')}
              />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Enter description' }]}>
              <Input placeholder="Transaction description" />
            </Form.Item>
            <Form.Item name="paymentMethod" label="Payment Method">
              <Select placeholder="Select payment method">
                <Option value="cash">Cash</Option>
                <Option value="transfer">Bank Transfer</Option>
                <Option value="cheque">Cheque</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item name="referenceNumber" label="Reference Number">
              <Input placeholder="Reference number (optional)" />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea placeholder="Additional notes (optional)" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'dashboard':
        return renderDashboard();
      case 'employees':
        return renderEmployees();
      case 'suppliers':
        return (
          <div>
            <Card title="Suppliers" extra={
              <Space>
                <Button icon={<FilePdfOutlined />} onClick={exportSuppliersAsPDF}>
                  Export PDF
                </Button>
                <Button type="primary" onClick={() => { setEditingSupplier(null); supplierForm.resetFields(); setSupplierModalVisible(true); }}>
                  Add Supplier
                </Button>
              </Space>
            }>
              <Table
                dataSource={suppliers}
                rowKey="_id"
                columns={[
                  { title: 'Name', dataIndex: 'name', key: 'name' },
                  { title: 'Phone', dataIndex: 'phone', key: 'phone' },
                  { title: 'Address', dataIndex: 'address', key: 'address', ellipsis: true },
                  { title: 'Items', dataIndex: 'items', key: 'items', render: (v)=> (v||[]).join(', ') },
                  { title: 'Wallet Balance', dataIndex: 'walletBalance', key: 'walletBalance', render: v => `Rs. ${Number(v||0).toLocaleString()}` },
                  { title: 'Status', dataIndex: 'status', key: 'status' },
                  { title: 'Actions', key: 'actions', render: (_, rec) => (
                    <Space>
                      <Button size="small" onClick={() => { setEditingSupplier(rec); supplierForm.setFieldsValue({ ...rec }); setSupplierModalVisible(true); }}>Edit</Button>
                      <Popconfirm title="Delete supplier?" onConfirm={async () => { try { await api.delete(`/api/construction-admin/suppliers/${rec._id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` } }); message.success('Supplier deleted'); loadSuppliers(); } catch(e){ message.error(e?.response?.data?.error||'Failed to delete'); } }}> 
                        <Button danger size="small">Delete</Button>
                      </Popconfirm>
                    </Space>
                  )}
                ]}
              />
            </Card>

            <Modal
              title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
              open={supplierModalVisible}
              onCancel={() => setSupplierModalVisible(false)}
              onOk={async () => {
                try {
                  const vals = await supplierForm.validateFields();
                  if (editingSupplier) {
                    await api.put(`/api/construction-admin/suppliers/${editingSupplier._id}`, vals, { headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` } });
                    message.success('Supplier updated');
                  } else {
                    await api.post('/api/construction-admin/suppliers', vals, { headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` } });
                    message.success('Supplier added');
                  }
                  setSupplierModalVisible(false);
                  loadSuppliers();
                } catch(e) {
                  // handled by form or show error
                }
              }}
              okText={editingSupplier ? 'Save' : 'Add'}
            >
              <Form layout="vertical" form={supplierForm} initialValues={{ status: 'active' }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="name" label="Supplier Name" rules={[{ required: true, message: 'Enter supplier name' }]}>
                      <Input placeholder="e.g., ABC Aggregates" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="phone" label="Phone">
                      <Input placeholder="07XXXXXXXX" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="address" label="Address">
                      <Input placeholder="Address" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="items" label="Items">
                      <Select
                        mode="multiple"
                        allowClear
                        placeholder="Select items supplied"
                        optionFilterProp="children"
                      >
                        {items.map(it => (
                          <Option key={it._id} value={it.name}>{it.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="status" label="Status">
                      <Select>
                        <Option value="active">active</Option>
                        <Option value="inactive">inactive</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </div>
        );
      case 'vehicle-logs':
        return renderVehicleLogs();
      case 'customers':
        return renderCustomers();
      case 'items':
        return renderItems();
      case 'fuel-management':
        return renderFuelManagement();
      case 'shed-wallet':
        return renderShedWallet();
      case 'add-vehicle':
        return (
          <div>
            <Card title="Add Vehicle">
              <Form layout="vertical" form={addVehicleForm} onFinish={handleAddVehicle}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name="vehicleNumber" label="Vehicle Number" rules={[{ required: true, message: 'Enter vehicle number' }]}>
                      <Input placeholder="e.g., ABC123" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} style={{ display: 'flex', alignItems: 'end' }}>
                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Add Vehicle</Button>
                  </Col>
                </Row>
              </Form>
              <Divider />
              <Title level={5}>Existing Vehicles</Title>
              <List
                dataSource={vehiclesDisplay}
                locale={{ emptyText: 'No vehicles yet' }}
                renderItem={(v) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        danger 
                        onClick={() => handleDeleteVehicle(v.vehicleNumber)}
                        icon={<DeleteOutlined />}
                      >
                        Delete
                      </Button>
                    ]}
                  >
                    <Text>{v.vehicleNumber}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        );
      case 'credit-management':
        return renderCreditManagement();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  const openVehicleSheet = (vehicleNumber) => {
    setSelectedVehicleForSheet(vehicleNumber);
    // Start with an empty sheet (only new logs). History is shown via View history.
    setSheetRows([]);
    setSalaryRows([]);
    setExpenseRows([]);
    setSalaryPaid(false);
    setExpensesSaved(false);
    setSelectedEmployeeForSalary('');
    setSelectedEmployeeForExpense('');
    setSalaryPaymentMethod('');
    try {
      const yesterdayKey = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      const yCash = vehicleLogs
        .filter(l => l.vehicleNumber === vehicleNumber && dayjs(l.date).format('YYYY-MM-DD') === yesterdayKey)
        .reduce((s, l) => s + (l.payments?.cash || 0), 0);
      setYesterdayBalance(yCash || 0);
    } catch {}
    setSetCashTaken(undefined);
    setVehicleSheetVisible(true);
  };

  const sheetTotals = (() => {
    const cashReceived = sheetRows.reduce((s, r) => s + (Number(r.cash) || 0), 0);
    const setTaken = sheetRows.reduce((s, r) => s + (Number(r.setCash) || 0), 0);
    
    // Calculate yesterday balance only once per unique employee-date combination
    const employeeDateMap = new Map();
    sheetRows.forEach((row) => {
      if (row.employeeId && row.date) {
        const key = `${row.employeeId}-${dayjs(row.date).format('YYYY-MM-DD')}`;
        if (!employeeDateMap.has(key)) {
          employeeDateMap.set(key, Number(row.yBal) || 0);
        }
      }
    });
    const yBalSum = Array.from(employeeDateMap.values()).reduce((sum, val) => sum + val, 0);
    
    const total = (Number(cashReceived) || 0) + setTaken + yBalSum;
    const salaryFromRows = salaryRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const selectedEmployee = employees.find(emp => emp.employeeId === selectedEmployeeForSalary);
    const pendingSalary = selectedEmployee ? (selectedEmployee.pendingSalary || 0) : 0;
    // Display total includes pending salary, but operational deductions should use only current rows
    const salaryTotal = salaryFromRows + pendingSalary;
    const expenseTotal = expenseRows.reduce((s, r) => s + (Number(r.cost) || 0), 0);
    
    // Only deduct salary from balance if it's been marked as "Deduct from Balance"
    // If it's "Add to Pending Salary", it doesn't affect current balance
    const salaryToDeduct = salaryPaid && salaryPaymentMethod === 'balance' ? salaryFromRows : 0;
    const balance = total - expenseTotal - salaryToDeduct;
    
    return { cashReceived, total, salaryTotal, salaryFromRows, expenseTotal, balance };
  })();

  const markSalaryPaid = async () => {
    try {
      // Save salary to employee wallet
      if (salaryRows.length > 0) {
        const totalSalary = salaryRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
        if (totalSalary > 0) {
          // Update employee wallet balance
          const employeeId = sheetRows[0]?.employeeId; // Assuming all rows are for same employee
          if (employeeId) {
            await api.post(`/api/construction-admin/employees/${employeeId}/wallet`, {
              amount: totalSalary,
              type: 'salary',
              description: 'Salary payment'
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` } });
          }
        }
      }
      setSalaryPaid(true);
      message.success('Salary marked as paid and saved to employee wallet');
    } catch (error) {
      message.error('Failed to save salary');
    }
  };

  const saveExpenses = async () => {
    try {
      if (!selectedEmployeeForExpense) {
        message.error('Please select an employee first');
        return;
      }
      if (expenseRows.length > 0) {
        const totalExpenses = expenseRows.reduce((sum, row) => sum + (Number(row.cost) || 0), 0);
        if (totalExpenses > 0) {
          // Update employee wallet balance (subtract expenses)
          await api.post(`/api/construction-admin/employees/${selectedEmployeeForExpense}/wallet`, {
            amount: -totalExpenses,
            type: 'expense',
            description: 'Expenses deducted'
          }, { headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` } });
        }
      }
      setExpensesSaved(true);
      message.success('Expenses saved to employee wallet');
    } catch (error) {
      message.error('Failed to save expenses');
    }
  };

  const computeEmployeeYesterdayBalance = (employeeId, baseDate) => {
    try {
      if (!employeeId) return 0;
      const logDate = baseDate ? dayjs(baseDate) : dayjs();
      
      // Get all previous logs for this employee, sorted by date
      const previousLogs = vehicleLogs
        .filter(l => l.employeeId === employeeId && dayjs(l.date).isBefore(logDate))
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending
      
      // Calculate running balance from all previous logs
      let runningBalance = 0;
      previousLogs.forEach(log => {
        const cash = log.payments?.cash || 0;
        const setCash = log.setCashTaken || 0;
        const expenses = (log.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
        const salaryDeducted = log.salaryDeductedFromBalance || 0;
        
        runningBalance += cash + setCash - expenses - salaryDeducted;
      });
      
      return runningBalance;
    } catch { return 0; }
  };

  const saveVehicleSheet = async () => {
    try {
      console.log('Salary rows:', salaryRows);
      console.log('Expense rows:', expenseRows);
      console.log('Set cash taken:', setCashTaken);
      console.log('Yesterday balance:', yesterdayBalance);
      
      // Build common expenses from the expenses table ONLY (do not duplicate across rows)
      // Set Cash and Yesterday Balance are not treated as expenses and will not be added here
      const commonExpenses = expenseRows.map(e => ({ description: e.expense, amount: Number(e.cost||0) }));
      
      console.log('Common expenses:', commonExpenses);
      console.log('Expense rows total:', expenseRows.reduce((s, r) => s + (Number(r.cost) || 0), 0));

      const smsSuggestions = [];

      for (let i = 0; i < sheetRows.length; i += 1) {
        const row = sheetRows[i];
        if (!row) continue;
        const isFirstRow = i === 0; // only attach common expenses once to avoid double counting
        const payload = {
          date: row.date || new Date(),
          employeeId: row.employeeId,
          employeeName: row.employee,
          vehicleNumber: selectedVehicleForSheet,
          startPlace: row.from,
          endPlace: row.to,
          startMeter: row.startKm,
          endMeter: row.endKm,
          itemsLoading: row.item ? [row.item] : [],
          customerName: row.customer,
          payments: { cash: row.cash || 0, credit: row.credit || 0 },
          // Attach expenses only on the first row to prevent duplication across multiple logs
          expenses: isFirstRow ? commonExpenses : [],
          salary: salaryRows.map(s => ({ item: s.item, amount: Number(s.amount||0) })),
          setCashTaken: row.setCash || 0,
          yesterdayBalance: row.yBal || 0,
          salaryDeductedFromBalance: row.salaryDeductedFromBalance || 0,
          supplier: sheetSupplierId ? {
            supplierId: sheetSupplierId,
            supplierName: suppliers.find(s=>s._id===sheetSupplierId)?.name,
            suppliedItems: supplierRows.map(sr => ({ item: sr.item, quantity: Number(sr.quantity||0), unitPrice: Number(sr.unitPrice||0), total: Number(sr.total||0) })),
            amountPayable: supplierRows.reduce((s,r)=> s + (Number(r.total)||0), 0),
            amountPaid: Number(supplierPaid||0),
            paymentDescription: supplierPaymentDescription || ''
          } : undefined
        };
        console.log('Saving vehicle log payload:', payload);
        const response = await api.post('/api/construction-admin/vehicle-logs', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` } });
        
        // Collect SMS suggestions
        if (response.data.suggestSMS) {
          const found = customers.find(c => c.name === response.data.customerName);
          smsSuggestions.push({
            customerName: response.data.customerName,
            phone: row.customerPhone || found?.phone || ''
          });
        }
      }
      message.success('Vehicle sheet saved successfully');
      await loadVehicleLogs();
      
      // Show SMS suggestions if any (and stop here so the sheet doesn't reopen over the modal)
      if (smsSuggestions.length > 0) {
        const firstSuggestion = smsSuggestions[0];
        setSmsCustomerName(firstSuggestion.customerName);
        setSmsCustomerPhone(firstSuggestion.phone);
        setSmsModalVisible(true);
        return;
      }

      // Refresh vehicle history if it's currently open
      if (selectedVehicle) {
        await loadVehicleHistory(selectedVehicle);
      }
      if (selectedVehicleForSheet) openVehicleSheet(selectedVehicleForSheet);
    } catch (e) {
      message.error('Save failed');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            {collapsed ? 'AKR' : 'AKR Construction'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedSection]}
          items={SECTIONS}
          onClick={({ key }) => setSelectedSection(key)}
        />
      </Sider>
      
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Space>
            <Text strong>A.K.R & SON'S Construction & Suppliers</Text>
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </Header>
        
        <Content style={{ margin: '16px', padding: '16px', background: '#fff', minHeight: 280 }}>
          {renderContent()}
        </Content>
      </Layout>

      <Modal
        title={editingLog ? 'Edit Vehicle Log' : 'Add Vehicle Log'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        zIndex={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            expenses: []
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="employeeId"
                label="Employee"
                rules={[{ required: true, message: 'Please select employee' }]}
              >
                <Select placeholder="Select employee" disabled={lockEmployeeField}>
                  {employees.map(employee => (
                    <Option key={employee.employeeId} value={employee.employeeId}>
                      {employee.name} ({employee.employeeId})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="vehicleNumber"
                label="Vehicle Number"
                rules={[{ required: true, message: 'Please select vehicle number' }]}
              >
                <Select placeholder="Select vehicle number" showSearch allowClear filterOption={(input, option) => option?.children?.toLowerCase?.().includes(input.toLowerCase())}>
                  {vehicles.map(v => (
                    <Option key={typeof v === 'string' ? v : v.vehicleNumber} value={typeof v === 'string' ? v : v.vehicleNumber}>
                      {typeof v === 'string' ? v : v.vehicleNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Items & Delivery</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="itemsLoading" label="Items Loading">
                <Select
                  mode="multiple"
                  placeholder="Select items (sand, salli, etc.)"
                  style={{ width: '100%' }}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {items.map(item => (
                    <Option key={item._id} value={item.name}>
                      {item.name} ({item.unit})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="customerName" label="Customer Name">
                <Select
                  placeholder="Select customer or type new one"
                  style={{ width: '100%' }}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onSelect={(value) => {
                    const customer = customers.find(c => c.name === value);
                    if (customer) {
                      form.setFieldsValue({
                        customerPhone: customer.phone,
                        deliveryAddress: customer.address
                      });
                    }
                  }}
                >
                  {customers.map(customer => (
                    <Option key={customer._id} value={customer.name}>
                      {customer.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="customerPhone" label="Customer Phone">
                <Input placeholder="Customer phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="deliveryAddress" label="Delivery Address">
                <Input.TextArea rows={2} placeholder="Delivery address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="startMeter" label="Start Meter (KM)">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Start meter reading"
                  onChange={(value) => {
                    const endMeter = form.getFieldValue('endMeter');
                    if (value && endMeter) {
                      const workingKm = endMeter - value;
                      form.setFieldsValue({ workingKm: workingKm > 0 ? workingKm : 0 });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="endMeter" label="End Meter (KM)">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="End meter reading"
                  onChange={(value) => {
                    const startMeter = form.getFieldValue('startMeter');
                    if (value && startMeter) {
                      const workingKm = value - startMeter;
                      form.setFieldsValue({ workingKm: workingKm > 0 ? workingKm : 0 });
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="startPlace" label="Start Place">
                <Input placeholder="Starting location" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="endPlace" label="End Place">
                <Input placeholder="Ending location" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="workingKm" label="Working (KM)">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Auto-calculated distance"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="description" label="Description">
                <Input placeholder="Work description" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="duties" label="Duties Performed">
                <Select
                  mode="multiple"
                  placeholder="Select duties"
                  style={{ width: '100%' }}
                >
                  <Option value="Driving">Driving</Option>
                  <Option value="Supervision">Supervision</Option>
                  <Option value="Loading">Loading</Option>
                  <Option value="Unloading">Unloading</Option>
                  <Option value="Maintenance">Maintenance</Option>
                  <Option value="Construction">Construction</Option>
                  <Option value="Material Handling">Material Handling</Option>
                  <Option value="Safety Management">Safety Management</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Payments</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item name={['payments', 'credit']} label="Credit Amount">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Credit amount" 
                  onChange={(value) => {
                    const cash = form.getFieldValue(['payments', 'cash']) || 0;
                    const total = (value || 0) + cash;
                    form.setFieldsValue({ payments: { ...form.getFieldValue('payments'), total } });
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name={['payments', 'cash']} label="Cash Amount">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Cash amount"
                  onChange={(value) => {
                    const credit = form.getFieldValue(['payments', 'credit']) || 0;
                    const total = (value || 0) + credit;
                    form.setFieldsValue({ payments: { ...form.getFieldValue('payments'), total } });
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name={['payments', 'total']} label="Total Amount">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Total (auto-calculated)"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name={['payments', 'paymentMethod']} label="Payment Method">
                <Select placeholder="Select method">
                  <Option value="cash">Cash</Option>
                  <Option value="credit">Credit</Option>
                  <Option value="mixed">Mixed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Meters</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="startMeter" label="Start Meter">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Start meter"
                  onChange={(value) => {
                    const endMeter = form.getFieldValue('endMeter') || 0;
                    const workingKm = (endMeter && value) ? Math.max(endMeter - value, 0) : 0;
                    form.setFieldsValue({ workingKm });
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="endMeter" label="End Meter">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="End meter"
                  onChange={(value) => {
                    const startMeter = form.getFieldValue('startMeter') || 0;
                    const workingKm = (startMeter && value) ? Math.max(value - startMeter, 0) : 0;
                    form.setFieldsValue({ workingKm });
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="workingKm" label="Total (KM)">
                <InputNumber style={{ width: '100%' }} placeholder="Total KM" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Expenses</Divider>

          <Form.List name="expenses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        label="Description"
                        rules={[{ required: true, message: 'Missing description' }]}
                      >
                        <Input placeholder="Expense description" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'amount']}
                        label="Amount"
                        rules={[{ required: true, message: 'Missing amount' }]}
                      >
                        <InputNumber style={{ width: '100%' }} placeholder="Amount" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={4}>
                      <Button 
                        type="link" 
                        danger 
                        onClick={() => remove(name)}
                        style={{ marginTop: 32 }}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Expense
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="driverSignature" label="Driver Signature">
                <Input placeholder="Driver name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="supervisorSignature" label="Supervisor Signature">
                <Input placeholder="Supervisor name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingLog ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Employee Modal */}
      <Modal
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        open={employeeModalVisible}
        onCancel={() => setEmployeeModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={employeeForm}
          layout="vertical"
          onFinish={handleEmployeeSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter employee name' }]}
              >
                <Input placeholder="Employee full name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Please enter valid email' }]}
              >
                <Input placeholder="Email address" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[{ required: true, message: 'Please select position' }]}
              >
                <Select placeholder="Select position">
                  <Option value="Driver">Driver</Option>
                  <Option value="Supervisor">Supervisor</Option>
                  <Option value="Worker">Worker</Option>
                  <Option value="Manager">Manager</Option>
                  <Option value="Engineer">Engineer</Option>
                  <Option value="Technician">Technician</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="salary"
                label="Salary"
              >
                <InputNumber style={{ width: '100%' }} placeholder="Monthly salary" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="joiningDate"
                label="Joining Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="on_leave">On Leave</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="department"
                label="Department"
              >
                <Input placeholder="Department" defaultValue="Construction" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Address">
            <Input.TextArea rows={3} placeholder="Full address" />
          </Form.Item>

          <Divider>Emergency Contact</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name={['emergencyContact', 'name']} label="Contact Name">
                <Input placeholder="Emergency contact name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name={['emergencyContact', 'phone']} label="Contact Phone">
                <Input placeholder="Emergency contact phone" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name={['emergencyContact', 'relationship']} label="Relationship">
                <Input placeholder="Relationship" />
              </Form.Item>
            </Col>
          </Row>

          

          <Divider>Duties</Divider>

          <Form.Item name="duties" label="Assigned Duties">
            <Select
              mode="multiple"
              placeholder="Select duties"
              style={{ width: '100%' }}
            >
              <Option value="Driving">Driving</Option>
              <Option value="Supervision">Supervision</Option>
              <Option value="Loading">Loading</Option>
              <Option value="Unloading">Unloading</Option>
              <Option value="Maintenance">Maintenance</Option>
              <Option value="Construction">Construction</Option>
              <Option value="Material Handling">Material Handling</Option>
              <Option value="Safety Management">Safety Management</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setEmployeeModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingEmployee ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Employee History Modal */}
      <Modal
        title={`Employee History - ${selectedEmployee?.name}`}
        open={!!selectedEmployee}
        onCancel={() => {
          setSelectedEmployee(null);
          setEmployeeHistory(null);
        }}
        footer={null}
        width={1200}
      >
        {employeeHistory && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} md={8}>
                <Card title="Employee Info" size="small">
                  <p><strong>ID:</strong> {employeeHistory.employee.employeeId}</p>
                  <p><strong>Name:</strong> {employeeHistory.employee.name}</p>
                  <p><strong>Position:</strong> {employeeHistory.employee.position}</p>
                  <p><strong>Phone:</strong> {employeeHistory.employee.phone}</p>
                  <p><strong>Status:</strong> {employeeHistory.employee.status}</p>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card title="Statistics" size="small">
                  <p><strong>Total Trips:</strong> {employeeHistory.statistics.totalTrips}</p>
                  <p><strong>Total KM:</strong> {employeeHistory.statistics.totalKm}</p>
                  <p><strong>Total Expenses:</strong> Rs. {employeeHistory.statistics.totalExpenses}</p>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card title="Assigned Vehicles" size="small">
                  {employeeHistory.employee.assignedVehicles?.map(vehicle => (
                    <Tag key={vehicle} style={{ margin: 2 }}>{vehicle}</Tag>
                  ))}
                </Card>
              </Col>
            </Row>

            <Card title="Vehicle Log History">
              <Table
                dataSource={employeeHistory.vehicleLogs}
                columns={vehicleLogColumns.filter(col => col.key !== 'actions')}
                pagination={false}
                size="small"
                rowKey="_id"
                scroll={{ x: 1000 }}
              />
            </Card>
          </div>
                 )}
       </Modal>

       {/* Vehicle History Modal */}
       <Modal
         title={`Vehicle History - ${selectedVehicle}`}
         open={!!selectedVehicle}
         onCancel={() => {
           setSelectedVehicle(null);
           setVehicleHistory(null);
         }}
         footer={null}
         width={1300}
       >
         {vehicleHistory && (
           <div>
             <Card title="Vehicle Log History">
               <div style={{ marginBottom: 16 }}>
                 <Button 
                   type="primary" 
                   onClick={() => loadVehicleHistory(selectedVehicle)}
                   icon={<SearchOutlined />}
                 >
                   Refresh History
                 </Button>
               <Button 
                 style={{ marginLeft: 8 }}
                 onClick={() => {
                   setSelectedVehicle(null); // Close history modal
                   setVehicleHistory(null);
                   setSelectedSection('vehicle-logs'); // Navigate to Vehicle Logs tab
                 }}
                 icon={<PlusOutlined />}
               >
                 Add Vehicle Log
               </Button>
               </div>
              <Table
                dataSource={vehicleHistory.logs}
                columns={[
                  ...vehicleLogColumns.filter(col => col.key !== 'actions'),
                  {
                    title: 'Export',
                    key: 'export',
                    width: 80,
                    render: (_, record) => (
                      <Button 
                        type="default" 
                        size="small" 
                        icon={<DownloadOutlined />}
                        onClick={() => exportVehicleLogAsPDF(record)}
                        title="Export as PDF"
                      />
                    ),
                  },
                  {
                    title: 'Actions',
                    key: 'delete',
                    width: 90,
                    render: (_, record) => (
                      <Popconfirm
                        title="Delete this vehicle log?"
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                          try {
                            await api.delete(`/api/construction-admin/vehicle-logs/${record._id}` , {
                              headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
                            });
                            message.success('Vehicle log deleted');
                            if (selectedVehicle) {
                              await loadVehicleHistory(selectedVehicle);
                            }
                          } catch (e) {
                            message.error(e?.response?.data?.error || 'Failed to delete');
                          }
                        }}
                      >
                        <Button danger size="small">Delete</Button>
                      </Popconfirm>
                    )
                  }
                ]}
                pagination={false}
                size="small"
                rowKey="_id"
                scroll={{ x: 1300 }}
              />
             </Card>
           </div>
         )}
       </Modal>

       {/* Customer Modal */}
       <Modal
         title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
         open={customerModalVisible}
         onCancel={() => setCustomerModalVisible(false)}
         footer={null}
         width={800}
       >
         <Form
           form={customerForm}
           layout="vertical"
           onFinish={handleCustomerSubmit}
         >
           <Row gutter={16}>
             <Col xs={24} sm={12}>
               <Form.Item
                 name="name"
                 label="Customer Name"
                 rules={[{ required: true, message: 'Please enter customer name' }]}
               >
                 <Input placeholder="Customer full name" />
               </Form.Item>
             </Col>
             <Col xs={24} sm={12}>
               <Form.Item
                 name="phone"
                 label="Phone Number"
                 rules={[{ required: true, message: 'Please enter phone number' }]}
               >
                 <Input placeholder="Phone number" />
               </Form.Item>
             </Col>
           </Row>

           <Row gutter={16}>
             <Col xs={24} sm={12}>
               <Form.Item
                 name="email"
                 label="Email"
                 rules={[{ type: 'email', message: 'Please enter valid email' }]}
               >
                 <Input placeholder="Email address" />
               </Form.Item>
             </Col>
            
           </Row>

           <Form.Item name="address" label="Address">
             <Input.TextArea rows={3} placeholder="Full address" />
           </Form.Item>

           <Form.Item name="notes" label="Notes">
             <Input.TextArea rows={2} placeholder="Additional notes" />
           </Form.Item>

           {/* Credit Status Summary */}
           <Divider>Credit Status Summary</Divider>
           <Row gutter={16} style={{ marginBottom: 16 }}>
             <Col xs={24}>
               <Alert
                 message="Payment Information"
                 description={
                   <div>
                     <p><strong>Customer:</strong> {creditPaymentForm.getFieldValue('customerName') || 'Not selected'}</p>
                     <p><strong>Payment Amount:</strong> Rs. {creditPaymentForm.getFieldValue('paymentAmount') || 0}</p>
                     <p><strong>Payment Date:</strong> {creditPaymentForm.getFieldValue('paymentDate')?.format('DD/MM/YYYY') || 'Not selected'}</p>
                   </div>
                 }
                 type="info"
                 showIcon
               />
             </Col>
           </Row>

           <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
             <Space>
               <Button onClick={() => setCustomerModalVisible(false)}>
                 Cancel
               </Button>
               <Button type="primary" htmlType="submit">
                 {editingCustomer ? 'Update' : 'Create'}
               </Button>
             </Space>
           </Form.Item>
         </Form>
       </Modal>

       {/* Item Modal */}
       <Modal
         title={editingItem ? 'Edit Item' : 'Add Item'}
         open={itemModalVisible}
         onCancel={() => setItemModalVisible(false)}
         footer={null}
         width={800}
       >
         <Form
           form={itemForm}
           layout="vertical"
           onFinish={handleItemSubmit}
         >
           <Row gutter={16}>
             <Col xs={24} sm={12}>
               <Form.Item
                 name="name"
                 label="Item Name"
                 rules={[{ required: true, message: 'Please enter item name' }]}
               >
                 <Input placeholder="Item name (e.g., Sand, Salli)" />
               </Form.Item>
             </Col>
             <Col xs={24} sm={12}>
               <Form.Item
                 name="category"
                 label="Category"
                 rules={[{ required: true, message: 'Please select category' }]}
               >
                 <Select placeholder="Select category">
                   <Option value="construction">Construction</Option>
                   <Option value="supplies">Supplies</Option>
                   <Option value="materials">Materials</Option>
                 </Select>
               </Form.Item>
             </Col>
           </Row>

           <Row gutter={16}>
             <Col xs={24} sm={12}>
               <Form.Item
                 name="unit"
                 label="Unit"
                 rules={[{ required: true, message: 'Please enter unit' }]}
               >
                 <Input placeholder="e.g., tons, kg, pieces, liters" />
               </Form.Item>
             </Col>
             <Col xs={24} sm={12}>
               <Form.Item
                 name="pricePerUnit"
                 label="Price per Unit"
               >
                 <InputNumber style={{ width: '100%' }} placeholder="Price per unit" />
               </Form.Item>
             </Col>
           </Row>

           <Form.Item name="description" label="Description">
             <Input.TextArea rows={2} placeholder="Item description" />
           </Form.Item>

           <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
             <Select placeholder="Select status">
               <Option value="active">Active</Option>
               <Option value="inactive">Inactive</Option>
             </Select>
           </Form.Item>

           <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
             <Space>
               <Button onClick={() => setItemModalVisible(false)}>
                 Cancel
               </Button>
               <Button type="primary" htmlType="submit">
                 {editingItem ? 'Update' : 'Create'}
               </Button>
             </Space>
           </Form.Item>
         </Form>
       </Modal>

       {/* Credit Payment Modal */}
       <Modal
  title="Record Credit Payment"
  open={creditPaymentModalVisible}
  onCancel={() => {
    setCreditPaymentModalVisible(false);
    creditPaymentForm.resetFields();
  }}
  footer={null}
  width={600}
  destroyOnClose
>
  <Form
    form={creditPaymentForm}
    layout="vertical"
    onFinish={handleCreditPaymentSubmit}
  >
    <Row gutter={16}>
      <Col xs={24} sm={12}>
        <Form.Item
          name="customerId"
          label="Customer"
          rules={[{ required: true, message: 'Please select customer' }]}
        >
          <Select 
            placeholder="Select customer"
            onChange={(value) => {
              const customer = customers.find(c => c._id === value);
              if (customer) {
                creditPaymentForm.setFieldsValue({ 
                  customerName: customer.name,
                  originalCreditAmount: customer.remainingCredit || 0 // Set originalCreditAmount
                });
              }
            }}
          >
            {customers.map(customer => (
              <Option key={customer._id} value={customer._id}>
                {customer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          name="customerName"
          label="Customer Name"
        >
          <Input placeholder="Customer name" disabled />
        </Form.Item>
      </Col>
    </Row>

    <Row gutter={16}>
      <Col xs={24} sm={12}>
        <Form.Item
          name="originalCreditAmount"
          label="Original Credit Amount"
          rules={[{ required: true, message: 'Original credit amount is required' }]}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            placeholder="Original credit amount"
            disabled // Make it read-only since it's auto-populated
            precision={2}
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          name="paymentAmount"
          label="Payment Amount"
          rules={[
            { required: true, message: 'Please enter payment amount' },
            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
          ]}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            placeholder="Payment amount"
            min={0.01}
            step={0.01}
            precision={2}
          />
        </Form.Item>
      </Col>
    </Row>

    <Row gutter={16}>
      <Col xs={24} sm={12}>
        <Form.Item
          name="paymentDate"
          label="Payment Date"
          rules={[{ required: true, message: 'Please select payment date' }]}
        >
          <DatePicker 
            style={{ width: '100%' }}
            defaultValue={dayjs()}
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item
          name="paymentMethod"
          label="Payment Method"
          rules={[{ required: true, message: 'Please select payment method' }]}
          initialValue="cash"
        >
          <Select placeholder="Select payment method">
            <Option value="cash">Cash</Option>
            <Option value="bank_transfer">Bank Transfer</Option>
            <Option value="cheque">Cheque</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>
      </Col>
    </Row>

    <Row gutter={16}>
      <Col xs={24}>
        <Form.Item
          name="referenceNumber"
          label="Reference Number"
        >
          <Input placeholder="Cheque no., transaction ID, etc." />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item name="notes" label="Notes">
      <Input.TextArea rows={2} placeholder="Additional notes" />
    </Form.Item>

    <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
      <Space>
        <Button onClick={() => setCreditPaymentModalVisible(false)}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit">
          Record Payment
        </Button>
      </Space>
    </Form.Item>
  </Form>
</Modal>

{/* Salary Payment Modal */}
<Modal
  title={`${salaryPaymentMethod === 'balance' ? 'Deduct from Balance' : 'Add to Pending Salary'}`}
  open={salaryPaymentModalVisible}
  onCancel={() => setSalaryPaymentModalVisible(false)}
  zIndex={2000}
  onOk={async () => {
    try {
      if (salaryPaymentMethod === 'balance') {
        // Deduct from employee wallet balance
        await api.post(`/api/construction-admin/employees/${selectedEmployeeForSalary}/wallet`, {
          amount: -salaryAmount,
          type: 'salary_deduction',
          description: 'Salary deducted from balance'
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` } });
        
        // Update all current sheet rows to track salary deducted from balance
        const updatedRows = sheetRows.map(row => ({
          ...row,
          salaryDeductedFromBalance: salaryAmount
        }));
        setSheetRows(updatedRows);
        
        message.success('Salary deducted from employee balance');
        setSalaryPaid(true); // Mark as paid so it affects balance
      } else {
        // Add to pending salary (tracked separately)
        await api.post(`/api/construction-admin/employees/${selectedEmployeeForSalary}/pending-salary`, {
          amount: salaryAmount,
          description: 'Pending salary added'
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` } });
        message.success('Salary added to pending salary');
        setSalaryPaid(false); // Don't mark as paid so it doesn't affect current balance
        
        // Add to salaryRows for vehicle log saving
        const salaryItem = salaryRows.find(s => s.item && s.amount > 0);
        if (salaryItem) {
          setSalaryRows([salaryItem]); // Keep the salary item for saving
        }
      }
      setSalaryPaymentModalVisible(false);
    } catch (error) {
      message.error('Failed to process salary payment');
    }
  }}
>
  <div>
    <p><strong>Employee:</strong> {employees.find(emp => emp.employeeId === selectedEmployeeForSalary)?.name}</p>
    <p><strong>Amount:</strong> Rs. {salaryAmount.toLocaleString()}</p>
    <p><strong>Method:</strong> {salaryPaymentMethod === 'balance' ? 'Deduct from Balance' : 'Add to Pending Salary'}</p>
    {salaryPaymentMethod === 'salary' && (
      <div style={{ marginTop: 16 }}>
        <label>Amount to add to pending salary:</label>
        <InputNumber
          value={salaryAmount}
          onChange={setSalaryAmount}
          style={{ width: '100%', marginTop: 8 }}
          formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/Rs.\s?|(,*)/g, '')}
        />
      </div>
    )}
  </div>
</Modal>

{/* Wallet Modal */}
<Modal
  title={`Wallet Details - ${selectedEmployeeForWallet?.name}`}
  open={walletModalVisible}
  onCancel={() => setWalletModalVisible(false)}
  footer={[
    <Button key="close" onClick={() => setWalletModalVisible(false)}>
      Close
    </Button>
  ]}
  width={600}
  zIndex={1500}
>
  <div style={{ marginBottom: 20 }}>
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card size="small" title="Pending Salary">
          <div style={{ fontSize: 24, fontWeight: 'bold', color: selectedEmployeeForWallet?.pendingSalary > 0 ? '#1890ff' : '#8c8c8c' }}>
            Rs. {Number(selectedEmployeeForWallet?.pendingSalary || 0).toLocaleString()}
          </div>
          <div style={{ marginTop: 12 }}>
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber
                min={1}
                placeholder="Amount"
                style={{ width: '60%' }}
                value={walletMarkPaidAmount}
                onChange={setWalletMarkPaidAmount}
              />
              <Button type="primary" onClick={async () => {
                if (!selectedEmployeeForWallet) return;
                const amt = Number(walletMarkPaidAmount || 0);
                if (!amt || amt <= 0) { message.error('Enter amount'); return; }
                try {
                  await api.post(`/api/construction-admin/employees/${selectedEmployeeForWallet.employeeId}/mark-salary-paid`, { amount: amt }, { headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` } });
                  message.success('Marked as paid');
                  await loadEmployees();
                  await loadWalletHistory(selectedEmployeeForWallet.employeeId);
                  setWalletMarkPaidAmount(undefined);
                } catch {
                  message.error('Failed to mark paid');
                }
              }}>Mark Paid</Button>
            </Space.Compact>
          </div>
        </Card>
      </Col>
      <Col span={12}>
        <Card size="small" title="Yesterday Balance">
          <div style={{ fontSize: 24, fontWeight: 'bold', color: selectedEmployeeForWallet?.yesterdayBalance >= 0 ? '#52c41a' : '#ff4d4f' }}>
            Rs. {Number(selectedEmployeeForWallet?.yesterdayBalance || 0).toLocaleString()}
          </div>
        </Card>
      </Col>
    </Row>
  </div>
  
  {/* Removed Last Salary Payment card per request */}
</Modal>

     {/* SMS Modal */}
     <Modal
       title="Send Thank You Message"
       open={smsModalVisible}
       onCancel={() => {
         setSmsModalVisible(false);
         setSmsCustomerName('');
         setSmsCustomerPhone('');
       }}
       footer={[
         <Button key="cancel" onClick={() => {
           setSmsModalVisible(false);
           setSmsCustomerName('');
           setSmsCustomerPhone('');
         }}>
           Skip
         </Button>,
         <Button key="send" type="primary" onClick={sendSMS}>
           Send SMS
         </Button>
       ]}
     >
       <div style={{ padding: '20px 0' }}>
         <p style={{ marginBottom: '16px', fontSize: '16px' }}>
           Customer <strong>{smsCustomerName}</strong> didn't use credit. Would you like to send a thank you message?
         </p>
         <p style={{ marginBottom: '20px', color: '#666' }}>
           Message: "Thank you for contacting AKR Construction. Contact 0773111226 for any inquiries."
         </p>
         <div>
           <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
             Customer Phone Number:
           </label>
           <Input
             placeholder="Enter phone number (e.g., 0771234567)"
             value={smsCustomerPhone}
             onChange={(e) => setSmsCustomerPhone(e.target.value)}
             style={{ width: '100%' }}
           />
         </div>
       </div>
     </Modal>

     {/* Date Picker Modal for Vehicle Logs Export */}
     <Modal
       title="Export Vehicle Logs by Date"
       open={datePickerModalVisible}
       onCancel={() => setDatePickerModalVisible(false)}
       onOk={async () => {
         try {
           const values = await datePickerForm.validateFields();
           await exportDateWiseVehicleLogsAsPDF(values.selectedDate);
           setDatePickerModalVisible(false);
           datePickerForm.resetFields();
         } catch (error) {
           console.error('Date picker validation error:', error);
         }
       }}
       okText="Export PDF"
       cancelText="Cancel"
     >
       <Form form={datePickerForm} layout="vertical">
         <Form.Item
           name="selectedDate"
           label="Select Date"
           rules={[{ required: true, message: 'Please select a date' }]}
         >
           <DatePicker 
             style={{ width: '100%' }} 
             format="DD/MM/YYYY"
             placeholder="Select date to export vehicle logs"
           />
         </Form.Item>
       </Form>
     </Modal>
     </Layout>
   );
   };

export default ConstructionAdminDashboard; 