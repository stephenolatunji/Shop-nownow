const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
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
app.use(compression({ level: 9 }));

// Initialize Routes
const distributorRoute = require('./Routes/distributor');
const pocRt = require('./Routes/poc');
const bulkRoute = require('./Routes/bulkBreaker');
const productRoute = require('./Routes/products');
const orderRoute = require('./Routes/order');
const adminRoute = require('./Routes/admin');

app.get('/', (req, res) => {
    res.status(200).send('Welcome to IBShopNow')
});
app.use('/Distributor', distributorRoute);
app.use('/Poc', pocRt);
app.use('/Bulkbreaker', bulkRoute);
app.use('/Product', productRoute);
app.use('/Order', orderRoute);
app.use('Admin', adminRoute)

const port = process.env.PORT || 9999

// Connect Database and start Server
connectDB().then(() =>{
    app.listen( port, () => {
        console.log(`App listening on PORT ${port}`)
    });
});