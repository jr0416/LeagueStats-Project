const { pool } = require('../db');
const axios = require('axios');

const getSummonerProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Get linked account from database
        const [accounts] = await pool.query(
            'SELECT * FROM lol_accounts WHERE user_id = ?',
            [req.session.user.userId]
        );

        if (!accounts.length) {
            return res.status(404).json({ message: 'No linked LoL account found' });
        }

        const account = accounts[0];
        const riotApiKey = process.env.RIOT_API_KEY;

        // Get basic summoner data
        const summonerResponse = await axios.get(
            `https://${account.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
            {
                headers: {
                    'X-Riot-Token': riotApiKey
                }
            }
        );

        // Get ranked data
        const rankedResponse = await axios.get(
            `https://${account.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerResponse.data.id}`,
            {
                headers: {
                    'X-Riot-Token': riotApiKey
                }
            }
        );

        // Get mastery data (top 10 champions)
        const masteryResponse = await axios.get(
            `https://${account.region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${account.puuid}/top?count=10`,
            {
                headers: {
                    'X-Riot-Token': riotApiKey
                }
            }
        );

        // Format all the data
        const profileData = {
            summoner: {
                gameName: account.game_name, // Use the stored game_name from account linking
                tagLine: account.tag_line,   // Use the stored tag_line from account linking
                profileIconId: summonerResponse.data.profileIconId,
                summonerLevel: summonerResponse.data.summonerLevel,
                revisionDate: new Date(summonerResponse.data.revisionDate).toLocaleDateString()
            },
            ranked: rankedResponse.data.map(queueData => ({
                queueType: formatQueueType(queueData.queueType),
                tier: queueData.tier || 'UNRANKED',
                rank: queueData.rank || '',
                leaguePoints: queueData.leaguePoints || 0,
                wins: queueData.wins || 0,
                losses: queueData.losses || 0,
                winRate: ((queueData.wins / (queueData.wins + queueData.losses)) * 100).toFixed(1),
                hotStreak: queueData.hotStreak || false,
                miniSeries: queueData.miniSeries || null
            })),
            mastery: masteryResponse.data.map(champion => ({
                championId: champion.championId,
                championLevel: champion.championLevel,
                championPoints: champion.championPoints,
                lastPlayTime: new Date(champion.lastPlayTime).toLocaleDateString(),
                tokensEarned: champion.tokensEarned
            }))
        };

        // Add debug logs
        console.log('Account data:', {
            gameName: account.game_name,
            tagLine: account.tag_line,
            puuid: account.puuid
        });
        console.log('Summoner data:', summonerResponse.data);

        // Store the ranked data in the database
        for (const queueData of rankedResponse.data) {
            await pool.query(
                `INSERT INTO summoner_profile 
                (lol_account_id, queue_type, tier, rank_division, league_points, 
                wins, losses, hot_streak, veteran, fresh_blood, inactive, mini_series_progress) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                tier = VALUES(tier),
                rank_division = VALUES(rank_division),
                league_points = VALUES(league_points),
                wins = VALUES(wins),
                losses = VALUES(losses),
                hot_streak = VALUES(hot_streak),
                veteran = VALUES(veteran),
                fresh_blood = VALUES(fresh_blood),
                inactive = VALUES(inactive),
                mini_series_progress = VALUES(mini_series_progress)`,
                [
                    account.lol_account_id,
                    queueData.queueType,
                    queueData.tier,
                    queueData.rank,
                    queueData.leaguePoints,
                    queueData.wins,
                    queueData.losses,
                    queueData.hotStreak ? 1 : 0,
                    queueData.veteran ? 1 : 0,
                    queueData.freshBlood ? 1 : 0,
                    queueData.inactive ? 1 : 0,
                    queueData.miniSeries ? queueData.miniSeries.progress : null
                ]
            );
        }

        res.json(profileData);

    } catch (error) {
        console.error('Error fetching summoner profile:', error);
        res.status(500).json({ 
            message: 'Error fetching summoner profile',
            error: error.response?.data || error.message
        });
    }
};

// Helper functions
function formatQueueType(queueType) {
    switch(queueType) {
        case 'RANKED_SOLO_5x5':
            return 'Ranked Solo/Duo';
        case 'RANKED_FLEX_SR':
            return 'Ranked Flex';
        default:
            return 'Unranked';
    }
}

function calculateWinRate(wins, losses) {
    const totalGames = wins + losses;
    if (totalGames === 0) return '0';
    return ((wins / totalGames) * 100).toFixed(1);
}

module.exports = {
    getSummonerProfile
};