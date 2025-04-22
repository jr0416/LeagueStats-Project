require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const authController = require('./controllers/authController');
const lolAccountController = require('./controllers/lolAccountController');
const championController = require('./controllers/championController');
const matchHistoryController = require('./controllers/matchHistoryController');
const { pool } = require('./db'); // Import from db.js
const axios = require('axios');

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
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.error('Database connection failed. Please check your configuration.');
    }
  }
}

testConnection();

// Middleware to parse JSON bodies
app.use(express.json());

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

// Serve static files from the public folder
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
    // Fetch the linked account for the logged-in user
    const [accounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (accounts.length === 0) {
      return res.status(404).json({ message: 'No linked LoL account found for this user' });
    }

    const account = accounts[0];

    // Query to fetch match history for the linked account
    const [matchHistory] = await pool.query(
      `SELECT 
        mh.match_id,
        c.champion_name,
        mh.queue_id,
        mh.win,
        mh.kills,
        mh.deaths,
        mh.assists,
        mh.team_kills,
        mh.match_type,
        mh.total_minions_killed,
        mh.game_duration,
        mh.total_damage_dealt,
        mh.total_damage_taken,
        mh.total_healing,
        mh.wards_placed,
        mh.wards_destroyed,
        mh.vision_score,
        mh.gold_earned,
        mh.gold_spent,
        mh.dragons_killed,
        mh.barons_killed,
        mh.turrets_destroyed,
        mh.largest_killing_spree,
        mh.largest_multi_kill,
        ROUND(mh.total_minions_killed / (mh.game_duration / 60), 2) AS cs_per_minute -- Calculate C/S
      FROM match_history mh
      JOIN champions c ON mh.champion_id = c.champion_id
      WHERE mh.lol_account_id = ? -- Filter by the linked account's lol_account_id
      ORDER BY mh.match_id DESC`,
      [account.lol_account_id]
    );

    res.json(matchHistory);
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

// Serve the reset-password.html file
app.get('/reset-password', (req, res) => {
  res.sendFile(__dirname + '/public/reset-password.html');
});

// Authentication Routes
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/logout', authController.logout);
app.get('/check-login', authController.checkLogin);
app.post('/forgot-password', authController.forgotPassword);
app.post('/reset-password', authController.resetPassword);

// Champion Data Integration Route
app.get('/update-champions', championController.updateChampions);

// Match History Integration Route
app.post('/match-history', matchHistoryController.updateMatchHistory);

// Route to link a League of Legends account using Riot ID
app.post('/link-account-riotid', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { gameName, tagLine, region } = req.body;

  if (!gameName || !tagLine || !region) {
    return res.status(400).json({ message: 'Missing required fields: gameName, tagLine, or region' });
  }

  try {
    // Check if the user already has a linked account
    const userId = req.session.user.userId;
    const [existingAccounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (existingAccounts.length > 0) {
      return res.status(400).json({ message: 'You already have a linked League of Legends account.' });
    }

    // Call the controller function to handle the linking logic
    await lolAccountController.linkAccountByRiotId(req, res);
  } catch (error) {
    console.error('Error linking account:', error.message);
    res.status(500).json({ message: 'Error linking account', error: error.message });
  }
});

// Route to get linked League of Legends account for the logged-in user
app.get('/get-linked-account', async (req, res) => {
  if (!req.session.user) {
    console.log('User not authenticated'); // Debugging log
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.session.user.userId;

  try {
    console.log(`Fetching linked account for user ID: ${userId}`); // Debugging log
    const [accounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (accounts.length === 0) {
      console.log('No linked account found'); // Debugging log
      return res.status(404).json({ message: 'No linked League of Legends account found' });
    }

    console.log('Linked account found:', accounts[0]); // Debugging log
    res.status(200).json(accounts[0]); // Return the linked account details
  } catch (error) {
    console.error('Error checking linked account:', error);
    res.status(500).json({ message: 'Error checking linked account' });
  }
});

// Route to unlink a League of Legends account
app.post('/unlink-account', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.session.user.userId;

  try {
    // Delete the linked account from the database
    await pool.query('DELETE FROM lol_accounts WHERE user_id = ?', [userId]);
    res.status(200).json({ message: 'Account unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking account:', error.message);
    res.status(500).json({ message: 'Error unlinking account', error: error.message });
  }
});

// Endpoint to fetch recommendations
app.get('/recommendations', async (req, res) => {
  const query = 'SELECT * FROM recommendation WHERE link IS NOT NULL AND link != ""';
  try {
    const [results] = await pool.query(query); // Use promise-based query
    res.json(results);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).send('Error fetching recommendations');
  }
});

// Endpoint to fetch summoner profile stats
app.get('/summoner-profile/:summonerName', async (req, res) => {
  const { summonerName } = req.params;
  console.log('Summoner Name:', summonerName); // Debugging log
  const apiKey = process.env.RIOT_API_KEY;

  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.session.user.userId;

  try {
    // Fetch the linked account for the logged-in user
    const [accounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (accounts.length === 0) {
      return res.status(404).json({ message: 'No linked League of Legends account found' });
    }

    const account = accounts[0];
    const region = account.region; // Use the region from the linked account

    // Fetch summoner data
    const summonerResponse = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      { headers: { 'X-Riot-Token': apiKey } }
    );

    const summonerData = summonerResponse.data;

    // Fetch ranked stats
    const rankedResponse = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`,
      { headers: { 'X-Riot-Token': apiKey } }
    );

    const rankedData = rankedResponse.data;

    res.json({
      summonerName: summonerData.name,
      profileIconId: summonerData.profileIconId,
      summonerLevel: summonerData.summonerLevel,
      rankedStats: rankedData,
    });
  } catch (error) {
    console.error('Error fetching summoner profile:', error.response?.data || error.message);

    if (error.response) {
      const status = error.response.status;

      if (status === 403) {
        res.status(403).json({ message: 'Invalid or expired API key. Please check your Riot API key.' });
      } else if (status === 429) {
        res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
      } else if (status === 404) {
        res.status(404).json({ message: 'Summoner not found. Please check the summoner name and region.' });
      } else {
        res.status(status).json({ message: error.response.data });
      }
    } else {
      res.status(500).json({ message: 'An unexpected error occurred.', error: error.message });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

