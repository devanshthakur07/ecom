const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authValidation } = require("../validators/schemaValidation");
const randomstring = require("randomstring");
const { sendResetPasswordMail } = require("../validators/sendMail");




const register = async (req, res) => {
  try {
    let { email, name, mobile, isAdmin } = req.body;

    const valid = authValidation.validate(req.body);

    if (valid.error) {
      return res.status(400).send(valid.error.details[0].message);
    }
    let duplicateCheck = await User.findOne({ email: email });
    if (duplicateCheck)
      return res.status(409).send({
        status: false, 
        message: "User already exists!" 
      });

    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      email: email,
      password: hashedPassword,
      name,
      mobile,
      isAdmin:isAdmin,
    };
    let savedData = await User.create(user);
    return res.status(201).send({
      status: true,
      message: "User created successfully",
      data: savedData,
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};



///login user

const login = async function (req, res) {

  try {

    const {email, password} = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is mandatory" });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is mandatory"});
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(409).send({
        status: false,
        message: "User does not exists!" 
      });
    }
    let hashPassword = await bcrypt.compare(password, user.password);
    if (!hashPassword) {
      return res.status(409).send({ 
        message: "email or password is incorrect" 
      });
    }
    let token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    let refreshToken = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.REF_TOKEN_SECRET,
      { expiresIn: process.env.REF_TOKEN_EXPIRE }
    );
    const response = {
      status: "Logged in",
      token: token,
      refreshToken: refreshToken,
    };
    let oldTokens = user.tokens || [];
    if (oldTokens.length) {
      oldTokens = oldTokens.filter((t) => {
        if (t.signedAt < Date.now()) {
          return t;
        }
      });
    }
    await User.findByIdAndUpdate(user._id, {
      tokens: [
        ...oldTokens,
        { token, signedAt: new Date(Date.now() + 5 * 60 * 1000) },
      ],
    });
    const userInfo = {
      email: user.email,
    };
    res
      .status(200)
      .send({ 
        success: true,
        message:" Logged in successfully" ,
        response
       });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//refreshToken
const refreshToken = (req, res) => {
  try {
    const postData = req.body;
    if (postData.refreshToken) {
      let decodedToken = jwt.verify(
        postData.refreshToken,
        process.env.REF_TOKEN_SECRET
      );
      const token = jwt.sign(
        { userId: decodedToken.userId },
        process.env.JWT_SECRET,
        { expiresIn: "50m" }
      );
      const response = {
        token: token,
      };
      res.status(200).json(response);
    } else {
      res.status(404).send({message:"Invalid request"});
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// send mail to forget  password
const forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(404).send({
        success: false, 
        message: "User does not exists!" 
      });
    }
    const randomString = randomstring.generate();
    await User.findOneAndUpdate(
        { email },
        {
          $set: {
            token: randomString,
            tokenExp: Math.round(new Date(Date.now() + 10 * 60 * 1000)),
          },
          new: true,
        }
      );
      sendResetPasswordMail(userData.email, randomString);
      res.status(200).send({
          success: true,
          message: "please check your inbox of mail and reset your password ",
      });
  }
  catch (error) {
    res.status(400).send({ 
      success: false, 
      error: error.message 
    });
  }
};

//update new password
const updatePassword = async (req, res) => {
  try {
    const token = req.params.emailToken;
    const tokenData = await User.findOne({ token: token });
    if (!tokenData) {
      return res
        .status(400)
        .send({ success: false, message: "token expired or empty" });
    }
    if (tokenData.tokenExp < Date.now()) {
      return res
        .status(400)
        .send({ success: false, message: "this link has been expired ! Please try again" });
    }
    if (tokenData) {
      const password = req.body.newPassword;
      const newPassword = await bcrypt.hash(password, 10);
      const userData = await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: "" } },
        { new: true }
      );
      return res
        .status(200)
        .send({
          success: true,
          message: "User password has been reset"
        });
    } else {
      res.status(400).send({ success: false, message: "invalid token " });
    }
  } catch (error) {
    return res.status(400).send({ success: false, error: error.message });
  }
};

///logout
const logout = async (req, res) => {
  let userId = req.user.userId;
  try {
    let token = req.get("authorization");
    const tokens = req.user.tokens;

    let user = await User.findById(userId);
    const newTokens = user.tokens.filter((t) => t.token !== token);

    await User.findByIdAndUpdate(
      userId,
      { tokens: newTokens },
      { new: true }
    );

    return res.status(200).send({ 
      success: true, 
      message: "Logged out successfully!" 
    });
  } 
  catch (error) {
    return res.status(500).send({ success: false, error: error.message });
  }
};

module.exports = {
  register,
  login,
  updatePassword,
  forgetPassword,
  logout,
  refreshToken,
};
