const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Admin = require('../models/Admin');

module.exports = {
    secretKey: null,

    validateAdmin: async (req, res, next) => {
        const admin = await Admin.findOne({name: req.params.name});

        const secret = ":)secret"
        const hashedPassword = crypto.createHmac('sha256', secret)
            .update(req.body.password)
            .digest('hex');
        
        /* if(admin.password !== hashedPassword) {
            res.status(403).send("access denied!");
        } else {
            res.locals.authenticated = admin;
            next();
        } */
        res.locals.authenticated = admin;
        next();
    },

    //checks if token is valid
    validateToken: (req, res, next) => {
        const key = this.secretKey;
        
        jwt.verify(res.locals.token, key, error => {
            if(error) {
                res.sendStatus(403);
            } else {
                next();
            }
        });
    },

    //checks if token was send
    verifyToken: (req, res, next) => {
        //get header
        const bearerHeader = req.headers['authorization'];
        
        if(typeof bearerHeader !== 'undefined') {
            //split bearer
            const bearer = bearerHeader.split(" ");
            //get token
            const token = bearer[1];

            //pass token to next middleware function
            res.locals.token = token;
            next();
        } else {
            res.status(403).send("no token");
        }
    },

    //creates key when user logs in
    createKey: (req, res, next) => {
        this.secretKey = crypto.randomBytes(16);
        res.locals.key = this.secretKey;
        next();
    },

    //deletes current key when user wants to log out
    deleteKey: (req, res, next) => {
        this.secretKey = null;
        next();
    }
}