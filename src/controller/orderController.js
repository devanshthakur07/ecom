const Order = require("../model/Order");
const User = require('../model/User');
const Product = require("../model/Product");
const Cart = require("../model/Cart");
const mongoose = require("mongoose");
const orderReceivedMail = require('../validators/sendOrderSummaryMail')
// Controller for placing an order
const createOrder = async (req, res) => {
  console.log(req.user);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(req.user)
    let userId = req.user.userId;
    
    const userLoggedIn = User.findById(userId);
    const {email} = userLoggedIn;
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
    await order.save({ session });

    // Clear the user's cart
    console.log(userCart._id);
    await Cart.findByIdAndDelete(userCart._id).session(session);
    session.endSession();
    orderReceivedMail(email, order);
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error(error);
    session.endSession();
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


module.exports = {createOrder};