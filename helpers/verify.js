module.exports = {
  isAdmin: (req, res, next) => {
    const role = req.cookies.role;
    if (!role) {
      return res.status(403).send({ error: "Cookie not found" });
    } else {
      if (role !== "admin") {
        return res.status(403).send({ error: "Unauthorized" });
      }

      next();
    }
  },
  isEmployee: (req, res, next) => {
    const role = req.cookies.role;
    if (!role) {
      return res.status(403).send({ error: "Cookie not found" });
    } else {
      if (role !== "employee") {
        return res.status(403).send({ error: "Unauthorized" });
      }

      next();
    }
  },
  isUser: (req, res, next) => {
    const role = req.cookies.role;
    if (!role) {
      return res.status(403).send({ error: "Cookie not found" });
    } else {
      if (role !== "user") {
        return res.status(403).send({ error: "Unauthorized" });
      }

      next();
    }
  },
  isSuperAdmin: (req, res, next) => {
    const role = req.cookies.role;
    if (!role) {
      return res.status(403).send({ error: "Cookie not found" });
    } else {
      if (role !== "super admin") {
        return res.status(403).send({ error: "Unauthorized" });
      }

      next();
    }
  },
};
