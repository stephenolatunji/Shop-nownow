const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const helmet = require('helmet');
const connectDB = require('./Config/db');

// Require Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self"],
            scriptSrc: ["'self"]
        }
    },
    referrerPolicy: {policy: 'same-origin'}
}));

// Initialize Routes
const distributorRoute = require('./Routes/distributor');
const pocRoute = require('./Routes/poc');

app.use('/Distributor', distributorRoute);
app.use('/Poc', pocRoute);



const port = process.env.PORT || 5000

// Connect Database and start Server
connectDB().then(() =>{
    app.listen( port, () => {
        console.log(`App listening on PORT ${port}`)
    });
});