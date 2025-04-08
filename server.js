require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const authController = require('./controllers/authController');
const lolAccountController = require('./controllers/lolAccountController');
const championController = require('./controllers/championController');
const matchHistoryController = require('./controllers/matchHistoryController');
const { pool } = require('./db');  // Import from db.js

const app = express();
const port = process.env.PORT || 3000;

// Test the connection 
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL Database');
    connection.release();
  } catch (error) {
    console.error('Unable to connect to MySQL Database:', error);
    process.exit(1);
  }
}

testConnection();

// Middleware to parse JSON bodies
app.use(express.json());

// Set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production" }
}));

//Get html files from public folder
app.use(express.static('public'));

// Test route 
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving users');
  }
});

// Route to get match history for the logged-in user
app.get('/get-match-history', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.session.user.userId;

  try {
    // Retrieve the LoL account for the logged-in user
    const [accounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (accounts.length === 0) {
      return res.status(404).json({ message: 'No linked LoL account found for this user' });
    }

    const account = accounts[0];

    // Query to join match_history with champions table to get champion names
    const query = `
      SELECT 
        m.match_id,
        c.champion_name,
        m.win,
        m.kills,
        m.deaths,
        m.assists,
        m.game_timestamp
      FROM match_history m
      JOIN champions c ON m.champion_id = c.champion_id
      WHERE m.lol_account_id = ?
      ORDER BY m.game_timestamp DESC;
    `;
    const [matchRows] = await pool.query(query, [account.lol_account_id]);

    res.json(matchRows);
  } catch (error) {
    console.error('Error retrieving match history:', error);
    res.status(500).json({ message: 'Error retrieving match history' });
  }
});

// Route to get champion data based on match history for the logged-in user
app.get('/get-champions', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const userId = req.session.user.userId;
  try {
    // Retrieve the LoL account for the logged-in user
    const [accounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (accounts.length === 0) {
      return res.status(404).json({ message: 'No linked LoL account found for this user' });
    }
    const account = accounts[0];
    const query = `
      SELECT 
        c.champion_name,
        IFNULL(ROUND(SUM(m.win) / COUNT(m.match_id) * 100, 2), 0) AS win_rate,
        CASE
          WHEN SUM(m.deaths) = 0 THEN 'Infinity'
          ELSE ROUND((SUM(m.kills) + SUM(m.assists)) / SUM(m.deaths), 2)
        END AS kda
      FROM champions c
      LEFT JOIN match_history m 
        ON c.champion_id = m.champion_id 
        AND m.lol_account_id = ?
      GROUP BY c.champion_id
      ORDER BY win_rate DESC;
    `;
    const [rows] = await pool.query(query, [account.lol_account_id]);
    res.json(rows);
  } catch (error) {
    console.error("Error retrieving champion stats:", error);
    res.status(500).json({ message: 'Error retrieving champion stats', error: error.message });
  }
});

// Authentication Routes
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/logout', authController.logout);
app.get('/check-login', authController.checkLogin);

// Champion Data Integration Route
app.get('/update-champions', championController.updateChampions);

// Match History Integration Route
app.post('/match-history', matchHistoryController.updateMatchHistory);

// Route to link a League account
app.post('/link-account-riotid', lolAccountController.linkAccountByRiotId);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
