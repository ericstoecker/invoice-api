const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

const fs = require('fs');

module.exports = {
    //reads properties file and returns it
    readProperties: function() {
        const propertiesFileName = "properties.json"
        const properties = require(`../../${propertiesFileName}`);

        return properties;
    },

    readCsv: function(csvFileName, alphabet) {
        if(!alphabet) alphabet = 'utf-8';

        const path = `../csv_data/${csvFileName}.csv`;
        return fs.readFileSync(path, alphabet);
    },

    //generates new invoice number
    invoiceNumber: async () => {
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
    },

    //generates new customer number
    customerNumber: async () => {
        //array of all existing customer numbers
        let numbers = [];
    
        //creates an array of all customers
        const customers = await Customer.find();

        //iterates through customers to select all customer numbers
        customers.map(customer => numbers.push(Number(customer.customerNo)));

        //adds one to the biggest existing number
        numbers = numbers.filter(num => num >= 0)
        const customerNumber = Math.max.apply(null, numbers) + 1;
        return customerNumber;
    }
}