const { pool } = require('../db');

// Get all restaurants
const getRestaurants = async (req, res) => {
  try {
    const [restaurants] = await pool.execute(
      'SELECT id, name, dino_icon FROM restaurants ORDER BY id'
    );
    res.json(restaurants);
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all tables for a restaurant
const getTables = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const [tables] = await pool.execute(
      `SELECT t.id, t.number, t.is_reserved, t.restaurant_id, 
              r.name as restaurant_name, r.dino_icon
       FROM tables t 
       JOIN restaurants r ON t.restaurant_id = r.id 
       WHERE t.restaurant_id = ? 
       ORDER BY t.number`,
      [restaurantId]
    );

    res.json(tables);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new reservation
const createReservation = async (req, res) => {
  try {
    const { tableId, customerName, customerPhone, partySize, reservationTime } = req.body;

    // Validate input
    if (!tableId || !customerName || !customerPhone || !partySize || !reservationTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if table exists and is available
    const [tables] = await pool.execute(
      'SELECT id, is_reserved FROM tables WHERE id = ?',
      [tableId]
    );

    if (tables.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (tables[0].is_reserved) {
      return res.status(400).json({ error: 'Table is already reserved' });
    }

    // Create reservation
    const [result] = await pool.execute(
      'INSERT INTO reservations (customer_name, customer_phone, party_size, reservation_time, table_id) VALUES (?, ?, ?, ?, ?)',
      [customerName, customerPhone, partySize, reservationTime, tableId]
    );

    // Mark table as reserved
    await pool.execute(
      'UPDATE tables SET is_reserved = TRUE WHERE id = ?',
      [tableId]
    );

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: {
        id: result.insertId,
        customerName,
        customerPhone,
        partySize,
        reservationTime,
        tableId,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all reservations
const getReservations = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    let query = `
      SELECT r.id, r.customer_name, r.customer_phone, r.party_size, 
             r.reservation_time, r.status, r.created_at,
             t.number as table_number, t.restaurant_id,
             rest.name as restaurant_name
      FROM reservations r
      JOIN tables t ON r.table_id = t.id
      JOIN restaurants rest ON t.restaurant_id = rest.id
    `;
    
    const params = [];
    if (restaurantId) {
      query += ' WHERE t.restaurant_id = ?';
      params.push(restaurantId);
    }
    
    query += ' ORDER BY r.reservation_time DESC';

    const [reservations] = await pool.execute(query, params);
    res.json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update reservation status
const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    // Get current reservation
    const [reservations] = await pool.execute(
      'SELECT id, table_id FROM reservations WHERE id = ?',
      [id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservations[0];

    // Update reservation status
    await pool.execute(
      'UPDATE reservations SET status = ? WHERE id = ?',
      [status, id]
    );

    // If completed or cancelled, free the table
    if (status === 'completed' || status === 'cancelled') {
      await pool.execute(
        'UPDATE tables SET is_reserved = FALSE WHERE id = ?',
        [reservation.table_id]
      );
    }

    res.json({
      message: 'Reservation updated successfully',
      reservation: { id, status }
    });
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete reservation
const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // Get reservation to find table_id
    const [reservations] = await pool.execute(
      'SELECT id, table_id FROM reservations WHERE id = ?',
      [id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservations[0];

    // Delete reservation
    await pool.execute('DELETE FROM reservations WHERE id = ?', [id]);

    // Free the table
    await pool.execute(
      'UPDATE tables SET is_reserved = FALSE WHERE id = ?',
      [reservation.table_id]
    );

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getRestaurants,
  getTables,
  createReservation,
  getReservations,
  updateReservation,
  deleteReservation
};
