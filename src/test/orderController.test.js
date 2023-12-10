const mongoose = require('mongoose');
const { mocked } = require('ts-jest');
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
      error: 'Internal Server Error',
    });
  });
});
