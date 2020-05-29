const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const connectDB = require('./Config/db');

// Require Middleware
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000


// Connect Database and start Server
connectDB().then(() =>{
    app.listen( port, () => {
        console.log(`App listening on PORT ${port}`)
    });
});