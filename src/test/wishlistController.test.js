const { addToWishlist, removeFromWishlist, getWishlist, moveToCart } = require('../controller/wishlistController'); 
const Wishlist = require('../model/Wishlist'); 
const Product = require('../model/Product');
const User = require('../model/User'); 
const Cart = require('../model/Cart');
jest.mock('../model/Product', () => ({
  findById: jest.fn(),
}));

jest.mock('../model/Wishlist', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../model/User', () => ({
  findById: jest.fn(),
}));

jest.mock('../model/Cart');

describe('addToWishlist controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add item to wishlist successfully', async () => {
    // Mock Product.findById implementation
    Product.findById.mockResolvedValueOnce({
      _id: 'mockProductId',
    });

    // Mock User.findById implementation
    User.findById.mockResolvedValueOnce({
      _id: 'mockUserId',
    });

    // Mock Wishlist.findOne implementation
    Wishlist.findOne.mockResolvedValueOnce(null);

    // Mock Wishlist.create implementation
    Wishlist.create.mockResolvedValueOnce({
      _id: 'mockWishlistId',
      userId: 'mockUserId',
      products: ['mockProductId'],
    });

    const req = {
      user: { userId: 'mockUserId' },
      body: { productId: 'mockProductId' },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await addToWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'Item added to your wishlist',
      wishlist: {
        _id: 'mockWishlistId',
        userId: 'mockUserId',
        products: ['mockProductId'],
      },
    });

    // Check if Product.findById was called with the correct arguments
    expect(Product.findById).toHaveBeenCalledWith('mockProductId');

    // Check if User.findById was called with the correct arguments
    expect(User.findById).toHaveBeenCalledWith('mockUserId');

    // Check if Wishlist.findOne was called with the correct arguments
    expect(Wishlist.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });

    // Check if Wishlist.create was called with the correct arguments
    expect(Wishlist.create).toHaveBeenCalledWith({ userId: 'mockUserId', products: ['mockProductId'] });
  });

  it('should handle the case where the product is not found', async () => {
    // Mock Product.findById implementation to return null
    Product.findById.mockResolvedValueOnce(null);

    const req = {
      user: { userId: 'mockUserId' },
      body: { productId: 'nonexistentProductId' },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await addToWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: ' invalid productId ',
    });

    // Check if Product.findById was called with the correct arguments
    expect(Product.findById).toHaveBeenCalledWith('nonexistentProductId');
  });

  it('should handle the case where the user is not found', async () => {
    // Mock Product.findById implementation
    Product.findById.mockResolvedValueOnce({
      _id: 'mockProductId',
    });

    // Mock User.findById implementation to return null
    User.findById.mockResolvedValueOnce(null);

    const req = {
      user: { userId: 'nonexistentUserId' },
      body: { productId: 'mockProductId' },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await addToWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'No user found with this id!',
    });

    // Check if Product.findById was called with the correct arguments
    expect(Product.findById).toHaveBeenCalledWith('mockProductId');

    // Check if User.findById was called with the correct arguments
    expect(User.findById).toHaveBeenCalledWith('nonexistentUserId');
  });

  it('should handle the case where the product is already in the wishlist', async () => {
    // Mock Product.findById implementation
    Product.findById.mockResolvedValueOnce({
      _id: 'mockProductId',
    });

    // Mock User.findById implementation
    User.findById.mockResolvedValueOnce({
      _id: 'mockUserId',
    });

    // Mock Wishlist.findOne implementation
    Wishlist.findOne.mockResolvedValueOnce({
      _id: 'mockWishlistId',
      userId: 'mockUserId',
      products: ['mockProductId'],
    });

    const req = {
      user: { userId: 'mockUserId' },
      body: { productId: 'mockProductId' },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await addToWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Your wishlist already has this product!',
    });

    expect(Product.findById).toHaveBeenCalledWith('mockProductId');

    // Check if User.findById was called with the correct arguments
    expect(User.findById).toHaveBeenCalledWith('mockUserId');

    // Check if Wishlist.findOne was called with the correct arguments
    expect(Wishlist.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });
  });

  it('should handle internal server error', async () => {
    // Mock Product.findById to throw an error
    Product.findById.mockRejectedValueOnce(new Error('Test error'));

    const req = {
      user: { userId: 'mockUserId' },
      body: { productId: 'mockProductId' },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await addToWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Test error',
    });

    expect(Product.findById).toHaveBeenCalledWith('mockProductId');
  });
});




describe('removeFromWishlist controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should remove product from wishlist successfully', async () => {
    // Mock Wishlist.findOne implementation
    const mockUserWishlist = {
      _id: 'mockWishlistId',
      userId: 'mockUserId',
      products: [
        {
          _id: 'mockProductId1',
          product: {
            _id: 'mockProductId1',
            title: 'Product 1',
            description: 'Description 1',
            price: 10,
            brand: 'Brand 1',
            stock: 5,
            category: 'Category 1',
          },
        },
        {
          _id: 'mockProductId2',
          product: {
            _id: 'mockProductId2',
            title: 'Product 2',
            description: 'Description 2',
            price: 15,
            brand: 'Brand 2',
            stock: 8,
            category: 'Category 2',
          },
        },
      ],
    };

    Wishlist.findOne.mockResolvedValueOnce(mockUserWishlist);

    Wishlist.findByIdAndUpdate.mockResolvedValueOnce({
      _id: 'mockWishlistId',
      userId: 'mockUserId',
      products: [
        {
          _id: 'mockProductId2',
          product: {
            _id: 'mockProductId2',
            title: 'Product 2',
            description: 'Description 2',
            price: 15,
            brand: 'Brand 2',
            stock: 8,
            category: 'Category 2',
          },
        },
      ],
    });

    const filterSpy = jest.spyOn(Array.prototype, 'filter');

    const req = {
      user: { userId: 'mockUserId' },
      body: { productId: 'mockProductId1' },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await removeFromWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      wishlist: {
        _id: 'mockWishlistId',
        userId: 'mockUserId',
        products: [
          {
            _id: 'mockProductId2',
            product: {
              _id: 'mockProductId2',
              title: 'Product 2',
              description: 'Description 2',
              price: 15,
              brand: 'Brand 2',
              stock: 8,
              category: 'Category 2',
            },
          },
        ],
      },
    });


    expect(Wishlist.findByIdAndUpdate).toHaveBeenCalledWith(
      'mockWishlistId',
      { $set: { products: [{ _id: 'mockProductId2' }] } },
      { new: true }
    );

    // Check if the filterSpy was called with the correct arguments
    expect(filterSpy).toHaveBeenCalledWith(
      expect.any(Function) // You can provide a custom filter function here if needed
    );

    filterSpy.mockRestore();
  });

  it('should return 404 when user wishlist does not exist', async () => {
    // Mock Wishlist.findOne to return null (wishlist not found)
    Wishlist.findOne.mockResolvedValueOnce(null);

    const req = {
      user: { userId: 'mockUserId' },
      body: { productId: 'mockProductId' },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await removeFromWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Wishlist does not exists.',
    });

    // Check if Wishlist.findOne was called with the correct arguments
    expect(Wishlist.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });

    // Check if Wishlist.findByIdAndUpdate was not called
    expect(Wishlist.findByIdAndUpdate).not.toHaveBeenCalled();
  });
  it('should handle internal server error', async () => {
    // Mock Wishlist.findOne to throw an error
    Wishlist.findOne.mockRejectedValueOnce(new Error('Test error'));

    const req = {
      user: { userId: 'mockUserId' },
      body: { productId: 'mockProductId1' },
    };

    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await removeFromWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Test error',
    });

    expect(Wishlist.findOne).toHaveBeenCalledWith({ userId: 'mockUserId' });

    expect(Wishlist.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});




describe('getWishlist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if wishlist does not exist for the user', async () => {
    Wishlist.findOne.mockResolvedValueOnce(null);

    const req = { user: { userId: 'someUserId' } };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await getWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Wishlist does not exists for this user',
    });
  });

  it('should return 200 with empty wishlist message if the wishlist is empty', async () => {
    Wishlist.findOne.mockResolvedValueOnce({ products: [] });

    const req = { user: { userId: 'someUserId' } };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await getWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'Your wishlist is empty.',
    });
  });

  it('should return 200 with wishlist details if the wishlist is not empty', async () => {
    const mockProduct ={
      title: 'Mock Product',
      description: 'Mock Product Description',
      price: 50,
      brand: 'Mock Brand',
      stock: 10,
      category: 'Mock Category',
    };

    Wishlist.findOne.mockResolvedValueOnce({ products: [mockProduct] });

    const req = { user: { userId: 'someUserId' } };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await getWishlist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'Wishlist Found',
      wishlist: { products: [mockProduct] },
    });
  });
});




describe('moveToCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if product is not found in wishlist', async () => {
    Wishlist.findOne.mockResolvedValueOnce(null);

    const req = { user: { userId: 'someUserId' }, body: { productId: 'someProductId' } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await moveToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product not found in wishlist' });
  });

  it('should return 404 if the product does not exist', async () => {
    const mockProduct = null;
    Wishlist.findOne.mockResolvedValueOnce({ products: ['someProductId'] });
    Product.findById.mockResolvedValueOnce(mockProduct);

    const req = { user: { userId: 'someUserId' }, body: { productId: 'someProductId' } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await moveToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product does not exists!' });
  });

  it('should move the item to the cart successfully', async () => {
    const mockProduct = {
      _id: 'someProductId',
      price: 50,
    };
    Wishlist.findOne.mockResolvedValueOnce({ userId: 'someUserId', products: ['someProductId'] });
    Product.findById.mockResolvedValueOnce(mockProduct);
    Cart.findOne.mockResolvedValueOnce(null);

    const req = { user: { userId: 'someUserId' }, body: { productId: 'someProductId' } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await moveToCart(req, res);

    expect(Cart.findOne).toHaveBeenCalledWith({ userId: 'someUserId' });
    expect(Cart).toHaveBeenCalledWith({
      userId: 'someUserId',
      items: [{ productId: 'someProductId', quantity: 1 }],
      totalPrice: 50,
      totalItems: 1,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Item moved to cart successfully' });
  });

  it('should update the existing cart if it exists', async () => {
    const mockProduct = {
      _id: 'someProductId',
      price: 50,
    };
    const mockExistingCart = {
      userId: 'someUserId',
      items: [{ productId: 'existingProductId', quantity: 2 }],
      totalPrice: 100,
      totalItems: 2,
    };
    Wishlist.findOne.mockResolvedValueOnce({ userId: 'someUserId', products: ['someProductId'] });
    Product.findById.mockResolvedValueOnce(mockProduct);
    Cart.findOne.mockResolvedValueOnce(mockExistingCart);

    const req = { user: { userId: 'someUserId' }, body: { productId: 'someProductId' } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await moveToCart(req, res);

    expect(Cart.findOne).toHaveBeenCalledWith({ userId: 'someUserId' });
    expect(Cart).toHaveBeenCalledWith({
      userId: 'someUserId',
      items: [
        { productId: 'existingProductId', quantity: 2 },
        { productId: 'someProductId', quantity: 1 },
      ],
      totalPrice: 150, // (2 * 50) + (1 * 50)
      totalItems: 3, // 2 + 1
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Item moved to cart successfully' });
  });

  it('should handle errors and return 500 for internal server error', async () => {
    Wishlist.findOne.mockRejectedValueOnce(new Error('Internal Server Error'));

    const req = { user: { userId: 'someUserId' }, body: { productId: 'someProductId' } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await moveToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'There was an error while moving items to cart!' });
  });
});