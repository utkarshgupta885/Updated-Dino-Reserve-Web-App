const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');

// Database configuration
const USE_PRISMA = process.env.USE_PRISMA === 'true';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'dino_reserve'
};

// MySQL connection pool
const pool = mysql.createPool({
  ...DB_CONFIG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Prisma client
let prisma = null;
if (USE_PRISMA) {
  prisma = new PrismaClient();
}

// Unified database interface
class DatabaseService {
  constructor() {
    this.usePrisma = USE_PRISMA;
    this.pool = pool;
    this.prisma = prisma;
  }

  // Get restaurant with live table counts
  async getRestaurantStatus(restaurantId) {
    if (this.usePrisma) {
      return await this.getRestaurantStatusPrisma(restaurantId);
    } else {
      return await this.getRestaurantStatusMySQL(restaurantId);
    }
  }

  async getRestaurantStatusMySQL(restaurantId) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get restaurant info
      const [restaurants] = await connection.execute(
        'SELECT id, name, dinoIcon FROM restaurants WHERE id = ?',
        [restaurantId]
      );

      if (restaurants.length === 0) {
        throw new Error('Restaurant not found');
      }

      // Get table counts
      const [counts] = await connection.execute(`
        SELECT 
          COUNT(*) as total_tables,
          SUM(CASE WHEN isReserved = 0 THEN 1 ELSE 0 END) as available_tables,
          SUM(CASE WHEN isReserved = 1 THEN 1 ELSE 0 END) as feeding_tables
        FROM tables 
        WHERE restaurantId = ?
      `, [restaurantId]);

      // Get all tables with reservation info
      const [tables] = await connection.execute(`
        SELECT 
          t.id, t.number, t.isReserved, t.restaurantId,
          r.customerName, r.customerPhone, r.partySize, 
          r.reservationTime, r.status
        FROM tables t
        LEFT JOIN reservations r ON t.id = r.tableId AND r.status IN ('pending', 'confirmed')
        WHERE t.restaurantId = ?
        ORDER BY t.number
      `, [restaurantId]);

      await connection.commit();

      return {
        restaurant: restaurants[0],
        counts: counts[0],
        tables: tables
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getRestaurantStatusPrisma(restaurantId) {
    return await this.prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.findUnique({
        where: { id: parseInt(restaurantId) },
        include: {
          tables: {
            include: {
              reservations: {
                where: {
                  status: { in: ['pending', 'confirmed'] }
                }
              }
            },
            orderBy: { number: 'asc' }
          }
        }
      });

      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const totalTables = restaurant.tables.length;
      const availableTables = restaurant.tables.filter(t => !t.isReserved).length;
      const feedingTables = restaurant.tables.filter(t => t.isReserved).length;

      return {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          dinoIcon: restaurant.dinoIcon
        },
        counts: {
          total_tables: totalTables,
          available_tables: availableTables,
          feeding_tables: feedingTables
        },
        tables: restaurant.tables.map(table => ({
          id: table.id,
          number: table.number,
          is_reserved: table.isReserved,
          restaurant_id: table.restaurantId,
          customer_name: table.reservations[0]?.customerName || null,
          customer_phone: table.reservations[0]?.customerPhone || null,
          party_size: table.reservations[0]?.partySize || null,
          reservation_time: table.reservations[0]?.reservationTime || null,
          status: table.reservations[0]?.status || null
        }))
      };
    });
  }

  // Create reservation with transaction
  async createReservation(data) {
    if (this.usePrisma) {
      return await this.createReservationPrisma(data);
    } else {
      return await this.createReservationMySQL(data);
    }
  }

  async createReservationMySQL(data) {
    const { tableId, customerName, customerPhone, partySize, reservationTime } = data;
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if table exists and is available
      const [tables] = await connection.execute(
        'SELECT id, restaurantId, isReserved FROM tables WHERE id = ?',
        [tableId]
      );

      if (tables.length === 0) {
        throw new Error('Table not found');
      }

      if (tables[0].isReserved) {
        throw new Error('Table is already reserved');
      }

      // Create reservation
      const [result] = await connection.execute(
        'INSERT INTO reservations (customerName, customerPhone, partySize, reservationTime, tableId, status) VALUES (?, ?, ?, ?, ?, ?)',
        [customerName, customerPhone, partySize, reservationTime, tableId, 'pending']
      );

      // Mark table as reserved
      await connection.execute(
        'UPDATE tables SET isReserved = TRUE WHERE id = ?',
        [tableId]
      );

      // Get updated restaurant status
      const restaurantStatus = await this.getRestaurantStatusMySQL(tables[0].restaurantId);

      await connection.commit();

      return {
        reservation: {
          id: result.insertId,
          customerName,
          customerPhone,
          partySize,
          reservationTime,
          tableId,
          status: 'pending'
        },
        restaurantStatus
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async createReservationPrisma(data) {
    const { tableId, customerName, customerPhone, partySize, reservationTime } = data;
    
    return await this.prisma.$transaction(async (tx) => {
      // Check if table exists and is available
      const table = await tx.table.findUnique({
        where: { id: parseInt(tableId) },
        include: { restaurant: true }
      });

      if (!table) {
        throw new Error('Table not found');
      }

      if (table.isReserved) {
        throw new Error('Table is already reserved');
      }

      // Create reservation and update table in one transaction
      const reservation = await tx.reservation.create({
        data: {
          customerName,
          customerPhone,
          partySize: parseInt(partySize),
          reservationTime: new Date(reservationTime),
          tableId: parseInt(tableId),
          status: 'pending'
        }
      });

      await tx.table.update({
        where: { id: parseInt(tableId) },
        data: { isReserved: true }
      });

      // Get updated restaurant status
      const restaurantStatus = await this.getRestaurantStatusPrisma(table.restaurantId);

      return {
        reservation: {
          id: reservation.id,
          customerName: reservation.customerName,
          customerPhone: reservation.customerPhone,
          partySize: reservation.partySize,
          reservationTime: reservation.reservationTime,
          tableId: reservation.tableId,
          status: reservation.status
        },
        restaurantStatus
      };
    });
  }

  // Update reservation status
  async updateReservationStatus(reservationId, status) {
    if (this.usePrisma) {
      return await this.updateReservationStatusPrisma(reservationId, status);
    } else {
      return await this.updateReservationStatusMySQL(reservationId, status);
    }
  }

  async updateReservationStatusMySQL(reservationId, status) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get reservation with table info
      const [reservations] = await connection.execute(`
        SELECT r.id, r.tableId, r.status, t.restaurantId
        FROM reservations r
        JOIN tables t ON r.tableId = t.id
        WHERE r.id = ?
      `, [reservationId]);

      if (reservations.length === 0) {
        throw new Error('Reservation not found');
      }

      const reservation = reservations[0];

      // Update reservation status
      await connection.execute(
        'UPDATE reservations SET status = ? WHERE id = ?',
        [status, reservationId]
      );

      // If completed or cancelled, free the table
      if (status === 'completed' || status === 'cancelled') {
        await connection.execute(
          'UPDATE tables SET isReserved = FALSE WHERE id = ?',
          [reservation.tableId]
        );
      }

      // Get updated restaurant status
      const restaurantStatus = await this.getRestaurantStatusMySQL(reservation.restaurantId);

      await connection.commit();

      return {
        reservation: { id: reservationId, status },
        restaurantStatus
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateReservationStatusPrisma(reservationId, status) {
    return await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: parseInt(reservationId) },
        include: { table: { include: { restaurant: true } } }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // Update reservation status
      await tx.reservation.update({
        where: { id: parseInt(reservationId) },
        data: { status }
      });

      // If completed or cancelled, free the table
      if (status === 'completed' || status === 'cancelled') {
        await tx.table.update({
          where: { id: reservation.tableId },
          data: { isReserved: false }
        });
      }

      // Get updated restaurant status
      const restaurantStatus = await this.getRestaurantStatusPrisma(reservation.table.restaurantId);

      return {
        reservation: { id: reservationId, status },
        restaurantStatus
      };
    });
  }

  // Test connection
  async testConnection() {
    try {
      if (this.usePrisma) {
        await this.prisma.$queryRaw`SELECT 1`;
        console.log('✅ Prisma database connected successfully');
      } else {
        const connection = await this.pool.getConnection();
        console.log('✅ MySQL database connected successfully');
        connection.release();
      }
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  // Initialize database
  async initializeDatabase() {
    if (this.usePrisma) {
      console.log('✅ Prisma database initialized');
      return;
    }

    try {
      const connection = await this.pool.getConnection();
      
      // Create tables if they don't exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS managers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS restaurants (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          dinoIcon VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS tables (
          id INT AUTO_INCREMENT PRIMARY KEY,
          number INT NOT NULL,
          isReserved BOOLEAN DEFAULT FALSE,
          restaurantId INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE
        )
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS reservations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          customerName VARCHAR(100) NOT NULL,
          customerPhone VARCHAR(20) NOT NULL,
          partySize INT NOT NULL,
          reservationTime DATETIME NOT NULL,
          status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
          tableId INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (tableId) REFERENCES tables(id) ON DELETE CASCADE
        )
      `);

      // Seed restaurants if empty
      const [restaurants] = await connection.execute('SELECT COUNT(*) as count FROM restaurants');
      if (restaurants[0].count === 0) {
        const dinoIcons = ['trex', 'stego', 'trike', 'brachio', 'raptor'];
        for (let i = 0; i < 5; i++) {
          await connection.execute(
            'INSERT INTO restaurants (name, dinoIcon) VALUES (?, ?)',
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
              'INSERT INTO tables (number, restaurantId) VALUES (?, ?)',
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
  }
}

// Create singleton instance
const dbService = new DatabaseService();

module.exports = {
  dbService,
  pool,
  prisma
};
