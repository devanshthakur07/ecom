const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");

const  { createOrder } = require("../controller/orderController");

router.route("/").post(authentication,createOrder);
// router.route("/order").get(authentication, getOrder);
// router.route("/order/:orderId").get(getOrderById);
// router.route("/track/:orderId").get(trackOrderById);
// router.route("/order").put(authentication, cancelProductInOrder);
// router.route("/order").put(authentication, cancelOrder);


module.exports = router;