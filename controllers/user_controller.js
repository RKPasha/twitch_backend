const pool = require('../config/connect_db');
const promisePool = pool.promise();
const { getUserId } = require('../config/twitch_userId_storage');

class UserController {

    // Add a user along with related data
    async addUser(req, res) {
        try {
            const { username, accessIds, botIds, streamerIds } = req.body;
            const userId = getUserId();

            if (!username) {
                return res.status(400).json({ error: 'Username is required' });
            }

            const connection = await promisePool.getConnection();
            await connection.beginTransaction();

            try {
                const userInsertSql = 'INSERT INTO users (uid, username) VALUES (?,?)';
                await connection.query(userInsertSql, [userId ,username]);


                if (accessIds && accessIds.length > 0) {
                    const userAccessSql = 'INSERT INTO user_access (userId, accessId) VALUES (?, ?)';
                    for (const accessId of accessIds) {
                        await connection.query(userAccessSql, [userId, accessId]);
                    }
                }

                if (botIds && botIds.length > 0) {
                    const userBotSql = 'INSERT INTO user_access_to_bots (userId, botId) VALUES (?, ?)';
                    for (const botId of botIds) {
                        await connection.query(userBotSql, [userId, botId]);
                    }
                }

                if (streamerIds && streamerIds.length > 0) {
                    const userStreamerSql = 'INSERT INTO user_access_to_streamers (userId, streamerId) VALUES (?, ?)';
                    for (const streamerId of streamerIds) {
                        await connection.query(userStreamerSql, [userId, streamerId]);
                    }
                }

                await connection.commit();

                res.json({ message: 'User and related data added successfully', userId: userId });
            } catch (error) {
                await connection.rollback();
                console.error('Error adding user and related data:', error);
                res.status(500).json({ error: 'Failed to add user and related data' });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error adding user:', error);
            res.status(500).json({ error: 'Failed to add user' });
        }
    }

    // Edit a user by ID
    async editUser(req, res) {
        try {
            const userId = req.params.id;
            const { username, accessIds, botIds, streamerIds } = req.body;

            const editUserQuery = 'UPDATE users SET username = ? WHERE uid = ?';
            await promisePool.query(editUserQuery, [username, userId]);

            // Delete existing user access entries
            const deleteAccessQuery = 'DELETE FROM user_access WHERE userId = ?';
            await promisePool.query(deleteAccessQuery, [userId]);

            // Insert new user access entries
            const insertAccessQuery = 'INSERT INTO user_access (userId, accessId) VALUES (?, ?)';
            for (const accessId of accessIds) {
                await promisePool.query(insertAccessQuery, [userId, accessId]);
            }

            // Delete existing user access to bots entries
            const deleteBotAccessQuery = 'DELETE FROM user_access_to_bots WHERE userId = ?';
            await promisePool.query(deleteBotAccessQuery, [userId]);

            // Insert new user access to bots entries
            const insertBotAccessQuery = 'INSERT INTO user_access_to_bots (userId, botId) VALUES (?, ?)';
            for (const botId of botIds) {
                await promisePool.query(insertBotAccessQuery, [userId, botId]);
            }

            // Delete existing user access to streamers entries
            const deleteStreamerAccessQuery = 'DELETE FROM user_access_to_streamers WHERE userId = ?';
            await promisePool.query(deleteStreamerAccessQuery, [userId]);

            // Insert new user access to streamers entries
            const insertStreamerAccessQuery = 'INSERT INTO user_access_to_streamers (userId, streamerId) VALUES (?, ?)';
            for (const streamerId of streamerIds) {
                await promisePool.query(insertStreamerAccessQuery, [userId, streamerId]);
            }

            res.json({ message: 'User updated successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    }

    // Delete a user by ID
    async deleteUser(req, res) {
        try {
            const userId = req.params.id;

            const deleteUserQuery = 'DELETE FROM users WHERE uid = ?';
            await promisePool.query(deleteUserQuery, [userId]);

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }

    // Get a user by ID
    async getUserById(req, res) {
        try {
            const userId = req.params.id;

            const getUserQuery = 'SELECT * FROM users WHERE uid = ?';
            const [rows] = await promisePool.query(getUserQuery, [userId]);

            if (rows.length === 0) {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.json(rows[0]);
            }
        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({ error: 'Failed to get user' });
        }
    }

    // Get all users
    async getAllUsers(req, res) {
        try {
            const getAllUsersQuery = 'SELECT * FROM users';
            const [rows] = await promisePool.query(getAllUsersQuery);

            res.json(rows);
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({ error: 'Failed to get users' });
        }
    }

    // Get a user by ID along with related data
    async getUserWithAccess(req, res) {
        try {
            const userId = req.params.id;

            const getUserQuery = 'SELECT * FROM users WHERE uid = ?';
            const [userRows] = await promisePool.query(getUserQuery, [userId]);

            if (userRows.length === 0) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            const user = userRows[0];

            const getUserAccessQuery = 'SELECT accessId FROM user_access WHERE userId = ?';
            const [accessRows] = await promisePool.query(getUserAccessQuery, [userId]);
            const accessIds = accessRows.map(row => row.accessId);

            const getUserBotAccessQuery = 'SELECT botId FROM user_access_to_bots WHERE userId = ?';
            const [botRows] = await promisePool.query(getUserBotAccessQuery, [userId]);
            const botIds = botRows.map(row => row.botId);

            const getUserStreamerAccessQuery = 'SELECT streamerId FROM user_access_to_streamers WHERE userId = ?';
            const [streamerRows] = await promisePool.query(getUserStreamerAccessQuery, [userId]);
            const streamerIds = streamerRows.map(row => row.streamerId);

            const userWithAccess = {
                user,
                accessIds,
                botIds,
                streamerIds
            };

            res.json(userWithAccess);
        } catch (error) {
            console.error('Error getting user with access:', error);
            res.status(500).json({ error: 'Failed to get user with access' });
        }
    }

}

module.exports = new UserController();
