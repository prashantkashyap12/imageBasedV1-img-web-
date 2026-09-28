// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const secretKey = "omrscanner";

// const authMiddleware = async (req, res, next) => {
//   const { token } = req.headers;
//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Unauthorized - Token Not Provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, secretKey);
//     const user = await User.findOne({
//       where: { id: decoded.userId, email: decoded.email, role: decoded.role },
//     });
//     // console.log(user.id, "------------------");
//     if (!user) {
//       // return res.status(500).json({ message: "user not found", status: false });
//       return res.status(401).json({ message: "Unauthorized - Invalid User" });
//     }
//     req.user = user;
//     req.permissions = user.permissions;
//     req.role = user.role;
//     req.userId = user.id;
//     console.log( typeof req.permissions)
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Unauthorized - Invalid Token" });
//   }
// };

// module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const secretKey = "omrscanner";

const STATIC_TOKEN = "abc123xyz";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;

  console.log("Incoming token:", token); // 👈 debug

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  //  STATIC TOKEN CHECK
  if (token === STATIC_TOKEN) {
    console.log("Static token matched ");

    req.user = { id: 0, role: "Admin" }; 
    return next();
  }

  //  Normal JWT flow
  try {
    const decoded = jwt.verify(token, secretKey);

    const user = await User.findOne({
      where: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;