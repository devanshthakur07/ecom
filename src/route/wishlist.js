const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {addToWishlist, getWishlist, removeFromWishlist} = require('../controller/wishlistController');


router.route("/wishlist").post(authentication, addToWishlist);
router.route("/wishlist").get(authentication, getWishlist);
router.route("/wishlist").put(authentication, removeFromWishlist);

module.exports = router;