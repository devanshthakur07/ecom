const { getCartDetails, createCart, updateCart } = require('../controller/cartController'); 
const Cart = require('../model/Cart'); 
const Product = require('../model/Product'); 

jest.mock('../model/Cart');
jest.mock('../model/Product');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;


describe('getCartDetails', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return cart details when cart is found', async () => {
    // Arrange
    const mockCart = {
      userId: 'mockUserId',
      items: [{ productId: 'mockProductId', quantity: 2 }],
      totalPrice: 10,
      totalItems: 1,
    };
    Cart.findOne = jest.fn().mockResolvedValue(mockCart);
    
    const req = { user: { userId: 'mockUserId' } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Act
    await getCartDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ cart: mockCart });
  });

  it('should return 404 if cart is not found', async () => {
    // Arrange
    Cart.findOne.mockResolvedValue(null);

    const req = { user: { userId: 'nonExistentUserId' } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Act
    await getCartDetails(req, res);

    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found' });
  });

  it('should return 500 on internal server error', async () => {
    // Arrange
    Cart.findOne.mockRejectedValue(new Error('Database error'));

    const req = { user: { userId: 'mockUserId' } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Act
    await getCartDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'There was an error while fetching details from database' });
  });
});


jest.mock('../model/Cart', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock('../model/Product', () =>  ({
  findById: jest.fn(),
}));

describe('createCart', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a cart successfully', async () => {
    // Arrange
    const req = {
      user: { userId: 'mockUserId' },
      body: {
        items: [
          { productId: 'mockProductId1', quantity: 2 },
          { productId: 'mockProductId2', quantity: 1 },
        ],
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Mocking Product model
    Product.findById.mockImplementation((productId) => {
      const products = {
        mockProductId1: { price: 10, stock: 5 },
        mockProductId2: { price: 20, stock: 3 },
      };

      return Promise.resolve(products[productId]);
    });

    Cart.create = jest.fn().mockResolvedValue({
      userId: 'mockUserId',
      items: [{ productId: 'mockProductId1', quantity: 2, price: 10 }],
      totalPrice: 20,
      totalItems: 3,
    });

    // Act
    await createCart(req, res);

    // Assert
    expect(Product.findById).toHaveBeenCalledTimes(2);
    expect(Product.findById).toHaveBeenCalledWith('mockProductId1');
    expect(Product.findById).toHaveBeenCalledWith('mockProductId2');

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Cart created successfully',
      cart: {
        userId: 'mockUserId',
        items: [{ productId: 'mockProductId1', quantity: 2, price: 10 }],
        totalPrice: 20,
        totalItems: 3,
      },
    });
  });

  test('should handle product not found', async () => {
    const mockUserId = 'testUserId';
    const mockItems = [{ productId: 'nonexistentProduct', quantity: 1 }];

    const req = { user: { userId: mockUserId }, body: { items: mockItems } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Product.findById.mockResolvedValueOnce(null); 

    await createCart(req, res);

    expect(res.status).toHaveBeenCalledWith(404); 
    expect(res.json).toHaveBeenCalledWith({ message: 'Product with ID nonexistentProduct not found.' });
  });

  test('should handle insufficient stock', async () => {
    const mockUserId = 'testUserId';
    const mockItems = [{ productId: 'product1', quantity: 10 }];

    const mockProduct1 = { _id: 'product1', stock: 5, price: 30 };

    const req = { user: { userId: mockUserId }, body: { items: mockItems } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Product.findById.mockResolvedValueOnce(mockProduct1);

    await createCart(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient stock for product with ID product1.' });
  });
});




jest.mock('../model/Product', () => ({
  findById: jest.fn(),
}));

jest.mock('../model/Cart', () => ({
  findByIdAndUpdate: jest.fn(),
}));

describe('updateCart controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update the cart successfully', async () => {
    // Mock Product.findById implementation
    Product.findById.mockResolvedValueOnce({
      _id: 'mockProductId',
      price: 10,
      stock: 20,
    });

    // Mock Cart.findByIdAndUpdate implementation
    Cart.findByIdAndUpdate.mockResolvedValueOnce({
      _id: 'mockCartId',
      items: [{ productId: 'mockProductId', quantity: 2 }],
      totalPrice: 20,
      totalItems: 2,
    });

    const req = {
      params: { cartId: 'mockCartId' },
      body: { items: [{ productId: 'mockProductId', quantity: 2 }] },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Cart updated successfully',
      cart: {
        _id: 'mockCartId',
        items: [{ productId: 'mockProductId', quantity: 2 }],
        totalPrice: 20,
        totalItems: 2,
      },
    });


    expect(Product.findById).toHaveBeenCalledWith('mockProductId');

    // Check if Cart.findByIdAndUpdate was called with the correct arguments
    expect(Cart.findByIdAndUpdate).toHaveBeenCalledWith(
      'mockCartId',
      {
        items: [{ productId: 'mockProductId', quantity: 2, price: 10 }],
        totalPrice: 20,
        totalItems: 2,
      },
      { new: true }
    );
  });


  it('should handle internal server error', async () => {
    // Mock Product.findById to throw an error
    Product.findById.mockRejectedValueOnce(new Error('Test error'));

    const req = {
      params: { cartId: 'mockCartId' },
      body: { items: [{ productId: 'mockProductId', quantity: 2 }] },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });

    expect(Product.findById).toHaveBeenCalledWith('mockProductId');
  });
});


describe('updateCart controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle the case where the product is not found', async () => {
    // Mock Product.findById implementation to return null
    Product.findById.mockResolvedValueOnce(null);

    const req = {
      params: { cartId: 'mockCartId' },
      body: { items: [{ productId: 'nonexistentProductId', quantity: 2 }] },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(404); 
    expect(res.json).toHaveBeenCalledWith({
      message: 'Product with ID nonexistentProductId not found.',
    });

    // Check if Product.findById was called with the correct arguments
    expect(Product.findById).toHaveBeenCalledWith('nonexistentProductId');
  });

  it('should handle the case where there is insufficient stock', async () => {
    // Mock Product.findById implementation
    Product.findById.mockResolvedValueOnce({
      _id: 'mockProductId',
      stock: 1,
    });

    const req = {
      params: { cartId: 'mockCartId' },
      body: { items: [{ productId: 'mockProductId', quantity: 2 }] },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(409); 
    expect(res.json).toHaveBeenCalledWith({
      message: 'Insufficient stock for product with ID mockProductId.',
    });

    expect(Product.findById).toHaveBeenCalledWith('mockProductId');
  });
});