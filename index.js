const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

//import routes
const customersRoute = require('./src/router/customersRoute');
const carsRoute = require('./src/router/carsRoute');
const accessRoute = require('./src/router/accessRoute');

//import middleware
const middleware = require('./src/middleware/middleware');

//connecting to DB
mongoose.connect('mongodb://localhost:27017/invoice', { useNewUrlParser: true }, () => {
    console.log('connected to DB!');
});


//Middleware
//body parsing
app.use(cors());
app.use(express.json());


//routing
//uses token validation
app.use('/api/customers', middleware.verifyToken, middleware.validateToken, customersRoute);
app.use('/api/cars', middleware.verifyToken, middleware.validateToken, carsRoute);

//doesnt use token validation
app.use('/api/access', accessRoute);


//listen for requests
const port = process.env.port || 8888;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
});