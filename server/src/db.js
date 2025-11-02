const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || 'Bond@007',
  database: 'dino_reserve',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
};

// Initialize database tables if they don't exist
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create managers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS managers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create restaurants table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        dino_icon VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tables table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        number INT NOT NULL,
        is_reserved BOOLEAN DEFAULT FALSE,
        restaurant_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    // Create reservations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        party_size INT NOT NULL,
        reservation_time DATETIME NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        table_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
      )
    `);

    // Seed restaurants if empty
    const [restaurants] = await connection.execute('SELECT COUNT(*) as count FROM restaurants');
    if (restaurants[0].count === 0) {
      const dinoIcons = ['trex', 'stego', 'trike', 'brachio', 'raptor'];
      for (let i = 0; i < 5; i++) {
        await connection.execute(
          'INSERT INTO restaurants (name, dino_icon) VALUES (?, ?)',
          [`Dino Diner #${i + 1}`, dinoIcons[i]]
        );
      }
    }

    // Seed tables if empty
    const [tables] = await connection.execute('SELECT COUNT(*) as count FROM tables');
    if (tables[0].count === 0) {
      for (let restaurantId = 1; restaurantId <= 5; restaurantId++) {
        for (let tableNumber = 1; tableNumber <= 25; tableNumber++) {
          await connection.execute(
            'INSERT INTO tables (number, restaurant_id) VALUES (?, ?)',
            [tableNumber, restaurantId]
          );
        }
      }
    }

    connection.release();
    console.log('✅ Database tables initialized and seeded');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
