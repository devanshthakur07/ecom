const User = require("../model/User")
const Product = require("../model/Product")
const Wishlist = require("../model/Wishlist")


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
    let userWishlist = await Wishlist.findOne({ userId }).populate("products");
    if(!(userWishlist.products.length)) {
      return res.status(200).send({
        status: true,
        message: "Your wishlist is empty."
      })
    }
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






module.exports = { addToWishlist, getWishlist, removeFromWishlist };