const Product = require("../model/Product");
const { productSchema } = require("../validators/schemaValidation");

const createProduct = async function (req, res) {
  try {

    const validateProduct = productSchema.validate(req.body);

    if (validateProduct.error) {
      return res.status(400).send(validateProduct.error.details[0].message);
    }
    let product = await Product.create(req.body);
    return res.status(201).send({
      status: true,
      message: "Product created successfully!",
      data: product,
    });
  } 
  catch (error) {
    return res.status(500).send({ 
      status: false, 
      message: error.message 
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    let products = await Product.find();
    if(!products) {
      return res.status(404).send({
        message: "No products found!"
      });
    }
    return res.status(200).send({ 
      status: true, 
      products 
    });
  } 
  catch (error) {
    return res.status(500).send({ 
      status: false, 
      message: error.message 
    });
  }
};


const getProductById = async (req, res) => {
  try {
    let id = req.params.id;
    let product = await Product.findById(id);
    return res.status(200).send({ status: true, product });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


const searchProduct = async (req, res) => {
  try {
    const { searchQuery } = req.query;
   
    const products = await Product.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { brand: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: "i" } },
      ],
    });
    if(!products.length) {
      return res.status(200).json({
        message: "No products found!"
      });
    }
    return res.json(products);
  } catch (error) {
    return res.status(500).send({ 
      status: false, 
      message: error.message });
  }
};



module.exports = {
  createProduct,
  getProductById,
  getAllProducts,
  searchProduct,
};