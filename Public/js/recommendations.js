document.addEventListener('DOMContentLoaded', () => {
    const recommendationsContainer = document.getElementById('recommendationsContainer');

    async function loadRecommendations() {
        try {
            const response = await fetch('/recommendations');
            const recommendations = await response.json();
            
            recommendationsContainer.innerHTML = '';

            recommendations.forEach(rec => {
                const recommendation = document.createElement('div');
                recommendation.className = 'recommendation';
                
                // Check if it's a video link (YouTube)
                if (rec.type === 'video' && rec.link) {
                    const videoId = extractYoutubeId(rec.link);
                    recommendation.innerHTML = `
                        <h3>${rec.title}</h3>
                        <div class="video-embed">
                            <iframe 
                                width="100%" 
                                height="215" 
                                src="https://www.youtube.com/embed/${videoId}"
                                title="${rec.title}"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen>
                            </iframe>
                        </div>
                        <p>${rec.description}</p>
                    `;
                } else {
                    // Regular link recommendation
                    recommendation.innerHTML = `
                        <h3>${rec.title}</h3>
                        <p>${rec.description}</p>
                        <a href="${rec.link}" target="_blank" class="btn btn-primary">Learn More</a>
                    `;
                }
                
                recommendationsContainer.appendChild(recommendation);
            });
        } catch (error) {
            console.error('Error loading recommendations:', error);
            recommendationsContainer.innerHTML = '<p>Failed to load recommendations</p>';
        }
    }

    function extractYoutubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Initialize
    loadRecommendations();
});