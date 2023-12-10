const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {createCart, getCartDetails, updateCart} = require("../controller/cartController");


/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Operations related to the shopping cart
 */

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Create a new cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Cart data to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *             example:
 *               items:
 *                 - productId: product_id_here
 *                   quantity: 2
 *     responses:
 *       201:
 *         description: Cart created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Cart created successfully
 *               cart:
 *                 _id: cart_id_here
 *                 userId: user_id_here
 *                 items:
 *                   - productId: product_id_here
 *                     quantity: 2
 *                 totalPrice: 39.98
 *                 totalItems: 2
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               message: Validation error message
 *       404:
 *         description: Product not found or insufficient stock
 *         content:
 *           application/json:
 *             example:
 *               message: Product not found or insufficient stock
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get cart details
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart details retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               cart:
 *                 _id: cart_id_here
 *                 userId: user_id_here
 *                 items:
 *                   - productId: product_id_here
 *                     quantity: 2
 *                 totalPrice: 39.98
 *                 totalItems: 2
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             example:
 *               message: Cart not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */

/**
 * @swagger
 * /api/cart:
 *   put:
 *     summary: Update the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Cart data to be updated
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *             example:
 *               items:
 *                 - productId: product_id_here
 *                   quantity: 3
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Cart updated successfully
 *               cart:
 *                 _id: cart_id_here
 *                 userId: user_id_here
 *                 items:
 *                   - productId: product_id_here
 *                     quantity: 3
 *                 totalPrice: 59.97
 *                 totalItems: 3
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             example:
 *               message: Cart not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */




router.route('/').post(authentication, createCart);
router.route('/').get(authentication, getCartDetails);
router.route('/').put(authentication, updateCart);

module.exports = router;