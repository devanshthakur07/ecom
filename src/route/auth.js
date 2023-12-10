const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {register, login, forgetPassword, updatePassword, logout, refreshToken} = require("../controller/userController");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication operations
 * components:
 *    securitySchemes:
 *     bearerAuth:   
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT  
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       description: User registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               mobile:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *               password:
 *                 type: string
 *             example:
 *               email: user@example.com
 *               name: John Doe
 *               mobile: 1234567890
 *               isAdmin: false
 *               password: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               status: true
 *               message: User created successfully
 *               data:
 *                 email: user@example.com
 *                 name: John Doe
 *                 mobile: 1234567890
 *                 isAdmin: false
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: Validation error message
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: User already exists!
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       description: User login details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: user@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Logged in successfully
 *               response:
 *                 token: JWT Token
 *                 refreshToken: Refresh Token
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation error message
 *       404:
 *         description: User does not exist
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               message: User does not exist
 *       409:
 *         description: Incorrect email or password
 *         content:
 *           application/json:
 *             example:
 *               message: Incorrect email or password
 */

/**
 * @swagger
 * /api/auth/forgotPassword:
 *   post:
 *     summary: Send a reset password email
 *     tags: [Authentication]
 *     requestBody:
 *       description: User email for password reset
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             example:
 *               email: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Please check your email inbox and reset your password
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Error message
 *       404:
 *         description: User does not exist
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User does not exist
 */
/**
 * @swagger
 * /api/auth/resetPassword/{emailToken}:
 *   put:
 *     summary: Reset user password
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: emailToken
 *         required: true
 *         description: Token received in the password reset email
 *         schema:
 *           type: string
 *     requestBody:
 *       description: New password for the user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *             example:
 *               newPassword: newpassword123
 *     responses:
 *       200:
 *         description: User password has been reset
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: User password has been reset
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid token or token expired
 *       404:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid token
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Logged out successfully
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: Error message
 */

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       description: Refresh token for generating a new JWT token
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: refresh_token_here
 *     responses:
 *       200:
 *         description: New JWT token generated successfully
 *         content:
 *           application/json:
 *             example:
 *               token: new_JWT_token_here
 *       404:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid request
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Error message
 */


router.route('/register').post(register);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgetPassword);
router.route('/resetPassword/:emailToken').put(updatePassword);
router.route('/logout').post(authentication, logout);
router.route('/refresh-token').post(refreshToken)


module.exports = router;













