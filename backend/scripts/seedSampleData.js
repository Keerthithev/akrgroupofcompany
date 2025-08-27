const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const VehicleLog = require('../models/VehicleLog');
require('dotenv').config();

async function seedSampleData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Employee.deleteMany({});
    await VehicleLog.deleteMany({});

    // Create sample employees
    const employees = [
      {
        employeeId: 'EMP0001',
        name: 'John Driver',
        phone: '0771234567',
        email: 'john@akr.com',
        position: 'Driver',
        department: 'Construction',
        duties: ['Driving', 'Loading', 'Unloading'],
        assignedVehicles: ['1J0611', 'ABC123'],
        salary: 45000,
        status: 'active',
        address: 'Main Street, Murunkan',
        emergencyContact: {
          name: 'Mary Driver',
          phone: '0771234568',
          relationship: 'Wife'
        }
      },
      {
        employeeId: 'EMP0002',
        name: 'Mike Supervisor',
        phone: '0771234569',
        email: 'mike@akr.com',
        position: 'Supervisor',
        department: 'Construction',
        duties: ['Supervision', 'Safety Management'],
        assignedVehicles: ['1J0611', 'XYZ789'],
        salary: 60000,
        status: 'active',
        address: 'Second Street, Murunkan',
        emergencyContact: {
          name: 'Sarah Supervisor',
          phone: '0771234570',
          relationship: 'Sister'
        }
      },
      {
        employeeId: 'EMP0003',
        name: 'David Worker',
        phone: '0771234571',
        email: 'david@akr.com',
        position: 'Worker',
        department: 'Construction',
        duties: ['Construction', 'Material Handling'],
        assignedVehicles: ['ABC123'],
        salary: 35000,
        status: 'active',
        address: 'Third Street, Murunkan',
        emergencyContact: {
          name: 'Lisa Worker',
          phone: '0771234572',
          relationship: 'Mother'
        }
      }
    ];

    const createdEmployees = await Employee.insertMany(employees);
    console.log('Created employees:', createdEmployees.length);

    // Create sample vehicle logs
    const vehicleLogs = [
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-01-15'),
        startMeter: 1000,
        startPlace: 'Murunkan',
        endMeter: 1500,
        endPlace: 'Mannar',
        workingKm: 500,
        description: 'Transport construction materials',
        duties: ['Driving', 'Loading'],
        payments: {
          credit: '0',
          cash: 5000,
          total: 5000
        },
        fuel: {
          liters: 50,
          startMeter: 1000,
          endMeter: 1500,
          totalKm: 500
        },
        expenses: [
          { description: 'Fuel', amount: 2500 },
          { description: 'Toll', amount: 500 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: '1J0611',
        employeeId: 'EMP0001',
        employeeName: 'John Driver',
        date: new Date('2024-01-16'),
        startMeter: 1500,
        startPlace: 'Mannar',
        endMeter: 2000,
        endPlace: 'Jaffna',
        workingKm: 500,
        description: 'Deliver materials to construction site',
        duties: ['Driving', 'Unloading'],
        payments: {
          credit: '0',
          cash: 6000,
          total: 6000
        },
        fuel: {
          liters: 60,
          startMeter: 1500,
          endMeter: 2000,
          totalKm: 500
        },
        expenses: [
          { description: 'Fuel', amount: 3000 },
          { description: 'Maintenance', amount: 1000 }
        ],
        driverSignature: 'John Driver',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      },
      {
        vehicleNumber: 'ABC123',
        employeeId: 'EMP0003',
        employeeName: 'David Worker',
        date: new Date('2024-01-15'),
        startMeter: 500,
        startPlace: 'Murunkan',
        endMeter: 800,
        endPlace: 'Local Site',
        workingKm: 300,
        description: 'Local construction work',
        duties: ['Construction', 'Material Handling'],
        payments: {
          credit: '0',
          cash: 3000,
          total: 3000
        },
        fuel: {
          liters: 30,
          startMeter: 500,
          endMeter: 800,
          totalKm: 300
        },
        expenses: [
          { description: 'Fuel', amount: 1500 },
          { description: 'Tools', amount: 500 }
        ],
        driverSignature: 'David Worker',
        supervisorSignature: 'Mike Supervisor',
        status: 'approved'
      }
    ];

    const createdLogs = await VehicleLog.insertMany(vehicleLogs);
    console.log('Created vehicle logs:', createdLogs.length);

    console.log('Sample data seeded successfully!');
    console.log('Employees:', employees.length);
    console.log('Vehicle Logs:', vehicleLogs.length);

  } catch (error) {
    console.error('Error seeding sample data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedSampleData(); 