const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

//properties
const properties = require('./src/env/development.json');

//import routes
const customersRoute = require('./src/router/customersRoute');
const carsRoute = require('./src/router/carsRoute');
const accessRoute = require('./src/router/accessRoute');

//import middleware
const middleware = require('./src/middleware/middleware');

//connecting to DB
const db = properties.database;

mongoose.connect(`${db.type}://${db.host}:${db.port}/${db.name}`, { useNewUrlParser: true }, () => {
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
const appProperties = properties.appProperties;

const port = process.env.port || Number(appProperties.port);
app.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
});