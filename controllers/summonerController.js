const { pool } = require('../db');
const axios = require('axios');

const getSummonerProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const [accounts] = await pool.query(
            'SELECT * FROM lol_accounts WHERE user_id = ?',
            [req.session.user.userId]
        );

        if (!accounts.length) {
            return res.status(404).json({ message: 'No linked LoL account found' });
        }

        const account = accounts[0];
        const riotApiKey = process.env.RIOT_API_KEY;

        // Fetch summoner data
        const summonerResponse = await axios.get(
            `https://${account.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
            { headers: { 'X-Riot-Token': riotApiKey } }
        );

        // Fetch ranked data
        const rankedResponse = await axios.get(
            `https://${account.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerResponse.data.id}`,
            { headers: { 'X-Riot-Token': riotApiKey } }
        );

        // Fetch mastery data
        const masteryResponse = await axios.get(
            `https://${account.region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${account.puuid}/top?count=10`,
            { headers: { 'X-Riot-Token': riotApiKey } }
        );

        const profileData = {
            summoner: {
                gameName: account.game_name,
                tagLine: account.tag_line,
                profileIconId: summonerResponse.data.profileIconId,
                summonerLevel: summonerResponse.data.summonerLevel
            },
            ranked: rankedResponse.data.map(queueData => ({
                queueType: formatQueueType(queueData.queueType),
                tier: queueData.tier || 'UNRANKED',
                rank: queueData.rank || '',
                leaguePoints: queueData.leaguePoints || 0,
                wins: queueData.wins || 0,
                losses: queueData.losses || 0,
                winRate: calculateWinRate(queueData.wins, queueData.losses),
                hotStreak: queueData.hotStreak || false,
                miniSeries: queueData.miniSeries?.progress || null
            })),
            mastery: masteryResponse.data
        };

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