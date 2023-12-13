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
    const userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    userCart = userCart.populate("items.productId");

    // Create an order based on the cart
    const order = new Order({
      userId,
      items: userCart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      totalPrice: userCart.totalPrice,
      totalItems: userCart.totalItems,
      address: req.body.address,
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
    res.status(500).json({ success: false, error: "There was some error while placing your order." });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order = await order.populate("items.productId");

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "There was some error getting product IDs" });
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
    res.status(500).json({ message: 'There was some error while updating the status of your order.' });
  }
};



const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if the order can be canceled based on its current status
    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Cannot cancel order with status ' + order.status });
    }

    // Restore stock for each item in the order
    for (const item of order.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${item.productId} not found`
        });
      }

      // Increase stock
      product.stock += item.quantity;

      // Save the updated product
      await product.save();
    }

    // Update the order status to 'Canceled'
    order.status = 'Canceled';

    // Save the updated order
    await order.save();

    res.status(200).json({ success: true, message: 'Order canceled successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'There was an error while canceling the order' });
  }
};


module.exports = {createOrder, getOrderById, updateOrderStatus, cancelOrder};