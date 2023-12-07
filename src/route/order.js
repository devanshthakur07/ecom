const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");

const  { createOrder, getOrderById } = require("../controller/orderController");

router.route("/").post(authentication,createOrder);
router.route('/:id').get(authentication, getOrderById);
// router.route("/order").get(authentication, getOrder);
// router.route("/order/:orderId").get(getOrderById);
// router.route("/track/:orderId").get(trackOrderById);
// router.route("/order").put(authentication, cancelProductInOrder);
// router.route("/order").put(authentication, cancelOrder);


module.exports = router;