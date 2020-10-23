const express = require('express');
const router = express.Router();
const { v1: uuidv1 } = require('uuid');

//import models
const Car = require('../models/Car');
const Customer = require('../models/Customer');

//get all cars
router.get('/cars', async (req, res) => {
    //searches for all cars in DB
    const cars = await Car.find();
    //sends cars
    res.json(cars);
});

//add car to customer
router.put('/addcar/:customerNo', async (req, res) => {
    //searches for customer
    const customer = await Customer.findOne({ customerNo: req.params.customerNo });
    //checks if customer exists
    if(!customer) res.status(404).send('no customer found!');
    //checks if car exists already
    const car = await Car.findOne({ chassisNo: req.body.chassisNo });
    //const car = cars.filter(c => c.chassisNo == req.body.chassisNo);

    if(car) res.send("car already exists!");

    //creates uuid
    const uuid = uuidv1();

    const carData = new Car({
        carId: uuid,
        customerNo: customer.customerNo,
        manufacturer: req.body.manufacturer,
        licensePlate: req.body.licensePlate,
        admissionDate: req.body.admissionDate,
        chassisNo: req.body.chassisNo,
        model: req.body.model,
        typeKey: req.body.typeKey,
        capacity: req.body.capacity,
        kW: req.body.kW,
        isActive: true
    });

    try {
        const saved = await carData.save();
        console.log(saved);
        res.json(saved);
    }
    catch(error) {
        res.status(400).send(error);
    }
});

//update car
router.put('/update/:carId', async (req, res) => {
    //checks if car exists
    const car = await Car.findOne({ carId: req.params.carId });
    if(!car) res.status(404).send("no car found!");

    //saves car
    try {
        await Car.updateOne({ carId: req.params.carId }, req.body);
        const updatedCar = await Car.findOne({ carId: req.params.carId });
        res.json(updatedCar);
    }
    catch(error) {
        res.status(400).send(error);
    }
});

module.exports = router;