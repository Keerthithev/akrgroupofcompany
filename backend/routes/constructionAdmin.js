const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ConstructionAdmin = require('../models/ConstructionAdmin');
const VehicleLog = require('../models/VehicleLog');
const Employee = require('../models/Employee');

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
    
    const recentLogs = await VehicleLog.find().sort({ date: -1 }).limit(5);
    const recentEmployees = await Employee.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5);
    
    res.json({
      totalLogsToday,
      totalLogsMonth,
      totalVehicles,
      totalEmployees,
      totalExpenses,
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
    await vehicleLog.save();
    res.status(201).json(vehicleLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/construction-admin/vehicle-logs/:id
router.put('/vehicle-logs/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const vehicleLog = await VehicleLog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
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

module.exports = router; 