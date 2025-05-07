document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const accountControls = document.getElementById('accountControls');
    const userEmailSpan = document.getElementById('userEmail');

    // Check authentication state on page load
    async function checkAuthState() {
        try {
            const response = await fetch('/check-login', {
                credentials: 'include' 
            });
            const data = await response.json();

            if (data.email) {
                // User is logged in
                authButtons.style.display = 'none';
                userInfo.style.display = 'flex';
                accountControls.style.display = 'flex';
                userEmailSpan.textContent = data.email;

                // Check for linked account
                const linkedResponse = await fetch('/get-linked-account', {
                    credentials: 'include'
                });
                const linkedData = await linkedResponse.json();

                if (linkedData.success && linkedData.account) {
                    document.getElementById('linkAccountButton').style.display = 'none';
                    document.getElementById('unlinkAccountButton').style.display = 'block';
                } else {
                    document.getElementById('linkAccountButton').style.display = 'block';
                    document.getElementById('unlinkAccountButton').style.display = 'none';
                }
            } else {
                // User is not logged in
                authButtons.style.display = 'flex';
                userInfo.style.display = 'none';
                accountControls.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
        }
    }

    // Initialize auth state
    await checkAuthState();

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const logoutButton = document.getElementById('logoutButton');
    const closeButtons = document.getElementsByClassName('close');
    const forgotPasswordButton = document.getElementById('forgotPassword');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const linkAccountButton = document.getElementById('linkAccountButton');
    const linkAccountModal = document.getElementById('linkAccountModal');

    // Modal controls
    loginButton.addEventListener('click', () => loginModal.style.display = 'block');
    registerButton.addEventListener('click', () => registerModal.style.display = 'block');

    Array.from(closeButtons).forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loadingSpinner.style.display = 'block';

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('loginEmail').value,
                    password: document.getElementById('loginPassword').value
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                loginModal.style.display = 'none';
                
                // Update UI for logged in state
                document.getElementById('authButtons').style.display = 'none';
                document.getElementById('userInfo').style.display = 'flex';
                document.getElementById('userEmail').textContent = data.email;
                document.getElementById('accountControls').style.display = 'flex';
                
                // Load data first, then show profile
                await Promise.all([
                    loadSummonerProfile(),
                    updateWelcomeMessage()
                ]);
                
                loginForm.reset();
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        loadingSpinner.style.display = 'block';

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                registerModal.style.display = 'none';
                alert('Registration successful! Please log in.');
                registerForm.reset();
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Registration failed. Please try again.');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    // Logout functionality
    logoutButton.addEventListener('click', async () => {
        loadingSpinner.style.display = 'block';
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                sessionStorage.clear();
                window.location.replace('/');
            } else {
                const data = await response.json();
                console.error('Logout failed:', data.message);
                alert('Logout failed: ' + (data.message || 'Please try again'));
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    // Forgot password functionality
    forgotPasswordButton.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        if (!email) {
            alert('Please enter your email address');
            return;
        }

        loadingSpinner.style.display = 'block';
        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('Forgot password error:', error);
            alert('An error occurred while processing your request');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    // Link account button event listener
    linkAccountButton.addEventListener('click', () => {
        linkAccountModal.style.display = 'block';
        updateWelcomeMessage();
    });
});

// Helper functions
async function updateWelcomeMessage() {
    try {
        const response = await fetch('/get-linked-account');
        const data = await response.json();
        
        const welcomeMessage = document.getElementById('welcomeMessage');
        const summonerName = document.getElementById('summonerName');
        
        console.log('Account data received:', data);

        if (data.success && data.account && data.account.game_name) {
            welcomeMessage.style.display = 'block';
            summonerName.textContent = data.account.game_name;
        } else {
            welcomeMessage.style.display = 'none';
        }
    } catch (error) {
        console.error('Error updating welcome message:', error);
        welcomeMessage.style.display = 'none';
    }
}

async function loadSummonerProfile() {
    try {
        const profileSection = document.getElementById('summonerProfileSection');
        if (!profileSection) return;

        profileSection.style.display = 'flex';
        const response = await fetch('/get-summoner-profile');
        const data = await response.json();

        if (data.success && data.profile) {
            const profileContent = profileSection.querySelector('.profile-content');
            if (profileContent) {
                // Update profile content...
            }
        } else {
            const profileContent = profileSection.querySelector('.profile-content');
            if (profileContent) {
                profileContent.innerHTML = `
                    <div class="no-profile-message" style="text-align: center; padding: 20px; color: white;">
                        <h3>No League Account Linked</h3>
                        <p>Please link your League of Legends account to view your profile.</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading summoner profile:', error);
        const profileSection = document.getElementById('summonerProfileSection');
        if (profileSection) {
            const profileContent = profileSection.querySelector('.profile-content');
            if (profileContent) {
                profileContent.innerHTML = `
                    <div class="error-message" style="text-align: center; padding: 20px; color: white;">
                        <h3>To see profile information please refresh the website</h3>
                    </div>
                `;
            }
        }
    }
}