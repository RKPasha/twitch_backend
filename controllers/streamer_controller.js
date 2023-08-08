const pool = require('../config/connect_db');
const promisePool = pool.promise();

class StreamerController {

    // Add a streamer
    async addStreamer(req, res) {
        try {
            const { streamer_url, streaming_key } = req.body;

            if (!streamer_url || !streaming_key) {
                return res.status(400).json({ error: 'Streamer URL and streamer key are required' });
            }

            const sql = 'INSERT INTO streamers (streamer_url, streaming_key) VALUES (?, ?)';
            const result = await promisePool.query(sql, [streamer_url, streaming_key]);
            res.json({ message: 'Streamer added successfully', insertedId: result[0].insertId });
        } catch (error) {
            console.error('Error adding streamer:', error);
            res.status(500).json({ error: 'Failed to add streamer' });
        }
    }

    // Edit a streamer by ID
    async editStreamer(req, res) {
        try {
            const streamerId = req.params.id;
            const { streamer_url, streaming_key } = req.body;

            if (!streamer_url || !streaming_key) {
                return res.status(400).json({ error: 'Streamer URL and streamer key are required' });
            }

            const sql = 'UPDATE streamers SET streamer_url = ?, streaming_key = ? WHERE sid = ?';
            const result = await promisePool.query(sql, [streamer_url, streaming_key, streamerId]);
            res.json({ message: 'Streamer updated successfully', affectedRows: result[0].affectedRows });
        } catch (error) {
            console.error('Error updating streamer:', error);
            res.status(500).json({ error: 'Failed to update streamer' });
        }
    }

    // Delete a streamer by ID
    async deleteStreamer(req, res) {
        try {
            const streamerId = req.params.id;
            const sql = 'DELETE FROM streamers WHERE sid = ?';
            const result = await promisePool.query(sql, [streamerId]);
            res.json({ message: 'Streamer deleted successfully', affectedRows: result[0].affectedRows });
        } catch (error) {
            console.error('Error deleting streamer:', error);
            res.status(500).json({ error: 'Failed to delete streamer' });
        }
    }

    // Get a streamer by ID
    async getStreamerById(req, res) {
        try {
            const streamerId = req.params.id;
            const sql = 'SELECT * FROM streamers WHERE sid = ?';
            const [rows] = await promisePool.query(sql, [streamerId]);
            if (rows.length === 0) {
                res.status(404).json({ error: 'Streamer not found' });
            } else {
                res.json(rows[0]);
            }
        } catch (error) {
            console.error('Error getting streamer:', error);
            res.status(500).json({ error: 'Failed to get streamer' });
        }
    }

    // Get all streamers
    async getStreamers(req, res) {
        try {
            const sql = 'SELECT * FROM streamers';
            const [rows] = await promisePool.query(sql);
            res.json(rows);
        } catch (error) {
            console.error('Error getting streamers:', error);
            res.status(500).json({ error: 'Failed to get streamers' });
        }
    }

}

module.exports = new StreamerController();
