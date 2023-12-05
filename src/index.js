
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const route = require('./route/route');
const app = express();
const cors =require('cors')

dotenv.config()
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use('/',route);

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true
}).then(() => console.log("Connection to MongoDB is established..."))
.catch(err => console.log(err))

const server = app.listen(process.env.APP_PORT, ()=> {
    console.log(`App is running on port: ${process.env.APP_PORT}...`)
});
module.exports=server;