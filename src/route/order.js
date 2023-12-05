const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");

const { createOrder,getOrder,cancelOrder,cancelProductInOrder,getOrderById,trackOrderById} = require("../controller/orderController");

router.route("/order").post(createOrder);
router.route("/order").get(authentication, getOrder);
router.route("/order/:orderId").get(getOrderById);
router.route("/track/:orderId").get(trackOrderById);
router.route("/order").put(authentication, cancelProductInOrder);
router.route("/order").put(authentication, cancelOrder);


module.exports = router;