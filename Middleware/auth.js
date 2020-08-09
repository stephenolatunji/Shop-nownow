const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');


module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');

    if(!token){
        return res.status(401).send('User unathorized')
    }
    try{
        const authenticated = jwt.verify(token, process.env.JWT_SECRET);

        req.user = authenticated.user;

        next()
    }
    catch(err){
        res.status(401).send('Invalid')
    }
}