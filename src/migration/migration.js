const mongoose = require('mongoose');
const fs = require('fs');
const { v1: uuidv1 } = require('uuid');

//import mongoose models
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const Car = require('../models/Car');



//function call
migration();
//cleanCarData();



function readPositions() {
    let file = fs.readFileSync('../csv_data/Artikel.csv', 'latin1');

    //changes all ',' in numbers into '.' so javascript can read it as double
    file = file.toString().replace(/,/g, '.').replace(/\r/g, '').replace(/"/g, '');

    //creates array of positions
    let positions = file.split('\n');

    //array with position objects
    let positionsArray = [];

    for(let i = 1; i < positions.length; i++) {
        const position = positions[i].split(';');

        const total = Number(position[2]) * Number(position[3]) * (Number(position[4])==0 ? 1 : ((100-Number(position[4]))/100));

        positionsArray.push({
            description: position[1],
            amount: position[2],
            price: position[3],
            discount: position[4],
            invoiceNo: position[5],
            total: total
        });
    }
    return positionsArray;
}

//adds cars and invoices to DB
async function migrateInvoicesCars(positionsArray) {
    let file = fs.readFileSync('../csv_data/Rechnungen.csv');

    //changes all ',' in numbers into '.' so javascript can read it as double
    file = file.toString().replace(/,/g, '.').replace(/\r/g, '');

    //creates array of invoices
    let invoices = file.split('\n');

    for(let i = 1; i < invoices.length; i++) {
        const invoice = invoices[i].split(';');

        //filters the positionsArray for all positions with matching invoice number
        const positions = positionsArray.filter(p => p.invoiceNo == invoice[0]);

        //sums the cost of all positions
        let totalPriceOfPositions = 0;
        positions.map(pos => totalPriceOfPositions += pos.total);

        let totalNetto = invoice[16] * invoice[17] + invoice[19] * invoice[20] + totalPriceOfPositions;
        let totalBrutto = totalNetto * 119/100;

        //rounds totals to two digits
        totalNetto = Number.parseFloat(totalNetto).toFixed(2);
        totalBrutto = Number.parseFloat(totalBrutto).toFixed(2);
        
        //creates uuid
        const uuid = uuidv1();

        //creates new Car
        const carData = new Car({
            carId: uuid,
            customerNo: invoice[1],
            manufacturer: invoice[3],
            licensePlate: invoice[4],
            admissionDate: invoice[5],
            chassisNo: invoice[6],
            model: invoice[7],
            typeKey: invoice[8],
            capacity: invoice[11],
            kW: invoice[12],
            isActive: false
        });

        //creates new invoice
        const invoiceData = new Invoice({
            invoiceNo: invoice[0],
            customerNo: invoice[1],
            carId: uuid,
            invoiceDate: invoice[2],
            wage1: invoice[15],
            amount1: invoice[16],
            price1: invoice[17],
            wage2: invoice[18],
            amount2: invoice[19],
            price2: invoice[20],
            totalNetto: totalNetto,
            totalBrutto: totalBrutto,
            positions: positions,
            receptionDay: invoice[9],
            kmStatus: invoice[10],
            tuev: invoice[13],
            exhaustInvestigation: invoice[14]
        });
        try {
            carData.save();
            invoiceData.save();
        }
        catch(error) {
            console.log(error);
        }
    }
}

/*async function migrateCars() {
    let file = fs.readFileSync('../csv_data/Rechnungen.csv');

    //changes all ',' in numbers into '.' so javascript can read it as double
    file = file.toString().replace(/,/g, '.').replace(/\r/g, '');

    //creates array of invoices
    let invoices = file.split('\n');

    for(let i = 1; i < invoices.length; i++) {
        const invoice = invoices[i].split(';');

        const carData = new Car({
            CarId: i,
            customerNo: invoice[1],
            manufacturer: invoice[3],
            licensePlate: invoice[4],
            admissionDate: invoice[5],
            chassisNo: invoice[6],
            model: invoice[7],
            typeKey: invoice[8],
            receptionDay: invoice[9],
            kmStatus: invoice[10],
            capacity: invoice[11],
            kW: invoice[12],
            tuev: invoice[13],
            exhaustInvestigation: invoice[14],
            isActive: false
        });
        try {
            carData.save();
        }
        catch(error) {
            console.log(error);
        }
    }
}*/

//adds all customers from Kunden.csv to DB
async function migrateCustomers() {
    let file = fs.readFileSync('../csv_data/Kunden.csv');

    //deletes all unnecessary " and \r
    file = file.toString().replace(/"|\r/g, '');

    //creates array of customers
    let customers = file.split('\n');

    for(let i = 0; i < customers.length; i++) {
        const customer = customers[i].split(';');

        //searches for all invoices of customer
        const invoices = await Invoice.find({ customerNo: customer[0] });
        const invoiceNumbers = [];

        invoices.map(invoice => invoiceNumbers.push(invoice.invoiceNo));
        //searches for all cars of customer
        //const cars = await Car.find({ customerNo: customer[0] });
        //const carIds = [];


        const customerData = new Customer({
            customerNo: customer[0],
            salutation: customer[1],
            name: customer[2],
            street: customer[3],
            town: customer[4],
            zip: customer[5],
            isActive: true,
            invoices: invoiceNumbers
        });
        try {
            customerData.save();
        }
        catch(error) {
            console.log(error);
        }
    }
}

//cleans cars from duplicates
async function cleanCarData() {
    //connects to DB
    await mongoose.connect('mongodb://localhost:27017/invoice', { useNewUrlParser: true },() => {
        console.log('connected to DB!');
    });

    const customers = await Customer.find();

    for(let i=0; i<customers.length; i++) {
        const cars = await Car.find({ customerNo: customers[i].customerNo });

        for(let j=0; j<cars.length; j++) {
            const selectedCar = cars[j];
            if(selectedCar.chassisNo) {
                //const sameCars = [];
                for(let k=0; k<cars.length; k++) {
                    const car = cars[k];
                    if(!car.chassisNo && car.licensePlate === selectedCar.licensePlate && car.model === selectedCar.model) {
                        const invoices = await Invoice.find({ carId: car.carId });
                        invoices.forEach((invoice, index) => {
                            invoices[index].carId = selectedCar.carId;
                        });
                        invoices.map(invoice => {
                            Invoice.updateOne({ invoiceNo: invoice.invoiceNo }, {carId: invoice.carId});
                        });
                        Car.findOneAndDelete({ carId: car.carId }, () => {
                            console.log("car succesfully deleted!");
                        });
                    }
                }
            }
        }
    }
}


async function migration() {
    //connects to DB
    await mongoose.connect('mongodb://localhost:27017/invoice', { useNewUrlParser: true },() => {
        console.log('connected to DB!');
    });

    //reads Artikel.csv
    const positions = readPositions();

    //adds invoices to DB
    await migrateInvoicesCars(positions).then(() => {
        console.log("invoices and cars saved to DB!");
    });
    //adds customers to DB
    migrateCustomers().then(() => {
        console.log("customers saved to DB!");
    });
}

