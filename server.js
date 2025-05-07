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
const summonerController = require('./controllers/summonerController');

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

// Update the get-match-history route with the correct column name
app.get('/get-match-history', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.session.user.userId;
    try {
        const [accounts] = await pool.query(
            'SELECT * FROM lol_accounts WHERE user_id = ?',
            [userId]
        );
        if (!accounts.length) {
            return res.status(404).json({ message: 'No linked LoL account found' });
        }
        const account = accounts[0];

        // First, let's check what champions we have in our database
        const [championsInDb] = await pool.query('SELECT riot_champion_id, champion_name FROM champions');
        console.log('Champions in database:', championsInDb.length);

        // Modified query to use the correct column name and add debugging fields
        const sql = `
            SELECT 
                m.*,
                c.champion_name,
                c.riot_champion_id,
                CASE 
                    WHEN c.champion_name IS NULL THEN 'missing'
                    ELSE 'found'
                END as champion_status
            FROM match_history m
            LEFT JOIN champions c ON m.champion_riot_id = c.riot_champion_id
            WHERE m.lol_account_id = ?
            ORDER BY m.match_id DESC
        `;

        const [matches] = await pool.query(sql, [account.lol_account_id]);
        
        // Debug log to check data
        if (matches.length > 0) {
            const missingChampions = matches
                .filter(m => m.champion_status === 'missing')
                .map(m => m.champion_riot_id);

            if (missingChampions.length > 0) {
                console.log('Missing champions:', {
                    count: missingChampions.length,
                    ids: [...new Set(missingChampions)]
                });
            }

            console.log('Match analysis:', {
                total_matches: matches.length,
                matches_with_champions: matches.filter(m => m.champion_status === 'found').length,
                matches_missing_champions: matches.filter(m => m.champion_status === 'missing').length
            });
        }
        
        return res.json(matches);
    } catch (err) {
        console.error('Error retrieving match history:', err);
        return res.status(500).json({ message: 'Error retrieving match history' });
    }
});

// Route to get champion data based on match history for the logged-in user
app.get('/get-champions', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  
  const userId = req.session.user.userId;
  
  try {
    const [accounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (accounts.length === 0) {
      return res.status(404).json({ message: 'No linked LoL account found' });
    }
    
    // Simplified query that was working before
    const query = `
      SELECT 
        c.champion_name,
        COUNT(*) as games_played,
        SUM(m.win) as wins,
        ROUND(AVG(m.win) * 100, 2) as win_rate,
        ROUND(AVG((m.kills + m.assists) / CASE WHEN m.deaths = 0 THEN 1 ELSE m.deaths END), 2) as kda,
        ROUND(AVG(m.total_minions_killed), 2) as cs_per_minute
      FROM match_history m
      JOIN champions c ON m.champion_riot_id = c.riot_champion_id
      WHERE m.lol_account_id = ?
      GROUP BY c.riot_champion_id, c.champion_name
      ORDER BY games_played DESC
    `;
    
    const [rows] = await pool.query(query, [accounts[0].lol_account_id]);
    res.json(rows);
    
  } catch (error) {
    console.error("Error retrieving champion stats:", error);
    res.status(500).json({ message: 'Error retrieving champion stats' });
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
    const userId = req.session.user.userId;

    try {
        // Check if user already has a linked account
        const [existingAccounts] = await pool.query(
            'SELECT * FROM lol_accounts WHERE user_id = ?', 
            [userId]
        );

        if (existingAccounts.length > 0) {
            return res.status(400).json({ 
                message: 'You already have a linked League of Legends account. Please unlink your current account before linking a new one.' 
            });
        }

        if (!gameName || !tagLine || !region) {
            return res.status(400).json({ message: 'Missing required fields: gameName, tagLine, or region' });
        }

        // If no existing account, proceed with linking
        await lolAccountController.linkAccountByRiotId(req, res);

    } catch (error) {
        console.error('Error linking account:', error.message);
        res.status(500).json({ message: 'Error linking account', error: error.message });
    }
});

// Route to get linked League of Legends account for the logged-in user
app.get('/get-linked-account', async (req, res) => {
    if (!req.session.user) {
        return res.json({ success: false, message: 'Not logged in' });
    }

    try {
        const [accounts] = await pool.query(
            'SELECT game_name, tag_line FROM lol_accounts WHERE user_id = ?',
            [req.session.user.userId]
        );

        if (accounts.length > 0) {
            return res.json({
                success: true,
                account: accounts[0]
            });
        } else {
            return res.json({
                success: false,
                message: 'No linked account found'
            });
        }
    } catch (error) {
        console.error('Error fetching linked account:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching linked account'
        });
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

// Add this route
app.get('/get-summoner-profile', summonerController.getSummonerProfile);

// Add this new route to get champion name by riot_id
app.get('/get-match-history/champion/:championRiotId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT champion_name FROM champions WHERE champion_riot_id = ?',
            [req.params.championRiotId]
        );
        
        if (rows.length > 0) {
            res.json({ champion_name: rows[0].champion_name });
        } else {
            console.log(`No champion found for riot_id: ${req.params.championRiotId}`);
            res.status(404).json({ error: 'Champion not found' });
        }
    } catch (error) {
        console.error('Error fetching champion:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Add this route
app.get('/check-linked-account', async (req, res) => {
    if (!req.session.user) {
        return res.json({ hasLinkedAccount: false });
    }

    try {
        const [accounts] = await pool.query(
            'SELECT game_name FROM lol_accounts WHERE user_id = ?',
            [req.session.user.userId]
        );

        return res.json({
            hasLinkedAccount: accounts.length > 0,
            gameName: accounts.length > 0 ? accounts[0].game_name : null
        });
    } catch (error) {
        console.error('Error checking linked account:', error);
        return res.status(500).json({ message: 'Error checking linked account' });
    }
});

// Add near the bottom of the file, before app.listen
app.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ message: 'Error logging out' });
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.json({ message: 'Logged out successfully' });
        });
    } else {
        res.json({ message: 'Already logged out' });
    }
});

app.get('/check-login', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            email: req.session.user.email
        });
    } else {
        res.json({
            email: null
        });
    }
});

// Remove the existing unlink-account route and add this one
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

app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    try {
        await championController.populateChampionsOnStartup();
        console.log('Champions table populated successfully');
    } catch (error) {
        console.error('Error populating champions table:', error);
    }
});

