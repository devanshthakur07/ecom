const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {addToWishlist, getWishlist, removeFromWishlist} = require('../controller/wishlistController');


router.route();