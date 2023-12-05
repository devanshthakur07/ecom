const express = require("express");
const router = express.Router();

const {paymentStatus, payment} = require("../controller/stripeController")

router.route('/').post(payment);
router.route('/paymentStatus').post(paymentStatus);



module.exports = router;