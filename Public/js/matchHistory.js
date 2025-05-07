document.addEventListener('DOMContentLoaded', () => {
    const matchHistoryTable = document.getElementById('matchHistoryTable');
    const matchHistoryBody = document.getElementById('matchHistoryBody');
    const toggleMatchHistory = document.getElementById('toggleMatchHistory');
    const updateMatchHistory = document.getElementById('updateMatchHistory');
    const loadingSpinner = document.getElementById('loadingSpinner');

    let championData = null;

    // Modify the loadChampionData function to add more logging
    async function loadChampionData() {
        try {
            console.log('Loading champion data from Data Dragon...');
            const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.8.1/data/en_US/champion.json');
            const data = await response.json();
            championData = data.data;
            console.log('Champion data loaded:', {
                championCount: Object.keys(championData).length,
                sampleChampion: Object.values(championData)[0]
            });
        } catch (error) {
            console.error('Error loading champion data:', error);
        }
    }

    // Replace the getChampionNameByRiotId function with this version
    async function getChampionNameByRiotId(championRiotId) {
        try {
            const response = await fetch(`/api/champion/${championRiotId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.champion_name || `Champion ${championRiotId}`;
        } catch (error) {
            console.error('Error fetching champion name:', error);
            return `Champion ${championRiotId}`;
        }
    }

    function getQueueType(queueId) {
        const queueTypes = {
            400: "Normal Draft",
            420: "Ranked Solo",
            430: "Normal Blind",
            440: "Ranked Flex",
            450: "ARAM"
        };
        return queueTypes[queueId] || "Event";
    }

    // Replace the createMatchRow function
    async function createMatchRow(match) {
        const row = document.createElement('tr');
        row.className = 'match-row';
        const result = match.win ? 'win' : 'loss';
        const kda = ((match.kills + match.assists) / Math.max(1, match.deaths)).toFixed(2);

        // Debug log to check match data
        console.log('Creating row for match:', {
            champion_riot_id: match.champion_riot_id,
            champion_name: match.champion_name
        });

        row.innerHTML = `
            <td><button class="expand-button">▼</button></td>
            <td>${match.champion_name || `Unknown (${match.champion_riot_id})`}</td>
            <td>${getQueueType(match.queue_id)}</td>
            <td class="${result}">${match.win ? 'Victory' : 'Defeat'}</td>
            <td>${match.kills}/${match.deaths}/${match.assists} (${kda})</td>
        `;
        
        const detailsRow = createDetailsRow(match);
        
        row.querySelector('.expand-button').addEventListener('click', () => {
            const isHidden = detailsRow.style.display === 'none';
            detailsRow.style.display = isHidden ? 'table-row' : 'none';
            row.querySelector('.expand-button').textContent = isHidden ? '▲' : '▼';
        });
        
        return [row, detailsRow];
    }

    // Add this function after createMatchRow and before loadMatchHistory
    function createDetailsRow(match) {
        const detailsRow = document.createElement('tr');
        detailsRow.className = 'details-row';
        detailsRow.style.display = 'none';
        
        // Calculate CS per minute
        const csPerMinute = ((match.total_minions_killed) / (match.game_duration / 60)).toFixed(2);
        
        detailsRow.innerHTML = `
            <td colspan="5">
                <div class="match-details">
                    <div class="stats-container">
                        <div class="stat-group">
                            <div class="stat">CS/min: ${csPerMinute}</div>
                            <div class="stat">Total CS: ${match.total_minions_killed}</div>
                            <div class="stat">Vision Score: ${match.vision_score}</div>
                        </div>
                        <div class="stat-group">
                            <div class="stat">Damage Dealt: ${match.total_damage_dealt}</div>
                            <div class="stat">Damage Taken: ${match.total_damage_taken}</div>
                            <div class="stat">Healing: ${match.total_healing}</div>
                        </div>
                        <div class="stat-group">
                            <div class="stat">Gold Earned: ${match.gold_earned}</div>
                            <div class="stat">Gold Spent: ${match.gold_spent}</div>
                            <div class="stat">Wards Placed: ${match.wards_placed}</div>
                        </div>
                        <div class="stat-group">
                            <div class="stat">Dragons: ${match.dragons_killed}</div>
                            <div class="stat">Barons: ${match.barons_killed}</div>
                            <div class="stat">Turrets: ${match.turrets_destroyed}</div>
                        </div>
                    </div>
                </div>
            </td>
        `;

        return detailsRow;
    }

    // In your loadMatchHistory function, add more logging
    async function loadMatchHistory() {
        try {
            const response = await fetch('/get-match-history');
            const matches = await response.json();
            
            // Add detailed debugging for first match
            if (matches.length > 0) {
                console.log('First match full data:', matches[0]);
                console.log('Champion data:', {
                    champion_name: matches[0].champion_name,
                    champion_riot_id: matches[0].champion_riot_id,
                    // Log all keys to see what we're actually getting
                    keys: Object.keys(matches[0])
                });
            }
            
            matchHistoryBody.innerHTML = '';

            for (const match of matches) {
                const [matchRow, detailsRow] = await createMatchRow(match);
                matchHistoryBody.appendChild(matchRow);
                matchHistoryBody.appendChild(detailsRow);
            }
        } catch (error) {
            console.error('Error loading match history:', error);
        }
    }

    toggleMatchHistory.addEventListener('click', () => {
        const table = document.getElementById('matchHistoryTable');
        if (table.style.display === 'none') {
            table.style.display = 'table';
            toggleMatchHistory.textContent = 'Hide Table';
        } else {
            table.style.display = 'none';
            toggleMatchHistory.textContent = 'Show Table';
        }
    });

    updateMatchHistory.addEventListener('click', async () => {
        loadingSpinner.style.display = 'block';
        try {
            await fetch('/match-history', { method: 'POST' });
            await loadMatchHistory();
        } catch (error) {
            console.error('Error updating match history:', error);
            alert('Failed to update match history');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    // Initialize
    loadMatchHistory();
});
