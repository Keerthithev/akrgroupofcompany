const Customer = require('../models/Customer');

// List customers: flatten purchases for frontend
exports.listCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().populate('purchases.vehicle');
    // Flatten for frontend: one row per purchase
    const rows = customers.flatMap(c =>
      (c.purchases && c.purchases.length > 0)
        ? c.purchases.map(p => ({
            _id: c._id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            address: c.address,
            ...p
          }))
        : [{ _id: c._id, name: c.name, email: c.email, phone: c.phone, address: c.address }]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Add a new endpoint to return raw customer objects (with all purchases)
exports.listCustomersRaw = async (req, res, next) => {
  try {
    const customers = await Customer.find().populate('purchases.vehicle');
    res.json(customers);
  } catch (err) {
    next(err);
  }
};

// Add or update customer
exports.addCustomer = async (req, res, next) => {
  try {
    const { name, email, ...purchase } = req.body;
    let customer = await Customer.findOne({ name, email });
    if (customer) {
      customer.purchases.push(purchase);
      await customer.save();
      res.status(201).json(customer);
    } else {
      customer = new Customer({ name, email, purchases: [purchase] });
      if (req.body.phone) customer.phone = req.body.phone;
      if (req.body.address) customer.address = req.body.address;
      await customer.save();
      res.status(201).json(customer);
    }
  } catch (err) {
    next(err);
  }
};

// Update and delete remain unchanged
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
}; 