const express = require('express');
const app = express();
const dbConnection = require('./src/dbConnection/dbConnection');
const cors = require('cors');

//properties
const toolbox = require('./src/toolbox/toolbox');
const properties = toolbox.readProperties();

//import routes
const customersRoute = require('./src/router/customersRoute');
const carsRoute = require('./src/router/carsRoute');
const accessRoute = require('./src/router/accessRoute');
const invoicesRoute = require('./src/router/invoicesRoute');

//import middleware
const middleware = require('./src/middleware/middleware');

//connecting to DB
dbConnection.connect();

//Middleware
//body parsing
app.use(cors());
app.use(express.json());


//routing
//uses token validation
app.use('/api/customers', middleware.verifyToken, middleware.validateToken, customersRoute);
app.use('/api/cars', middleware.verifyToken, middleware.validateToken, carsRoute);
app.use('/api/invoices', middleware.verifyToken, middleware.validateToken, invoicesRoute);

//doesnt use token validation
app.use('/api/access', accessRoute);


//listen for requests
const appProperties = properties.appProperties;

const port = process.env.port || Number(appProperties.port);
app.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
});