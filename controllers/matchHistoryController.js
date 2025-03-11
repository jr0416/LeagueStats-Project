const axios = require('axios');
const { pool } = require('../db');

// Helper function to map platform region to Match-V5 routing value
function getMatchBaseUrl(region) {
  region = region.toLowerCase();
  // For NA, LAN, LAS, OCE
  if (region.startsWith('na') || region.startsWith('lan') || region.startsWith('las') || region.startsWith('oce')) {
    return "https://americas.api.riotgames.com";
  }
  // For EUW, EUNE, TR, RU
  else if (region.startsWith('euw') || region.startsWith('eune') || region.startsWith('tr') || region.startsWith('ru')) {
    return "https://europe.api.riotgames.com";
  }
  // For KR, JP
  else if (region.startsWith('kr') || region.startsWith('jp')) {
    return "https://asia.api.riotgames.com";
  }
  // Default fallback
  else {
    return "https://americas.api.riotgames.com";
  }
}

exports.updateMatchHistory = async (req, res) => {
  // User auth
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const userId = req.session.user.userId;

  try {
    // Retrieve the LoL account record for the logged-in user that has a riot games account linked to their profile
    const [accounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (accounts.length === 0) {
      return res.status(404).json({ message: 'No linked LoL account found for this user' });
    }
    // pick first linked account (for reducdency if there is an error/bug)
    const account = accounts[0];
    const puuid = account.puuid;
    const region = account.region;

    // find the correct match API base URL based on the region
    const matchBaseUrl = getMatchBaseUrl(region);

    //Retrieve recent 10 match IDs using the account's puuid
    const matchIdsResponse = await axios.get(
      `${matchBaseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
      { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
    );
    const matchIds = matchIdsResponse.data;
    
    // retrieve match data for each unique match ID
    for (const matchId of matchIds) {
      const matchResponse = await axios.get(
        `${matchBaseUrl}/lol/match/v5/matches/${matchId}`,
        { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
      );
      const matchData = matchResponse.data;
      
      // Find the participant corresponding to this puuid (participant is a player in the match)
      const participant = matchData.info.participants.find(p => p.puuid === puuid);
      if (!participant) continue;  // Skip if not found
      
      // Extract the Riot champion ID and convert to string 
      const riotChampionId = participant.championId.toString();
      
      // Retrieve the internal champion_id from the champions table using the Riot champion ID
      const [champRows] = await pool.query(
        'SELECT champion_id FROM champions WHERE riot_champion_id = ?',
        [riotChampionId]
      );
      if (champRows.length === 0) {
        console.error(`Champion with riot_champion_id ${riotChampionId} not found in champions table`);
        continue; // Skip this match if no matching champion record is found (if match data was deleted/corrupted on Riot's end)
      }
      const internalChampionId = champRows[0].champion_id;
      
      // Extract additional match data
      const queueId = matchData.info.queueId;
      const gameTimestamp = matchData.info.gameCreation;
      const gameDuration = matchData.info.gameDuration;
      const win = participant.win ? 1 : 0;
      const kills = participant.kills;
      const deaths = participant.deaths;
      const assists = participant.assists;
      
      // Insert or update the match history record including the internal champion_id's and queue_id's
      await pool.query(
        `INSERT INTO match_history 
          (lol_account_id, match_id, champion_id, queue_id, game_timestamp, game_duration, win, kills, deaths, assists, stats_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           game_timestamp = VALUES(game_timestamp),
           game_duration = VALUES(game_duration),
           win = VALUES(win),
           kills = VALUES(kills),
           deaths = VALUES(deaths),
           assists = VALUES(assists),
           stats_json = VALUES(stats_json)`,
        [
          account.lol_account_id,
          matchId,
          internalChampionId,
          queueId,
          gameTimestamp,
          gameDuration,
          win,
          kills,
          deaths,
          assists,
          JSON.stringify(matchData)
        ]
      );
    }
    
    res.status(200).json({ message: 'Match history updated successfully', matchIds });
  } catch (error) {
    console.error('Error updating match history:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error updating match history', error: error.message });
  }
};
