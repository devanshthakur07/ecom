const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");

const  { createOrder, getOrderById, updateOrderStatus } = require("../controller/orderController");

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Operations related to orders
 */

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Place a new order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Order data to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *             example:
 *               address: "123 Main St, City"
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               order:
 *                 _id: order_id_here
 *                 userId: user_id_here
 *                 items:
 *                   - productId: product_id_here
 *                     quantity: 2
 *                 totalPrice: 39.98
 *                 totalItems: 2
 *                 status: "Pending"
 *                 address: "123 Main St, City"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation error message
 *       404:
 *         description: Cart not found or insufficient stock
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Cart not found or insufficient stock
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Internal Server Error
 */

/**
 * @swagger
 * /order/{orderId}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               order:
 *                 _id: order_id_here
 *                 userId: user_id_here
 *                 items:
 *                   - productId: product_id_here
 *                     quantity: 2
 *                 totalPrice: 39.98
 *                 totalItems: 2
 *                 status: "Pending"
 *                 address: "123 Main St, City"
 *       400:
 *         description: Invalid order ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid order ID
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Order not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Internal Server Error
 */

/**
 * @swagger
 * /order/{orderId}/status:
 *   put:
 *     summary: Update order status by ID
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       description: Order status data to be updated
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *             example:
 *               status: "Shipped"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Order status updated successfully
 *               order:
 *                 _id: order_id_here
 *                 userId: user_id_here
 *                 items:
 *                   - productId: product_id_here
 *                     quantity: 2
 *                 totalPrice: 39.98
 *                 totalItems: 2
 *                 status: "Shipped"
 *                 address: "123 Main St, City"
 *       400:
 *         description: Invalid order ID or status
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid order ID or status
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             example:
 *               message: Order not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */



router.route("/").post(authentication,createOrder);
router.route('/:id').get(authentication, getOrderById);
router.route("/:id/status").put(authentication, updateOrderStatus);
// router.route("/order").get(authentication, getOrder);
// router.route("/order/:orderId").get(getOrderById);
// router.route("/track/:orderId").get(trackOrderById);
// router.route("/order").put(authentication, cancelProductInOrder);
// router.route("/order").put(authentication, cancelOrder);


module.exports = router;