const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/PaymentModel');
require('dotenv').config();

const instance = new Razorpay({
    key_id: process.env.RazorpayKey,
    key_secret: process.env.RazorpaySecret,
});

const checkout = async (req, res) => {
    try {
        const options = {
            amount: Number(req.body.amount * 100),
            currency: "INR"
        };

        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "An error occurred during checkout."
        });
    }
};

const paymentVerification = async (req, res) => {

    console.log(req.body);

    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac('sha256', 'f1FpxdyKiQ8FKd4JoQspq2Pq')
    .update(body.toString())
    .digest('hex');
    

    const isAuthenticate = expectedSignature===razorpay_signature;

    if(isAuthenticate)
    {
        await Payment.create({
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature
        })
    }
    else
    {
        res.status(200).json({
            success:false
        })
    }
};

module.exports = {checkout, paymentVerification};