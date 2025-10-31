const { dbService } = require('../database');

// Get restaurant status with live counts
const getRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        error: 'Restaurant ID is required',
        message: 'Please provide a valid restaurant ID'
      });
    }

    const result = await dbService.getRestaurantStatus(id);
    
    res.json({
      message: 'Restaurant status retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get restaurant status error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to retrieve restaurant status'
    });
  }
};

// Get all restaurants with counts
const getRestaurants = async (req, res) => {
  try {
    const restaurants = [];
    
    // Get all restaurants and their status
    for (let i = 1; i <= 5; i++) {
      try {
        const result = await dbService.getRestaurantStatus(i);
        restaurants.push({
          ...result.restaurant,
          counts: result.counts
        });
      } catch (error) {
        console.error(`Error getting status for restaurant ${i}:`, error);
      }
    }

    res.json({
      message: 'Restaurants retrieved successfully',
      data: restaurants
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve restaurants'
    });
  }
};

// Get tables for a restaurant
const getTables = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({ 
        error: 'Restaurant ID is required',
        message: 'Please provide a restaurant ID'
      });
    }

    const result = await dbService.getRestaurantStatus(restaurantId);
    
    res.json({
      message: 'Tables retrieved successfully',
      data: {
        restaurant: result.restaurant,
        tables: result.tables,
        counts: result.counts
      }
    });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to retrieve tables'
    });
  }
};

// Create reservation with transaction
const createReservation = async (req, res) => {
  try {
    const { tableId, customerName, customerPhone, partySize, reservationTime } = req.body;

    // Validate input
    if (!tableId || !customerName || !customerPhone || !partySize || !reservationTime) {
      return res.status(400).json({ 
        error: 'All fields are required',
        message: 'Please provide tableId, customerName, customerPhone, partySize, and reservationTime'
      });
    }

    // Validate party size
    if (partySize < 1 || partySize > 20) {
      return res.status(400).json({ 
        error: 'Invalid party size',
        message: 'Party size must be between 1 and 20'
      });
    }

    const result = await dbService.createReservation({
      tableId,
      customerName,
      customerPhone,
      partySize,
      reservationTime
    });

    res.status(201).json({
      message: 'Reservation created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    
    if (error.message === 'Table not found') {
      return res.status(404).json({ 
        error: 'Table not found',
        message: 'The specified table does not exist'
      });
    }
    
    if (error.message === 'Table is already reserved') {
      return res.status(400).json({ 
        error: 'Table unavailable',
        message: 'This table is already reserved'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to create reservation'
    });
  }
};

// Get all reservations
const getReservations = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    // This would need to be implemented in the database service
    // For now, return a placeholder response
    res.json({
      message: 'Reservations retrieved successfully',
      data: []
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve reservations'
    });
  }
};

// Update reservation status
const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Valid status is required',
        message: 'Status must be one of: pending, confirmed, completed, cancelled'
      });
    }

    const result = await dbService.updateReservationStatus(id, status);

    res.json({
      message: 'Reservation updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update reservation error:', error);
    
    if (error.message === 'Reservation not found') {
      return res.status(404).json({ 
        error: 'Reservation not found',
        message: 'The specified reservation does not exist'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to update reservation'
    });
  }
};

// Delete reservation
const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // Update status to cancelled (which will free the table)
    const result = await dbService.updateReservationStatus(id, 'cancelled');

    res.json({
      message: 'Reservation deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete reservation error:', error);
    
    if (error.message === 'Reservation not found') {
      return res.status(404).json({ 
        error: 'Reservation not found',
        message: 'The specified reservation does not exist'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to delete reservation'
    });
  }
};

module.exports = {
  getRestaurantStatus,
  getRestaurants,
  getTables,
  createReservation,
  // Quick action for "Feed Dino" button
  feedDino: async (req, res) => {
    try {
      const { tableId, partySize } = req.body;

      if (!tableId) {
        return res.status(400).json({
          error: 'tableId is required',
          message: 'Please provide a valid tableId'
        });
      }

      const nowIso = new Date().toISOString();

      const result = await dbService.createReservation({
        tableId,
        customerName: 'Walk-in Guest',
        customerPhone: 'N/A',
        partySize: partySize || 1,
        reservationTime: nowIso
      });

      return res.status(201).json({
        message: 'Dino feeding started and reservation created',
        data: result
      });
    } catch (error) {
      console.error('Feed dino error:', error);

      if (error.message === 'Table not found') {
        return res.status(404).json({
          error: 'Table not found',
          message: 'The specified table does not exist'
        });
      }

      if (error.message === 'Table is already reserved') {
        return res.status(400).json({
          error: 'Table unavailable',
          message: 'This table is already reserved'
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Failed to start dino feeding'
      });
    }
  },
  getReservations,
  updateReservation,
  deleteReservation
};
