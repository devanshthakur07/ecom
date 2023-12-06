
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const authRoute = require('./route/auth');
const productRoute = require('./route/product');
const paymentRoute = require('./route/payments');
const wishlistRoute = require('./route/wishlist');
const cartRoute = require('./route/cart');
const app = express();
const cors =require('cors')

dotenv.config();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use('/api/auth',authRoute);
app.use('/product', productRoute);
app.use('/payment', paymentRoute);
app.use('/wishlist', wishlistRoute);
app.use('/cart', cartRoute);
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true
}).then(() => console.log("Connection to MongoDB is established..."))
.catch(err => console.log(err))

const server = app.listen(process.env.APP_PORT, ()=> {
    console.log(`App is running on port: ${process.env.APP_PORT}...`)
});
module.exports=server;