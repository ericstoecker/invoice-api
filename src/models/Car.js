const mongoose = require('mongoose');


const Car = mongoose.model('car', {
    carId: String,
    customerNo: String,
    manufacturer: String,
    licensePlate: String,
    admissionDate: String,
    chassisNo: String,
    model: String,
    typeKey: String,
    capacity: String,
    kW: String,
    isActive: Boolean
});

module.exports = Car;