const mongoose = require('mongoose');
const VehicleLog = require('./backend/models/VehicleLog');
const Customer = require('./backend/models/Customer');

async function testDataStructure() {
  try {
    await mongoose.connect('mongodb://localhost:27017/akr-construction', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');

    // Check customers
    console.log('=== CUSTOMERS ===');
    const customers = await Customer.find({});
    customers.forEach(customer => {
      console.log(`- ${customer.name} (${customer.phone}) - Status: ${customer.status}`);
    });

    // Check vehicle logs
    console.log('\n=== VEHICLE LOGS ===');
    const vehicleLogs = await VehicleLog.find({});
    console.log(`Total vehicle logs: ${vehicleLogs.length}`);
    
    if (vehicleLogs.length > 0) {
      console.log('\nSample vehicle log:');
      const sampleLog = vehicleLogs[0];
      console.log(`- Customer: ${sampleLog.customerName || 'NOT SET'}`);
      console.log(`- Phone: ${sampleLog.customerPhone || 'NOT SET'}`);
      console.log(`- Employee: ${sampleLog.employeeName || 'NOT SET'} (${sampleLog.employeeId || 'NOT SET'})`);
      console.log(`- Credit: Rs. ${sampleLog.payments?.credit || 'NOT SET'}`);
      console.log(`- Items: ${sampleLog.itemsLoading?.join(', ') || 'NOT SET'}`);
    }

    // Check for keerthigan specifically
    console.log('\n=== KEERTHIGAN CHECK ===');
    const keerthiganLogs = await VehicleLog.find({ customerName: 'keerthigan' });
    console.log(`Logs for keerthigan: ${keerthiganLogs.length}`);
    
    if (keerthiganLogs.length > 0) {
      keerthiganLogs.forEach((log, index) => {
        console.log(`\nLog ${index + 1}:`);
        console.log(`- Customer: ${log.customerName}`);
        console.log(`- Phone: ${log.customerPhone}`);
        console.log(`- Employee: ${log.employeeName} (${log.employeeId})`);
        console.log(`- Credit: Rs. ${log.payments?.credit}`);
        console.log(`- Items: ${log.itemsLoading?.join(', ')}`);
      });
    } else {
      console.log('❌ No vehicle logs found for keerthigan');
    }

    // Check credit overview logic
    console.log('\n=== CREDIT OVERVIEW LOGIC ===');
    const creditLogs = await VehicleLog.find({ 'payments.credit': { $gt: 0 } });
    console.log(`Logs with credit > 0: ${creditLogs.length}`);
    
    creditLogs.forEach((log, index) => {
      console.log(`\nCredit Log ${index + 1}:`);
      console.log(`- Customer: ${log.customerName || 'NOT SET'}`);
      console.log(`- Employee: ${log.employeeName || 'NOT SET'}`);
      console.log(`- Credit Amount: Rs. ${log.payments?.credit || 0}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

testDataStructure();
