const AUTH_API_URL = 'http://localhost:3001/api/auth';

// Helper functions
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    const successEl = document.getElementById('successMessage');
    if (successEl) successEl.classList.add('hidden');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}

function showSuccess(message) {
    const errorEl = document.getElementById('errorMessage');
    const successEl = document.getElementById('successMessage');
    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) {
        successEl.textContent = message;
        successEl.classList.remove('hidden');
    }
}

function hideMessages() {
    const errorEl = document.getElementById('errorMessage');
    const successEl = document.getElementById('successMessage');
    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');
}

function setLoading(loading) {
    const btn = document.getElementById('submitBtn');
    if (btn) {
        btn.disabled = loading;
        btn.textContent = loading ? 'Please wait...' : btn.dataset.originalText || btn.textContent;
        if (!loading && !btn.dataset.originalText) {
            btn.dataset.originalText = btn.textContent;
        }
    }
}

// Store original button text
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('submitBtn');
    if (btn) btn.dataset.originalText = btn.textContent;
    
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const currentPage = window.location.pathname;
    
    if (token && (currentPage.includes('signin') || currentPage.includes('signup'))) {
        // Redirect to main app if already logged in
        window.location.href = 'index.html';
    }
});

// Sign Up Handler
async function handleSignup() {
    hideMessages();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
    }
    
    setLoading(true);
    
    try {
        const response = await fetch(`${AUTH_API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess(data.message || 'Account created! Check your email to verify.');
            document.getElementById('signupForm').reset();
        } else {
            showError(data.error || 'Signup failed');
        }
    } catch (error) {
        showError('Failed to connect to server');
    } finally {
        setLoading(false);
    }
}

// Sign In Handler
async function handleSignin() {
    hideMessages();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked;
    
    setLoading(true);
    
    try {
        const response = await fetch(`${AUTH_API_URL}/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token
            if (remember) {
                localStorage.setItem('authToken', data.token);
            } else {
                sessionStorage.setItem('authToken', data.token);
            }
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showSuccess('Signed in successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            if (data.needsVerification) {
                showError('Please verify your email before signing in. Check your inbox.');
            } else {
                showError(data.error || 'Sign in failed');
            }
        }
    } catch (error) {
        showError('Failed to connect to server');
    } finally {
        setLoading(false);
    }
}

// Forgot Password Handler
async function handleForgotPassword() {
    hideMessages();
    
    const email = document.getElementById('email').value.trim();
    
    setLoading(true);
    
    try {
        const response = await fetch(`${AUTH_API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        showSuccess(data.message || 'If the email exists, a reset link will be sent.');
        document.getElementById('forgotForm').reset();
    } catch (error) {
        showError('Failed to connect to server');
    } finally {
        setLoading(false);
    }
}

// Reset Password Handler
async function handleResetPassword() {
    hideMessages();
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showError('Invalid reset link');
        return;
    }
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
    }
    
    setLoading(true);
    
    try {
        const response = await fetch(`${AUTH_API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Password reset successfully! Redirecting to sign in...');
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 2000);
        } else {
            showError(data.error || 'Reset failed');
        }
    } catch (error) {
        showError('Failed to connect to server');
    } finally {
        setLoading(false);
    }
}

// Auth utility functions for main app
function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function isAuthenticated() {
    return !!getAuthToken();
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    window.location.href = 'signin.html';
}

// Check auth status for protected pages
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'signin.html';
        return false;
    }
    return true;
}
