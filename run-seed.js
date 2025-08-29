const { execSync } = require('child_process');

console.log('Starting to seed customers and items...');

try {
  // Run the seeding script
  execSync('node backend/scripts/seedCustomersAndItems.js', { stdio: 'inherit' });
  console.log('✅ Customers and items seeded successfully!');
  
  console.log('\nUpdating vehicle logs with customer information...');
  execSync('node backend/scripts/updateVehicleLogsWithCustomers.js', { stdio: 'inherit' });
  console.log('✅ Vehicle logs updated with customer information!');
  
  console.log('\n🎉 All seeding and updates completed successfully!');
  console.log('\nNow you can:');
  console.log('1. View the dashboard to see customer credit information');
  console.log('2. Check that "keerthigan" shows delivery employee information');
  console.log('3. Use the credit management system');
  
} catch (error) {
  console.error('❌ Error during seeding/updating:', error.message);
}
