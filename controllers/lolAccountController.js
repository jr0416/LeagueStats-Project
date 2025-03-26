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
    const { gameName, tagLine, region } = req.body;
    const riotApiKey = process.env.RIOT_API_KEY;
  
  if (!riotApiKey) {
    return res.status(500).json({ message: 'Riot API key not configured' });
  }
  
  try {
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
    
    // Ensure the user is authenticated via session
    if (!req.session.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.session.user.userId;
    
    // Insert or update the linked account in the database
    const [result] = await pool.query(
      `INSERT INTO lol_accounts (user_id, riot_account_id, summoner_name, region, puuid)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         summoner_name = VALUES(summoner_name),
         region = VALUES(region),
         puuid = VALUES(puuid)`,
      [userId, summonerData.id, summonerData.name, region, puuid]
    );
    
    res.status(200).json({ message: 'LoL account linked successfully via Riot ID', data: summonerData });
  } catch (error) {
    console.error('Error linking account:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error linking account', error: error.message });
  }
};
