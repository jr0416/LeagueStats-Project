const axios = require('axios');
const { pool } = require('../db');

// Helper function to map platform region to Match-V5 routing value
function getMatchBaseUrl(region) {
  region = region.toLowerCase();
  if (region.startsWith('na') || region.startsWith('lan') || region.startsWith('las') || region.startsWith('oce')) {
    return "americas";
  } else if (region.startsWith('euw') || region.startsWith('eune') || region.startsWith('tr') || region.startsWith('ru')) {
    return "europe";
  } else if (region.startsWith('kr') || region.startsWith('jp')) {
    return "asia";
  } else {
    return "americas"; // Default to americas
  }
}

// Helper function to fetch match details from Riot API
async function fetchMatchDetails(matchId, region) {
  const riotApiKey = process.env.RIOT_API_KEY;
  const routingRegion = getMatchBaseUrl(region); // Use routing region for Match-V5 API
  const baseUrl = `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`;

  try {
    const response = await axios.get(baseUrl, {
      headers: { 'X-Riot-Token': riotApiKey },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching match details for matchId ${matchId}:`, error.response?.data || error.message);
    throw new Error('Failed to fetch match details');
  }
}

async function updateMatchHistory(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.session.user.userId;
  const riotApiKey = process.env.RIOT_API_KEY;

  // Helper function to add a delay between requests
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  try {
    // Fetch the user's linked account
    const [accounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (accounts.length === 0) {
      return res.status(404).json({ message: 'No linked League of Legends account found' });
    }

    const account = accounts[0];
    const region = account.region;
    const routingRegion = getMatchBaseUrl(region); // Use routing region for Match-V5 API
    const puuid = account.puuid;

    if (!puuid) {
      throw new Error('PUUID is missing for the linked account');
    }

    console.log(`Routing Region: ${routingRegion}`);
    console.log(`PUUID: ${puuid}`);

    // Fetch match IDs from Riot API
    const matchListUrl = `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`;
    console.log(`Fetching match list from: ${matchListUrl}`);

    const matchListResponse = await axios.get(matchListUrl, {
      headers: { 'X-Riot-Token': riotApiKey },
    });

    const matchIds = matchListResponse.data;

    for (const matchId of matchIds) {
      // Add a delay to respect Riot's rate limits
      await sleep(100); // 100ms delay between requests

      console.log(`Fetching match details for matchId: ${matchId}`);

      // Fetch match details using the helper function
      const matchDetails = await fetchMatchDetails(matchId, region);

      // Find the participant data for the linked account
      const participant = matchDetails.info.participants.find(
        (p) => p.puuid === puuid
      );

      if (!participant) {
        console.log(`Skipping match ${matchId} as linked account is not a participant.`);
        continue;
      }

      console.log(`Processing match ${matchId} for linked account.`);

      // Validate the champion_id
      const [rows] = await pool.query('SELECT 1 FROM champions WHERE champion_id = ?', [participant.championId]);
      if (rows.length === 0) {
        console.error(`Invalid champion_id: ${participant.championId} for match ${matchId}`);
        continue; // Skip this match if the champion_id is invalid
      }

      // Access stats for the linked account
      const totalCreepScore = participant.totalMinionsKilled + participant.neutralMinionsKilled;

      // Insert or update the match history in the database
      await pool.query(
        `INSERT INTO match_history (
          match_id, lol_account_id, champion_id, queue_id, win, kills, deaths, assists,
          team_kills, match_type, total_minions_killed, game_duration,
          total_damage_dealt, total_damage_taken, total_healing, wards_placed, wards_destroyed,
          vision_score, gold_earned, gold_spent, dragons_killed, barons_killed, turrets_destroyed,
          largest_killing_spree, largest_multi_kill
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          total_damage_dealt = VALUES(total_damage_dealt),
          total_damage_taken = VALUES(total_damage_taken),
          total_healing = VALUES(total_healing),
          wards_placed = VALUES(wards_placed),
          wards_destroyed = VALUES(wards_destroyed),
          vision_score = VALUES(vision_score),
          gold_earned = VALUES(gold_earned),
          gold_spent = VALUES(gold_spent),
          dragons_killed = VALUES(dragons_killed),
          barons_killed = VALUES(barons_killed),
          turrets_destroyed = VALUES(turrets_destroyed),
          largest_killing_spree = VALUES(largest_killing_spree),
          largest_multi_kill = VALUES(largest_multi_kill)`,
        [
          matchId,
          account.lol_account_id,
          participant.championId,
          matchDetails.info.queueId,
          participant.win ? 1 : 0,
          participant.kills,
          participant.deaths,
          participant.assists,
          participant.teamKills || 0,
          matchDetails.info.gameMode,
          totalCreepScore,
          matchDetails.info.gameDuration,
          participant.totalDamageDealtToChampions,
          participant.totalDamageTaken,
          participant.totalHeal,
          participant.wardsPlaced,
          participant.wardsKilled,
          participant.visionScore,
          participant.goldEarned,
          participant.goldSpent,
          participant.dragonKills || 0,
          participant.baronKills || 0,
          participant.turretKills || 0,
          participant.largestKillingSpree,
          participant.largestMultiKill,
        ]
      );
    }

    res.status(200).json({ message: 'Match history updated successfully' });
  } catch (error) {
    console.error('Error updating match history:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error updating match history' });
  }
}

module.exports = { updateMatchHistory };
