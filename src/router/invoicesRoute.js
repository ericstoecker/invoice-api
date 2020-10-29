const express = require('express');
const router = express.Router();

//properties
const properties = require('../env/development.json');

//import models
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

//import helper functions
const helper = require('../helperFunctions/helper');


//get all invoices
router.get('/invoices', async (req, res) => {
    //searches for invoices in DB
    const invoices = await Invoice.find();
    //sends invoices
    res.json(invoices);
});

//add invoice
router.put('/addinvoice/:customerNo', async (req, res) => {
    //searches for customer
    const customer = await Customer.findOne({ customerNo: req.params.customerNo });
    const invoices = customer.invoices;
    //checks if customer exists
    if(!customer) res.status(404).send('no customer found!');
    //creates new invoiceNo
    const invoiceNo = await helper.invoiceNumber();

    invoices.push(invoiceNo);

    let vat = properties.config.VAT;
    vat = Number(vat);

    //calculate brutto
    const totalNetto = req.body.totalNetto;
    const totalBrutto = totalNetto * (100 + vat) / 100;

    //creates new invoice
    const invoiceData = new Invoice({
        invoiceNo: invoiceNo,
        customerNo: req.body.customerNo,
        carId: req.body.carId,
        invoiceDate: req.body.invoiceDate,
        wage1: req.body.wage1,
        amount1: req.body.amount1,
        price1: req.body.price1,
        wage2: req.body.wage2,
        amount2: req.body.amount2,
        price2: req.body.price2,
        totalNetto: totalNetto,
        totalBrutto: totalBrutto,
        positions: req.body.positions,
        receptionDay: req.body.receptionDay,
        kmStatus: req.body.kmStatus,
        tuev: req.body.tuev,
        exhaustInvestigation: req.body.exhaustInvestigation,
        status: req.body.status,
        VAT: vat
    });

    try {
        const saved = await invoiceData.save();
        await Customer.updateOne({ customerNo: req.params.customerNo }, { invoices: invoices });
        res.json(saved);
    }
    catch(error) {
        res.status(400).send(error);
    }
});

module.exports = router;