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
};
