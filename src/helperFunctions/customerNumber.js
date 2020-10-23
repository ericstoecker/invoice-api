const Customer = require('../models/Customer');


//generates a new customer number
async function customerNumber() {
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

module.exports = customerNumber;