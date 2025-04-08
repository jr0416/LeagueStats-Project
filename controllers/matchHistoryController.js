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
  // Default 
  else {
    return "https://americas.api.riotgames.com";
  }
}

exports.updateMatchHistory = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const userId = req.session.user.userId;
  try {
    const [accounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (accounts.length === 0) {
      return res.status(404).json({ message: 'No linked LoL account found for this user' });
    }
    const account = accounts[0];
    const puuid = account.puuid;
    const region = account.region;
    const matchBaseUrl = getMatchBaseUrl(region);  // Use my helper function for dynamic base URL

    const matchIdsResponse = await axios.get(
      `${matchBaseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=50`,
      { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
    );
    const matchIds = matchIdsResponse.data;
    
    for (const matchId of matchIds) {
      const matchResponse = await axios.get(
        `${matchBaseUrl}/lol/match/v5/matches/${matchId}`,
        { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
      );
      const matchData = matchResponse.data;
      const participant = matchData.info.participants.find(p => p.puuid === puuid);
      if (!participant) continue;
      const riotChampionId = participant.championId.toString();
      const [champRows] = await pool.query(
        'SELECT champion_id FROM champions WHERE riot_champion_id = ?',
        [riotChampionId]
      );
      if (champRows.length === 0) continue;
      const internalChampionId = champRows[0].champion_id;
      const queueId = matchData.info.queueId;
      const gameTimestamp = matchData.info.gameCreation;
      const gameDuration = matchData.info.gameDuration;
      const win = participant.win ? 1 : 0;
      const kills = participant.kills;
      const deaths = participant.deaths;
      const assists = participant.assists;
      
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
