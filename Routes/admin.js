const express = require('express');
const route = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = require('./bulkBreaker');


const Admin = require('../Models/Admin');

router.route('/login')
    .post(async(req, res) => {
         
    })


module.exports = router;