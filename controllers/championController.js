const axios = require('axios');
const { pool } = require('../db');

async function getLatestVersion() {
    const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    return response.data[0]; // Get the latest version
}

async function populateChampionsOnStartup() {
    try {
        console.log('Checking champion data...');
        const latestVersion = await getLatestVersion();
        console.log(`Using Data Dragon version: ${latestVersion}`);

        const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
        const champions = response.data.data;

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Get existing champions count
            const [existingCount] = await connection.query('SELECT COUNT(*) as count FROM champions');
            console.log(`Current champions in database: ${existingCount[0].count}`);

            // Insert or update champions
            for (const key in champions) {
                const champion = champions[key];
                await connection.query(
                    `INSERT INTO champions (
                        riot_champion_id, 
                        champion_name, 
                        champion_title, 
                        champion_role
                    ) VALUES (?, ?, ?, ?) 
                    ON DUPLICATE KEY UPDATE 
                        champion_name = VALUES(champion_name),
                        champion_title = VALUES(champion_title),
                        champion_role = VALUES(champion_role)`,
                    [
                        champion.key,
                        champion.name,
                        champion.title,
                        champion.tags[0] || ''
                    ]
                );
            }

            await connection.commit();
            
            // Verify final count
            const [finalCount] = await connection.query('SELECT COUNT(*) as count FROM champions');
            console.log(`Updated champions count: ${finalCount[0].count}`);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error populating champions:', error);
        throw error;
    }
}

async function calculateChampionStats(matches, puuid) {
    const championStats = {};

    matches.forEach(match => {
        const participant = match.info.participants.find(p => p.puuid === puuid);
        if (!participant) return;

        const championId = participant.championId;

        if (!championStats[championId]) {
            championStats[championId] = {
                champion_name: participant.championName,
                games_played: 0,
                wins: 0,
                kills: 0,
                deaths: 0,
                assists: 0
            };
        }

        const stats = championStats[championId];
        stats.games_played++;
        stats.wins += participant.win ? 1 : 0;
        stats.kills += participant.kills;
        stats.deaths += participant.deaths;
        stats.assists += participant.assists;
    });

    // Calculate averages
    Object.values(championStats).forEach(stats => {
        stats.win_rate = ((stats.wins / stats.games_played) * 100).toFixed(1);
        stats.kda = ((stats.kills + stats.assists) / Math.max(1, stats.deaths)).toFixed(2);
    });

    return Object.values(championStats);
}

// Keep existing updateChampions function but update it to use latest version
exports.updateChampions = async (req, res) => {
    try {
        await populateChampionsOnStartup();
        res.status(200).json({ message: 'Champion data updated successfully!' });
    } catch (error) {
        console.error('Error updating champion data:', error);
        res.status(500).json({ message: 'Error updating champion data', error: error.message });
    }
};

exports.populateChampionsOnStartup = populateChampionsOnStartup;
