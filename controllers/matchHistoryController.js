const axios = require('axios');
const { pool } = require('../db');

const MATCHES_TO_FETCH = 50; // Changed from 100 to 50
const RATE_LIMIT_DELAY = 200; // Increase delay between requests

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

async function getMatchHistory(puuid, region) {
  try {
    const routingRegion = getMatchBaseUrl(region);
    const riotApiKey = process.env.RIOT_API_KEY;
    const baseUrl = `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;

    // Add delay before making request
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));

    // Log the request parameters
    console.log('Requesting matches with params:', {
      start: 0,
      count: MATCHES_TO_FETCH
    });

    const response = await axios.get(baseUrl, {
      headers: { 
        'X-Riot-Token': riotApiKey,
        'Accept': 'application/json'
      },
      params: {
        start: 0,
        count: 50  // Explicitly set to 50
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid response from Riot API:', response.data);
      throw new Error('Invalid response from Riot API');
    }

    console.log(`Found ${response.data.length} matches for PUUID: ${puuid}`);
    console.log('First few match IDs:', response.data.slice(0, 5));

    return response.data;

  } catch (error) {
    console.error('Error fetching match history:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
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
    console.log(`Linked Account Region: ${region}`);
    console.log(`Linked Account PUUID: ${puuid}`);

    // Fetch match IDs from Riot API
    const matchIds = await getMatchHistory(puuid, region);
    console.log(`Fetched match list: ${matchIds}`);

    for (const matchId of matchIds) {
      try {
        // Increase delay between match detail requests
        await sleep(RATE_LIMIT_DELAY);
        
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

        // Replace the champion validation section with this:
        try {
            // Log what we receive from Riot API
            console.log(`Champion Riot ID from API: ${participant.championId}`);

            // Directly use the champion ID from Riot's API
            const champion_riot_id = participant.championId;

            console.log(`Using champion_riot_id directly from Riot API: ${champion_riot_id}`);

            await pool.query(
                `INSERT INTO match_history (
                    match_id, lol_account_id, champion_id, champion_riot_id, queue_id, win, kills, deaths, assists,
                    team_kills, match_type, total_minions_killed, game_duration,
                    total_damage_dealt, total_damage_taken, total_healing, wards_placed, wards_destroyed,
                    vision_score, gold_earned, gold_spent, dragons_killed, barons_killed, turrets_destroyed,
                    largest_killing_spree, largest_multi_kill
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    matchId,
                    account.lol_account_id,
                    champion_riot_id,  // Add champion_id value (using riot_id temporarily)
                    champion_riot_id,  // champion_riot_id value
                    matchDetails.info.queueId,
                    participant.win ? 1 : 0,
                    participant.kills,
                    participant.deaths,
                    participant.assists,
                    participant.teamKills || 0,
                    matchDetails.info.gameMode,
                    participant.totalMinionsKilled + participant.neutralMinionsKilled,
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
        } catch (error) {
            console.error(`Error processing match ${matchId}:`, error);
            continue;
        }
      } catch (error) {
        if (error.response?.status === 429) {
          console.log('Rate limit hit, waiting before next request...');
          await sleep(RATE_LIMIT_DELAY * 2);
          continue;
        }
        throw error;
      }
    }

    res.status(200).json({ message: 'Match history updated successfully' });
  } catch (error) {
    console.error('Error updating match history:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error updating match history' });
  }
}

module.exports = { updateMatchHistory };
