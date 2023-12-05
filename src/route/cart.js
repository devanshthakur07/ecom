const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {createCart, getCartDetails, updateCart, addToCartFromLocalStorage} = require("../controller/cartController");

router.route('/cart').post(authentication, createCart);
router.route('/cart').get(authentication, getCartDetails);
router.route('/cart').put(authentication, updateCart);
router.route('/local-cart').put(authentication, addToCartFromLocalStorage);

module.exports = router;