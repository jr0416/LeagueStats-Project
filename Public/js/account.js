document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const linkAccountButton = document.getElementById('linkAccountButton');
    const linkAccountModal = document.getElementById('linkAccountModal');
    const linkAccountForm = document.getElementById('linkAccountForm');
    const closeBtn = document.querySelector('.close');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const unlinkAccountButton = document.getElementById('unlinkAccountButton');

    // Debug log for unlink button
    console.log('Found unlink button:', unlinkAccountButton);

    if (!linkAccountButton || !linkAccountModal || !linkAccountForm) {
        console.error('Required elements not found');
        return;
    }

    // Single event listener for link button
    linkAccountButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/get-linked-account');
            const data = await response.json();
            
            if (data && data.puuid) {
                alert('A League of Legends account is already linked to this profile.');
            } else {
                console.log('Link button clicked');
                linkAccountModal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error checking account status:', error);
            alert('Error checking account status. Please try again.');
        }
    });

    // Close modal functionality
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            linkAccountModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === linkAccountModal) {
            linkAccountModal.style.display = 'none';
        }
    });

    // Form submission
    linkAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loadingSpinner.style.display = 'block';

        const formData = {
            gameName: document.getElementById('gameName').value.trim(),
            tagLine: document.getElementById('tagLine').value.trim(),
            region: document.getElementById('region').value
        };

        try {
            const response = await fetch('/link-account-riotid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account linked successfully!');
                linkAccountModal.style.display = 'none';
                location.reload();
            } else {
                throw new Error(data.message || 'Error linking account');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error linking account');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    // Single unlink button handler
    if (unlinkAccountButton) {
        // Remove any existing listeners
        unlinkAccountButton.replaceWith(unlinkAccountButton.cloneNode(true));
        
        // Get fresh button reference
        const freshUnlinkButton = document.getElementById('unlinkAccountButton');
        
        // Add single event listener
        freshUnlinkButton.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Unlink button clicked');
            
            if (confirm('Are you sure you want to unlink your League account?')) {
                if (loadingSpinner) loadingSpinner.style.display = 'block';
                
                try {
                    const response = await fetch('/unlink-account', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });

                    console.log('Response status:', response.status);
                    const data = await response.json();
                    console.log('Response data:', data);

                    if (response.ok) {
                        alert('Account unlinked successfully!');
                        window.location.reload();
                    } else {
                        throw new Error(data.message || 'Failed to unlink account');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error unlinking account: ' + error.message);
                } finally {
                    if (loadingSpinner) loadingSpinner.style.display = 'none';
                }
            }
        });
    }

    // Check linked account status
    async function checkLinkedAccount() {
        try {
            const response = await fetch('/get-linked-account', { credentials: 'include' });
            const data = await response.json();
        
            const isLinked = data.success && data.account;
            linkAccountButton.style.display = isLinked ? 'none' : 'block';
            unlinkAccountButton.style.display = isLinked ? 'block' : 'none';
        } catch (err) {
            console.error('Error checking linked account:', err);
        }
    }

    // Initialize
    checkLinkedAccount();
    updateSummonerName();
});

// Helper function for updating summoner name
async function updateSummonerName() {
    try {
        const response = await fetch('/get-linked-account');
        const data = await response.json();
        
        const welcomeMessage = document.getElementById('welcomeMessage');
        const summonerName = document.getElementById('summonerName');
        
        if (data.success && data.account) {
            welcomeMessage.style.display = 'block';
            summonerName.textContent = `${data.account.game_name}#${data.account.tag_line}`;
        } else {
            welcomeMessage.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching summoner name:', error);
    }
}