import jwt from "jsonwebtoken";

export const userAuth = (req, res, next) => {
  try {
    // ✅ Prefer cookie token, fallback to Bearer
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      const [scheme, authToken] = req.headers.authorization.split(" ");
      if (scheme === "Bearer") {
        token = authToken;
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required: No token provided",
      });
    }

    // ✅ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach userId to request for later use
    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
