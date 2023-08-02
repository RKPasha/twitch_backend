const pool = require('../config/connect_db');
const promisePool = pool.promise();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserController {

    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Check if the email is already registered
            const emailQuery = 'SELECT * FROM users WHERE email = ?';
            const emailValues = [email];
            const [emailResult] = await promisePool.query(emailQuery, emailValues);

            if (emailResult && emailResult.length > 0) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            const saltRounds = 10;
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert the new user
            const insertQuery =
                'INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)';
            const insertValues = [name, email, hashedPassword];
            const [insertResult] = await promisePool.query(insertQuery, insertValues);

            if (!insertResult) {
                return res.status(500).json({ error: 'Failed to register user' });
            }

            // Retrieve the last inserted ID
            const userId = insertResult.insertId;

            res.status(201).json({ message: 'Registration successful', userId });

        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Failed to register user' });
        }
    }


    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Check if the email is registered and account is verified
            const query = 'SELECT * FROM users WHERE email = ?';
            const [result] = await promisePool.query(query, [email]);

            if (result.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify the password
            const user = result[0];
            const passwordMatch = await bcrypt.compare(password, user.passwordHash);

            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const secretKey = process.env.SECRET_KEY;

            // Generate JWT token
            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

            res.json({ message: 'Login successful', token });
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({ error: 'Failed to login user' });
        }
    }
}

module.exports = new UserController();
