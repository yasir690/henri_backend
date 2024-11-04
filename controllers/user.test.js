const request = require("supertest");
const app = require("../index");
const userModel = require("../model/user");
const bcrypt = require("bcryptjs");
const { getUserTeamMates } = require('../controllers/user');
// const {getUsersFans}=require('../controllers/user');
const controller = require('../controllers/user');

// const { loggerError, loggerInfo } = require('../utils/log'); // Replace the path with the actual path to your logger file
const { findById } = require('../model/user');

//user register test case

describe("POST /register", () => {
  beforeEach(() => {
    // Clear user collection before each test
    return userModel.deleteMany({});
  });

  afterAll(() => {
    // Close the server connection after running the tests
    return app.close();
  });

  it("should register a new user and return success response", async () => {
    const userData = {
      userEmail: "test@example.com",
      userName: "Test User",
      userPassword: "password123",
      isSocial: false,
    };

    const response = await request(app).post("/register").send(userData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.message).toBe("User saved successfully");
  });

  it("should return an error if user email already exists", async () => {
    // Insert a user with the same email
    await userModel.create({
      userEmail: "existing@example.com",
      userName: "Existing User",
      userPassword: "password123",
    });

    const userData = {
      userEmail: "existing@example.com",
      userName: "New User",
      userPassword: "password456",
      isSocial: false,
    };

    const response = await request(app).post("/register").send(userData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("user email already exist");
  });

  // Add more test cases for different scenarios

  // ...
});

//user login test case

describe("POST /login", () => {
  beforeAll(async () => {
    // Insert a user for testing
    await userModel.create({
      userEmail: "test@example.com",
      userName: "Test User",
      userPassword: bcrypt.hashSync("password123", 8),
    });
  });

  afterAll(() => {
    // Close the server connection after running the tests
    return app.close();
  });

  it("should login a user with correct credentials and return success response", async () => {
    const userData = {
      userEmail: "test@example.com",
      userPassword: "password123",
    };

    const response = await request(app).post("/login").send(userData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.message).toBe("login successfully");
  });

  it("should return an error if user is not found", async () => {
    const userData = {
      userEmail: "nonexistent@example.com",
      userPassword: "password123",
    };

    const response = await request(app).post("/login").send(userData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("user not found");
  });

  it("should return an error if password is incorrect", async () => {
    const userData = {
      userEmail: "test@example.com",
      userPassword: "incorrectpassword",
    };

    const response = await request(app).post("/login").send(userData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("login failed");
  });

  // Add more test cases for different scenarios

  // ...
});

//get user by id test case

describe('GET /getUserByUserID/:id', () => {
  it('should get user by ID successfully', async () => {
    // Create a mock user
    const user = {
      _id: 'user_id',
      userName: 'john_doe',
      userEmail: 'john@example.com',
      // ... other user properties
    };

    // Mock the userModel.findById method to return the mock user
    userModel.findById = jest.fn().mockResolvedValue(user);

    // Make a GET request to the getUserByUserID endpoint
    const response = await request(app).get('/getUserByUserID/user_id');

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('success');
    expect(response.body.data).toEqual({
      _id: 'user_id',
      userName: 'john_doe',
      userEmail: 'john@example.com',
      // ... other user properties
    });
  });

  it('should return user not found if user is not found', async () => {
    // Mock the userModel.findById method to return null (user not found)
    userModel.findById = jest.fn().mockResolvedValue(null);

    // Make a GET request to the getUserByUserID endpoint
    const response = await request(app).get('/getUserByUserID/non_existent_id');

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('user not found');
  });
});

//get user teammates test case

describe("GET /getUserTeamMates", () => {
  it("should get user teammates successfully", async () => {
    // Mock the req and res objects
    const req = {
      user: {
        user_id: "user_id",
      },
      body: {
        userName: "john_doe",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the userModel.findById method to return a mock user with followers and following
    const mockUser = {
      _id: "user_id",
      userFollowers: [
        { userName: "teammate1" },
        { userName: "teammate2" },
        { userName: "teammate3" },
      ],
      userFollowing: [
        { userName: "teammate2" },
        { userName: "teammate3" },
        { userName: "teammate4" },
      ],
    };
    userModel.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUser),
    });

    // Call the getUserTeamMates function
    await getUserTeamMates(req, res);

    // Assertions
    expect(userModel.findById).toHaveBeenCalledWith("user_id");
    expect(userModel.findById().populate).toHaveBeenCalledWith([
      "userFollowers",
      "userFollowing",
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "success",
      success: true,
      data: [
        { userName: "teammate2" },
        { userName: "teammate3" },
      ],
    });
  });
 
});


//get user fans test case

jest.mock('../model/user');

describe('GET /getUsersFans', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should handle internal server error', async () => {
    const req = {
      user: { user_id: '646f91eb1ddeed0f7cf1bb57' },
    };

    const errorMessage = 'An unexpected error occurred';

    userModel.findById.mockRejectedValue(new Error(errorMessage));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.getUsersFans(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
    });
  });
});


