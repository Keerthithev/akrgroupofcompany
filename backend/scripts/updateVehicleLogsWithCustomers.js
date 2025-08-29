const mongoose = require('mongoose');
const VehicleLog = require('../models/VehicleLog');
const Customer = require('../models/Customer');
require('dotenv').config();

async function updateVehicleLogsWithCustomers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/akr-construction', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get existing customers
    const customers = await Customer.find({ status: 'active' });
    console.log('Found customers:', customers.map(c => ({ name: c.name, phone: c.phone })));

    if (customers.length === 0) {
      console.log('No customers found. Please run seedCustomersAndItems.js first.');
      return;
    }

    // Get existing vehicle logs
    const vehicleLogs = await VehicleLog.find({});
    console.log(`Found ${vehicleLogs.length} vehicle logs`);

    if (vehicleLogs.length === 0) {
      console.log('No vehicle logs found. Please run seedExtendedData.js first.');
      return;
    }

    // Update vehicle logs with customer information
    let updatedCount = 0;
    for (let i = 0; i < vehicleLogs.length; i++) {
      const log = vehicleLogs[i];
      
      // Skip if already has customer info
      if (log.customerName) {
        console.log(`Log ${i + 1} already has customer: ${log.customerName}`);
        continue;
      }

      // Assign customer based on index (round-robin)
      const customerIndex = i % customers.length;
      const customer = customers[customerIndex];
      
      // Update the vehicle log
      await VehicleLog.findByIdAndUpdate(log._id, {
        customerName: customer.name,
        customerPhone: customer.phone,
        deliveryAddress: customer.address || 'Address not specified',
        itemsLoading: ['Sand', 'Salli (Gravel)'], // Sample items
        'payments.credit': customer.name === 'keerthigan' ? 15000 : 5000, // Sample credit amounts
        'payments.cash': 0,
        'payments.total': customer.name === 'keerthigan' ? 15000 : 5000,
        'payments.paymentMethod': 'credit',
        'payments.creditStatus': 'pending',
        'payments.creditPaidAmount': 0, // No payments made yet
        'payments.creditRemaining': customer.name === 'keerthigan' ? 15000 : 5000
      });

      console.log(`Updated log ${i + 1} with customer: ${customer.name}`);
      updatedCount++;
    }

    console.log(`\n✅ Successfully updated ${updatedCount} vehicle logs with customer information`);
    
    // Verify the updates
    const updatedLogs = await VehicleLog.find({ customerName: { $exists: true } });
    console.log(`\nVerification: ${updatedLogs.length} logs now have customer information`);
    
    // Show sample updated log
    if (updatedLogs.length > 0) {
      const sampleLog = updatedLogs[0];
      console.log('\nSample updated log:');
      console.log(`- Customer: ${sampleLog.customerName}`);
      console.log(`- Phone: ${sampleLog.customerPhone}`);
      console.log(`- Credit: Rs. ${sampleLog.payments.credit}`);
      console.log(`- Employee: ${sampleLog.employeeName} (${sampleLog.employeeId})`);
    }

  } catch (error) {
    console.error('Error updating vehicle logs:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

updateVehicleLogsWithCustomers();
