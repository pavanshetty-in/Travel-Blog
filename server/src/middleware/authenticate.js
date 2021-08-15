const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const User2 = require("../models/user2Schema");

const Authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken;
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    if (!rootUser) {
      const rootUser2 = await User2.findOne({
        _id: verifyToken._id,
        "tokens.token": token,
      });
      req.token = token;
      req.rootUser = rootUser2;
      req.userID = rootUser2._id;
      next();
    }
    else {
      req.token = token;
      req.rootUser = rootUser;
      req.userID = rootUser._id;
      next();
    }
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
};
module.exports = Authenticate;
