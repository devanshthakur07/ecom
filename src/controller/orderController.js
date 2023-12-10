const Order = require("../model/Order");
const User = require('../model/User');
const Product = require("../model/Product");
const Cart = require("../model/Cart");
const mongoose = require("mongoose");
const orderReceivedMail = require('../validators/sendOrderSummaryMail')
// Controller for placing an order

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the user's cart
    const userCart = await Cart.findOne({ userId }).populate("items.productId");

    if (!userCart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Create an order based on the cart
    const order = new Order({
      userId,
      items: userCart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      totalPrice: userCart.totalPrice,
      totalItems: userCart.totalItems,
      address: req.body.address, // assuming address is provided in the request body
    });

    // Save the order
    await order.save();

    // Decrease the product quantity for each item in the order
    for (const item of userCart.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).status({
          message: `Product with ID ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(404).status({
          message: `Insufficient stock for product with ID ${item.productId}`
        });
      }

      // Decrease stock
      product.stock -= item.quantity;

      // Save the updated product
      await product.save();
    }

    // Clear the user's cart
    await Cart.findByIdAndDelete(userCart._id);

    // Send order received email or perform any other actions

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId).populate("items.productId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {createOrder, getOrderById, updateOrderStatus};