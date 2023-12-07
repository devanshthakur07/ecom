const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {addToWishlist, getWishlist, removeFromWishlist, moveToCart} = require('../controller/wishlistController');


router.route("/").post(authentication, addToWishlist);
router.route("/").get(authentication, getWishlist);
router.route("/removeItem").put(authentication, removeFromWishlist);
router.route('/moveToCart').post(authentication, moveToCart);

module.exports = router;