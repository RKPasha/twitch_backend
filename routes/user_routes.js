const express = require('express');
const router = express.Router();
const validateTwitchUsername = require('../twitchUsernameMiddleware');
const userController = require('../controllers/user_controller');

// Add a user and related data
router.post('/addUser', validateTwitchUsername, userController.addUser);
router.patch('/editUser/:id', validateTwitchUsername, userController.editUser);
router.delete('/deleteUser/:id', userController.deleteUser);
router.get('/getUserById/:id', userController.getUserById);
router.get('/', userController.getAllUsers);
router.get('/getUserWithAccess/:id', userController.getUserWithAccess);

module.exports = router;