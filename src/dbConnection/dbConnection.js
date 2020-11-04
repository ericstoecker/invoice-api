const mongoose = require('mongoose');

const toolbox = require('../toolbox/toolbox');
const properties = toolbox.readProperties();

class DBConnection {
    constructor() {
        this.db = properties.database;
    }

    async connect() {
        const db = this.db;
        await mongoose.connect(db.uri, db.options, () => {
            console.log('connected to DB!');
        });
    }

    async disconnect() {
        await mongoose.connection.close(() => {
            console.log('connection to DB closed!');
        });
    }

    async testDB() {

    }
}

//create instance of connection
const dbConnection = new DBConnection();

module.exports = dbConnection;