const express = require('express');
const {
  getRestaurants,
  getTables,
  createReservation,
  getReservations,
  updateReservation,
  deleteReservation
} = require('../controllers/reservation.controller');

const router = express.Router();

// GET /api/restaurants
router.get('/restaurants', getRestaurants);

// GET /api/tables?restaurantId=1
router.get('/tables', getTables);

// POST /api/reservations
router.post('/reservations', createReservation);

// GET /api/reservations?restaurantId=1
router.get('/reservations', getReservations);

// PUT /api/reservations/:id
router.put('/reservations/:id', updateReservation);

// DELETE /api/reservations/:id
router.delete('/reservations/:id', deleteReservation);

module.exports = router;
