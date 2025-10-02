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
  SaveOutlined
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
  { key: 'vehicle-logs', label: 'Vehicle Logs', icon: <CarOutlined /> },
  { key: 'customers', label: 'Customers', icon: <UserOutlined /> },
  { key: 'items', label: 'Items', icon: <FileTextOutlined /> },
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
  const [editingLog, setEditingLog] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
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
  const [creditPaymentForm] = Form.useForm();
  const [addVehicleForm] = Form.useForm();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
    loadVehicles();
    loadEmployees();
    loadEmployeePositions();
    loadCustomers();
    loadItems();
    loadCreditOverview();
    loadCreditPayments();
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
          <Col xs={24} sm={6}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddEmployee}
              style={{ width: '100%' }}
            >
              Add Employee
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
          <Col xs={24} sm={6}>
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
          <Col xs={24} sm={6}>
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

      <Card title="Credit Details" style={{ marginTop: 16 }}>
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

  const renderContent = () => {
    switch (selectedSection) {
      case 'dashboard':
        return renderDashboard();
      case 'employees':
        return renderEmployees();
      case 'vehicle-logs':
        return renderVehicleLogs();
      case 'customers':
        return renderCustomers();
      case 'items':
        return renderItems();
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
          salaryDeductedFromBalance: row.salaryDeductedFromBalance || 0
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
     </Layout>
   );
   };

export default ConstructionAdminDashboard; 