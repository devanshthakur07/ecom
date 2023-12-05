const express = require("express");
const router = express.Router();
const {authentication} = require("../middleware/auth");
const {register, login, forgetPassword, updatePassword, logout, refreshToken} = require("../controller/userController");

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgetPassword);
router.route('/resetPassword/:emailToken').put(updatePassword);
router.route('/logout').post(authentication, logout);
router.route('/refresh-token').post(refreshToken)


module.exports = router;













