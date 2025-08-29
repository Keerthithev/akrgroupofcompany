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
  HistoryOutlined
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
  const [form] = Form.useForm();
  const [employeeForm] = Form.useForm();
  const [customerForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [creditPaymentForm] = Form.useForm();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
    loadVehicles();
    loadEmployees();
    loadEmployeePositions();
    loadCustomers();
    loadItems();
    loadCreditOverview();
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
      setVehicles(response.data);
    } catch (error) {
      message.error('Failed to load vehicles');
    }
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

  const handleLogout = () => {
    localStorage.removeItem('constructionAdminToken');
    localStorage.removeItem('adminRole');
    navigate('/admin-login');
  };

  const handleAddLog = () => {
    setEditingLog(null);
    form.resetFields();
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
      } else {
        await api.post('/api/construction-admin/vehicle-logs', logData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('constructionAdminToken')}` }
        });
        message.success('Vehicle log created successfully');
      }
      
      setModalVisible(false);
      loadVehicleLogs();
      loadDashboardData();
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
      const logExpenses = log.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      months[month].expenses += logExpenses + (log.payments?.total || 0);
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
        const totalExpenses = fuelExpense + otherExpenses + (log.payments?.total || 0);
        
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
          const logExpenses = log.expenses?.reduce((logSum, expense) => logSum + expense.amount, 0) || 0;
          return sum + logExpenses + (log.payments?.total || 0);
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
          const logExpenses = log.expenses?.reduce((logSum, expense) => logSum + expense.amount, 0) || 0;
          return sum + logExpenses + (log.payments?.total || 0);
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



  const vehicleLogColumns = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 120,
    },
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
      title: 'Working KM',
      dataIndex: 'workingKm',
      key: 'workingKm',
      width: 100,
    },
    {
      title: 'Duties',
      dataIndex: 'duties',
      key: 'duties',
      width: 150,
      render: (duties) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {duties?.map(duty => (
            <Tag key={duty} size="small">{duty}</Tag>
          ))}
        </div>
      ),
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
      title: 'Credit Status',
      dataIndex: 'payments',
      key: 'creditStatus',
      width: 120,
      render: (payments) => {
        if (!payments?.credit || payments.credit === 0) return '-';
        const status = payments.creditStatus || 'pending';
        const color = status === 'completed' ? 'green' : status === 'partial' ? 'orange' : 'red';
        return <Tag color={color} size="small">{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Fuel (L)',
      dataIndex: 'fuel',
      key: 'fuelLiters',
      width: 100,
      render: (fuel) => fuel?.liters || 0,
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
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
      title: 'Assigned Vehicles',
      dataIndex: 'assignedVehicles',
      key: 'assignedVehicles',
      width: 150,
      render: (vehicles) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {vehicles?.map(vehicle => (
            <Tag 
              key={vehicle} 
              style={{ cursor: 'pointer' }}
              onClick={() => handleViewVehicleHistory(vehicle)}
              size="small"
            >
              {vehicle}
            </Tag>
          ))}
        </div>
      ),
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
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Logs"
              value={dashboardData?.totalLogsToday || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Monthly Logs"
              value={dashboardData?.totalLogsMonth || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Vehicles"
              value={dashboardData?.totalVehicles || 0}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={dashboardData?.totalEmployees || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Monthly Expenses"
              value={dashboardData?.totalExpenses || 0}
              prefix={<DollarOutlined />}
              suffix="Rs."
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Credit"
              value={dashboardData?.totalCredit || 0}
              prefix={<DollarOutlined />}
              suffix="Rs."
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Cash"
              value={dashboardData?.totalCash || 0}
              prefix={<DollarOutlined />}
              suffix="Rs."
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Payments"
              value={dashboardData?.totalPayments || 0}
              prefix={<DollarOutlined />}
              suffix="Rs."
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Credit Overview" size="small">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>Total Pending Credit:</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#cf1322' }}>
                  Rs. {creditOverview?.reduce((sum, customer) => sum + customer.remainingCredit, 0) || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>Customers with Pending Credit:</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                  {creditOverview?.length || 0}
                </span>
              </div>
            </div>
            
            {/* Customer Credit Details Table */}
            {creditOverview && creditOverview.length > 0 ? (
              <div>
                <Divider style={{ margin: '12px 0' }}>Customer Credit Details</Divider>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {creditOverview.map((customer, index) => (
                    <div 
                      key={customer.customerId} 
                      style={{ 
                        padding: '12px', 
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                        border: '1px solid #e8e8e8',
                        borderRadius: '6px',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1890ff', marginBottom: '4px' }}>
                            {customer.customerName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            📞 {customer.customerPhone}
                          </div>
                          <div style={{ fontSize: '12px', color: '#cf1322', fontWeight: 'bold' }}>
                            Credit: Rs. {customer.remainingCredit?.toLocaleString() || 0}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flex: 1 }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            🚚 Delivery Employee:
                          </div>
                          {customer.deliveryEmployees?.map((employee, empIndex) => (
                            <div key={empIndex} style={{ fontSize: '11px', color: '#1890ff', marginBottom: '2px' }}>
                              👤 {employee.name} ({employee.employeeId})
                            </div>
                          )) || (
                            <div style={{ fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                              No employee info
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', fontStyle: 'italic', padding: '20px 0' }}>
                No pending credits
              </div>
            )}
            
            <Divider style={{ margin: '16px 0' }} />
            <Button 
              type="primary" 
              size="small"
              onClick={() => setSelectedSection('credit-management')}
              style={{ width: '100%' }}
            >
              View Full Credit Details
            </Button>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Vehicle Logs">
                    <Table
          dataSource={dashboardData?.recentLogs || []}
          style={{ fontSize: '12px' }}
          columns={[
                {
                  title: 'Employee',
                  dataIndex: 'employeeName',
                  key: 'employeeName',
                  width: 120,
                },
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
                  title: 'Working KM',
                  dataIndex: 'workingKm',
                  key: 'workingKm',
                  width: 100,
                },
                {
                  title: 'Duties',
                  dataIndex: 'duties',
                  key: 'duties',
                  width: 150,
                  render: (duties) => (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {duties?.map(duty => (
                        <Tag key={duty} size="small">{duty}</Tag>
                      ))}
                    </div>
                  ),
                },
                {
                  title: 'Total Payment',
                  dataIndex: 'payments',
                  key: 'totalPayment',
                  width: 120,
                  render: (payments) => `Rs. ${payments?.total || 0}`,
                },
                {
                  title: 'Fuel (L)',
                  dataIndex: 'fuel',
                  key: 'fuelLiters',
                  width: 100,
                  render: (fuel) => fuel?.liters || 0,
                },

              ]}
              pagination={false}
              size="small"
              rowKey="_id"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Employees">
            <Table
              dataSource={dashboardData?.recentEmployees || []}
              style={{ fontSize: '12px' }}
              columns={[
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
                  title: 'Assigned Vehicles',
                  dataIndex: 'assignedVehicles',
                  key: 'assignedVehicles',
                  width: 150,
                  render: (vehicles) => (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {vehicles?.map(vehicle => (
                        <Tag 
                          key={vehicle} 
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleViewVehicleHistory(vehicle)}
                          size="small"
                        >
                          {vehicle}
                        </Tag>
                      ))}
                    </div>
                  ),
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
                    <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange'} size="small">
                      {status?.toUpperCase()}
                    </Tag>
                  ),
                },
              ]}
              pagination={false}
              size="small"
              rowKey="_id"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="All Vehicles" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          {vehicles.map(vehicle => (
            <Col xs={24} sm={12} md={8} lg={6} key={vehicle}>
              <Card 
                size="small" 
                hoverable
                onClick={() => handleViewVehicleHistory(vehicle)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <CarOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                  <div><strong>{vehicle}</strong></div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Click to view history
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
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
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by Employee"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, employeeId: value }))}
            >
              {employees.map(employee => (
                <Select.Option key={employee.employeeId} value={employee.employeeId}>
                  {employee.name} ({employee.employeeId})
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by Vehicle"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, vehicleNumber: value }))}
            >
              {vehicles.map(vehicle => (
                <Select.Option key={vehicle} value={vehicle}>{vehicle}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates) {
                  setFilters(prev => ({
                    ...prev,
                    startDate: dates[0].format('YYYY-MM-DD'),
                    endDate: dates[1].format('YYYY-MM-DD')
                  }));
                } else {
                  setFilters(prev => {
                    const { startDate, endDate, ...rest } = prev;
                    return rest;
                  });
                }
              }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddLog}
              style={{ width: '100%' }}
            >
              Add Vehicle Log
            </Button>
          </Col>
        </Row>

        <Table
          dataSource={vehicleLogs}
          columns={vehicleLogColumns}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
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

  const renderReports = () => {
    // Debug calculations
    const totalExpenses = vehicleLogs.reduce((sum, log) => {
      const logExpenses = log.expenses?.reduce((logSum, expense) => logSum + expense.amount, 0) || 0;
      return sum + logExpenses + (log.payments?.total || 0);
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
            { title: 'Credit Limit', dataIndex: 'creditLimit', key: 'creditLimit', 
              render: (value) => `Rs. ${value?.toLocaleString() || 0}` },
            { title: 'Total Credit', dataIndex: 'totalCredit', key: 'totalCredit',
              render: (value) => `Rs. ${value?.toLocaleString() || 0}` },
            { title: 'Total Paid', dataIndex: 'totalPaid', key: 'totalPaid',
              render: (value) => `Rs. ${value?.toLocaleString() || 0}` },
            { title: 'Remaining Credit', dataIndex: 'remainingCredit', key: 'remainingCredit',
              render: (value) => `Rs. ${value?.toLocaleString() || 0}` },
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
              valueStyle={{ color: '#cf1322' }}
            />
            <Divider />
            <Statistic
              title="Customers with Pending Credit"
              value={creditOverview.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  creditPaymentForm.resetFields();
                  setCreditPaymentModalVisible(true);
                }}
                style={{ width: '100%' }}
              >
                Record Credit Payment
              </Button>
              <Button 
                type="default" 
                icon={<UserOutlined />}
                onClick={() => setSelectedSection('customers')}
                style={{ width: '100%' }}
              >
                Manage Customers
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Pending Credit Details" style={{ marginTop: 16 }}>
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
                <Select placeholder="Select employee">
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
                rules={[{ required: true, message: 'Please enter vehicle number' }]}
              >
                <Input placeholder="e.g., 1J0611" />
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

          <Divider>Fuel</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item name={['fuel', 'liters']} label="Fuel (L)">
                <InputNumber style={{ width: '100%' }} placeholder="Liters" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name={['fuel', 'startMeter']} label="Start Meter">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Start meter"
                  onChange={(value) => {
                    const endMeter = form.getFieldValue(['fuel', 'endMeter']) || 0;
                    if (value && endMeter) {
                      const totalKm = endMeter - value;
                      form.setFieldsValue({ fuel: { ...form.getFieldValue('fuel'), totalKm } });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name={['fuel', 'endMeter']} label="End Meter">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="End meter"
                  onChange={(value) => {
                    const startMeter = form.getFieldValue(['fuel', 'startMeter']) || 0;
                    if (value && startMeter) {
                      const totalKm = value - startMeter;
                      form.setFieldsValue({ fuel: { ...form.getFieldValue('fuel'), totalKm } });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name={['fuel', 'totalKm']} label="Total (KM)">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Auto-calculated"
                  disabled
                />
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

          <Divider>Assigned Vehicles</Divider>

          <Form.Item name="assignedVehicles" label="Assigned Vehicles">
            <Select
              mode="multiple"
              placeholder="Select vehicles"
              style={{ width: '100%' }}
            >
              {vehicles.map(vehicle => (
                <Option key={vehicle} value={vehicle}>{vehicle}</Option>
              ))}
            </Select>
          </Form.Item>

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
         width={1200}
       >
         {vehicleHistory && (
           <div>
             <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
               <Col xs={24} md={8}>
                 <Card title="Vehicle Info" size="small">
                   <p><strong>Vehicle Number:</strong> {selectedVehicle}</p>
                   <p><strong>Total Trips:</strong> {vehicleHistory.statistics.totalTrips}</p>
                   <p><strong>Total KM:</strong> {vehicleHistory.statistics.totalKm}</p>
                   <p><strong>Total Fuel:</strong> {vehicleHistory.statistics.totalFuel}L</p>
                   <p><strong>Total Expenses:</strong> Rs. {vehicleHistory.statistics.totalExpenses}</p>
                 </Card>
               </Col>
               <Col xs={24} md={8}>
                 <Card title="Assigned Employees" size="small">
                   {vehicleHistory.assignedEmployees?.map(employee => (
                     <Tag key={employee._id} style={{ margin: 2 }}>
                       {employee.name} ({employee.employeeId})
                     </Tag>
                   ))}
                 </Card>
               </Col>
               <Col xs={24} md={8}>
                 <Card title="Quick Actions" size="small">
                   <Button 
                     type="primary" 
                     icon={<PlusOutlined />}
                     onClick={() => {
                       setSelectedVehicle(null);
                       setVehicleHistory(null);
                       form.setFieldsValue({ vehicleNumber: selectedVehicle });
                       setModalVisible(true);
                     }}
                     style={{ width: '100%', marginBottom: 8 }}
                   >
                     Add Log for This Vehicle
                   </Button>
                 </Card>
               </Col>
             </Row>

             <Card title="Vehicle Log History">
               <Table
                 dataSource={vehicleHistory.logs}
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
             <Col xs={24} sm={12}>
               <Form.Item
                 name="creditLimit"
                 label="Credit Limit"
               >
                 <InputNumber style={{ width: '100%' }} placeholder="Credit limit amount" />
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
     </Layout>
   );
   };

export default ConstructionAdminDashboard; 