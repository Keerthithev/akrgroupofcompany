const Vehicle = require('../models/Vehicle.cjs');
const Company = require('../models/Company.cjs');

// List all vehicles for a company
exports.listVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ company: req.params.companyId });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
};

// Add a vehicle to a company
exports.addVehicle = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Validate colors
    if (req.body.colors) {
      if (!Array.isArray(req.body.colors)) {
        return res.status(400).json({ message: 'Colors must be an array' });
      }
      for (const color of req.body.colors) {
        if (!color.name || !color.hex || !Array.isArray(color.images) || color.images.length === 0 || !color.images.every(img => typeof img === 'string')) {
          return res.status(400).json({ message: 'Each color must have name, hex, and images (array of strings, at least one)' });
        }
      }
    }
    // Validate rating
    if (req.body.rating && typeof req.body.rating !== 'number') {
      return res.status(400).json({ message: 'Rating must be a number' });
    }

    const vehicle = new Vehicle({ ...req.body, company: company._id });
    await vehicle.save();
    company.vehicles.push(vehicle._id);
    await company.save();
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
};

// Get vehicle details
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// Update vehicle details
exports.updateVehicle = async (req, res, next) => {
  try {
    // Validate colors
    if (req.body.colors) {
      if (!Array.isArray(req.body.colors)) {
        return res.status(400).json({ message: 'Colors must be an array' });
      }
      for (const color of req.body.colors) {
        if (!color.name || !color.hex || !Array.isArray(color.images) || color.images.length === 0 || !color.images.every(img => typeof img === 'string')) {
          return res.status(400).json({ message: 'Each color must have name, hex, and images (array of strings, at least one)' });
        }
      }
    }
    // Validate rating
    if (req.body.rating && typeof req.body.rating !== 'number') {
      return res.status(400).json({ message: 'Rating must be a number' });
    }
    // If specs is an array, convert to object
    if (Array.isArray(req.body.specs)) {
      const specsObj = {};
      req.body.specs.forEach(s => {
        if (s.key && s.value) specsObj[s.key] = s.value;
      });
      req.body.specs = specsObj;
    }
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.vehicleId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    // Remove vehicle reference from company
    await Company.updateOne(
      { _id: vehicle.company },
      { $pull: { vehicles: vehicle._id } }
    );
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    next(err);
  }
}; 