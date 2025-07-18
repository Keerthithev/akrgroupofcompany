const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.listCustomers);
router.post('/', customerController.addCustomer);
router.patch('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.get('/raw', customerController.listCustomersRaw);

module.exports = router; 