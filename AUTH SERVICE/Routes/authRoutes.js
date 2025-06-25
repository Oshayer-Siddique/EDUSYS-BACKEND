const express = require('express');
const router = express.Router();
const { loginUser } = require('../Controllers/authController');
const { authenticate } = require('../Middleware/authMiddleware');

router.post('/login', loginUser);

// Example protected route
router.get('/verify', authenticate, (req, res) => {
  res.status(200).json({
    message: 'Token is valid',
    user: req.user, // { id, role }
  });
});

module.exports = router;
