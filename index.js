const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
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
const bulkRoute = require('./Routes/bulkBreaker');

app.use('/Distributor', distributorRoute);
app.use('/Poc', pocRoute);
app.use('/Bulkbreaker', bulkRoute);



const port = process.env.PORT || 5000

// Connect Database and start Server
connectDB().then(() =>{
    app.listen( port, () => {
        console.log(`App listening on PORT ${port}`)
    });
});