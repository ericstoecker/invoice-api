const Invoice = require('../models/Invoice');


//generates a new invoiceNo
async function invoiceNumber() {
    //array of all existing invoice numbers
    let numbers = [];
    
    //creates an array of all invoices
    const invoices = await Invoice.find();

    //iterates through invoices to select all invoice numbers
    invoices.map(invoice => numbers.push(Number(invoice.invoiceNo)));

    //adds one to the biggest existing number
    numbers = numbers.filter(num => num >= 0)
    const invoiceNumber = Math.max.apply(null, numbers) + 1;
    return invoiceNumber;
}

module.exports = invoiceNumber;
