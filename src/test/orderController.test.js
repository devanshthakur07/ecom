const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { createOrder, getOrderById, cancelOrder } = require('../controller/orderController'); 
const Order = require('../model/Order');

const Cart = require('../model/Cart');
const Product = require('../model/Product');

jest.mock('mongoose');
jest.mock('../model/Order');
jest.mock('../model/Cart');
jest.mock('../model/Product');
describe('Order Controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  

  it('should handle invalid order ID', async () => {
    const mockReq = {
      params: {
        orderId: 'invalidOrderId',
      },
    };
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    mongoose.Types.ObjectId.isValid.mockReturnValue(false);

    await getOrderById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid order ID',
    });
  });

  
  it('should handle internal server error', async () => {
    const mockReq = {
      params: {
        orderId: 'errorOrderId',
      },
    };
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    mongoose.Types.ObjectId.isValid.mockImplementation(() => {
      throw new Error('Some internal error');
    });

    await getOrderById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'There was some error getting product IDs',
    });
  });
});

describe('getOrderById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get order by valid ID', async () => {
    const validOrderId = new ObjectId();
    const req = { params: { orderId: validOrderId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockOrder = {
      _id: validOrderId,
      userId: new ObjectId(),
      items: [{ productId: new ObjectId(), quantity: 2 }],
      totalPrice: 100,
      totalItems: 1,
      status: 'Pending',
      address: '123 Main St',
    };

    Order.findById = jest.fn().mockResolvedValueOnce(mockOrder);

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, order: mockOrder });
  });

  it('should handle invalid order ID', async () => {
    const invalidOrderId = 'invalidID';
    const req = { params: { orderId: invalidOrderId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid order ID' });
  });

  it('should handle order not found', async () => {
    const nonExistentOrderId = new ObjectId();
    const req = { params: { orderId: nonExistentOrderId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(Order, 'findById').mockResolvedValueOnce(null);

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
  });

  it('should handle internal server error', async () => {
    const validOrderId = new ObjectId();
    const req = { params: { orderId: validOrderId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = 'There was some error getting product IDs';

    jest.spyOn(Order, 'findById').mockRejectedValueOnce(new Error(errorMessage));

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: errorMessage });
  });
});





describe('createOrder', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      user: { userId: 'user123' },
      body: { address: 'Test Address' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Reset mocks for each test
    Cart.findOne.mockReset();
    Product.findById.mockReset();
    Product.prototype.save.mockReset();
    Cart.findByIdAndDelete.mockReset();
    Order.prototype.save.mockReset();
  });

  it('should create an order and update product stock and cart correctly', async () => {
    const mockUserCart = {
      userId: 'user123',
      items: [
        { productId: 'product1', quantity: 2 },
        { productId: 'product2', quantity: 1 },
      ],
      totalPrice: 100,
      totalItems: 3,
    };

    Cart.findOne.mockResolvedValue(mockUserCart);

    Product.findById.mockImplementation((productId) => {
      return Promise.resolve({
        _id: productId,
        stock: 5,
        save: jest.fn(),
      });
    });

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, order: expect.any(Object) }));
    expect(Order.prototype.save).toHaveBeenCalled();
    expect(Product.findById).toHaveBeenCalledTimes(2);
    expect(Product.prototype.save).toHaveBeenCalledTimes(2);
    expect(Cart.findByIdAndDelete).toHaveBeenCalledWith(mockUserCart._id);
  });

  it('should handle case when user cart is not found', async () => {
    Cart.findOne.mockResolvedValue(null);

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cart not found' });
  });

  it('should handle case when product is not found', async () => {
    const mockUserCart = {
      userId: 'user123',
      items: [{ productId: 'product1', quantity: 2 }],
      totalPrice: 50,
      totalItems: 2,
    };

    Cart.findOne.mockResolvedValue(mockUserCart);
    Product.findById.mockResolvedValue(null);

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product with ID product1 not found' });
  });

  it('should handle case when there is insufficient stock for a product', async () => {
    const mockUserCart = {
      userId: 'user123',
      items: [{ productId: 'product1', quantity: 10 }],
      totalPrice: 500,
      totalItems: 10,
    };

    Cart.findOne.mockResolvedValue(mockUserCart);

    Product.findById.mockImplementation((productId) => {
      return Promise.resolve({
        _id: productId,
        stock: 5,
        save: jest.fn(),
      });
    });

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient stock for product with ID product1' });
  });

  it('should handle internal server error', async () => {
    Cart.findOne.mockRejectedValue(new Error('Database error'));

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'There was some error while placing your order.' });
  });
});


// const mockOrderId = mongoose.Types.ObjectId(); // Generate a valid ObjectId
// const mockProductId = mongoose.Types.ObjectId(); // Generate a valid ObjectId

// const mockReq = {
//   params: {
//     orderId: mockOrderId.toString(), // Convert ObjectId to string for testing
//   },
// };

// const mockRes = {
//   status: jest.fn(() => mockRes),
//   json: jest.fn(),
// };

// // Define a mock order for testing
// const mockOrderData = {
//   _id: mockOrderId,
//   userId: mongoose.Types.ObjectId(), // Generate a valid ObjectId for userId
//   items: [
//     {
//       productId: mockProductId,
//       quantity: 2,
//     },
//   ],
//   totalPrice: 39.98,
//   totalItems: 2,
//   status: 'Pending',
//   address: 'Mock Address',
// };

// // Define a mock product for testing
// const mockProductData = {
//   _id: mockProductId,
//   title: 'Mock Product',
//   description: 'Mock Product Description',
//   price: 19.99,
//   brand: 'Mock Brand',
//   stock: 8,
//   category: 'Mock Category',
// };

// beforeEach(() => {
//   // Reset the mock data and mock functions before each test
//   jest.clearAllMocks();
//   jest.resetAllMocks();
// });

// describe('cancelOrder', () => {
//   it('should cancel the order and update product stock', async () => {
//     // Mock Order.findById to return the mock order
//     Order.findById.mockResolvedValue(mockOrderData);

//     // Mock Product.findById to return the mock product
//     Product.findById.mockResolvedValue(mockProductData);

//     // Mock Product.save to do nothing
//     Product.prototype.save.mockResolvedValue();

//     // Call the cancelOrder function
//     await cancelOrder(mockReq, mockRes);

//     // Assertions
//     expect(Order.findById).toHaveBeenCalledWith(mockOrderId);
//     expect(Product.findById).toHaveBeenCalledWith(mockProductId);
//     expect(Product.prototype.save).toHaveBeenCalled();
//     expect(mockRes.status).toHaveBeenCalledWith(200);
//     expect(mockRes.json).toHaveBeenCalledWith({
//       success: true,
//       message: 'Order canceled successfully',
//       order: expect.any(Object),
//     });
//   });

//   it('should return 404 if order is not found', async () => {
//     // Mock Order.findById to return null (order not found)
//     Order.findById.mockResolvedValue(null);

//     // Call the cancelOrder function
//     await cancelOrder(mockReq, mockRes);

//     // Assertions
//     expect(mockRes.status).toHaveBeenCalledWith(404);
//     expect(mockRes.json).toHaveBeenCalledWith({
//       success: false,
//       message: 'Order not found',
//     });
//   });

//   it('should return 400 if order status is not "Pending"', async () => {
//     // Mock Order.findById to return a non-cancelable order
//     Order.findById.mockResolvedValue({
//       ...mockOrderData,
//       status: 'Shipped', // Change status to a non-cancelable status
//     });

//     // Call the cancelOrder function
//     await cancelOrder(mockReq, mockRes);

//     // Assertions
//     expect(mockRes.status).toHaveBeenCalledWith(400);
//     expect(mockRes.json).toHaveBeenCalledWith({
//       success: false,
//       message: 'Cannot cancel order with status Shipped',
//     });
//   });

//   it('should handle errors during cancellation', async () => {
//     // Mock Order.findById to throw an error
//     Order.findById.mockRejectedValue(new Error('Test Error'));

//     // Call the cancelOrder function
//     await cancelOrder(mockReq, mockRes);

//     // Assertions
//     expect(mockRes.status).toHaveBeenCalledWith(500);
//     expect(mockRes.json).toHaveBeenCalledWith({
//       success: false,
//       error: 'There was an error while canceling the order',
//     });
//   });
// });
