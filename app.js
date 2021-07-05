// TODO taskkill /im node.exe /F => Instruccion elimina todo los procesos de node
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
require('dotenv/config');

//Import Routes
const productsRouter = require('./routes/products.routes');
const categoriesRoutes = require('./routes/categories.routes');
const usersRoutes = require('./routes/users.routes');
const ordersRoutes = require('./routes/orders.routes');
const errorHandler = require('./helpers/error-handler');

const api = process.env.API_URL;

app.use(cors());
app.options('*', cors());


//Middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler)

//Routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);



mongoose.connect(process.env.CONNECTION_STRING,{ useNewUrlParser: true, useUnifiedTopology: true, dbName: 'eshop-database' }).then(() => {
    console.log('Database Connection is ready...')
}).catch((err) => {
    console.error(err);
})

app.listen(3000, () => {
    console.log('Server is runnig http://localhost:3000');
    console.log(api);
});