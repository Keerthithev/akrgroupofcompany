const mongoose = require('mongoose');

const ConstructionAdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['construction_admin'], default: 'construction_admin' },
  companyName: { type: String, default: 'A.K.R & SON\'S Construction & Suppliers' },
  address: { type: String, default: 'Main Street, Murunkan, Mannar.' },
  phoneNumbers: { type: String, default: '024 222 6899/077 311 1266/077 364 6999' }
});

module.exports = mongoose.model('ConstructionAdmin', ConstructionAdminSchema); 