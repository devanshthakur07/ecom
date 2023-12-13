const mongoose = require('mongoose');
const { createOrder, getOrderById, updateOrderStatus, cancelOrder } = require('../controller/orderController'); 
const Order = require('../model/Order');
const Cart = require('../model/Cart');
const Product = require('../model/Product');
jest.mock('../model/Order');
jest.mock('../model/Cart');
jest.mock('../model/Product');


describe('getting order by id', ()=> {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if order not found', async() => {
    const req = {
      params: 'someOrderId',
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Order.findById.mockResolvedValue(null);

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Order not found' 
    });

  });

  it('should return 200 if order is found', async() => {
    const req = {
      params: {
        id: 'orderId'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const orderMock = {
      _id: 'orderId',
      userId: 'mockUserId',
      items: [
        {
          productId: 'orderProduct1',
          quantity: 5
        }
      ],
      totalPrice: 500,
      totalQuantity: 5,
      status: 'Delivered',
      address: "Kharar, Punjab",
      createdAt: "2023-12-06T17:08:56.800Z",
      updatedAt: "2023-12-13T06:31:55.505Z",
      populate: jest.fn().mockResolvedValue({
        _id: 'orderId',
        userId: 'mockUserId',
        items: [
          {
            productId: {
                _id: "orderProduct1",
                title: "mock product",
                description: "Mock desc",
                price: 100,
                brand: "mock",
                stock: 200,
                category: "mock ctg",
                __v: 0,
              },
            quantity: 5,
            _id: '6570abb5bd6f6395980b14ec'
          }
        ],
        totalPrice: 500,
        totalQuantity: 5,
        status: 'Shipped',
        address: "Kharar, Punjab",
        createdAt: "2023-12-06T17:08:56.800Z",
        updatedAt: "2023-12-13T06:31:55.505Z",
      })
    }

    Order.findById.mockResolvedValue(orderMock);

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true, 
      order: orderMock 
    });
  })

  it('should return 500 if some error occurs', async() => {
    const req = {
      params: {
        id: 'notThatId'
      },
      body: {
        status: 'Shipped'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const generateError = new Error('error in getting detail');
    Order.findById.mockRejectedValue(generateError);

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'There was some error getting your order'
    });

  });

})


describe('updating order status', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if order not found', async() => {
    const req = {
      params: 'someOrderId',
      body: {
        status: 'Shipped'
      }
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Order.findById.mockResolvedValue(null);

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Order not found' 
    });

  });

  it('should successfully update the status of the order', async() => {
    const req = {
      params: 'someOrderId',
      body: {
        status: 'Shipped'
      }
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const orderMock = {
      _id: 'someOrderId',
      userId: 'mockUserId',
      items: [
        {
          productId: 'orderProduct1',
          quantity: 5
        }
      ],
      totalPrice: 500,
      totalQuantity: 5,
      status: 'Pending',
      address: "Kharar, Punjab",
      createdAt: "2023-12-06T17:08:56.800Z",
      updatedAt: "2023-12-13T06:31:55.505Z",
      save: jest.fn().mockResolvedValue({
        _id: 'orderId',
        userId: 'mockUserId',
        items: [
          {
            productId: 'orderProduct1',
            quantity: 5
          }
        ],
        totalPrice: 500,
        totalQuantity: 5,
        status: 'Shipped',
        address: "Kharar, Punjab",
        createdAt: "2023-12-06T17:08:56.800Z",
        updatedAt: "2023-12-13T06:31:55.505Z",
      })
    };



    Order.findById.mockResolvedValue(orderMock);


    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Order status updated successfully',
      order: orderMock
    });
  });
  it('should return 500 if some error occurs', async() => {
    const req = {
      params: {
        id: 'notThatId'
      },
      body: {
        status: 'Shipped'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const generateError = new Error('error in updating status');
    Order.findById.mockRejectedValue(generateError);

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'There was some error while updating the status of your order.'
    });

  });
})



describe('cancel order', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if order not found', async() => {
    const req = {
      params: {
        id: 'notThatId'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const orderMock = {
      _id: 'orderId',
      userId: 'mockUserId',
      items: [
        {
          productId: 'orderProduct1',
          quantity: 5
        }
      ],
      totalPrice: 500,
      totalQuantity: 5,
      status: 'Pending',
      address: "Kharar, Punjab",
      createdAt: "2023-12-06T17:08:56.800Z",
      updatedAt: "2023-12-13T06:31:55.505Z"
    }

    Order.findById.mockResolvedValue(null);

    await cancelOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false, 
      message: 'Order not found' 
    });

  });

  it('should return 400 if order is not Pending', async() => {
    const req = {
      params: {
        id: 'orderId'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const orderMock = {
      _id: 'orderId',
      userId: 'mockUserId',
      items: [
        {
          productId: 'orderProduct1',
          quantity: 5
        }
      ],
      totalPrice: 500,
      totalQuantity: 5,
      status: 'Delivered',
      address: "Kharar, Punjab",
      createdAt: "2023-12-06T17:08:56.800Z",
      updatedAt: "2023-12-13T06:31:55.505Z"
    }

    Order.findById.mockResolvedValue(orderMock);

    await cancelOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false, 
      message: 'Cannot cancel order with status Delivered' 
    });
  })

  it('should return 404 if product not found', async() => {
    const req = {
      params: {
        id: 'orderId'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const orderMock = {
      _id: 'orderId',
      userId: 'mockUserId',
      items: [
        {
          productId: 'orderProduct1',
          quantity: 5
        }
      ],
      totalPrice: 500,
      totalQuantity: 5,
      status: 'Pending',
      address: "Kharar, Punjab",
      createdAt: "2023-12-06T17:08:56.800Z",
      updatedAt: "2023-12-13T06:31:55.505Z"
    }

    Order.findById.mockResolvedValue(orderMock);

    Product.findById.mockResolvedValue(null);

    await cancelOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Product with ID orderProduct1 not found'
    });
  })

  it('should successfully update the status to cancel the order', async() => {
    const req = {
      params: {
        id: 'orderId'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const orderMock = {
      _id: 'orderId',
      userId: 'mockUserId',
      items: [
        {
          productId: 'orderProduct1',
          quantity: 5
        }
      ],
      totalPrice: 500,
      totalQuantity: 5,
      status: 'Pending',
      address: "Kharar, Punjab",
      createdAt: "2023-12-06T17:08:56.800Z",
      updatedAt: "2023-12-13T06:31:55.505Z",
      save: jest.fn().mockResolvedValue({
        _id: 'orderId',
        userId: 'mockUserId',
        items: [
          {
            productId: 'orderProduct1',
            quantity: 5
          }
        ],
        totalPrice: 500,
        totalQuantity: 5,
        status: 'Canceled',
        address: "Kharar, Punjab",
        createdAt: "2023-12-06T17:08:56.800Z",
        updatedAt: "2023-12-13T06:31:55.505Z",
      })
    };

    const itemMock = {
      _id: 'orderProduct1',
      title: 'product 1',
      description: 'desc product 1',
      price: '100',
      brand: 'mockbrand',
      stock: 100,
      category: 'mock',
      save: jest.fn().mockResolvedValue({
        _id: 'orderProduct1',
      title: 'product 1',
      description: 'desc product 1',
      price: '100',
      brand: 'mockbrand',
      stock: 105,
      category: 'mock',
      })
    }


    Order.findById.mockResolvedValue(orderMock);

    Product.findById.mockResolvedValue(itemMock);

    await cancelOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true, 
      message: 'Order canceled successfully',
      order: orderMock
    });
  });


  it('should return 500 if some error occurs', async() => {
    const req = {
      params: {
        id: 'notThatId'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const generateError = new Error('error in updating status');
    Order.findById.mockRejectedValue(generateError);

    await cancelOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false, 
      error: 'There was an error while canceling the order'
    });

  });
})