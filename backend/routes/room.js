const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// List all rooms
router.get('/', roomController.listRooms);
// Get room details
router.get('/:roomId', roomController.getRoom);
// Add a new room
router.post('/', roomController.addRoom);
// Update room
router.patch('/:roomId', roomController.updateRoom);
// Delete room
router.delete('/:roomId', roomController.deleteRoom);

module.exports = router; 