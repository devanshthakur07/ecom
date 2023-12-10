const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {addToWishlist, getWishlist, removeFromWishlist, moveToCart} = require('../controller/wishlistController');


/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Operations related to user's wishlist
 */

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Product ID to be added to the wishlist
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *             example:
 *               productId: product_id_here
 *     responses:
 *       201:
 *         description: Product added to the wishlist successfully
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               message: Item added to your wishlist
 *               wishlist:
 *                 userId: user_id_here
 *                 products:
 *                   - product_id_here
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: Validation error message
 *       404:
 *         description: Invalid product ID or user not found
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: Invalid product ID or user not found
 */

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get the user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               message: Wishlist Found
 *               wishlist:
 *                 userId: user_id_here
 *                 products:
 *                   - product_id_here
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               error: Error message
 */

/**
 * @swagger
 * /api/wishlist/removeItem:
 *   put:
 *     summary: Remove a product from the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Product ID to be removed from the wishlist
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *             example:
 *               productId: product_id_here
 *     responses:
 *       200:
 *         description: Product removed from the wishlist successfully
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               wishlist:
 *                 userId: user_id_here
 *                 products:
 *                   - remaining_product_ids_here
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: Error message
 */

/**
 * @swagger
 * /api/wishlist/moveToCart:
 *   post:
 *     summary: Move a product from wishlist to cart
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Product ID to be moved to the cart
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *             example:
 *               productId: product_id_here
 *     responses:
 *       200:
 *         description: Product moved to cart successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Item moved to cart successfully
 *       404:
 *         description: Product not found in wishlist or does not exist
 *         content:
 *           application/json:
 *             example:
 *               message: Product not found in wishlist
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */


router.route("/").post(authentication, addToWishlist);
router.route("/").get(authentication, getWishlist);
router.route("/removeItem").put(authentication, removeFromWishlist);
router.route('/moveToCart').post(authentication, moveToCart);

module.exports = router;