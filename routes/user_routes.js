const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const userController = require('../controllers/user_controller');

// const UserController = new UserController();
// Student routes
router.post('/register', userController.register);
// router.put('/account/update/name', authMiddleware, studentController.updateAccountName);
// router.put('/account/update/email', authMiddleware, studentController.updateAccountEmail);
// router.put('/account/update/pass', authMiddleware, studentController.updateAccountPassword);
router.post('/login', userController.login);

module.exports = router;