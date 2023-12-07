const express = require("express");
const router = express.Router();
const {authentication} = require('../middleware/auth');
const {isAdmin} = require('../middleware/isAdmin')
const {createProduct, getProductById, getAllProducts, searchProduct, updateProduct} = require("../controller/productController");


router.route('/').post(authentication, isAdmin, createProduct);
router.route('/').get(getAllProducts);
router.route('/getProductById/:id').get(getProductById);
router.route('/search').get(searchProduct);
router.route('/:id').post(authentication, isAdmin, updateProduct);

module.exports = router;