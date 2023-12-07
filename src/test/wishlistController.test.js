const { getWishlist } = require('../controller/wishlistController');
const Wishlist = require('../model/Wishlist');

jest.mock('../model/Wishlist');

describe('getWishlist function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get user wishlist successfully when wishlist is not empty', async () => {
    const userId = 'someUserId';

    const req = {
      user: {
        userId,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const userWishlistMock = {
      _id: 'someWishlistId',
      userId,
      products: ['productId1', 'productId2'],
      populate: jest.fn().mockResolvedValue({
        _id: 'someWishlistId',
        userId,
        products: [
          { _id: 'productId1', title: 'Product 1', price: 29.99 },
          { _id: 'productId2', title: 'Product 2', price: 39.99 },
        ],
      }),
    };

    Wishlist.findOne.mockResolvedValue(userWishlistMock);

    await getWishlist(req, res);

    expect(Wishlist.findOne).toHaveBeenCalledWith({ userId });
    expect(userWishlistMock.populate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'Wishlist Found',
      wishlist: {
        _id: 'someWishlistId',
        userId,
        products: [
          { _id: 'productId1', title: 'Product 1', price: 29.99 },
          { _id: 'productId2', title: 'Product 2', price: 39.99 },
        ],
      },
    });
  });

  it('should handle an empty wishlist with a 200 status', async () => {
    const userId = 'someUserId';
  
    const req = {
      user: {
        userId,
      },
    };
  
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  
    const emptyWishlistMock = {
      _id: 'someWishlistId',
      userId,
      products: [],
      populate: jest.fn().mockResolvedValue({
        _id: 'someWishlistId',
        userId,
        products: [],
      }),
    };
  
    Wishlist.findOne.mockResolvedValue(emptyWishlistMock);
  
    await getWishlist(req, res);
  
    expect(Wishlist.findOne).toHaveBeenCalledWith({ userId });
    // Fix: Ensure that populate is called on the mocked object
    expect(emptyWishlistMock.populate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'Your wishlist is empty.',
    });
  });
});
