const Room = require('../models/Room');

// List all rooms
exports.listRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms.' });
  }
};

// Get room details
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found.' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room.' });
  }
};

// Add a new room
exports.addRoom = async (req, res) => {
  console.log('Add Room request body:', req.body);
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    console.error('Room add error:', err);
    res.status(400).json({ error: err.message || 'Failed to add room.' });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.roomId, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ error: 'Room not found.' });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update room.' });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found.' });
    res.json({ message: 'Room deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete room.' });
  }
}; 