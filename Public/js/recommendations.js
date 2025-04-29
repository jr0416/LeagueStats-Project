document.addEventListener('DOMContentLoaded', () => {
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');

    async function loadRecommendations() {
        try {
            const response = await fetch('/recommendations');
            const recommendations = await response.json();
            
            recommendationsContainer.innerHTML = '';

            recommendations.forEach(rec => {
                const recommendation = document.createElement('div');
                recommendation.className = 'recommendation';
                recommendation.innerHTML = `
                    <h3>${rec.title}</h3>
                    <p>${rec.description}</p>
                    ${rec.link ? `<a href="${rec.link}" target="_blank" class="btn btn-primary">Learn More</a>` : ''}
                `;
                recommendationsContainer.appendChild(recommendation);
            });
        } catch (error) {
            console.error('Error loading recommendations:', error);
            recommendationsContainer.innerHTML = '<p>Failed to load recommendations</p>';
        }
    }

    // Initialize
    loadRecommendations();
});