const admin = require("firebase-admin");
admin.initializeApp();

module.exports = function (allowedRoles = []) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;

      // Role-based access control
      if (!allowedRoles.includes(decodedToken.role)) {
        return res.status(403).send({ error: "Forbidden" });
      }

      next(); // Proceed to the next middleware or route
    } catch (error) {
      return res.status(401).send({ error: "Invalid token" });
    }
  };
};
