const mongoose = require('mongoose');



const Customer = mongoose.model('customer', {
    customerNo: String,
    salutation: String,
    name: String,
    street: String,
    town: String,
    zip: String,
    isActive: Boolean,
    invoices: Array
});

module.exports = Customer;