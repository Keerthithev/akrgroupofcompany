const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ConstructionAdmin = require('../models/ConstructionAdmin');
const VehicleLog = require('../models/VehicleLog');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Item = require('../models/Item');
const CreditPayment = require('../models/CreditPayment');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware to protect construction admin routes
function requireConstructionAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'construction_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.constructionAdmin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /api/construction-admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await ConstructionAdmin.findOne({ username });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ 
    id: admin._id, 
    username: admin.username, 
    role: admin.role 
  }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, role: admin.role });
});

// POST /api/construction-admin/logout
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

// GET /api/construction-admin/dashboard
router.get('/dashboard', requireConstructionAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const totalLogsToday = await VehicleLog.countDocuments({ date: { $gte: today } });
    const totalLogsMonth = await VehicleLog.countDocuments({ date: { $gte: monthStart } });
    const totalVehicles = (await VehicleLog.distinct('vehicleNumber')).length;
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    
    // Calculate total expenses for the month
    const monthlyLogs = await VehicleLog.find({ date: { $gte: monthStart } });
    const totalExpenses = monthlyLogs.reduce((sum, log) => {
      const logExpenses = log.expenses.reduce((logSum, expense) => logSum + expense.amount, 0);
      return sum + logExpenses + (log.payments.total || 0);
    }, 0);
    
    // Calculate credit information
    const totalCredit = monthlyLogs.reduce((sum, log) => sum + (log.payments.credit || 0), 0);
    const totalCash = monthlyLogs.reduce((sum, log) => sum + (log.payments.cash || 0), 0);
    const totalPayments = monthlyLogs.reduce((sum, log) => sum + (log.payments.total || 0), 0);
    
    // Get credit overview
    const customers = await Customer.find({ status: 'active' });
    const allVehicleLogs = await VehicleLog.find({ 'payments.credit': { $gt: 0 } }).populate('employeeId', 'name employeeId');
    
    const creditOverview = customers.map(customer => {
      const customerLogs = allVehicleLogs.filter(log => log.customerName === customer.name);
      const customerTotalCredit = customerLogs.reduce((sum, log) => sum + (log.payments.credit || 0), 0);
      const customerTotalPaid = customerLogs.reduce((sum, log) => sum + (log.payments.creditPaidAmount || 0), 0);
      const customerRemainingCredit = customerTotalCredit - customerTotalPaid;
      
      // Get unique employees who delivered to this customer
      const deliveryEmployees = [...new Set(customerLogs.map(log => ({
        name: log.employeeName || 'Unknown',
        employeeId: log.employeeId || 'N/A'
      })))];
      
      return {
        customerId: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        totalCredit: customerTotalCredit,
        totalPaid: customerTotalPaid,
        remainingCredit: customerRemainingCredit,
        creditStatus: customerRemainingCredit > 0 ? 'pending' : 'completed',
        deliveryEmployees,
        totalDeliveries: customerLogs.length,
        lastPayment: customerLogs.length > 0 ? customerLogs[0].date : null
      };
    }).filter(customer => customer.remainingCredit > 0);
    
    const recentLogs = await VehicleLog.find().sort({ date: -1 }).limit(5);
    const recentEmployees = await Employee.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5);
    
    res.json({
      totalLogsToday,
      totalLogsMonth,
      totalVehicles,
      totalEmployees,
      totalExpenses,
      totalCredit,
      totalCash,
      totalPayments,
      creditOverview,
      recentLogs,
      recentEmployees
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/vehicle-logs
router.get('/vehicle-logs', requireConstructionAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, vehicleNumber, startDate, endDate, employeeId } = req.query;
    
    let query = {};
    if (vehicleNumber) query.vehicleNumber = vehicleNumber;
    if (employeeId) query.employeeId = employeeId;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const logs = await VehicleLog.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await VehicleLog.countDocuments(query);
    
    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/vehicle-logs
router.post('/vehicle-logs', requireConstructionAdmin, async (req, res) => {
  try {
    const vehicleLog = new VehicleLog(req.body);
    
    // Auto-calculate working kilometers if start and end meters are provided
    if (vehicleLog.startMeter && vehicleLog.endMeter) {
      vehicleLog.workingKm = vehicleLog.endMeter - vehicleLog.startMeter;
    }
    
    // Auto-calculate fuel total kilometers if fuel data is provided
    if (vehicleLog.fuel && vehicleLog.fuel.startMeter && vehicleLog.fuel.endMeter) {
      vehicleLog.fuel.totalKm = vehicleLog.fuel.endMeter - vehicleLog.fuel.startMeter;
    }
    
    // Auto-calculate total payment
    if (vehicleLog.payments) {
      vehicleLog.payments.total = (vehicleLog.payments.cash || 0) + (vehicleLog.payments.credit || 0);
      
      // Set payment method
      if (vehicleLog.payments.cash > 0 && vehicleLog.payments.credit > 0) {
        vehicleLog.payments.paymentMethod = 'mixed';
      } else if (vehicleLog.payments.credit > 0) {
        vehicleLog.payments.paymentMethod = 'credit';
      } else {
        vehicleLog.payments.paymentMethod = 'cash';
      }
    }
    
    await vehicleLog.save();
    res.status(201).json(vehicleLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/construction-admin/vehicle-logs/:id
router.put('/vehicle-logs/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: Date.now() };
    
    // Auto-calculate working kilometers if start and end meters are provided
    if (updateData.startMeter && updateData.endMeter) {
      updateData.workingKm = updateData.endMeter - updateData.startMeter;
    }
    
    // Auto-calculate fuel total kilometers if fuel data is provided
    if (updateData.fuel && updateData.fuel.startMeter && updateData.fuel.endMeter) {
      updateData.fuel.totalKm = updateData.fuel.endMeter - updateData.fuel.startMeter;
    }
    
    // Auto-calculate total payment
    if (updateData.payments) {
      updateData.payments.total = (updateData.payments.cash || 0) + (updateData.payments.credit || 0);
      
      // Set payment method
      if (updateData.payments.cash > 0 && updateData.payments.credit > 0) {
        updateData.payments.paymentMethod = 'mixed';
      } else if (updateData.payments.credit > 0) {
        updateData.payments.paymentMethod = 'credit';
      } else {
        updateData.payments.paymentMethod = 'cash';
      }
    }
    
    const vehicleLog = await VehicleLog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!vehicleLog) return res.status(404).json({ error: 'Vehicle log not found' });
    res.json(vehicleLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/construction-admin/vehicle-logs/:id
router.delete('/vehicle-logs/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const vehicleLog = await VehicleLog.findByIdAndDelete(req.params.id);
    if (!vehicleLog) return res.status(404).json({ error: 'Vehicle log not found' });
    res.json({ message: 'Vehicle log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/vehicles
router.get('/vehicles', requireConstructionAdmin, async (req, res) => {
  try {
    // Get vehicles from logs
    const logVehicles = await VehicleLog.distinct('vehicleNumber');
    
    // Get vehicles assigned to employees
    const employeeVehicles = await Employee.distinct('assignedVehicles');
    
    // Combine and remove duplicates
    const allVehicles = [...new Set([...logVehicles, ...employeeVehicles])];
    
    res.json(allVehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== EMPLOYEE MANAGEMENT ROUTES ==========

// GET /api/construction-admin/employees
router.get('/employees', requireConstructionAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, position } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (position) query.position = position;
    
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Employee.countDocuments(query);
    
    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/employees
router.post('/employees', requireConstructionAdmin, async (req, res) => {
  try {
    // Generate employee ID
    const count = await Employee.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
    
    const employee = new Employee({
      ...req.body,
      employeeId
    });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/construction-admin/employees/:id
router.put('/employees/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/construction-admin/employees/:id
router.delete('/employees/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/employees/:id/history
router.get('/employees/:id/history', requireConstructionAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    
    const vehicleLogs = await VehicleLog.find({ employeeId: employee.employeeId })
      .sort({ date: -1 })
      .limit(50);
    
    // Calculate statistics
    const totalTrips = vehicleLogs.length;
    const totalKm = vehicleLogs.reduce((sum, log) => sum + (log.workingKm || 0), 0);
    const totalExpenses = vehicleLogs.reduce((sum, log) => {
      const logExpenses = log.expenses.reduce((logSum, expense) => logSum + expense.amount, 0);
      return sum + logExpenses + (log.payments.total || 0);
    }, 0);
    
    res.json({
      employee,
      vehicleLogs,
      statistics: {
        totalTrips,
        totalKm,
        totalExpenses
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/employees/positions
router.get('/employees/positions', requireConstructionAdmin, async (req, res) => {
  try {
    const positions = await Employee.distinct('position');
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/vehicles/:vehicleNumber/logs
router.get('/vehicles/:vehicleNumber/logs', requireConstructionAdmin, async (req, res) => {
  try {
    const { vehicleNumber } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    let query = { vehicleNumber };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const logs = await VehicleLog.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await VehicleLog.countDocuments(query);
    
    // Calculate vehicle statistics
    const allLogs = await VehicleLog.find({ vehicleNumber });
    const totalKm = allLogs.reduce((sum, log) => sum + (log.workingKm || 0), 0);
    const totalFuel = allLogs.reduce((sum, log) => sum + (log.fuel?.liters || 0), 0);
    const totalExpenses = allLogs.reduce((sum, log) => {
      const logExpenses = log.expenses.reduce((logSum, expense) => logSum + expense.amount, 0);
      return sum + logExpenses + (log.payments.total || 0);
    }, 0);
    
    // Get employees assigned to this vehicle
    const assignedEmployees = await Employee.find({ assignedVehicles: vehicleNumber });
    
    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      statistics: {
        totalTrips: allLogs.length,
        totalKm,
        totalFuel,
        totalExpenses
      },
      assignedEmployees
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/reports/summary
router.get('/reports/summary', requireConstructionAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    // Get all data
    const employees = await Employee.find({ status: 'active' });
    const vehicleLogs = await VehicleLog.find(dateQuery);
    const vehicles = await VehicleLog.distinct('vehicleNumber');
    
    // Employee statistics
    const employeeStats = {
      total: employees.length,
      byPosition: {},
      byStatus: {}
    };
    
    employees.forEach(emp => {
      employeeStats.byPosition[emp.position] = (employeeStats.byPosition[emp.position] || 0) + 1;
      employeeStats.byStatus[emp.status] = (employeeStats.byStatus[emp.status] || 0) + 1;
    });
    
    // Vehicle statistics
    const vehicleStats = {
      total: vehicles.length,
      active: vehicleLogs.length > 0 ? vehicles.length : 0,
      byVehicle: {}
    };
    
    vehicles.forEach(vehicle => {
      const vehicleLogs = vehicleLogs.filter(log => log.vehicleNumber === vehicle);
      const totalKm = vehicleLogs.reduce((sum, log) => sum + (log.workingKm || 0), 0);
      const totalFuel = vehicleLogs.reduce((sum, log) => sum + (log.fuel?.liters || 0), 0);
      const totalExpenses = vehicleLogs.reduce((sum, log) => {
        const logExpenses = log.expenses.reduce((logSum, expense) => logSum + expense.amount, 0);
        return sum + logExpenses + (log.payments.total || 0);
      }, 0);
      
      vehicleStats.byVehicle[vehicle] = {
        trips: vehicleLogs.length,
        totalKm,
        totalFuel,
        totalExpenses,
        assignedEmployees: employees.filter(emp => emp.assignedVehicles?.includes(vehicle)).length
      };
    });
    
    // Financial statistics
    const totalExpenses = vehicleLogs.reduce((sum, log) => {
      const logExpenses = log.expenses.reduce((logSum, expense) => logSum + expense.amount, 0);
      return sum + logExpenses + (log.payments.total || 0);
    }, 0);
    
    const fuelExpenses = vehicleLogs.reduce((sum, log) => {
      const fuelExpense = log.expenses.find(exp => exp.description.toLowerCase().includes('fuel'));
      return sum + (fuelExpense?.amount || 0);
    }, 0);
    
    const totalPayments = vehicleLogs.reduce((sum, log) => sum + (log.payments.total || 0), 0);
    
    // Monthly breakdown
    const monthlyData = {};
    vehicleLogs.forEach(log => {
      const month = new Date(log.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { trips: 0, totalKm: 0, fuel: 0, expenses: 0 };
      }
      monthlyData[month].trips++;
      monthlyData[month].totalKm += log.workingKm || 0;
      monthlyData[month].fuel += log.fuel?.liters || 0;
      const logExpenses = log.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      monthlyData[month].expenses += logExpenses + (log.payments.total || 0);
    });
    
    // Duty breakdown
    const dutyData = {};
    vehicleLogs.forEach(log => {
      log.duties?.forEach(duty => {
        if (!dutyData[duty]) {
          dutyData[duty] = { count: 0, employees: new Set() };
        }
        dutyData[duty].count++;
        dutyData[duty].employees.add(log.employeeId);
      });
    });
    
    const dutyStats = Object.entries(dutyData).map(([duty, data]) => ({
      duty,
      count: data.count,
      employees: data.employees.size
    }));
    
    res.json({
      employeeStats,
      vehicleStats,
      financialStats: {
        totalExpenses,
        fuelExpenses,
        totalPayments,
        averageTripCost: vehicleLogs.length > 0 ? Math.round(totalExpenses / vehicleLogs.length) : 0
      },
      monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        ...data
      })),
      dutyStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Management Routes
// GET /api/construction-admin/customers
router.get('/customers', requireConstructionAdmin, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/customers
router.post('/customers', requireConstructionAdmin, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/construction-admin/customers/:id
router.put('/customers/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/construction-admin/customers/:id
router.delete('/customers/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Item Management Routes
// GET /api/construction-admin/items
router.get('/items', requireConstructionAdmin, async (req, res) => {
  try {
    const items = await Item.find().sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/items
router.post('/items', requireConstructionAdmin, async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/construction-admin/items/:id
router.put('/items/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/construction-admin/items/:id
router.delete('/items/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(500).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Credit Payment Routes
// GET /api/construction-admin/credit-payments
router.get('/credit-payments', requireConstructionAdmin, async (req, res) => {
  try {
    const { customerId, status } = req.query;
    let query = {};
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;
    
    const payments = await CreditPayment.find(query)
      .populate('customerId', 'name phone')
      .populate('vehicleLogId', 'vehicleNumber date')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/credit-payments
// POST /api/construction-admin/credit-payments
router.post('/credit-payments', requireConstructionAdmin, async (req, res) => {
  try {
    const payment = new CreditPayment({
      ...req.body,
      adminId: req.constructionAdmin.username
    });
    await payment.save();
    
    // Update customer's total paid amount
    const customer = await Customer.findById(req.body.customerId);
    if (customer) {
      customer.totalPaid += req.body.paymentAmount;
      await customer.save();
    }
    
    // Update vehicle log's credit paid amount
    if (req.body.vehicleLogId) {
      const vehicleLog = await VehicleLog.findById(req.body.vehicleLogId);
      if (vehicleLog) {
        vehicleLog.payments.creditPaidAmount += req.body.paymentAmount;
        await vehicleLog.save();
      }
    }
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/credit-overview
router.get('/credit-overview', requireConstructionAdmin, async (req, res) => {
  try {
    const customers = await Customer.find({ status: 'active' });
    console.log('Found customers:', customers.map(c => ({ name: c.name, phone: c.phone })));
    
    // Get all vehicle logs with credit payments
    const vehicleLogs = await VehicleLog.find({ 'payments.credit': { $gt: 0 } }).populate('employeeId', 'name employeeId');
    console.log('Found vehicle logs with credit:', vehicleLogs.length);
    console.log('Sample vehicle log:', vehicleLogs[0] ? {
      customerName: vehicleLogs[0].customerName,
      employeeName: vehicleLogs[0].employeeName,
      employeeId: vehicleLogs[0].employeeId,
      payments: vehicleLogs[0].payments
    } : 'No logs');
    
    const creditOverview = customers.map(customer => {
      // Try to find vehicle logs for this customer
      let customerLogs = [];
      
      // First try exact match by customer name
      customerLogs = vehicleLogs.filter(log => log.customerName === customer.name);
      
      // If no exact match, try to find logs that might be for this customer
      // This is a fallback for existing data that doesn't have customer names
      if (customerLogs.length === 0) {
        // For now, we'll create a sample entry to show the customer exists
        // In a real scenario, you'd want to update existing vehicle logs with customer information
        console.log(`No vehicle logs found for customer: ${customer.name}`);
      }
      
      const totalCredit = customerLogs.reduce((sum, log) => sum + (log.payments.credit || 0), 0);
      const totalPaid = customerLogs.reduce((sum, log) => sum + (log.payments.creditPaidAmount || 0), 0);
      const remainingCredit = totalCredit - totalPaid;
      
      // Get unique employees who delivered to this customer
      const deliveryEmployees = [...new Set(customerLogs.map(log => ({
        name: log.employeeName || 'Unknown',
        employeeId: log.employeeId || 'N/A'
      })))];
      
      // If no delivery employees found, show appropriate message
      if (deliveryEmployees.length === 0) {
        console.log(`No delivery employees found for customer: ${customer.name}`);
      }
      
      return {
        customerId: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        totalCredit,
        totalPaid,
        remainingCredit,
        creditStatus: remainingCredit > 0 ? 'pending' : 'completed',
        lastPayment: customerLogs.length > 0 ? customerLogs[0].date : null,
        deliveryEmployees,
        totalDeliveries: customerLogs.length
      };
    }).filter(customer => customer.remainingCredit > 0);
    
    console.log('Credit overview result:', creditOverview.map(c => ({
      name: c.customerName,
      credit: c.remainingCredit,
      employees: c.deliveryEmployees.length
    })));
    
    res.json(creditOverview);
  } catch (error) {
    console.error('Credit overview error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 