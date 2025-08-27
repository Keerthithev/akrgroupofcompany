const mongoose = require('mongoose');
const VehicleLog = require('../models/VehicleLog');
const Employee = require('../models/Employee');
require('dotenv').config();

async function seedExtendedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get existing employees
    const employees = await Employee.find();
    if (employees.length === 0) {
      console.log('No employees found. Please run seedSampleData.js first.');
      return;
    }

    // Clear existing vehicle logs
    await VehicleLog.deleteMany({});
    console.log('Cleared existing vehicle logs');

    // Sample data for different months
    const vehicleLogs = [
      // January 2024
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-01-05'),
        startMeter: 1000,
        startPlace: 'Murunkan',
        endMeter: 1500,
        endPlace: 'Mannar',
        workingKm: 500,
        description: 'Transport construction materials to Mannar',
        duties: ['Driving', 'Loading'],
        payments: { credit: '0', cash: 5000, total: 5000 },
        fuel: { liters: 50, startMeter: 1000, endMeter: 1500, totalKm: 500 },
        expenses: [
          { description: 'Fuel', amount: 2500 },
          { description: 'Toll', amount: 500 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: 'ABC123',
        employeeId: 'EMP0003',
        employeeName: 'David Worker',
        date: new Date('2024-01-08'),
        startMeter: 500,
        startPlace: 'Murunkan',
        endMeter: 800,
        endPlace: 'Local Site',
        workingKm: 300,
        description: 'Local construction work',
        duties: ['Construction', 'Material Handling'],
        payments: { credit: '0', cash: 3000, total: 3000 },
        fuel: { liters: 30, startMeter: 500, endMeter: 800, totalKm: 300 },
        expenses: [
          { description: 'Fuel', amount: 1500 },
          { description: 'Tools', amount: 500 }
        ],
        driverSignature: 'David Worker',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // February 2024
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-02-12'),
        startMeter: 1500,
        startPlace: 'Mannar',
        endMeter: 2000,
        endPlace: 'Jaffna',
        workingKm: 500,
        description: 'Deliver materials to Jaffna construction site',
        duties: ['Driving', 'Unloading'],
        payments: { credit: '0', cash: 6000, total: 6000 },
        fuel: { liters: 60, startMeter: 1500, endMeter: 2000, totalKm: 500 },
        expenses: [
          { description: 'Fuel', amount: 3000 },
          { description: 'Maintenance', amount: 1000 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: 'XYZ789',
        employeeId: 'EMP0002',
        employeeName: 'Mike Supervisor',
        date: new Date('2024-02-15'),
        startMeter: 2000,
        startPlace: 'Jaffna',
        endMeter: 2400,
        endPlace: 'Kilinochchi',
        workingKm: 400,
        description: 'Site inspection and supervision',
        duties: ['Supervision', 'Safety Management'],
        payments: { credit: '0', cash: 4000, total: 4000 },
        fuel: { liters: 40, startMeter: 2000, endMeter: 2400, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2000 },
          { description: 'Safety Equipment', amount: 800 }
        ],
        driverSignature: 'Mike Supervisor',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // March 2024
      {
        vehicleNumber: 'ABC123',
        employeeId: 'EMP0003',
        employeeName: 'David Worker',
        date: new Date('2024-03-03'),
        startMeter: 800,
        startPlace: 'Local Site',
        endMeter: 1200,
        endPlace: 'Construction Zone A',
        workingKm: 400,
        description: 'Foundation work at Zone A',
        duties: ['Construction', 'Material Handling'],
        payments: { credit: '0', cash: 3500, total: 3500 },
        fuel: { liters: 35, startMeter: 800, endMeter: 1200, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 1750 },
          { description: 'Construction Materials', amount: 750 }
        ],
        driverSignature: 'David Worker',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-03-10'),
        startMeter: 2000,
        startPlace: 'Jaffna',
        endMeter: 2500,
        endPlace: 'Vavuniya',
        workingKm: 500,
        description: 'Transport equipment to Vavuniya',
        duties: ['Driving', 'Loading', 'Unloading'],
        payments: { credit: '0', cash: 5500, total: 5500 },
        fuel: { liters: 55, startMeter: 2000, endMeter: 2500, totalKm: 500 },
        expenses: [
          { description: 'Fuel', amount: 2750 },
          { description: 'Equipment Rental', amount: 1000 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // April 2024
      {
        vehicleNumber: 'XYZ789',
        employeeId: 'EMP0002',
        employeeName: 'Mike Supervisor',
        date: new Date('2024-04-05'),
        startMeter: 2400,
        startPlace: 'Kilinochchi',
        endMeter: 2800,
        endPlace: 'Mullaitivu',
        workingKm: 400,
        description: 'Project supervision at Mullaitivu',
        duties: ['Supervision', 'Safety Management'],
        payments: { credit: '0', cash: 4500, total: 4500 },
        fuel: { liters: 45, startMeter: 2400, endMeter: 2800, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2250 },
          { description: 'Safety Gear', amount: 600 }
        ],
        driverSignature: 'Mike Supervisor',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: 'ABC123',
        employeeId: 'EMP0003',
        employeeName: 'David Worker',
        date: new Date('2024-04-18'),
        startMeter: 1200,
        startPlace: 'Construction Zone A',
        endMeter: 1600,
        endPlace: 'Construction Zone B',
        workingKm: 400,
        description: 'Structural work at Zone B',
        duties: ['Construction', 'Material Handling'],
        payments: { credit: '0', cash: 3800, total: 3800 },
        fuel: { liters: 38, startMeter: 1200, endMeter: 1600, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 1900 },
          { description: 'Steel Materials', amount: 900 }
        ],
        driverSignature: 'David Worker',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // May 2024
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-05-02'),
        startMeter: 2500,
        startPlace: 'Vavuniya',
        endMeter: 3000,
        endPlace: 'Anuradhapura',
        workingKm: 500,
        description: 'Deliver construction supplies to Anuradhapura',
        duties: ['Driving', 'Loading'],
        payments: { credit: '0', cash: 5200, total: 5200 },
        fuel: { liters: 52, startMeter: 2500, endMeter: 3000, totalKm: 500 },
        expenses: [
          { description: 'Fuel', amount: 2600 },
          { description: 'Toll Charges', amount: 400 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: 'XYZ789',
        employeeId: 'EMP0002',
        employeeName: 'Mike Supervisor',
        date: new Date('2024-05-15'),
        startMeter: 2800,
        startPlace: 'Mullaitivu',
        endMeter: 3200,
        endPlace: 'Trincomalee',
        workingKm: 400,
        description: 'Coastal project supervision',
        duties: ['Supervision', 'Safety Management'],
        payments: { credit: '0', cash: 4800, total: 4800 },
        fuel: { liters: 48, startMeter: 2800, endMeter: 3200, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2400 },
          { description: 'Safety Equipment', amount: 700 }
        ],
        driverSignature: 'Mike Supervisor',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // June 2024
      {
        vehicleNumber: 'ABC123',
        employeeId: 'EMP0003',
        employeeName: 'David Worker',
        date: new Date('2024-06-08'),
        startMeter: 1600,
        startPlace: 'Construction Zone B',
        endMeter: 2000,
        endPlace: 'Construction Zone C',
        workingKm: 400,
        description: 'Electrical installation work',
        duties: ['Construction', 'Material Handling'],
        payments: { credit: '0', cash: 4200, total: 4200 },
        fuel: { liters: 42, startMeter: 1600, endMeter: 2000, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2100 },
          { description: 'Electrical Materials', amount: 1100 }
        ],
        driverSignature: 'David Worker',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-06-22'),
        startMeter: 3000,
        startPlace: 'Anuradhapura',
        endMeter: 3500,
        endPlace: 'Polonnaruwa',
        workingKm: 500,
        description: 'Transport machinery to Polonnaruwa',
        duties: ['Driving', 'Loading', 'Unloading'],
        payments: { credit: '0', cash: 5800, total: 5800 },
        fuel: { liters: 58, startMeter: 3000, endMeter: 3500, totalKm: 500 },
        expenses: [
          { description: 'Fuel', amount: 2900 },
          { description: 'Machinery Transport', amount: 1500 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // July 2024
      {
        vehicleNumber: 'XYZ789',
        employeeId: 'EMP0002',
        employeeName: 'Mike Supervisor',
        date: new Date('2024-07-05'),
        startMeter: 3200,
        startPlace: 'Trincomalee',
        endMeter: 3600,
        endPlace: 'Batticaloa',
        workingKm: 400,
        description: 'Site inspection at Batticaloa',
        duties: ['Supervision', 'Safety Management'],
        payments: { credit: '0', cash: 4600, total: 4600 },
        fuel: { liters: 46, startMeter: 3200, endMeter: 3600, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2300 },
          { description: 'Inspection Tools', amount: 500 }
        ],
        driverSignature: 'Mike Supervisor',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: 'ABC123',
        employeeId: 'EMP0003',
        employeeName: 'David Worker',
        date: new Date('2024-07-18'),
        startMeter: 2000,
        startPlace: 'Construction Zone C',
        endMeter: 2400,
        endPlace: 'Construction Zone D',
        workingKm: 400,
        description: 'Plumbing installation work',
        duties: ['Construction', 'Material Handling'],
        payments: { credit: '0', cash: 3900, total: 3900 },
        fuel: { liters: 39, startMeter: 2000, endMeter: 2400, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 1950 },
          { description: 'Plumbing Materials', amount: 950 }
        ],
        driverSignature: 'David Worker',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // August 2024
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-08-03'),
        startMeter: 3500,
        startPlace: 'Polonnaruwa',
        endMeter: 4000,
        endPlace: 'Kandy',
        workingKm: 500,
        description: 'Deliver construction materials to Kandy',
        duties: ['Driving', 'Loading'],
        payments: { credit: '0', cash: 5400, total: 5400 },
        fuel: { liters: 54, startMeter: 3500, endMeter: 4000, totalKm: 500 },
        expenses: [
          { description: 'Fuel', amount: 2700 },
          { description: 'Mountain Road Toll', amount: 600 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: 'XYZ789',
        employeeId: 'EMP0002',
        employeeName: 'Mike Supervisor',
        date: new Date('2024-08-16'),
        startMeter: 3600,
        startPlace: 'Batticaloa',
        endMeter: 4000,
        endPlace: 'Ampara',
        workingKm: 400,
        description: 'Project management at Ampara',
        duties: ['Supervision', 'Safety Management'],
        payments: { credit: '0', cash: 4700, total: 4700 },
        fuel: { liters: 47, startMeter: 3600, endMeter: 4000, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2350 },
          { description: 'Project Management Tools', amount: 800 }
        ],
        driverSignature: 'Mike Supervisor',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // September 2024
      {
        vehicleNumber: 'ABC123',
        employeeId: 'EMP0003',
        employeeName: 'David Worker',
        date: new Date('2024-09-07'),
        startMeter: 2400,
        startPlace: 'Construction Zone D',
        endMeter: 2800,
        endPlace: 'Construction Zone E',
        workingKm: 400,
        description: 'Roofing work at Zone E',
        duties: ['Construction', 'Material Handling'],
        payments: { credit: '0', cash: 4100, total: 4100 },
        fuel: { liters: 41, startMeter: 2400, endMeter: 2800, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2050 },
          { description: 'Roofing Materials', amount: 1050 }
        ],
        driverSignature: 'David Worker',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-09-20'),
        startMeter: 4000,
        startPlace: 'Kandy',
        endMeter: 4500,
        endPlace: 'Colombo',
        workingKm: 500,
        description: 'Transport final materials to Colombo',
        duties: ['Driving', 'Loading', 'Unloading'],
        payments: { credit: '0', cash: 6200, total: 6200 },
        fuel: { liters: 62, startMeter: 4000, endMeter: 4500, totalKm: 500 },
        expenses: [
          { description: 'Fuel', amount: 3100 },
          { description: 'Highway Toll', amount: 800 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // October 2024
      {
        vehicleNumber: 'XYZ789',
        employeeId: 'EMP0002',
        employeeName: 'Mike Supervisor',
        date: new Date('2024-10-12'),
        startMeter: 4000,
        startPlace: 'Ampara',
        endMeter: 4400,
        endPlace: 'Monaragala',
        workingKm: 400,
        description: 'Final project inspection',
        duties: ['Supervision', 'Safety Management'],
        payments: { credit: '0', cash: 4900, total: 4900 },
        fuel: { liters: 49, startMeter: 4000, endMeter: 4400, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2450 },
          { description: 'Inspection Equipment', amount: 600 }
        ],
        driverSignature: 'Mike Supervisor',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: 'ABC123',
        employeeId: 'EMP0003',
        employeeName: 'David Worker',
        date: new Date('2024-10-25'),
        startMeter: 2800,
        startPlace: 'Construction Zone E',
        endMeter: 3200,
        endPlace: 'Final Site',
        workingKm: 400,
        description: 'Final finishing work',
        duties: ['Construction', 'Material Handling'],
        payments: { credit: '0', cash: 4300, total: 4300 },
        fuel: { liters: 43, startMeter: 2800, endMeter: 3200, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2150 },
          { description: 'Finishing Materials', amount: 1150 }
        ],
        driverSignature: 'David Worker',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // November 2024
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-11-08'),
        startMeter: 4500,
        startPlace: 'Colombo',
        endMeter: 5000,
        endPlace: 'Galle',
        workingKm: 500,
        description: 'New project materials to Galle',
        duties: ['Driving', 'Loading'],
        payments: { credit: '0', cash: 5600, total: 5600 },
        fuel: { liters: 56, startMeter: 4500, endMeter: 5000, totalKm: 500 },
        expenses: [
          { description: 'Fuel', amount: 2800 },
          { description: 'Coastal Road Toll', amount: 400 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: 'XYZ789',
        employeeId: 'EMP0002',
        employeeName: 'Mike Supervisor',
        date: new Date('2024-11-21'),
        startMeter: 4400,
        startPlace: 'Monaragala',
        endMeter: 4800,
        endPlace: 'Badulla',
        workingKm: 400,
        description: 'Mountain project supervision',
        duties: ['Supervision', 'Safety Management'],
        payments: { credit: '0', cash: 5100, total: 5100 },
        fuel: { liters: 51, startMeter: 4400, endMeter: 4800, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2550 },
          { description: 'Mountain Safety Gear', amount: 900 }
        ],
        driverSignature: 'Mike Supervisor',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },

      // December 2024
      {
        vehicleNumber: 'ABC123',
        employeeId: 'EMP0003',
        employeeName: 'David Worker',
        date: new Date('2024-12-05'),
        startMeter: 3200,
        startPlace: 'Final Site',
        endMeter: 3600,
        endPlace: 'New Project Site',
        workingKm: 400,
        description: 'Begin new construction project',
        duties: ['Construction', 'Material Handling'],
        payments: { credit: '0', cash: 4400, total: 4400 },
        fuel: { liters: 44, startMeter: 3200, endMeter: 3600, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2200 },
          { description: 'New Project Materials', amount: 1200 }
        ],
        driverSignature: 'David Worker',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-12-18'),
        startMeter: 5000,
        startPlace: 'Galle',
        endMeter: 5500,
        endPlace: 'Matara',
        workingKm: 500,
        description: 'Year-end project delivery',
        duties: ['Driving', 'Loading', 'Unloading'],
        payments: { credit: '0', cash: 5800, total: 5800 },
        fuel: { liters: 58, startMeter: 5000, endMeter: 5500, totalKm: 500 },
        expenses: [
          { description: 'Fuel', amount: 2900 },
          { description: 'Year-end Bonus', amount: 1500 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: 'XYZ789',
        employeeId: 'EMP0002',
        employeeName: 'Mike Supervisor',
        date: new Date('2024-12-30'),
        startMeter: 4800,
        startPlace: 'Badulla',
        endMeter: 5200,
        endPlace: 'Nuwara Eliya',
        workingKm: 400,
        description: 'Final year project completion',
        duties: ['Supervision', 'Safety Management'],
        payments: { credit: '0', cash: 5300, total: 5300 },
        fuel: { liters: 53, startMeter: 4800, endMeter: 5200, totalKm: 400 },
        expenses: [
          { description: 'Fuel', amount: 2650 },
          { description: 'Project Completion Tools', amount: 1000 }
        ],
        driverSignature: 'Mike Supervisor',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      }
    ];

    const createdLogs = await VehicleLog.insertMany(vehicleLogs);
    console.log('Created vehicle logs:', createdLogs.length);

    // Calculate summary statistics
    const totalExpenses = vehicleLogs.reduce((sum, log) => {
      const logExpenses = log.expenses.reduce((logSum, expense) => logSum + expense.amount, 0);
      return sum + logExpenses + log.payments.total;
    }, 0);

    const totalFuel = vehicleLogs.reduce((sum, log) => sum + log.fuel.liters, 0);
    const totalKm = vehicleLogs.reduce((sum, log) => sum + log.workingKm, 0);

    console.log('=== EXTENDED DATA SUMMARY ===');
    console.log('Total Vehicle Logs:', createdLogs.length);
    console.log('Total Expenses: Rs.', totalExpenses.toLocaleString());
    console.log('Total Fuel Consumed:', totalFuel, 'Liters');
    console.log('Total Distance:', totalKm, 'KM');
    console.log('Data spans from January to December 2024');
    console.log('Vehicles used: 1J0611, ABC123, XYZ789');
    console.log('Employees: John Driver, Mike Supervisor, David Worker');

  } catch (error) {
    console.error('Error seeding extended data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedExtendedData(); 