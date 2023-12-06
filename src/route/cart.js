const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {createCart, getCartDetails, updateCart, addToCartFromLocalStorage} = require("../controller/cartController");

router.route('/').post(authentication, createCart);
router.route('/').get(authentication, getCartDetails);
router.route('/').put(authentication, updateCart);
router.route('/local-cart').put(authentication, addToCartFromLocalStorage);

module.exports = router;