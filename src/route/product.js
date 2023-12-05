const express = require("express");
const router = express.Router();
const {createProduct, getLimitedProducts, getProductById, getPopularProducts, getAllproducts, searchProduct} = require("../controller/productController");


router.route('/product').post(createProduct);
router.route('/limited-products').get(getLimitedProducts);
router.route('/popular-products').get(getPopularProducts);
router.route('/products').get(getAllproducts);
router.route('/getProductById/:id').get(getProductById);
router.route('/products/search').get(searchProduct);

module.exports = router;