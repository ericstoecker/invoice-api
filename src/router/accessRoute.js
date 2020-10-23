const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

//import models
const Admin = require('../models/Admin');

//import middleware
const middleware = require('../middleware/middleware');

//login creates token
router.post('/login/:name', middleware.validateAdmin, middleware.createKey, (req, res) => {
    //creates and sends token if admin is valid
    const key = res.locals.key;

    const admin = res.locals.authenticated;
    jwt.sign({admin}, key, { expiresIn: '10h'}, (err, token) => {
        res.send({token});
    });
});

//logout deactivates token
router.post('/logout', middleware.verifyToken, middleware.validateToken, middleware.deleteKey, async (req, res) => {
    
    res.send("logged out");
});

//creates new admin
router.put('/createAdmin', middleware.verifyToken, middleware.validateToken, async (req, res) => {
    const secret = ":)secret"
    const hashedPassword = crypto.createHmac('sha256', secret)
        .update(req.body.password)
        .digest('hex');

    const adminData = new Admin({
        name: req.body.name,
        password: hashedPassword
    });

    try {
        const saved = await adminData.save();
        res.send(saved);
    }
    catch(error) {
        res.status(400).send(error);
    }
});

//updates admin
router.put('/updateAdmin', middleware.verifyToken, middleware.validateToken, async (req, res) => {
    const admin = await Admin.findOne({ name: req.params.name });

    if(!admin) res.status(404).send('no admin found');

    try {
        const updated = await Admin.updateOne({ name: req.params.name }, req.body);
        res.send(updated);
    }
    catch(error) {
        res.status(400).send(error);
    }
});

module.exports = router;