const router = require("express").Router();
const store = require("../data/store");

router.post("/login", (req, res) => {
  const { email, password, role } = req.body || {};

  const user = store.users.find(
    (u) => u.email === email && u.password === password && u.role === role
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    token: "token-demo",
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;