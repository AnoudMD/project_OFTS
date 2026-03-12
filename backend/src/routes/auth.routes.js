const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
router.post('/register', async (req, res) => {
try {
const { name, email, password, role } = req.body;
const exists = await User.findOne({ email });
if (exists) return res.status(400).json({ message: 'Email already exists' });
const user = await User.create({ name, email, password, role });
res.status(201).json({ message: 'User created', userId: user._id });
} catch (error) {
res.status(500).json({ message: error.message });
}
});
router.post('/login', async (req, res) => {
try {
const { email, password, role } = req.body;
const user = await User.findOne({ email });
if (!user) return res.status(400).json({ message: 'Invalid credentials' });
const ok = await user.comparePassword(password);
if (!ok || user.role !== role) {
return res.status(400).json({ message: 'Invalid credentials or role' });
}
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
expiresIn: '7d' });
res.json({
token,
user: {
id: user._id,
name: user.name,
email: user.email,
role: user.role,
},
});
} catch (error) {
res.status(500).json({ message: error.message });
}
});
module.exports = router;