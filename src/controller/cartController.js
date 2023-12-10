const Product = require("../model/Product");
const Cart = require("../model/Cart.js");
const { isValidId } = require("../validators/validator");
// const { getUserId } = require("./userController.js");


// Create Cart
const createCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items } = req.body;

    // Validate if products in the cart exist and have sufficient stock
    const productUpdates = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${item.productId} not found.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(409).json({
          message: `Insufficient stock for product with ID ${item.productId}.`
        });
      }


      productUpdates.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Calculate total price and total items
    let totalPrice = 0;
    let totalItems = 0;

    for (const update of productUpdates) {
      totalPrice += update.quantity * update.price;
      totalItems += update.quantity;
    }

    // Create the cart
    const cart = await Cart.create({
      userId,
      items: productUpdates,
      totalPrice,
      totalItems,
    });

    

    res.status(201).json({ message: 'Cart created successfully', cart });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { items } = req.body;

    // Validate if products in the cart exist and have sufficient stock
    const productUpdates = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${item.productId} not found.` 
        })
      }

      if (product.stock < item.quantity) {
        return res.status(409).json({
          message: `Insufficient stock for product with ID ${item.productId}.`
        })
      }


      productUpdates.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Calculate total price and total items
    let totalPrice = 0;
    let totalItems = 0;

    for (const update of productUpdates) {
      totalPrice += update.quantity * update.price;
      totalItems += update.quantity;
    }

    // Update the cart
    const updatedCart = await Cart.findByIdAndUpdate(
      cartId,
      { items: productUpdates, totalPrice, totalItems },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ message: 'Cart updated successfully', cart: updatedCart });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Cart Details
const getCartDetails = async (req, res) => {
  try {
    const { userId } = req.user.userId;

    const cart = await Cart.findOne(userId);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    else{
      return res.status(200).json({ cart });
    }
    
  } 
  catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'There was an error while fetching details from database' });
  }
};

module.exports = {
  createCart,
  getCartDetails,
  updateCart,
};
