const { getCartDetails, createCart, updateCart } = require('../controller/cartController'); 
const Cart = require('../model/Cart'); 
const Product = require('../model/Product'); 

jest.mock('../model/Cart'); 
jest.mock('../model/Product');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

describe('getCartDetails', () => {
  test('should return cart details when cart is found', async () => {
    const mockUser = { userId: 'testUserId' };
    const mockCart = {
        userId: new ObjectId('5f5b5b5b5b5b5b5b5b5b5b5b'),
        items: [
          {
            productId: new ObjectId('4f4a4a4a4a4a4a4a4a4a4a4a'),
            quantity: 2,
          },
          {
            productId: new ObjectId('3e3d3d3d3d3d3d3d3d3d3d3d'),
            quantity: 1,
          },
        ],
        totalPrice: 150, 
        totalItems: 3,
      };

    const req = { user: mockUser };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Cart.findOne.mockResolvedValueOnce(mockCart);

    await getCartDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ cart: mockCart });
  });

  test('should return 404 when cart is not found', async () => {
    const mockUser = { userId: 'testUserId' };

    const req = { user: mockUser };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Cart.findOne.mockResolvedValueOnce(null);

    await getCartDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found' });
  });

  test('should return 500 on internal server error', async () => {
    const mockUser = { userId: 'testUserId' };

    const req = { user: mockUser };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Cart.findOne.mockRejectedValueOnce(new Error('Database error'));

    await getCartDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});




describe('createCart', () => {
    test('should create a cart successfully', async () => {
        const mockUserId = 'testUserId';
        const mockItems = [
          { productId: 'product1', quantity: 2 },
          { productId: 'product2', quantity: 1 },
        ];
    
        const mockProduct1 = { _id: 'product1', stock: 5, price: 30 };
        const mockProduct2 = { _id: 'product2', stock: 3, price: 20 };
    
        const req = { user: { userId: mockUserId }, body: { items: mockItems } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
    
        Product.findById.mockImplementation((productId) => {
          const mockProducts = {
            product1: mockProduct1,
            product2: mockProduct2,
          };
    
          return Promise.resolve(mockProducts[productId]);
        });
    
        Cart.prototype.save.mockResolvedValueOnce(); // Assuming save resolves successfully
    
        await createCart(req, res);
    
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Cart created successfully',
          cart: expect.objectContaining({
            userId: mockUserId,
            items: expect.any(Array),
            totalPrice: expect.any(Number),
            totalItems: expect.any(Number),
          }),
        });
    
        // Additional check to ensure the cart property is defined
        expect(res.json.mock.calls[0][0].cart).toBeDefined();
      });

  test('should handle product not found', async () => {
    const mockUserId = 'testUserId';
    const mockItems = [{ productId: 'nonexistentProduct', quantity: 1 }];

    const req = { user: { userId: mockUserId }, body: { items: mockItems } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Product.findById.mockResolvedValueOnce(null); // Simulating product not found

    await createCart(req, res);

    expect(res.status).toHaveBeenCalledWith(500); // You might want to adjust this status code
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

    expect(res.status).toHaveBeenCalledWith(500); // You might want to adjust this status code
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

    // Check if Product.findById was called with the correct arguments
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

    // Check if Product.findById was called with the correct arguments
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

    expect(res.status).toHaveBeenCalledWith(404); // or 400 depending on how you want to handle it
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

    expect(res.status).toHaveBeenCalledWith(409); // or 400 depending on how you want to handle it
    expect(res.json).toHaveBeenCalledWith({
      message: 'Insufficient stock for product with ID mockProductId.',
    });

    // Check if Product.findById was called with the correct arguments
    expect(Product.findById).toHaveBeenCalledWith('mockProductId');
  });
});