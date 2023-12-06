const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {addToWishlist, getWishlist, removeFromWishlist} = require('../controller/wishlistController');


router.route("/").post(authentication, addToWishlist);
router.route("/").get(authentication, getWishlist);
router.route("/removeItem").put(authentication, removeFromWishlist);

module.exports = router;