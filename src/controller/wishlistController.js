const User = require("../model/User")
const Product = require("../model/Product")
const Wishlist = require("../model/Wishlist")
const Cart = require('../model/Cart');

const addToWishlist = async function (req, res) {
    try {
        let userId = req.user.userId;
        let {productId} = req.body;
        let product = await Product.findById(productId);
        if (!product) {
            return res.status(400).send({ 
              status: false, 
              message: " invalid productId " 
            });
        }
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).send({ 
              status: false, 
              message: "No user found with this id!" 
            });
        }

        let userWishlist = await Wishlist.findOne({ userId });
        if (!userWishlist) {
            let wishlist = await Wishlist.create({ userId, products: [productId] });
            return res.status(201).send({ 
              status: true, 
              message: "Item added to your wishlist", 
              wishlist
            });
        } 
        else {
            let products = userWishlist.products;
            //checking whether the product already exists in wishlist 
            let previouslyAdded = products.findIndex((x) => x == productId);
            if (previouslyAdded !== -1) {
                return res.status(400).send({ 
                  status: false, 
                  message: "Your wishlist already has this product!" 
                });
            }
            products.push(productId);
            let wishlist = await Wishlist.findByIdAndUpdate(userWishlist._id, { $set: { products: products } },
                { new: true }).populate("products");
            return res.status(201).send({ 
              status: true, 
              message: "Item added to your wishlist", 
              wishlist 
            });
        }
    } catch (error) {
        return res.status(500).send({ 
          status: false, 
          message: error.message 
        })
    };

}


const getWishlist = async function (req, res) {
  try {
    let userId = req.user.userId;
    let userWishlist = await Wishlist.findOne({ userId });

    if(!userWishlist) {
      return res.status(400).send({
        status: false,
        message: "Wishlist does not exists for this user"
      })
    }

    
    if(!(userWishlist.products.length)) {
      return res.status(200).send({
        status: true,
        message: "Your wishlist is empty."
      })
    }
    
    userWishlist =await userWishlist.populate("products");  


    return res.status(200).send({
      status: true, 
      message: "Wishlist Found", 
      wishlist: userWishlist 
    });
  } catch (error) {
    return res.status(500).send({ 
      status: false, 
      error: error.message 
    });
  }
};






const removeFromWishlist = async (req, res) => {
  try {
    let userId = req.user.userId;
    let {productId} = req.body;
    let userWishlist = await Wishlist.findOne({ userId });

    if(!userWishlist) {
      return res.status(404).json({
        message: "Wishlist does not exists."
      })
    }

    let filteredList = userWishlist.products.filter(
      (x) => x.toString() !== productId.toString()
    );
  
    let wishlist = await Wishlist.findByIdAndUpdate(userWishlist._id,
        { $set: { products: filteredList } },
        { new: true }
      ).populate("products");
    return res.status(200).send({ 
      status: true, 
      wishlist 
    });
  } 
  catch (error) {
    return res.status(500).send({ 
      status: false, 
      message: error.message 
    });
  }
};


const moveToCart = async (req, res) => {
  try {
    const userId = req.user.userId; 

    const { productId } = req.body;

    
    const wishlistItem = await Wishlist.findOne({ userId, products: productId });

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    
    const cartItem = {
      productId,
      quantity: 1,
    };
    const product = await Product.findById(productId);
    if(!product) {
      return res.status(404).json({message: "Product does not exists!"});
    }
    // Find the user's cart or create a new one if it doesn't exist
    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      userCart = new Cart({
        userId,
        items: [cartItem],
        totalPrice: cartItem.quantity * product.price, 
        totalItems: cartItem.quantity,
      });
    } else {
      // Add the cart item to the existing cart
      userCart.items.push(cartItem);

      // Update the total price and total items in the cart
      userCart.totalPrice += cartItem.quantity * product.price;
      userCart.totalItems += cartItem.quantity;
    }

    // Save the updated cart
    await userCart.save();

    // Remove the wishlist item
    await Wishlist.findOneAndUpdate({ userId }, { $pull: { products: productId } });

    res.status(200).json({ message: 'Item moved to cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'There was an error while moving items to cart!' });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist, moveToCart };