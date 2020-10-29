const express = require('express');
const router = express.Router();


//import models
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

//import helper functions
const helper = require('../helperFunctions/helper');



//get all customers
router.get('/customers', async (req, res) => {
    //searches for customers that are active
    const customers = await Customer.find({ isActive: true });
    //sends customers
    res.json(customers);
});

//get single customer
router.get('/:customerNo', async (req, res) => {
    //searches for customer
    const customer = await Customer.findOne({ customerNo: req.params.customerNo });
    //checks if customer exists
    if(!customer) res.status(404).send('customer with this customer number doesnt exist!');
    //sends customer
    res.json(customer);
});

//create new customer
router.post('/create', async (req, res) => {
    //searches for customer
    const customerExist = await Customer.findOne({ name: req.body.name, street: req.body.street });
    //checks if customer exists
    if(customerExist) {
        res.status(404).send('this customer already exists!');
    } else {
        //creates new customer number
        const customerNo = await helper.customerNumber();

        //creates a new customer
        const customerData = new Customer({
            customerNo: customerNo,
            salutation: req.body.salutation,
            name: req.body.name,
            street: req.body.street,
            town: req.body.town,
            zip: req.body.zip,
            isActive: true,
            invoices: [] 
        });

        try {
            const saved = await customerData.save();
            res.json(saved);
        }
        catch(error) {
            res.status(400).send(error);
        }
    }
});

//update customer
router.put('/update/:customerNo', async (req, res) => {
    //searches for customer
    const customer = await Customer.findOne({ customerNo: req.params.customerNo });
    //checks if customer exists
    if(!customer) res.status(404).send('no customer found!');

    try {
        const updated = await Customer.updateOne({ customerNo: req.params.customerNo }, req.body);
        res.json(updated);
    }
    catch(error) {
        res.status(400).send(error);
    }
});

//delete customer
router.delete('/delete/:customerNo', async (req, res) => {
    //searches for customer
    const customer = await Customer.findOne({ customerNo: req.params.customerNo });
    //checks if customer exists
    if(!customer) res.status(404).send('no customer found!');
    
    try {
        const deletedCustomer = await Customer.findOneAndDelete({ customerNo: req.params.customerNo });
        res.json(deletedCustomer);
    }
    catch(error) {
        res.send(error);
    }
});


module.exports = router;