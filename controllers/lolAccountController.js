const axios = require('axios');
const { pool } = require('../db');

// Helper function to map region to the appropriate Riot Account API base URL
function getAccountBaseUrl(region) {
  region = region.toLowerCase();
  if (region === 'na1' || region === 'lan' || region === 'las' || region === 'oce') {
    return 'https://americas.api.riotgames.com';
  } else if (region === 'euw1' || region === 'eune1' || region === 'tr' || region === 'ru') {
    return 'https://europe.api.riotgames.com';
  } else if (region === 'kr' || region === 'jp') {
    return 'https://asia.api.riotgames.com';
  } else {
    return 'https://americas.api.riotgames.com';
  }
}

exports.linkAccountByRiotId = async (req, res) => {
  const { gameName, tagLine, region } = req.body;
  const riotApiKey = process.env.RIOT_API_KEY;

  if (!riotApiKey) {
    return res.status(500).json({ message: 'Riot API key not configured' });
  }

  try {
    // Ensure the user is authenticated via session
    if (!req.session.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.session.user.userId;

    // Check if the user already has a linked account
    const [existingAccounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (existingAccounts.length > 0) {
      return res.status(400).json({ message: 'You already have a linked League of Legends account.' });
    }

    // Determine the correct base URL based on the region
    const accountBaseUrl = getAccountBaseUrl(region);
    const accountUrl = `${accountBaseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

    // Fetch account data from Riot to retrieve the puuid
    const accountResponse = await axios.get(accountUrl, {
      headers: { 'X-Riot-Token': riotApiKey }
    });
    const puuid = accountResponse.data.puuid;
    if (!puuid) {
      return res.status(404).json({ message: 'Could not find PUUID for the given Riot ID.' });
    }

    // Use the selected region to build the Summoner API URL
    const summonerBaseUrl = `https://${region}.api.riotgames.com`;
    const summonerUrl = `${summonerBaseUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summonerResponse = await axios.get(summonerUrl, {
      headers: { 'X-Riot-Token': riotApiKey }
    });
    const summonerData = summonerResponse.data;

    // Insert or update the linked account in the database
    const [result] = await pool.query(
      `INSERT INTO lol_accounts (
          user_id, 
          game_name, 
          tag_line, 
          region, 
          puuid, 
          riot_account_id, 
          summoner_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
          userId,
          gameName,           // From form input
          tagLine,            // From form input
          region,             // From form input
          puuid,              // From Riot API response
          summonerData.id,    // From Riot API response
          summonerData.name   // From Riot API response
      ]
    );

    // After successful insert
    res.status(200).json({
      success: true,
      message: 'LoL account linked successfully',
      data: {
        game_name: gameName,
        tag_line: tagLine,
        region: region,
        puuid: puuid
      }
    });
  } catch (error) {
    console.error('Error linking account:', error.response ? error.response.data : error.message);

    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Invalid Riot ID or region. Please check your input and try again.' });
    }

    if (error.response && error.response.status === 429) {
      return res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
    }

    res.status(500).json({ message: 'Error linking account', error: error.message });
  }
};

exports.unlinkAccount = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.session.user.userId;

  try {
    // Delete the linked account from the database
    await pool.query('DELETE FROM lol_accounts WHERE user_id = ?', [userId]);
    res.status(200).json({ message: 'Account unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking account:', error);
    res.status(500).json({ message: 'Error unlinking account' });
  }
};
