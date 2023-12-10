const { createProduct, getProductById, getAllProducts, searchProduct, updateProduct } = require('../controller/productController');
const Product = require('../model/Product');
const { productSchema } = require('../validators/schemaValidation');

jest.mock('../model/Product');
jest.mock('../validators/schemaValidation');

describe('createProduct function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a product successfully', async () => {
    const req = {
      body: {
        name: 'Test Product',
        price: 50.99,
        description: 'A description for the test product',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const validationErrorMock = null;

    productSchema.validate.mockReturnValue({ error: validationErrorMock });
    Product.create.mockResolvedValue({
      _id: 'someid',
      name: 'Test Product',
      price: 50.99,
      description: 'A description for the test product',
    });

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      message: 'Product created successfully!',
      data: {
        _id: 'someid',
        name: 'Test Product',
        price: 50.99,
        description: 'A description for the test product',
      },
    });
  });

  it('should handle product creation error with validation error', async () => {
    const req = {
      body: {
        // Invalid product data to trigger validation error
        name: '',
        price: 'invalidprice',
        description: '',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const validationError = new Error('Validation error');
    validationError.details = [{ message: 'Validation error details' }];

    productSchema.validate.mockReturnValue({ error: validationError });

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Validation error details');
  });

  it('should handle product creation error with internal server error', async () => {
    const req = {
      body: {
        name: 'Test Product',
        price: 50.99,
        description: 'A description for the test product',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const validationErrorMock = null;
    const creationError = new Error('Internal server error');

    productSchema.validate.mockReturnValue({ error: validationErrorMock });
    Product.create.mockRejectedValue(creationError);

    await createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Internal server error',
    });
  });
});



describe('getProductById function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve a product by ID successfully', async () => {
    const req = {
      params: {
        id: 'someid',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const productMock = {
      _id: 'someid',
      name: 'Test Product',
      price: 50.99,
      description: 'A description for the test product',
    };

    Product.findById.mockResolvedValue(productMock);

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      product: {
        _id: 'someid',
        name: 'Test Product',
        price: 50.99,
        description: 'A description for the test product',
      },
    });
  });

  it('should handle product retrieval error with internal server error', async () => {
    const req = {
      params: {
        id: 'nonexistentid',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const retrievalError = new Error('Internal server error');

    Product.findById.mockRejectedValue(retrievalError);

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Internal server error',
    });
  });
});



describe('getAllProducts function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve all products successfully', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const productsMock = [
      {
        _id: 'product1id',
        name: 'Product 1',
        price: 30.99,
        description: 'Description for Product 1',
      },
      {
        _id: 'product2id',
        name: 'Product 2',
        price: 45.99,
        description: 'Description for Product 2',
      },
    ];

    Product.find.mockResolvedValue(productsMock);

    await getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: true,
      products: [
        {
          _id: 'product1id',
          name: 'Product 1',
          price: 30.99,
          description: 'Description for Product 1',
        },
        {
          _id: 'product2id',
          name: 'Product 2',
          price: 45.99,
          description: 'Description for Product 2',
        },
      ],
    });
  });

  it('should handle no products found with a 404 status', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    Product.find.mockResolvedValue(null);

    await getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: 'No products found!',
    });
  });

  it('should handle product retrieval error with internal server error', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const retrievalError = new Error('Internal server error');

    Product.find.mockRejectedValue(retrievalError);

    await getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: false,
      message: 'Internal server error',
    });
  });
});




describe('searchProduct function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should search products successfully', async () => {
    const req = {
      query: {
        searchQuery: 'Test',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const productsMock = [
      {
        _id: 'product1id',
        title: 'Test Product 1',
        brand: 'Brand1',
        category: 'Category1',
      },
      {
        _id: 'product2id',
        title: 'Test Product 2',
        brand: 'Brand2',
        category: 'Category2',
      },
    ];

    Product.find.mockResolvedValue(productsMock);

    await searchProduct(req, res);

    expect(res.json).toHaveBeenCalledWith([
      {
        _id: 'product1id',
        title: 'Test Product 1',
        brand: 'Brand1',
        category: 'Category1',
      },
      {
        _id: 'product2id',
        title: 'Test Product 2',
        brand: 'Brand2',
        category: 'Category2',
      },
    ]);
  });

  it('should handle no products found with a 200 status', async () => {
    const req = {
      query: {
        searchQuery: 'Nonexistent',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Product.find.mockResolvedValue([]);

    await searchProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No products found!',
    });
  });

  it('should handle product search error with internal server error', async () => {
    const req = {
      query: {
        searchQuery: 'Test',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const searchError = new Error('Internal server error');

    Product.find.mockRejectedValue(searchError);

    await searchProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      message: 'Internal server error',
    });
  });
});


describe('updateProduct function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update the product successfully', async () => {
    const productId = 'someProductId';
    const req = {
      params: {
        id: productId,
      },
      body: {
        title: 'Updated Product Title',
        description: 'Updated product description',
        price: 59.99,
        brand: 'Updated Brand',
        stock: 100,
        category: 'Updated Category',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const existingProductMock = {
      _id: productId,
      title: 'Original Product Title',
      description: 'Original product description',
      price: 49.99,
      brand: 'Original Brand',
      stock: 50,
      category: 'Original Category',
      save: jest.fn().mockResolvedValue({
        _id: productId,
        title: 'Updated Product Title',
        description: 'Updated product description',
        price: 59.99,
        brand: 'Updated Brand',
        stock: 100,
        category: 'Updated Category',
      }),
    };

    Product.findById.mockResolvedValue(existingProductMock);

    await updateProduct(req, res);

    expect(Product.findById).toHaveBeenCalledWith(productId);
    expect(existingProductMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      _id: productId,
      title: 'Updated Product Title',
      description: 'Updated product description',
      price: 59.99,
      brand: 'Updated Brand',
      stock: 100,
      category: 'Updated Category',
    });
  });

  it('should handle product not found with a 404 status', async () => {
    const req = {
      params: {
        id: 'nonexistentProductId',
      },
      body: {
        title: 'Updated Product Title',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Product.findById.mockResolvedValue(null);

    await updateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Product not found',
    });
  });

  it('should handle internal server error during update with a 500 status', async () => {
    const productId = 'someProductId';
    const req = {
      params: {
        id: productId,
      },
      body: {
        title: 'Updated Product Title',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const existingProductMock = {
      _id: productId,
      title: 'Original Product Title',
      save: jest.fn().mockRejectedValue(new Error('Internal server error')),
    };

    Product.findById.mockResolvedValue(existingProductMock);

    await updateProduct(req, res);

    expect(Product.findById).toHaveBeenCalledWith(productId);
    expect(existingProductMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
  });
});