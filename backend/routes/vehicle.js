const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// List all vehicles for a company
router.get('/company/:companyId', vehicleController.listVehicles);
// Add a vehicle to a company
router.post('/company/:companyId', vehicleController.addVehicle);
// Get vehicle details
router.get('/:vehicleId', vehicleController.getVehicle);
// Add this route for updating a vehicle
router.patch('/:vehicleId', vehicleController.updateVehicle);
// Add this route for deleting a vehicle
router.delete('/:vehicleId', vehicleController.deleteVehicle);

module.exports = router; 