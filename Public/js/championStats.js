document.addEventListener('DOMContentLoaded', () => {
    const championStatsTable = document.getElementById('championStatsTable');
    const toggleChampionStats = document.getElementById('toggleChampionStats');
    const refreshChampionStats = document.getElementById('refreshChampionStats');
    const loadingSpinner = document.getElementById('loadingSpinner');

    async function loadChampionStats() {
        try {
            const response = await fetch('/get-champions');
            const champions = await response.json();
            updateChampionStatsTable(champions);
        } catch (error) {
            console.error('Error loading champion stats:', error);
        }
    }

    function updateChampionStatsTable(stats) {
        const tableBody = document.querySelector('#championStatsTable tbody');
        tableBody.innerHTML = '';

        stats.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stat.champion_name}</td>
                <td>${stat.games_played}</td>
                <td>${stat.win_rate}%</td>
                <td>${stat.kda}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    toggleChampionStats.addEventListener('click', () => {
        const table = championStatsTable;
        if (table.style.display === 'none') {
            table.style.display = 'table';
            toggleChampionStats.textContent = 'Hide Table';
        } else {
            table.style.display = 'none';
            toggleChampionStats.textContent = 'Show Table';
        }
    });

    refreshChampionStats.addEventListener('click', async () => {
        loadingSpinner.style.display = 'block';
        try {
            await fetch('/update-champions', { method: 'GET' });
            await loadChampionStats();
        } catch (error) {
            console.error('Error refreshing champion stats:', error);
            alert('Failed to refresh champion statistics');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    // Initialize
    loadChampionStats();
});