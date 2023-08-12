//Our Entry Point - index.js

const connectToMongo = require('./db')
const express = require('express')
const cors = require('cors')
require('dotenv').config();

connectToMongo();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/paymentRoute', require('./routes/paymentRoute'));

app.get('/api/getKey', (req,res)=>{
    res.status(200).json({key:process.env.RazorpayKey});
})

app.listen(process.env.PORT || 5000, () => {
    console.log(`PaperKart's Backend is running at Port - http://localhost:5000`);
})