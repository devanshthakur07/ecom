const { register, login, forgetPassword, updatePassword, logout, refreshToken } = require('../controller/userController');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');

jest.mock('randomstring');
jest.mock('../model/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');


describe('register function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        name: 'Test User',
        mobile: '1234567890',
        password: 'testpassword',
        isAdmin: false,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedpassword');
    User.create.mockResolvedValue({
      _id: 'someid',
      email: 'test@example.com',
      name: 'Test User',
      mobile: '1234567890',
      isAdmin: false,
    });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'User created successfully',
      data: {
        _id: 'someid',
        email: 'test@example.com',
        name: 'Test User',
        mobile: '1234567890',
        isAdmin: false,
      },
    });
  });

  it('should handle registration error', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        name: 'Test User',
        mobile: '1234567890',
        password: 'testpassword',
        isAdmin: false,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findOne.mockResolvedValue(true); // Mocking a duplicate user
    bcrypt.hash.mockRejectedValue(new Error('Hashing error'));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'User already exists!',
    });
  });
});


describe('login function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login a user successfully', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'testpassword',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const userMock = {
      _id: 'someid',
      email: 'test@example.com',
      password: 'hashedpassword',
      isAdmin: false,
      tokens: [],
    };

    User.findOne.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockedtoken');

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: ' Logged in successfully',
      response: {
        status: 'Logged in',
        token: 'mockedtoken',
        refreshToken: 'mockedtoken',
      }
    });
  });

  it('should handle login error', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'testpassword',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findOne.mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'User does not exists!',
    });
  });

  it('should handle incorrect password', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'testpassword',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const userMock = {
      _id: 'someid',
      email: 'test@example.com',
      password: 'hashedpassword',
      isAdmin: false,
      tokens: [],
    };

    User.findOne.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      message: 'email or password is incorrect',
    });
  });

  it('should handle login error with internal server error', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'testpassword',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findOne.mockRejectedValue(new Error('Database error'));

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      error: 'Database error',
    });
  });
});


describe('forgetPassword function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initiate password reset successfully', async () => {
    const req = {
      body: {
        email: 'test@example.com',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const userDataMock = {
      email: 'test@example.com',
      token: null,
      tokenExp: null,
    };

    User.findOne.mockResolvedValue(userDataMock);
    randomstring.generate.mockReturnValue('mockedrandomstring');
    User.findOneAndUpdate.mockResolvedValue({
      email: 'test@example.com',
      token: 'mockedrandomstring',
      tokenExp: expect.any(Number),
    });

    await forgetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'please check your inbox of mail and reset your password ',
    });
  });

  it('should handle password reset initiation error - user not found', async () => {
    const req = {
      body: {
        email: 'nonexistent@example.com',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findOne.mockResolvedValue(null);

    await forgetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'User does not exists!',
    });
  });

  it('should handle password reset initiation error with internal server error', async () => {
    const req = {
      body: {
        email: 'test@example.com',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findOne.mockRejectedValue(new Error('Database error'));

    await forgetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: 'Database error',
    });
  });
});



describe('updatePassword function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update user password successfully', async () => {
    const req = {
      params: {
        emailToken: 'mockedtoken',
      },
      body: {
        newPassword: 'newpassword',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const tokenDataMock = {
      _id: 'someid',
      token: 'mockedtoken',
      tokenExp: Date.now() + 1000 * 60 * 10, // Token expires in 10 minutes
    };

    User.findOne.mockResolvedValue(tokenDataMock);
    bcrypt.hash.mockResolvedValue('hashednewpassword');
    User.findByIdAndUpdate.mockResolvedValue({
      _id: 'someid',
      email: 'test@example.com',
      password: 'hashednewpassword',
      token: '',
    });

    await updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'User password has been reset',
    });
  });

  it('should handle password update error - token expired or empty', async () => {
    const req = {
      params: {
        emailToken: 'expiredtoken',
      },
      body: {
        newPassword: 'newpassword',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const tokenDataMock = {
      _id: 'someid',
      token: 'expiredtoken',
      tokenExp: Date.now() - 1000, // Token expired in the past
    };

    User.findOne.mockResolvedValue(tokenDataMock);

    await updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'this link has been expired ! Please try again',
    });
  });

  it('should handle password update error - invalid token', async () => {
    const req = {
      params: {
        emailToken: 'invalidtoken',
      },
      body: {
        newPassword: 'newpassword',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findOne.mockResolvedValue(null);

    await updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'token expired or empty',
    });
  });

  it('should handle password update error with internal server error', async () => {
    const req = {
      params: {
        emailToken: 'mockedtoken',
      },
      body: {
        newPassword: 'newpassword',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const tokenDataMock = {
      _id: 'someid',
      token: 'mockedtoken',
      tokenExp: Date.now() + 1000 * 60 * 10, // Token expires in 10 minutes
    };

    User.findOne.mockResolvedValue(tokenDataMock);
    bcrypt.hash.mockRejectedValue(new Error('Hashing error'));

    await updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: 'Hashing error',
    });
  });
});



describe('logout function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should logout user successfully', async () => {
    const req = {
      user: {
        userId: 'someid',
        tokens: [{ token: 'token1' }, { token: 'token2' }],
      },
      get: jest.fn().mockReturnValue('token1'),
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const userMock = {
      _id: 'someid',
      tokens: [{ token: 'token1' }, { token: 'token2' }],
    };

    User.findById.mockResolvedValue(userMock);
    User.findByIdAndUpdate.mockResolvedValue({
      _id: 'someid',
      tokens: [{ token: 'token2' }],
    });

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Logged out successfully!',
    });
  });

  it('should handle logout error with internal server error', async () => {
    const req = {
      user: {
        userId: 'someid',
        tokens: [{ token: 'token1' }, { token: 'token2' }],
      },
      get: jest.fn().mockReturnValue('token1'),
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findById.mockRejectedValue(new Error('Database error'));

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: 'Database error',
    });
  });

  
});


jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));

describe('refreshToken', () => {
  it('should refresh token and return a new token', () => {
    // Arrange
    const req = { body: { refreshToken: 'mockRefreshToken' } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    jwt.verify.mockReturnValue({ userId: 'mockUserId' });
    jwt.sign.mockReturnValue('newMockToken');

    // Act
    refreshToken(req, res);

    // Assert
    expect(jwt.verify).toHaveBeenCalledWith(
      'mockRefreshToken',
      process.env.REF_TOKEN_SECRET
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: 'mockUserId' },
      process.env.JWT_SECRET,
      { expiresIn: '50m' }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'newMockToken' });
  });

  it('should return 404 for invalid request', () => {
    // Arrange
    const req = { body: { refreshToken: '' } };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Act
    refreshToken(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ message: 'Invalid request' });
  });

  it('should return 500 for internal server error', () => {
    // Arrange
    const req = { body: { refreshToken: 'mockRefreshToken' } };
    const res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    jwt.verify.mockImplementation(() => {
      throw new Error('Mocked error');
    });

    // Act
    refreshToken(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Mocked error' });
  });
});
