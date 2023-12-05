
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const authRoute = require('./route/auth');
const app = express();
const cors =require('cors')

dotenv.config();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use('/api/auth',authRoute);

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true
}).then(() => console.log("Connection to MongoDB is established..."))
.catch(err => console.log(err))

const server = app.listen(process.env.APP_PORT, ()=> {
    console.log(`App is running on port: ${process.env.APP_PORT}...`)
});
module.exports=server;