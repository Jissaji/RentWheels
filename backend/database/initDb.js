const { initDatabase, getDatabaseType, query } = require('../config/db');

async function main() {
  console.log('🚀 Running Car Rental Database Initializer...');
  try {
    const result = await initDatabase();
    console.log(`🎉 Database initialization completed successfully on engine: ${result.type.toUpperCase()}`);
    
    // Print table summaries
    const usersCount = await query('SELECT COUNT(*) as count FROM users');
    const carsCount = await query('SELECT COUNT(*) as count FROM cars');
    const bookingsCount = await query('SELECT COUNT(*) as count FROM bookings');
    const paymentsCount = await query('SELECT COUNT(*) as count FROM payments');
    const maintenanceCount = await query('SELECT COUNT(*) as count FROM maintenance');

    console.log('----------------------------------------------------');
    console.log(`📊 Current Database Stats:`);
    console.log(`   Users:       ${usersCount.rows[0].count}`);
    console.log(`   Cars:        ${carsCount.rows[0].count}`);
    console.log(`   Bookings:    ${bookingsCount.rows[0].count}`);
    console.log(`   Payments:    ${paymentsCount.rows[0].count}`);
    console.log(`   Maintenance: ${maintenanceCount.rows[0].count}`);
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

main();
