document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const logoutButton = document.getElementById('logoutButton');
    const closeButtons = document.getElementsByClassName('close');
    const userEmailSpan = document.getElementById('userEmail');
    const forgotPasswordButton = document.getElementById('forgotPassword');
    const authButtons = document.querySelector('.auth-buttons');
    const userInfo = document.getElementById('userInfo');
    const loadingSpinner = document.getElementById('loadingSpinner');

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
                userEmailSpan.textContent = data.email;
                authButtons.style.display = 'none';
                userInfo.style.display = 'flex';
                loginForm.reset();
                location.reload(); // Refresh page to update all components
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loadingSpinner.style.display = 'block';

        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            loadingSpinner.style.display = 'none';
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('registerEmail').value,
                    password: password
                })
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
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    // Logout functionality
    logoutButton.addEventListener('click', async () => {
        loadingSpinner.style.display = 'block';
        try {
            const response = await fetch('/logout', { method: 'POST' });
            if (response.ok) {
                userEmailSpan.textContent = '';
                authButtons.style.display = 'flex';
                userInfo.style.display = 'none';
                location.reload(); // Refresh page to reset all components
            } else {
                alert('Logout failed');
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

    // Check login status on page load
    async function checkLoginStatus() {
        try {
            const response = await fetch('/check-login');
            const data = await response.json();
            
            if (data.email) {
                userEmailSpan.textContent = data.email;
                authButtons.style.display = 'none';
                userInfo.style.display = 'flex';
            } else {
                authButtons.style.display = 'flex';
                userInfo.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    }

    // Initialize
    checkLoginStatus();
});