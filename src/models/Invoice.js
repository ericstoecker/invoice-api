const mongoose = require('mongoose');


const Invoice = mongoose.model('invoice', {
    invoiceNo: String,
    customerNo: String,
    carId: String,
    invoiceDate: String,
    wage1: String,
    amount1: String,
    price1: String,
    wage2: String,
    amount2: String,
    price2: String,
    totalNetto: String,
    totalBrutto: String,
    positions: Array,
    receptionDay: String,
    kmStatus: String,
    tuev: String,
    exhaustInvestigation: String,
    //status: String,
    VAT: Number
});

module.exports = Invoice;