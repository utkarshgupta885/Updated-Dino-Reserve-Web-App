const express = require('express');
const {
  getRestaurantStatus,
  getRestaurants,
  getTables,
  createReservation,
  feedDino,
  getReservations,
  updateReservation,
  deleteReservation
} = require('../controllers/unified.controller');

const router = express.Router();

// Restaurant routes
router.get('/restaurants', getRestaurants);
router.get('/restaurants/:id/status', getRestaurantStatus);

// Table routes
router.get('/tables', getTables);

// Reservation routes
router.post('/reservations', createReservation);
router.post('/feed', feedDino);
router.get('/reservations', getReservations);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', deleteReservation);

module.exports = router;

