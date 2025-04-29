const axios = require('axios');
const { pool } = require('../db');

// Helper function to map region to the appropriate Riot Account API base URL
function getAccountBaseUrl(region) {
  region = region.toLowerCase();
  // For North America, LAN, LAS, and Oceania
  if (region === 'na1' || region === 'lan' || region === 'las' || region === 'oce') {
    return 'https://americas.api.riotgames.com';
  }
  // For Europe (EUW, EUNE, TR, RU)
  else if (region === 'euw1' || region === 'eune1' || region === 'tr' || region === 'ru') {
    return 'https://europe.api.riotgames.com';
  }
  // For Korea or Japan
  else if (region === 'kr' || region === 'jp') {
    return 'https://asia.api.riotgames.com';
  }
  // Default fallback
  else {
    return 'https://americas.api.riotgames.com';
  }
}

exports.linkAccountByRiotId = async (req, res) => {
  const { riotAccountId, summonerName, region } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.session.user.userId;

  try {
    await pool.query(
      'INSERT INTO lol_accounts (user_id, riot_account_id, summoner_name, region) VALUES (?, ?, ?, ?)',
      [userId, riotAccountId, summonerName, region]
    );

    res.status(201).json({ message: 'League of Legends account linked successfully!' });
  } catch (error) {
    console.error('Error linking LoL account:', error);
    res.status(500).json({ message: 'Error linking LoL account', error: error.message });
  }
};
