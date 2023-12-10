const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { getOrderById } = require('../controller/orderController'); // Adjust the path accordingly
const Order = require('../model/Order'); // Adjust the path accordingly

jest.mock('mongoose');
jest.mock('../model/Order');
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

// describe('getOrderById', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should get order by valid ID', async () => {
//     const validOrderId = new ObjectId();
//     const req = { params: { orderId: validOrderId } };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     const mockOrder = {
//       _id: validOrderId,
//       userId: new ObjectId(),
//       items: [{ productId: new ObjectId(), quantity: 2 }],
//       totalPrice: 100,
//       totalItems: 1,
//       status: 'Pending',
//       address: '123 Main St',
//     };

//     jest.spyOn(Order, 'findById').mockResolvedValueOnce(mockOrder);

//     await getOrderById(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({ success: true, order: mockOrder });
//   });

//   it('should handle invalid order ID', async () => {
//     const invalidOrderId = 'invalidID';
//     const req = { params: { orderId: invalidOrderId } };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await getOrderById(req, res);

//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid order ID' });
//   });

//   it('should handle order not found', async () => {
//     const nonExistentOrderId = new ObjectId();
//     const req = { params: { orderId: nonExistentOrderId } };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     jest.spyOn(Order, 'findById').mockResolvedValueOnce(null);

//     await getOrderById(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
//   });

//   it('should handle internal server error', async () => {
//     const validOrderId = new ObjectId();
//     const req = { params: { orderId: validOrderId } };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     const errorMessage = 'There was some error getting product IDs';

//     jest.spyOn(Order, 'findById').mockRejectedValueOnce(new Error(errorMessage));

//     await getOrderById(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({ success: false, error: errorMessage });
//   });
// });