const express = require('express');
const router = express.Router();

//import models
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

//import toolbox functions
const toolbox = require('../toolbox/toolbox');
//get properties
const properties = toolbox.readProperties();

//get all invoices
router.get('/invoices', async (req, res) => {
    //searches for invoices in DB
    const invoices = await Invoice.find();
    //sends invoices
    res.json(invoices);
});

//add invoice
router.post('/addinvoice/:customerNo', async (req, res) => {
    //searches for customer
    const customer = await Customer.findOne({ customerNo: req.params.customerNo });
    const invoices = customer.invoices;
    //checks if customer exists
    if(!customer) res.status(404).send('no customer found!');
    //creates new invoiceNo
    const invoiceNo = await toolbox.invoiceNumber();

    invoices.push(invoiceNo);

    let vat = properties.config.VAT;
    vat = Number(vat);

    //calculate brutto
    const totalNetto = req.body.totalNetto;
    const totalBrutto = totalNetto * (100 + vat) / 100;

    //create new date
    const date = new Date();

    //format day and month 
    let day = date.getDay() + 1;
    day = day >= 10 ? day : `0${day}`;

    let month = date.getMonth() + 1;
    month = month >= 10 ? month : `0${month}`;

    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const invoiceDate = `${day}.${month}.${year} ${hours}:${minutes}`;

    //set "draft" as default status if nothing else was send by the client
    const status = req.body.status ? req.body.status : "draft";

    //creates new invoice
    const invoiceData = new Invoice({
        invoiceNo: invoiceNo,
        customerNo: req.body.customerNo,
        carId: req.body.carId,
        invoiceDate: invoiceDate,
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
        status: status,
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

//updates status of invoice
router.put('/updateStatus/:invoiceNo', async (req, res) => {

    //search for invoice
    const invoice = await Invoice.findOne({ invoiceNo: req.params.invoiceNo });

    if(!invoice) res.status(404).send('no invoice found!');

    const newStatus = req.body.status;

    const actualStatus = invoice.status;
    
    //check if new status is valid
    if(newStatus !== "printed" && newStatus !== "canceled") {
        res.status(400).send("invalid status");

    } else if(actualStatus === "canceled") {
        res.status(400).send("invoice has been canceled already");

    } else {
        const statusUpdate = { status: newStatus };

        try {
            const updatedInvoice = await Invoice.findOneAndUpdate({ invoiceNo: req.params.invoiceNo }, statusUpdate, { new: true });
            res.json(updatedInvoice);
        }
        catch(error) {
            res.status(400).send(error);
        }
    }

});

//updates invoice
router.put('/updateInvoice/:invoiceNo', async (req, res) => {

    //serch invoice
    const invoice = await Invoice.findOne({ invoiceNo: req.params.invoiceNo });

    if(!invoice) res.status(404).send('no invoice found!');

    //check status of invoice
    const status = invoice.status;

    if(status !== "draft") {
        res.status(403).send("invoice can not be edited anymore!");
    
    //if status is valid update invoice
    } else {
        const newInvoice = req.body;

        try {
            const updatedInvoice = Invoice.findOneAndUpdate({ invoiceNo: req.params.invoiceNo }, newInvoice, { new: true });
            res.json(updatedInvoice);
        }
        catch(error) {
            res.status(400).send(error);
        }
    }
});

module.exports = router;