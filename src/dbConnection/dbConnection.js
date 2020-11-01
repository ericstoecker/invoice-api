const mongoose = require('mongoose');

const toolbox = require('../toolbox/toolbox');
const properties = toolbox.readProperties();

class DBConnection {
    constructor() {
        this.db = properties.database;
    }

    async connect() {
        const db = this.db;
        mongoose.connect(`${db.type}://${db.host}:${db.port}/${db.name}`, { useNewUrlParser: true }, () => {
            console.log('connected to DB!');
        });
    }

    async disconnect() {
        mongoose.connection.close(() => {
            console.log('connection to DB closed!');
        });
    }

    async testDB() {

    }
}

//create instance of connection
const dbConnection = new DBConnection();

module.exports = dbConnection;