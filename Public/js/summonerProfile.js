document.addEventListener('DOMContentLoaded', () => {
    const summonerProfileContainer = document.getElementById('summonerProfileContainer');

    async function loadSummonerProfile() {
        try {
            const response = await fetch('/get-summoner-profile');
            if (!response.ok) throw new Error('Failed to load summoner profile');
            
            const profileData = await response.json();
            displayProfile(profileData);
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('summonerProfileContainer').innerHTML = `
                <div class="error-message">If you are logged in please refresh the Website to see your summoner profile.</div>`;
        }
    }

    function displayProfile(profileData) {
        const container = document.getElementById('summonerProfileContainer');
        container.innerHTML = `
            <div class="summoner-info">
                <div class="summoner-header">
                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${profileData.summoner.profileIconId}.png" 
                         alt="Profile Icon" 
                         class="profile-icon">
                    <div class="summoner-details">
                        <h2>${profileData.summoner.gameName}#${profileData.summoner.tagLine}</h2>
                        <span class="level">Level ${profileData.summoner.summonerLevel}</span>
                    </div>
                </div>
            </div>
            <div class="ranked-info">
                ${profileData.ranked.map(queue => `
                    <div class="queue-card">
                        <h3>${queue.queueType}</h3>
                        <div class="rank-info">
                            <span class="tier">${queue.tier} ${queue.rank}</span>
                            <span class="lp">${queue.leaguePoints} LP</span>
                        </div>
                        <div class="win-loss">
                            <span class="wins">${queue.wins}W</span>
                            <span class="losses">${queue.losses}L</span>
                            <span class="win-rate">${queue.winRate}% WR</span>
                        </div>
                        ${queue.miniSeries ? createPromoDisplay(queue.miniSeries) : ''}
                    </div>
                `).join('')}
            </div>
        `;

        // Add champion mastery section
        if (profileData.mastery && profileData.mastery.length > 0) {
            const masterySection = document.createElement('div');
            masterySection.className = 'mastery-section';
            masterySection.innerHTML = `
                <h3>Champion Mastery</h3>
                <div class="mastery-grid">
                    ${profileData.mastery.map(champion => `
                        <div class="champion-mastery-card">
                            <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${getChampionKeyById(champion.championId)}.png" 
                                 alt="Champion Icon" 
                                 class="champion-icon">
                            <div class="mastery-info">
                                <span class="champion-name">${getChampionNameById(champion.championId)}</span>
                                <div class="mastery-details">
                                    <span class="mastery-level">Level ${champion.championLevel}</span>
                                    <span class="mastery-points">${formatNumber(champion.championPoints)} pts</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(masterySection);
        }
    }

    function formatQueueType(queueType) {
        switch(queueType) {
            case 'RANKED_SOLO_5x5':
                return 'Ranked Solo/Duo';
            case 'RANKED_FLEX_SR':
                return 'Ranked Flex';
            default:
                return queueType;
        }
    }

    function createPromoDisplay(promoProgress) {
        const games = promoProgress.split('');
        return `
            <div class="promo-series">
                ${games.map(game => `
                    <div class="promo-game ${game === 'W' ? 'win' : game === 'L' ? 'loss' : 'pending'}">
                        ${game === 'W' ? '✓' : game === 'L' ? '✗' : '−'}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Helper functions for champion data
    function getChampionKeyById(championId) {
        const championData = window.championData || {};
        return championData[championId]?.key || 'unknown';
    }

    function getChampionNameById(championId) {
        const championData = window.championData || {};
        return championData[championId]?.name || 'Unknown Champion';
    }

    function formatNumber(number) {
        return number.toLocaleString();
    }

    // Load profile on page load
    loadSummonerProfile();
});