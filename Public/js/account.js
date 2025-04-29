document.addEventListener('DOMContentLoaded', () => {
    const linkAccountButton = document.getElementById('linkAccountButton');
    const linkAccountModal = document.getElementById('linkAccountModal');
    const linkAccountForm = document.getElementById('linkAccountForm');
    const closeBtn = document.querySelector('.close');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const unlinkAccountButton = document.getElementById('unlinkAccountButton');

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
                // Show server message for already linked account
                alert('A League of Legends account is already linked to this profile. Please unlink your current account before linking a new one.');
            } else {
                console.log('Link button clicked'); // Debug log
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

    // Unlink button functionality
    unlinkAccountButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to unlink your League account?')) {
            try {
                const response = await fetch('/unlink-account', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to unlink account');
                }

                alert('Account unlinked successfully!');
                location.reload();
            } catch (error) {
                console.error('Error:', error);
                alert('Error unlinking account');
            }
        }
    });

    // Check linked account status
    async function checkLinkedAccount() {
        try {
            const response = await fetch('/get-linked-account');
            const data = await response.json();
            
            if (data && data.puuid) {
                linkAccountButton.disabled = true;
                unlinkAccountButton.disabled = false;
            } else {
                linkAccountButton.disabled = false;
                unlinkAccountButton.disabled = true;
            }
        } catch (error) {
            console.error('Error checking linked account:', error);
        }
    }

    // Initialize
    checkLinkedAccount();
});