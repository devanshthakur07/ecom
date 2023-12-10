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
    const { limit = 10, page = 1, fields } = req.query; // Default limit to 10 items per page

    const projection = fields
      ? fields.split(",").reduce((acc, field) => ({ ...acc, [field]: 1 }), {})
      : {};

    const options = {
      limit: parseInt(limit, 10),
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    let products = await Product.find({}, projection, options);

    if (!products || products.length === 0) {
      return res.status(404).send({
        message: "No products found!",
      });
    }

    return res.status(200).send({
      status: true,
      products,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
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
    return res.status(500).json({ 
      status: false, 
      message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id; // Assuming you pass the product ID through the request parameters

    // Check if the product exists
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product fields based on the request body
    if (req.body.title) {
      existingProduct.title = req.body.title;
    }

    if (req.body.description) {
      existingProduct.description = req.body.description;
    }

    if (req.body.price) {
      existingProduct.price = req.body.price;
    }

    if (req.body.brand) {
      existingProduct.brand = req.body.brand;
    }

    if (req.body.stock) {
      existingProduct.stock = req.body.stock;
    }

    if (req.body.category) {
      existingProduct.category = req.body.category;
    }

    // Save the updated product
    const updatedProduct = await existingProduct.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'There was some issue saving your data to DB!' });
  }
};

module.exports = {
  createProduct,
  getProductById,
  getAllProducts,
  searchProduct,
  updateProduct
};