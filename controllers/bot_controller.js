const pool = require('../config/connect_db');
const promisePool = pool.promise();

class BotController {
    // Add a bot
    async addBot(req, res) {
        try {
            const { name, description, image_path } = req.body;
            const sql = 'INSERT INTO bots (name, description, image_path) VALUES (?, ?, ?)';
            const result = await promisePool.query(sql, [name, description, image_path]);
            res.json({ message: 'Bot added successfully', insertedId: result[0].insertId });
        } catch (error) {
            console.error('Error adding bot:', error);
            res.status(500).json({ error: 'Failed to add bot' });
        }
    }

    // Edit a bot by ID
    async editBot(req, res) {
        try {
            const botId = req.params.id;
            const { name, description, image_path } = req.body;
            const sql = 'UPDATE bots SET name = ?, description = ?, image_path = ? WHERE bid = ?';
            const result = await promisePool.query(sql, [name, description, image_path, botId]);
            res.json({ message: 'Bot updated successfully', affectedRows: result[0].affectedRows });
        } catch (error) {
            console.error('Error updating bot:', error);
            res.status(500).json({ error: 'Failed to update bot' });
        }
    }

    // Delete a bot by ID
    async deleteBot(req, res) {
        try {
            const botId = req.params.id;
            const sql = 'DELETE FROM bots WHERE bid = ?';
            const result = await promisePool.query(sql, [botId]);
            res.json({ message: 'Bot deleted successfully', affectedRows: result[0].affectedRows });
        } catch (error) {
            console.error('Error deleting bot:', error);
            res.status(500).json({ error: 'Failed to delete bot' });
        }
    }

    // Get a bot by ID
    async getBotById(req, res) {
        try {
            const botId = req.params.id;
            const sql = 'SELECT * FROM bots WHERE bid = ?';
            const [rows] = await promisePool.query(sql, [botId]);
            if (rows.length === 0) {
                res.status(404).json({ error: 'Bot not found' });
            } else {
                res.json(rows[0]);
            }
        } catch (error) {
            console.error('Error getting bot:', error);
            res.status(500).json({ error: 'Failed to get bot' });
        }
    }


    // Get all bots
    async getBots(req, res) {
        try {
            const sql = 'SELECT * FROM bots';
            const [rows] = await promisePool.query(sql);
            res.json(rows);
        } catch (error) {
            console.error('Error getting bots:', error);
            res.status(500).json({ error: 'Failed to get bots' });
        }
    };
}
module.exports = new BotController();