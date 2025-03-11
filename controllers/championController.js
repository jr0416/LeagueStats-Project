const axios = require('axios');
const { pool } = require('../db');

exports.updateChampions = async (req, res) => {
  try {
    // 1. Get the latest patch version from Data Dragon
    const versionsResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    const latestVersion = versionsResponse.data[0];

    // 2. Fetch champion data using the latest version
    const championUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`;
    const championResponse = await axios.get(championUrl);
    const championsData = championResponse.data.data;

    // 3. Loop over each champion and insert/update the champions table
    for (const champKey in championsData) {
      if (Object.prototype.hasOwnProperty.call(championsData, champKey)) {
        const champ = championsData[champKey];
        await pool.query(
          `INSERT INTO champions (riot_champion_id, champion_name, champion_title, champion_role, stats_json)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             champion_name = VALUES(champion_name),
             champion_title = VALUES(champion_title),
             champion_role = VALUES(champion_role),
             stats_json = VALUES(stats_json)`,
          [
            champ.key,                         // Riot's champion key (string)
            champ.name,                        // Champion name
            champ.title,                       // Champion title
            champ.tags.join(', '),             // Champion roles/tags as a comma-separated string
            JSON.stringify(champ.stats)        // Champion stats in JSON
          ]
        );
      }
    }

    res.status(200).json({ message: 'Champion data updated successfully', version: latestVersion });
  } catch (error) {
    console.error('Error updating champion data:', error.message);
    res.status(500).json({ message: 'Error updating champion data', error: error.message });
  }
};
