const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ConstructionAdmin = require('../models/ConstructionAdmin');
const VehicleLog = require('../models/VehicleLog');
const Vehicle = require('../models/Vehicle');
const Supplier = require('../models/Supplier');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Item = require('../models/Item');
const CreditPayment = require('../models/CreditPayment');
const FuelLog = require('../models/FuelLog');
const ShedWallet = require('../models/ShedWallet');
const ShedTransaction = require('../models/ShedTransaction');
const smsService = require('../utils/smsService');

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
    
    // Calculate total expenses for the month (excluding salary)
    const monthlyLogs = await VehicleLog.find({ date: { $gte: monthStart } });
    const totalExpenses = monthlyLogs.reduce((sum, log) => {
      const logExpenses = log.expenses.reduce((logSum, expense) => {
        // Exclude salary from expenses
        if (expense.description && expense.description.toLowerCase().includes('salary')) {
          return logSum;
        }
        return logSum + expense.amount;
      }, 0);
      return sum + logExpenses;
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

    // Build: last three logs for each employee
    const allActiveEmployees = await Employee.find({ status: 'active' }).select('employeeId name').lean();
    const lastThreeLogsByEmployee = {};
    for (const emp of allActiveEmployees) {
      const logs = await VehicleLog.find({ employeeId: emp.employeeId }).sort({ date: -1 }).limit(3).lean();
      lastThreeLogsByEmployee[emp.employeeId] = { employee: emp, logs };
    }

    // Build: credit summary overview (pending only)
    const creditLogs = await VehicleLog.find({ 'payments.credit': { $gt: 0 } }).sort({ date: -1 }).lean();
    const creditSummaryMap = new Map();
    creditLogs.forEach(l => {
      const key = (l.customerName || 'Unknown').trim();
      const prev = creditSummaryMap.get(key) || { customerName: key, remainingCredit: 0, lastEmployeeName: l.employeeName, lastEmployeeId: l.employeeId, lastDate: l.date };
      const remaining = Math.max((l.payments?.credit || 0) - (l.payments?.creditPaidAmount || 0), 0);
      prev.remainingCredit += remaining;
      if (l.date && (!prev.lastDate || l.date > prev.lastDate)) {
        prev.lastDate = l.date;
        prev.lastEmployeeName = l.employeeName;
        prev.lastEmployeeId = l.employeeId;
      }
      creditSummaryMap.set(key, prev);
    });
    const creditSummary = Array.from(creditSummaryMap.values()).filter(c => c.remainingCredit > 0);
    
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
      recentEmployees,
      lastThreeLogsByEmployee,
      creditSummary
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
    console.log('Received vehicle log data:', req.body);
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
    
    // Calculate yesterday balance (running balance from all previous logs)
    // Only calculate if not provided from frontend (for vehicle sheet)
    if (vehicleLog.employeeId && vehicleLog.date && vehicleLog.yesterdayBalance === undefined) {
      const logDate = new Date(vehicleLog.date);
      
      // Get all previous logs for this employee, sorted by date
      const previousLogs = await VehicleLog.find({
        employeeId: vehicleLog.employeeId,
        date: { $lt: logDate }
      }).sort({ date: 1 });
      
      // Calculate running balance from all previous logs
      let runningBalance = 0;
      previousLogs.forEach(log => {
        const cash = log.payments?.cash || 0;
        const setCash = log.setCashTaken || 0;
        // Only include non-salary expenses in balance calculation
        const expenses = (log.expenses || []).reduce((s, e) => {
          // Exclude salary from expenses calculation
          if (e.description && e.description.toLowerCase().includes('salary')) {
            return s;
          }
          return s + (e.amount || 0);
        }, 0);
        const salaryDeducted = log.salaryDeductedFromBalance || 0;
        
        runningBalance += cash + setCash - expenses - salaryDeducted;
      });
      
      vehicleLog.yesterdayBalance = runningBalance;
    }
    
    await vehicleLog.save();

    // If supplier data present, record supplier wallet transaction
    try {
      if (vehicleLog.supplier && (vehicleLog.supplier.supplierId || vehicleLog.supplier.supplierName)) {
        let supplierDoc = null;
        if (vehicleLog.supplier.supplierId && mongoose.Types.ObjectId.isValid(vehicleLog.supplier.supplierId)) {
          supplierDoc = await Supplier.findById(vehicleLog.supplier.supplierId);
        }
        if (!supplierDoc && vehicleLog.supplier.supplierName) {
          supplierDoc = await Supplier.findOne({ name: vehicleLog.supplier.supplierName });
        }
        if (!supplierDoc && vehicleLog.supplier.supplierName) {
          supplierDoc = new Supplier({ name: vehicleLog.supplier.supplierName });
        }
        if (supplierDoc) {
          const payable = Number(vehicleLog.supplier.amountPayable || 0) - Number(vehicleLog.supplier.amountPaid || 0);
          const amount = isNaN(payable) ? 0 : payable; // positive increases payable
          supplierDoc.walletBalance = (supplierDoc.walletBalance || 0) + amount;
          supplierDoc.transactions.push({
            type: 'supply',
            description: `Vehicle ${vehicleLog.vehicleNumber} log on ${new Date(vehicleLog.date).toLocaleDateString()}`,
            item: vehicleLog.itemsLoading?.join(', '),
            amount,
            vehicleLogId: vehicleLog._id
          });
          await supplierDoc.save();
        }
      }
    } catch {}
    console.log('Saved vehicle log:', {
      _id: vehicleLog._id,
      vehicleNumber: vehicleLog.vehicleNumber,
      startPlace: vehicleLog.startPlace,
      endPlace: vehicleLog.endPlace,
      itemsLoading: vehicleLog.itemsLoading,
      customerName: vehicleLog.customerName,
      setCashTaken: vehicleLog.setCashTaken,
      yesterdayBalance: vehicleLog.yesterdayBalance
    });

    // Update employee wallet (only if salary is explicitly deducted from balance)
    try {
      if (vehicleLog.employeeId) {
        const emp = await Employee.findOne({ employeeId: vehicleLog.employeeId });
        if (emp) {
          const setCashTaken = Number(req.body.payments?.setCashTaken || 0);
          const yesterdayBalance = Number(req.body.payments?.yesterdayBalance || 0);
          const salaryDeductedFromBalance = Number(req.body.salaryDeductedFromBalance || 0);
          
          // Only include non-salary expenses in the calculation
          const expensesTotal = (vehicleLog.expenses || []).reduce((s, e) => {
            // Exclude salary from expenses calculation
            if (e.description && e.description.toLowerCase().includes('salary')) {
              return s;
            }
            return s + (e.amount || e.cost || 0);
          }, 0);
          
          // Calculate delta: cash + setCash + yesterdayBalance - expenses - salaryDeductedFromBalance
          const delta = (Number(vehicleLog.payments?.cash || 0) + setCashTaken + yesterdayBalance) - expensesTotal - salaryDeductedFromBalance;
          emp.walletBalance = (emp.walletBalance || 0) + delta;
          await emp.save();
        }
      }
    } catch {}

    // Check if customer didn't use credit and suggest SMS
    const response = { vehicleLog };
    
    if (vehicleLog.customerName && vehicleLog.payments && vehicleLog.payments.credit === 0) {
      // Customer didn't use credit, suggest sending SMS
      response.suggestSMS = true;
      response.customerName = vehicleLog.customerName;
      response.message = 'Customer did not use credit. Would you like to send a thank you message?';
    }

    res.status(201).json(response);
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
    try {
      if (updateData.supplier) {
        // Adjust supplier wallet by difference from previous
        const prev = await VehicleLog.findById(req.params.id).lean();
        const prevPayable = Number(prev?.supplier?.amountPayable || 0) - Number(prev?.supplier?.amountPaid || 0);
        const newPayable = Number(updateData.supplier.amountPayable || 0) - Number(updateData.supplier.amountPaid || 0);
        const delta = (isNaN(newPayable) ? 0 : newPayable) - (isNaN(prevPayable) ? 0 : prevPayable);
        if (delta !== 0) {
          let supplierDoc = null;
          if (updateData.supplier.supplierId && mongoose.Types.ObjectId.isValid(updateData.supplier.supplierId)) {
            supplierDoc = await Supplier.findById(updateData.supplier.supplierId);
          }
          if (!supplierDoc && (updateData.supplier.supplierName || prev?.supplier?.supplierName)) {
            supplierDoc = await Supplier.findOne({ name: updateData.supplier.supplierName || prev?.supplier?.supplierName });
          }
          if (supplierDoc) {
            supplierDoc.walletBalance = (supplierDoc.walletBalance || 0) + delta;
            supplierDoc.transactions.push({
              type: 'adjustment',
              description: `Adjustment for vehicle log ${vehicleLog._id}`,
              amount: delta,
              vehicleLogId: vehicleLog._id
            });
            await supplierDoc.save();
          }
        }
      }
    } catch {}
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
    // Revert supplier wallet if needed
    try {
      const payable = Number(vehicleLog?.supplier?.amountPayable || 0) - Number(vehicleLog?.supplier?.amountPaid || 0);
      if (payable && (vehicleLog?.supplier?.supplierId || vehicleLog?.supplier?.supplierName)) {
        let supplierDoc = null;
        if (vehicleLog.supplier.supplierId && mongoose.Types.ObjectId.isValid(vehicleLog.supplier.supplierId)) {
          supplierDoc = await Supplier.findById(vehicleLog.supplier.supplierId);
        }
        if (!supplierDoc && vehicleLog.supplier.supplierName) {
          supplierDoc = await Supplier.findOne({ name: vehicleLog.supplier.supplierName });
        }
        if (supplierDoc) {
          supplierDoc.walletBalance = (supplierDoc.walletBalance || 0) - payable;
          supplierDoc.transactions.push({
            type: 'adjustment',
            description: `Revert for deleted vehicle log ${vehicleLog._id}`,
            amount: -payable,
            vehicleLogId: vehicleLog._id
          });
          await supplierDoc.save();
        }
      }
    } catch {}
    res.json({ message: 'Vehicle log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Suppliers CRUD & Wallet =====
// GET suppliers
router.get('/suppliers', requireConstructionAdmin, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create supplier
router.post('/suppliers', requireConstructionAdmin, async (req, res) => {
  try {
    const sup = new Supplier(req.body);
    await sup.save();
    res.status(201).json(sup);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT update supplier
router.put('/suppliers/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const sup = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sup) return res.status(404).json({ error: 'Supplier not found' });
    res.json(sup);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE supplier (only if no transactions)
router.delete('/suppliers/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const sup = await Supplier.findById(req.params.id);
    if (!sup) return res.status(404).json({ error: 'Supplier not found' });
    if (sup.transactions && sup.transactions.length > 0) {
      return res.status(400).json({ error: 'Cannot delete supplier with transactions' });
    }
    await sup.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST supplier wallet transaction (payment or adjustment)
router.post('/suppliers/:id/wallet', requireConstructionAdmin, async (req, res) => {
  try {
    console.log('📊 Supplier wallet update request:', req.body);
    console.log('📊 Supplier ID:', req.params.id);
    
    const { type, amount, description } = req.body;
    const sup = await Supplier.findById(req.params.id);
    if (!sup) {
      console.log('❌ Supplier not found:', req.params.id);
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    console.log('📊 Current supplier wallet balance:', sup.walletBalance);
    
    const numeric = Number(amount) || 0;
    // For payments to supplier, amount should reduce wallet (payable)
    const delta = type === 'payment' ? -Math.abs(numeric) : numeric;
    
    console.log('📊 Payment amount:', numeric, 'Delta:', delta);
    
    sup.walletBalance = (sup.walletBalance || 0) + delta;
    sup.transactions.push({ type, amount: delta, description });
    await sup.save();
    
    console.log('✅ Supplier wallet updated successfully. New balance:', sup.walletBalance);
    res.json({ success: true, walletBalance: sup.walletBalance });
  } catch (e) {
    console.error('❌ Error updating supplier wallet:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/construction-admin/vehicles
router.get('/vehicles', requireConstructionAdmin, async (req, res) => {
  try {
    // Vehicles from dedicated collection (tolerate empty/missing)
    let savedVehicles = [];
    try {
      savedVehicles = await Vehicle.find().sort({ vehicleNumber: 1 }).lean();
    } catch (innerErr) {
      console.error('Vehicle collection fetch failed:', innerErr?.message);
      savedVehicles = [];
    }

    // Get vehicles from logs
    const logVehicles = await VehicleLog.distinct('vehicleNumber');
    
    // Get vehicles assigned to employees
    const employeeVehicles = await Employee.distinct('assignedVehicles');
    
    // Combine and remove duplicates
    const allVehicleStrings = [...new Set([...logVehicles, ...employeeVehicles])].filter(Boolean);

    // Build a map for saved vehicles by number
    const byNumber = new Map(savedVehicles.map(v => [v.vehicleNumber, v]));

    // Merge: ensure all string vehicle numbers appear; attach name if saved
    const merged = Array.from(new Set([...(byNumber ? byNumber.keys() : []), ...allVehicleStrings]))
      .sort()
      .map(vn => ({
        vehicleNumber: vn,
        name: byNumber.get(vn)?.name || ''
      }));

    res.json(merged);
  } catch (error) {
    console.error('GET /vehicles error:', error);
    // Fallback: return vehicles from logs and employees only
    try {
      const logVehicles = await VehicleLog.distinct('vehicleNumber');
      const employeeVehicles = await Employee.distinct('assignedVehicles');
      const allVehicleStrings = [...new Set([...logVehicles, ...employeeVehicles])].filter(Boolean).sort();
      return res.json(allVehicleStrings.map(vn => ({ vehicleNumber: vn, name: '' })));
    } catch (fallbackErr) {
      console.error('Vehicles fallback failed:', fallbackErr);
    res.status(500).json({ error: error.message });
    }
  }
});

// POST /api/construction-admin/vehicles
router.post('/vehicles', requireConstructionAdmin, async (req, res) => {
  try {
    const { vehicleNumber } = req.body;
    if (!vehicleNumber || !vehicleNumber.trim()) {
      return res.status(400).json({ error: 'Vehicle number is required' });
    }
    const existing = await Vehicle.findOne({ vehicleNumber: vehicleNumber.trim() });
    if (existing) {
      return res.status(409).json({ error: 'Vehicle already exists' });
    }
    const vehicle = new Vehicle({ 
      name: vehicleNumber.trim(), // Set name same as vehicle number
      vehicleNumber: vehicleNumber.trim() 
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/construction-admin/vehicles/:vehicleNumber
router.delete('/vehicles/:vehicleNumber', requireConstructionAdmin, async (req, res) => {
  try {
    const { vehicleNumber } = req.params;
    
    // Check if vehicle exists
    const vehicle = await Vehicle.findOne({ vehicleNumber });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Check if vehicle has any logs
    const hasLogs = await VehicleLog.findOne({ vehicleNumber });
    if (hasLogs) {
      return res.status(400).json({ error: 'Cannot delete vehicle with existing logs. Please delete all logs first.' });
    }
    
    // Delete the vehicle
    await Vehicle.deleteOne({ vehicleNumber });
    res.json({ message: 'Vehicle deleted successfully' });
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
      const logExpenses = log.expenses.reduce((logSum, expense) => {
        // Exclude salary from expenses
        if (expense.description && expense.description.toLowerCase().includes('salary')) {
          return logSum;
        }
        return logSum + expense.amount;
      }, 0);
      return sum + logExpenses;
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
    
    console.log(`Found ${logs.length} logs for vehicle ${vehicleNumber}:`, logs.map(l => ({
      _id: l._id,
      startPlace: l.startPlace,
      endPlace: l.endPlace,
      itemsLoading: l.itemsLoading,
      customerName: l.customerName,
      setCashTaken: l.setCashTaken,
      yesterdayBalance: l.yesterdayBalance
    })));
    
    const total = await VehicleLog.countDocuments(query);
    
    // Calculate vehicle statistics
    const allLogs = await VehicleLog.find({ vehicleNumber });
    const totalKm = allLogs.reduce((sum, log) => sum + (log.workingKm || 0), 0);
    const totalFuel = allLogs.reduce((sum, log) => sum + (log.fuel?.liters || 0), 0);
    const totalExpenses = allLogs.reduce((sum, log) => {
      const logExpenses = log.expenses.reduce((logSum, expense) => {
        // Exclude salary from expenses
        if (expense.description && expense.description.toLowerCase().includes('salary')) {
          return logSum;
        }
        return logSum + expense.amount;
      }, 0);
      return sum + logExpenses;
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
        const logExpenses = log.expenses.reduce((logSum, expense) => {
          // Exclude salary from expenses
          if (expense.description && expense.description.toLowerCase().includes('salary')) {
            return logSum;
          }
          return logSum + expense.amount;
        }, 0);
        return sum + logExpenses;
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
      const logExpenses = log.expenses.reduce((logSum, expense) => {
        // Exclude salary from expenses
        if (expense.description && expense.description.toLowerCase().includes('salary')) {
          return logSum;
        }
        return logSum + expense.amount;
      }, 0);
      return sum + logExpenses;
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
      const logExpenses = log.expenses.reduce((sum, exp) => {
        // Exclude salary from expenses
        if (exp.description && exp.description.toLowerCase().includes('salary')) {
          return sum;
        }
        return sum + exp.amount;
      }, 0);
      monthlyData[month].expenses += logExpenses;
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
    // Allow recording payments by customerName when customerId is not present (log-only customers)
    const payload = { ...req.body };
    // Sanitize customerId: if it's not a valid ObjectId, drop it so schema won't try to cast
    if (payload.customerId && !mongoose.Types.ObjectId.isValid(payload.customerId)) {
      delete payload.customerId;
    }
    if (!payload.customerId && payload.customerName) {
      const customer = await Customer.findOne({ name: payload.customerName });
      if (customer) {
        payload.customerId = customer._id;
      }
    }
    // New payments should start as 'completed' to be counted in overview, unless explicitly pending
    const status = payload.status || 'completed';
    const payment = new CreditPayment({ ...payload, status, adminId: req.constructionAdmin.username });
    await payment.save();
    
    // Update customer's total paid amount
    const customer = payment.customerId ? await Customer.findById(payment.customerId) : null;
    if (customer && status === 'completed' && payment.paymentAmount > 0) {
      customer.totalPaid += payment.paymentAmount;
      await customer.save();
    }
    
    // Update vehicle log's credit paid amount
    if (payment.vehicleLogId) {
      const vehicleLog = await VehicleLog.findById(payment.vehicleLogId);
      if (vehicleLog) {
        vehicleLog.payments.creditPaidAmount += payment.paymentAmount;
        await vehicleLog.save();
      }
    } else {
      // No specific log: distribute payment across this customer's unpaid credit logs (by customerName)
      if (payment.customerName) {
        let remaining = payment.paymentAmount;
        const logs = await VehicleLog.find({
          customerName: payment.customerName,
          'payments.credit': { $gt: 0 }
        }).sort({ date: 1 });
        for (const log of logs) {
          const alreadyPaid = log.payments.creditPaidAmount || 0;
          const credit = log.payments.credit || 0;
          const due = Math.max(credit - alreadyPaid, 0);
          if (due <= 0) continue;
          const apply = Math.min(due, remaining);
          log.payments.creditPaidAmount = alreadyPaid + apply;
          log.markModified('payments');
          await log.save();
          remaining -= apply;
          if (remaining <= 0) break;
        }
      }
    }
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/construction-admin/credit-payments/:id
router.delete('/credit-payments/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const payment = await CreditPayment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // Revert customer totalPaid if linked
    if (payment.customerId) {
      const customer = await Customer.findById(payment.customerId);
      if (customer) {
        customer.totalPaid = Math.max(0, (customer.totalPaid || 0) - (payment.paymentAmount || 0));
        await customer.save();
      }
    }

    // Revert vehicle log creditPaidAmount
    if (payment.vehicleLogId) {
      const log = await VehicleLog.findById(payment.vehicleLogId);
      if (log) {
        const current = log.payments?.creditPaidAmount || 0;
        log.payments.creditPaidAmount = Math.max(0, current - (payment.paymentAmount || 0));
        log.markModified('payments');
        await log.save();
      }
    } else if (payment.customerName) {
      // Reverse-distribute reduction across this customer's logs (newest first)
      let remaining = payment.paymentAmount || 0;
      const logs = await VehicleLog.find({
        customerName: payment.customerName,
        'payments.creditPaidAmount': { $gt: 0 }
      }).sort({ date: -1 });
      for (const log of logs) {
        if (remaining <= 0) break;
        const current = log.payments?.creditPaidAmount || 0;
        const reduceBy = Math.min(current, remaining);
        log.payments.creditPaidAmount = Math.max(0, current - reduceBy);
        log.markModified('payments');
        await log.save();
        remaining -= reduceBy;
      }
    }

    await payment.deleteOne();
    res.json({ success: true });
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
    // Fetch recorded credit payments grouped by customer
    // Only count completed payments with positive amount
    const payments = await CreditPayment.find({ status: 'completed', paymentAmount: { $gt: 0 } }).sort({ paymentDate: -1 });
    const paidByCustomerId = payments.reduce((map, p) => {
      const key = String(p.customerId);
      map[key] = (map[key] || 0) + (p.paymentAmount || 0);
      return map;
    }, {});
    const lastPaymentByCustomerId = payments.reduce((map, p) => {
      const key = String(p.customerId);
      if (!map[key] || new Date(p.paymentDate) > new Date(map[key])) {
        map[key] = p.paymentDate;
      }
      return map;
    }, {});
    // Also track payments grouped by customerName (for log-only customers or when customerId missing)
    const paidByCustomerName = payments.reduce((map, p) => {
      const key = (p.customerName || '').trim();
      if (!key) return map;
      map[key] = (map[key] || 0) + (p.paymentAmount || 0);
      return map;
    }, {});
    const lastPaymentByCustomerName = payments.reduce((map, p) => {
      const key = (p.customerName || '').trim();
      if (!key) return map;
      if (!map[key] || new Date(p.paymentDate) > new Date(map[key])) {
        map[key] = p.paymentDate;
      }
      return map;
    }, {});
    console.log('Found vehicle logs with credit:', vehicleLogs.length);
    console.log('Sample vehicle log:', vehicleLogs[0] ? {
      customerName: vehicleLogs[0].customerName,
      employeeName: vehicleLogs[0].employeeName,
      employeeId: vehicleLogs[0].employeeId,
      payments: vehicleLogs[0].payments
    } : 'No logs');
    
    // Build a map of customerName -> logs with credit
    const logsByCustomerName = vehicleLogs.reduce((map, log) => {
      const key = (log.customerName || 'Unknown').trim();
      if (!key) return map;
      if (!map[key]) map[key] = [];
      map[key].push(log);
      return map;
    }, {});

    // Seed overview with real customers first
    const creditOverview = customers.map(customer => {
      // Try to find vehicle logs for this customer
      const customerLogs = logsByCustomerName[customer.name] || [];
      
      // If no exact match, try to find logs that might be for this customer
      // This is a fallback for existing data that doesn't have customer names
      if (customerLogs.length === 0) {
        // For now, we'll create a sample entry to show the customer exists
        // In a real scenario, you'd want to update existing vehicle logs with customer information
        console.log(`No vehicle logs found for customer: ${customer.name}`);
      }
      
      const totalCredit = customerLogs.reduce((sum, log) => sum + (log.payments.credit || 0), 0);
      // Only consider recorded payments entries for paid amounts (ignore any log-side paid markers)
      // Avoid double-counting the same payment by ID and Name.
      // Prefer customerId mapping; fall back to name only if id mapping absent.
      const idKey = String(customer._id);
      const hasIdPayment = Object.prototype.hasOwnProperty.call(paidByCustomerId, idKey);
      const paidFromPayments = hasIdPayment
        ? (paidByCustomerId[idKey] || 0)
        : (paidByCustomerName[customer.name] || 0);
      // Prevent overpayment from making remaining negative
      const totalPaid = Math.min(totalCredit, paidFromPayments);
      const remainingCredit = Math.max(totalCredit - totalPaid, 0);
      const lastPayment = lastPaymentByCustomerId[String(customer._id)] || lastPaymentByCustomerName[customer.name] || (customerLogs.length > 0 ? customerLogs[0].date : null);
      
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
        lastPayment,
        deliveryEmployees,
        totalDeliveries: customerLogs.length
      };
    }).filter(customer => customer.totalCredit > 0);

    // Include customers that exist only in logs (not in customers collection)
    const existingNames = new Set(creditOverview.map(c => c.customerName));
    Object.entries(logsByCustomerName).forEach(([name, customerLogs]) => {
      if (existingNames.has(name)) return;
      const totalCredit = customerLogs.reduce((sum, log) => sum + (log.payments.credit || 0), 0);
      // Only count recorded payments (by customer name) for log-only customers
      const totalPaid = Math.min(totalCredit, (paidByCustomerName[name] || 0));
      const remainingCredit = Math.max(totalCredit - totalPaid, 0);
      if (totalCredit > 0) {
        // Derive delivery employees from logs
        const employeesMap = new Map();
        customerLogs.forEach(log => {
          const key = log.employeeId || log.employeeName;
          if (!employeesMap.has(key)) {
            employeesMap.set(key, {
              name: log.employeeName || 'Unknown',
              employeeId: log.employeeId || 'N/A'
            });
          }
        });
        const deliveryEmployees = Array.from(employeesMap.values());
        creditOverview.push({
          customerId: name, // use name as stable key
          customerName: name,
          customerPhone: '',
          totalCredit,
          totalPaid,
          remainingCredit,
          creditStatus: 'pending',
          lastPayment: customerLogs.length > 0 ? customerLogs[0].date : null,
          deliveryEmployees,
          totalDeliveries: customerLogs.length
        });
      }
    });
    
    console.log('Credit overview result:', creditOverview.map(c => ({
      name: c.customerName,
      totalCredit: c.totalCredit,
      totalPaid: c.totalPaid,
      remainingCredit: c.remainingCredit,
      employees: c.deliveryEmployees.length
    })));
    
    console.log('Total customers with credit:', creditOverview.length);
    
    res.json(creditOverview);
  } catch (error) {
    console.error('Credit overview error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/employees/:employeeId/wallet
router.post('/employees/:employeeId/wallet', requireConstructionAdmin, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { amount, type, description } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Update wallet balance
    const numericAmount = Number(amount) || 0;
    employee.walletBalance = (employee.walletBalance || 0) + numericAmount;

    // If we are deducting salary from balance, also clear pending salary up to the deducted amount
    if (type === 'salary_deduction' && numericAmount < 0) {
      const pending = Number(employee.pendingSalary || 0);
      const reduceBy = Math.min(pending, Math.abs(numericAmount));
      if (reduceBy > 0) {
        employee.pendingSalary = pending - reduceBy;
        // Update last salary payment metadata
        employee.lastSalaryPaid = new Date();
        employee.lastSalaryAmount = reduceBy;
      }
    }
    await employee.save();

    res.json({ 
      success: true, 
      walletBalance: employee.walletBalance,
      pendingSalary: employee.pendingSalary || 0,
      message: `${type === 'salary' ? 'Salary' : 'Expense'} ${amount >= 0 ? 'added' : 'deducted'} successfully`
    });
  } catch (error) {
    console.error('Wallet update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/employees/:employeeId/pending-salary
router.post('/employees/:employeeId/pending-salary', requireConstructionAdmin, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { amount, description } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Add to pending salary (tracked separately from wallet)
    employee.pendingSalary = (employee.pendingSalary || 0) + (Number(amount) || 0);
    await employee.save();

    res.json({ 
      success: true, 
      pendingSalary: employee.pendingSalary,
      message: 'Pending salary added successfully'
    });
  } catch (error) {
    console.error('Pending salary update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/employees/:employeeId/wallet-history
router.get('/employees/:employeeId/wallet-history', requireConstructionAdmin, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Calculate running balance from all logs for this employee
    const allLogs = await VehicleLog.find({
      employeeId: employeeId
    }).sort({ date: 1 });
    
    let yesterdayBalance = 0;
    allLogs.forEach(log => {
      const cash = log.payments?.cash || 0;
      const setCash = log.setCashTaken || 0;
      // Only include non-salary expenses in balance calculation
      const expenses = (log.expenses || []).reduce((s, e) => {
        // Exclude salary from expenses calculation
        if (e.description && e.description.toLowerCase().includes('salary')) {
          return s;
        }
        return s + (e.amount || 0);
      }, 0);
      const salaryDeducted = log.salaryDeductedFromBalance || 0;
      
      yesterdayBalance += cash + setCash - expenses - salaryDeducted;
    });

    // Find last salary payment from vehicle logs
    const lastSalaryLog = await VehicleLog.findOne({
      employeeId: employeeId,
      'payments.credit': { $gt: 0 } // Assuming salary payments have credit > 0
    }).sort({ date: -1 });

    const lastSalaryPaid = lastSalaryLog?.date || null;
    const lastSalaryAmount = lastSalaryLog?.payments?.credit || 0;

    // Update employee with calculated values
    employee.yesterdayBalance = yesterdayBalance;
    employee.lastSalaryAmount = lastSalaryAmount;
    if (lastSalaryPaid) {
      employee.lastSalaryPaid = lastSalaryPaid;
    }
    await employee.save();

    res.json({
      pendingSalary: employee.pendingSalary || 0,
      yesterdayBalance: yesterdayBalance,
      lastSalaryPaid: lastSalaryPaid,
      lastSalaryAmount: lastSalaryAmount
    });
  } catch (error) {
    console.error('Wallet history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/employees/:employeeId/mark-salary-paid
router.post('/employees/:employeeId/mark-salary-paid', requireConstructionAdmin, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const amount = Number(req.body.amount || 0);
    if (amount <= 0) return res.status(400).json({ error: 'Amount must be greater than 0' });

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const pending = Number(employee.pendingSalary || 0);
    const reduceBy = Math.min(pending, amount);
    employee.pendingSalary = Math.max(0, pending - reduceBy);
    employee.lastSalaryPaid = new Date();
    employee.lastSalaryAmount = reduceBy;
    await employee.save();

    res.json({ success: true, pendingSalary: employee.pendingSalary, lastSalaryPaid: employee.lastSalaryPaid, lastSalaryAmount: employee.lastSalaryAmount });
  } catch (error) {
    console.error('Mark salary paid error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/fix-yesterday-balances
router.post('/fix-yesterday-balances', requireConstructionAdmin, async (req, res) => {
  try {
    console.log('Starting to fix yesterday balances for all vehicle logs...');
    
    // Get all vehicle logs grouped by employee and sorted by date
    const logs = await VehicleLog.find({}).sort({ employeeId: 1, date: 1 });
    console.log(`Found ${logs.length} total logs`);
    
    // Group logs by employee
    const employeeLogs = {};
    logs.forEach(log => {
      if (!employeeLogs[log.employeeId]) {
        employeeLogs[log.employeeId] = [];
      }
      employeeLogs[log.employeeId].push(log);
    });
    
    let updatedCount = 0;
    const results = [];
    
    // Update each employee's logs
    for (const employeeId in employeeLogs) {
      const empLogs = employeeLogs[employeeId];
      
      // Sort logs by date to ensure chronological order
      empLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      let runningBalance = 0;
      
      console.log(`Processing employee ${employeeId} with ${empLogs.length} logs`);
      
      for (let i = 0; i < empLogs.length; i++) {
        const log = empLogs[i];
        
        // Set yesterday balance to current running balance
        const oldYesterdayBalance = log.yesterdayBalance;
        log.yesterdayBalance = runningBalance;
        await log.save();
        updatedCount++;
        
        // Update running balance for next log
        const cash = log.payments?.cash || 0;
        const setCash = log.setCashTaken || 0;
        // Only include non-salary expenses in balance calculation
        const expenses = (log.expenses || []).reduce((s, e) => {
          // Exclude salary from expenses calculation
          if (e.description && e.description.toLowerCase().includes('salary')) {
            return s;
          }
          return s + (e.amount || 0);
        }, 0);
        const salaryDeducted = log.salaryDeductedFromBalance || 0;
        
        runningBalance += cash + setCash - expenses - salaryDeducted;
        
        results.push({
          logId: log._id,
          date: log.date,
          employeeId: log.employeeId,
          oldYesterdayBalance,
          newYesterdayBalance: log.yesterdayBalance,
          runningBalance,
          cash,
          setCash,
          expenses,
          salaryDeducted
        });
        
        console.log(`Updated log ${log._id}: date=${log.date}, yesterdayBalance: ${oldYesterdayBalance} -> ${log.yesterdayBalance}, runningBalance: ${runningBalance}`);
      }
    }
    
    console.log(`Yesterday balance fix completed! Updated ${updatedCount} logs.`);
    res.json({ 
      success: true, 
      message: `Successfully updated yesterday balances for ${updatedCount} vehicle logs`,
      updatedCount,
      results: results.slice(0, 10) // Return first 10 results for debugging
    });
  } catch (error) {
    console.error('Error fixing yesterday balances:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/clear-vehicle-logs
router.post('/clear-vehicle-logs', requireConstructionAdmin, async (req, res) => {
  try {
    console.log('Starting to clear all vehicle logs and reset employee wallets...');
    
    // Count existing logs
    const countBefore = await VehicleLog.countDocuments();
    console.log(`Found ${countBefore} vehicle logs in database`);
    
    // Delete all vehicle logs
    const vehicleLogResult = await VehicleLog.deleteMany({});
    console.log(`Successfully deleted ${vehicleLogResult.deletedCount} vehicle logs`);
    
    // Reset all employee wallet data
    const employeeResult = await Employee.updateMany({}, {
      $set: {
        walletBalance: 0,
        pendingSalary: 0,
        yesterdayBalance: 0,
        lastSalaryAmount: 0,
        lastSalaryPaid: null
      }
    });
    console.log(`Reset wallet data for ${employeeResult.modifiedCount} employees`);
    
    res.json({ 
      success: true, 
      message: `Successfully deleted ${vehicleLogResult.deletedCount} vehicle logs and reset wallet data for ${employeeResult.modifiedCount} employees`,
      deletedLogs: vehicleLogResult.deletedCount,
      resetEmployees: employeeResult.modifiedCount
    });
  } catch (error) {
    console.error('Error clearing vehicle logs and resetting wallets:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/send-sms
router.post('/send-sms', requireConstructionAdmin, async (req, res) => {
  try {
    const { phoneNumber, customerName } = req.body;
    
    console.log('SMS request received:', { phoneNumber, customerName });
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await smsService.sendThankYouMessage(phoneNumber, customerName);
    
    console.log('SMS service result:', result);
    
    if (result.success) {
      res.json({ success: true, message: 'SMS sent successfully' });
    } else {
      console.error('SMS failed:', result);
      res.status(500).json({ 
        success: false, 
        error: result.message,
        details: result.details || result.error
      });
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/test-sms
router.post('/test-sms', requireConstructionAdmin, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    console.log('Testing SMS to:', phoneNumber);
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await smsService.sendSMS(phoneNumber, 'Test message from AKR Construction');
    
    console.log('Test SMS result:', result);
    
    res.json(result);
  } catch (error) {
    console.error('Test SMS error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fuel Management Routes
// GET /api/construction-admin/fuel-logs
router.get('/fuel-logs', requireConstructionAdmin, async (req, res) => {
  try {
    const { vehicleNumber, startDate, endDate } = req.query;
    let query = {};
    
    if (vehicleNumber) {
      query.vehicleNumber = vehicleNumber;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const fuelLogs = await FuelLog.find(query)
      .sort({ date: -1 })
      .limit(100);
    
    res.json(fuelLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/fuel-logs
router.post('/fuel-logs', requireConstructionAdmin, async (req, res) => {
  try {
    const fuelLog = new FuelLog(req.body);
    await fuelLog.save();
    res.status(201).json(fuelLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/construction-admin/fuel-logs/:id
router.put('/fuel-logs/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const fuelLog = await FuelLog.findById(req.params.id);
    if (!fuelLog) return res.status(404).json({ error: 'Fuel log not found' });
    
    // Update the fuel log with new data
    Object.assign(fuelLog, req.body);
    
    // Save to trigger pre-save middleware for calculations
    await fuelLog.save();
    
    res.json(fuelLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/construction-admin/fuel-logs/:id
router.delete('/fuel-logs/:id', requireConstructionAdmin, async (req, res) => {
  try {
    const fuelLog = await FuelLog.findByIdAndDelete(req.params.id);
    if (!fuelLog) return res.status(404).json({ error: 'Fuel log not found' });
    res.json({ message: 'Fuel log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/fuel-summary
router.get('/fuel-summary', requireConstructionAdmin, async (req, res) => {
  try {
    const { vehicleNumber, startDate, endDate } = req.query;
    let matchQuery = {};
    
    if (vehicleNumber) {
      matchQuery.vehicleNumber = vehicleNumber;
    }
    
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const summary = await FuelLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalFuelAmount: { $sum: '$fuelAmount' },
          totalCost: { $sum: '$totalCost' },
          totalDistance: { $sum: '$distanceTraveled' },
          averageEfficiency: { $avg: '$fuelEfficiency' },
          totalPaid: { $sum: '$paidAmount' },
          totalPending: { $sum: '$remainingAmount' },
          totalLogs: { $sum: 1 }
        }
      }
    ]);
    
    const result = summary[0] || {
      totalFuelAmount: 0,
      totalCost: 0,
      totalDistance: 0,
      averageEfficiency: 0,
      totalPaid: 0,
      totalPending: 0,
      totalLogs: 0
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/vehicles-fuel-efficiency
router.get('/vehicles-fuel-efficiency', requireConstructionAdmin, async (req, res) => {
  try {
    const efficiency = await FuelLog.aggregate([
      {
        $group: {
          _id: '$vehicleNumber',
          totalFuel: { $sum: '$fuelAmount' },
          totalDistance: { $sum: '$distanceTraveled' },
          averageEfficiency: { $avg: '$fuelEfficiency' },
          lastFuelDate: { $max: '$date' },
          totalLogs: { $sum: 1 }
        }
      },
      {
        $addFields: {
          overallEfficiency: {
            $cond: {
              if: { $gt: ['$totalFuel', 0] },
              then: { $divide: ['$totalDistance', '$totalFuel'] },
              else: 0
            }
          }
        }
      },
      { $sort: { overallEfficiency: -1 } }
    ]);
    
    res.json(efficiency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SHED WALLET MANAGEMENT ROUTES =====

// GET /api/construction-admin/shed-wallet
router.get('/shed-wallet', requireConstructionAdmin, async (req, res) => {
  try {
    let shedWallet = await ShedWallet.findOne({ status: 'active' });
    
    // Create default shed wallet if none exists
    if (!shedWallet) {
      shedWallet = new ShedWallet({
        shedName: 'AKR Shed',
        currentBalance: 0,
        pendingAmount: 0,
        totalReceived: 0
      });
      await shedWallet.save();
    }
    
    // Calculate pending amount from fuel logs
    const fuelLogs = await FuelLog.find({ 
      $or: [
        { paymentStatus: 'pending' },
        { paymentStatus: 'partial' }
      ]
    });
    
    const totalPendingFromFuel = fuelLogs.reduce((sum, log) => {
      return sum + (log.remainingAmount || 0);
    }, 0);
    
    // Update pending amount
    shedWallet.pendingAmount = totalPendingFromFuel;
    await shedWallet.save();
    
    res.json(shedWallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/shed-wallet/transactions
router.get('/shed-wallet/transactions', requireConstructionAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;
    
    let shedWallet = await ShedWallet.findOne({ status: 'active' });
    if (!shedWallet) {
      return res.json({ transactions: [], totalPages: 0, currentPage: 1, total: 0 });
    }
    
    let query = { shedWalletId: shedWallet._id };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const transactions = await ShedTransaction.find(query)
      .populate('fuelLogId', 'vehicleNumber employeeName date')
      .sort({ transactionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ShedTransaction.countDocuments(query);
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/construction-admin/shed-wallet/transaction
router.post('/shed-wallet/transaction', requireConstructionAdmin, async (req, res) => {
  try {
    const { type, amount, description, paymentMethod, referenceNumber, notes, fuelLogId, fuelLogDetails } = req.body;
    
    let shedWallet = await ShedWallet.findOne({ status: 'active' });
    if (!shedWallet) {
      shedWallet = new ShedWallet({
        shedName: 'AKR Shed',
        currentBalance: 0,
        pendingAmount: 0,
        totalReceived: 0
      });
      await shedWallet.save();
    }
    
    const transaction = new ShedTransaction({
      shedWalletId: shedWallet._id,
      type,
      amount: Number(amount),
      description,
      paymentMethod: paymentMethod || 'cash',
      referenceNumber,
      notes,
      fuelLogId,
      fuelLogDetails: fuelLogDetails || [],
      processedBy: req.constructionAdmin.username,
      status: 'completed'
    });
    
    await transaction.save();
    
    // Update shed wallet balance
    if (type === 'payment_sent') {
      shedWallet.currentBalance = Math.max(0, shedWallet.currentBalance - Number(amount));
    } else if (type === 'payment_received' || type === 'fuel_purchase') {
      shedWallet.currentBalance += Number(amount);
      if (type === 'payment_received') {
        shedWallet.totalReceived += Number(amount);
      }
    }
    
    await shedWallet.save();
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/construction-admin/shed-wallet/pending-details
router.get('/shed-wallet/pending-details', requireConstructionAdmin, async (req, res) => {
  try {
    // Get all pending fuel logs with details
    const pendingFuelLogs = await FuelLog.find({
      $or: [
        { paymentStatus: 'pending' },
        { paymentStatus: 'partial' }
      ]
    }).sort({ date: -1 });
    
    // Calculate total pending fuel amount
    const totalPendingFuel = pendingFuelLogs.reduce((sum, log) => sum + (log.remainingAmount || 0), 0);
    
    // Get all vehicle logs to calculate cash collected by employees from customers and set cash taken
    const vehicleLogs = await VehicleLog.find({
      $or: [
        { 'payments.cash': { $gt: 0 } },
        { setCashTaken: { $gt: 0 } }
      ]
    }).sort({ date: -1 });
    
    // Calculate total cash collected by employees from customers (this is what needs to be sent to shed)
    const totalCashCollected = vehicleLogs.reduce((sum, log) => sum + (log.payments?.cash || 0), 0);
    
    // Calculate total set cash taken by employees (cash borrowed from shed) - only unpaid ones
    const totalSetCashTaken = vehicleLogs.reduce((sum, log) => {
      // Only count set cash that hasn't been paid back
      const setCashPaidBack = log.setCashPaidBack || 0;
      const remainingSetCash = Math.max(0, (log.setCashTaken || 0) - setCashPaidBack);
      return sum + remainingSetCash;
    }, 0);
    
    // Group by employee
    const pendingByEmployee = {};
    const pendingByVehicle = {};
    
    pendingFuelLogs.forEach(log => {
      const employeeKey = log.employeeId || 'Unknown';
      const vehicleKey = log.vehicleNumber || 'Unknown';
      
      if (!pendingByEmployee[employeeKey]) {
        pendingByEmployee[employeeKey] = {
          employeeId: log.employeeId,
          employeeName: log.employeeName,
          totalPending: 0,
          logs: []
        };
      }
      
      if (!pendingByVehicle[vehicleKey]) {
        pendingByVehicle[vehicleKey] = {
          vehicleNumber: log.vehicleNumber,
          totalPending: 0,
          logs: []
        };
      }
      
      const remainingAmount = log.remainingAmount || 0;
      pendingByEmployee[employeeKey].totalPending += remainingAmount;
      pendingByEmployee[employeeKey].logs.push({
        _id: log._id,
        date: log.date,
        vehicleNumber: log.vehicleNumber,
        fuelAmount: log.fuelAmount,
        totalCost: log.totalCost,
        paidAmount: log.paidAmount,
        overallPaidAmount: log.overallPaidAmount,
        remainingAmount: remainingAmount,
        paymentStatus: log.paymentStatus
      });
      
      pendingByVehicle[vehicleKey].totalPending += remainingAmount;
      pendingByVehicle[vehicleKey].logs.push({
        _id: log._id,
        date: log.date,
        employeeName: log.employeeName,
        fuelAmount: log.fuelAmount,
        totalCost: log.totalCost,
        paidAmount: log.paidAmount,
        overallPaidAmount: log.overallPaidAmount,
        remainingAmount: remainingAmount,
        paymentStatus: log.paymentStatus
      });
    });
    
    // Calculate total pending amount (fuel pending + set cash taken by employees)
    // Set cash taken by employees is money they owe to the shed
    const totalPendingAmount = totalPendingFuel + totalSetCashTaken;
    
    // Also include vehicle logs with set cash information - only those with remaining set cash
    const vehicleLogsWithSetCash = vehicleLogs.filter(log => {
      const setCashPaidBack = log.setCashPaidBack || 0;
      const remainingSetCash = Math.max(0, (log.setCashTaken || 0) - setCashPaidBack);
      return remainingSetCash > 0;
    });
    
    res.json({
      totalPending: totalPendingFuel, // This is just fuel pending
      totalPendingFuel,
      totalCashCollected,
      totalSetCashTaken,
      totalPendingAmount, // This is the sum of fuel + set cash taken
      pendingByEmployee: Object.values(pendingByEmployee),
      pendingByVehicle: Object.values(pendingByVehicle),
      vehicleLogsWithSetCash: vehicleLogsWithSetCash.map(log => {
        const setCashPaidBack = log.setCashPaidBack || 0;
        const remainingSetCash = Math.max(0, (log.setCashTaken || 0) - setCashPaidBack);
        return {
          _id: log._id,
          date: log.date,
          vehicleNumber: log.vehicleNumber,
          employeeId: log.employeeId,
          employeeName: log.employeeName,
          setCashTaken: log.setCashTaken,
          setCashPaidBack: setCashPaidBack,
          remainingSetCash: remainingSetCash,
          customerName: log.customerName,
          startPlace: log.startPlace,
          endPlace: log.endPlace
        };
      }),
      totalLogs: pendingFuelLogs.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/construction-admin/shed-wallet
router.put('/shed-wallet', requireConstructionAdmin, async (req, res) => {
  try {
    let shedWallet = await ShedWallet.findOne({ status: 'active' });
    if (!shedWallet) {
      shedWallet = new ShedWallet(req.body);
    } else {
      Object.assign(shedWallet, req.body);
    }
    
    await shedWallet.save();
    res.json(shedWallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 