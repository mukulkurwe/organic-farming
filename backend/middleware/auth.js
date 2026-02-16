// backend/middleware/auth.js
import jwt from "jsonwebtoken";

/* ============================
   AUTHENTICATION MIDDLEWARE
============================ */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        ok: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        ok: false,
        message: "Token expired",
      });
    }

    console.error("AUTH MIDDLEWARE ERROR:", error);
    res.status(500).json({
      ok: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

/* ============================
   ROLE-BASED AUTHORIZATION
============================ */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};
