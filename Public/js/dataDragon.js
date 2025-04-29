let championData = null;

// Fetch champion data from Data Dragon
export async function fetchChampionData() {
  if (championData) return championData; // Use cached data if available

  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/cdn/13.8.1/data/en_US/champion.json');
    const data = await response.json();
    championData = {};

    // Map champion keys to their names
    Object.values(data.data).forEach(champion => {
      championData[champion.key] = champion.name;
    });

    console.log('Champion Data:', championData); // Debugging log
    return championData;
  } catch (error) {
    console.error('Error fetching champion data:', error);
    return {};
  }
}