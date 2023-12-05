const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {createCart, getCartDetails, updateCart, addToCartFromLocalStorage} = require("../controller/cartController");

router.route('/cart').post(createCart);
router.route('/cart').get(getCartDetails);
router.route('/cart').put(updateCart);
router.route('/local-cart').put(addToCartFromLocalStorage);