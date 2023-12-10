const express = require("express");
const router = express.Router();
const {authentication} = require('../middleware/auth');
const {isAdmin} = require('../middleware/isAdmin')
const {createProduct, getProductById, getAllProducts, searchProduct, updateProduct} = require("../controller/productController");

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Operations related to products
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Product data to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               brand:
 *                 type: string
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *             example:
 *               title: Product Title
 *               description: Product Description
 *               price: 20.99
 *               brand: Product Brand
 *               stock: 100
 *               category: Product Category
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               message: Product created successfully!
 *               data:
 *                 _id: product_id_here
 *                 title: Product Title
 *                 description: Product Description
 *                 price: 20.99
 *                 brand: Product Brand
 *                 stock: 100
 *                 category: Product Category
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: Validation error message
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
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               products:
 *                 - _id: product_id_here
 *                   title: Product Title
 *                   description: Product Description
 *                   price: 20.99
 *                   brand: Product Brand
 *                   stock: 100
 *                   category: Product Category
 *       404:
 *         description: No products found
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: No products found!
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
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               product:
 *                 _id: product_id_here
 *                 title: Product Title
 *                 description: Product Description
 *                 price: 20.99
 *                 brand: Product Brand
 *                 stock: 100
 *                 category: Product Category
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
 * /api/products/search:
 *   get:
 *     summary: Search for products by title, brand, or category
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: searchQuery
 *         required: true
 *         description: Search query string
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               products:
 *                 - _id: product_id_here
 *                   title: Product Title
 *                   description: Product Description
 *                   price: 20.99
 *                   brand: Product Brand
 *                   stock: 100
 *                   category: Product Category
 *       400:
 *         description: No products found
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               message: No products found!
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
 * /api/products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Fields to be updated
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               brand:
 *                 type: string
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *             example:
 *               title: Updated Product Title
 *               description: Updated Product Description
 *               price: 25.99
 *               brand: Updated Product Brand
 *               stock: 150
 *               category: Updated Product Category
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: product_id_here
 *               title: Updated Product Title
 *               description: Updated Product Description
 *               price: 25.99
 *               brand: Updated Product Brand
 *               stock: 150
 *               category: Updated Product Category
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: Product not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: Error message
 */


router.route('/').post(authentication, isAdmin, createProduct);
router.route('/').get(getAllProducts);
router.route('/:id').get(getProductById);
router.route('/search').get(searchProduct);
router.route('/:id').put(authentication, isAdmin, updateProduct);

module.exports = router;