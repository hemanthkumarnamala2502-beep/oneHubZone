// DOM Elements
const loginForm = document.getElementById('loginForm');
const loginMethodSelect = document.getElementById('loginMethod');
const identifierInput = document.getElementById('identifier');
const identifierLabel = document.getElementById('identifierLabel');
const passwordInput = document.getElementById('password');
const passwordToggle = document.getElementById('passwordToggle');
const rememberMeCheckbox = document.getElementById('rememberMe');
const loadingOverlay = document.getElementById('loadingOverlay');
const demoModal = document.getElementById('demoModal');

// Demo credentials for testing
const demoCredentials = {
    'national-id': {
        identifier: '123456789012',
        password: 'demo123'
    },
    'passport': {
        identifier: 'P123456789',
        password: 'demo123'
    },
    'email': {
        identifier: 'demo@citizen.gov',
        password: 'demo123'
    },
    'phone': {
        identifier: '+1-555-0123',
        password: 'demo123'
    }
};

// Update identifier field based on login method
loginMethodSelect.addEventListener('change', function() {
    const method = this.value;
    const identifierIcon = document.querySelector('.input-icon');
    
    switch(method) {
        case 'national-id':
            identifierLabel.textContent = 'National ID Number';
            identifierInput.placeholder = 'Enter your National ID (12 digits)';
            identifierIcon.className = 'fas fa-id-card input-icon';
            break;
        case 'passport':
            identifierLabel.textContent = 'Passport Number';
            identifierInput.placeholder = 'Enter your Passport Number';
            identifierIcon.className = 'fas fa-passport input-icon';
            break;
        case 'email':
            identifierLabel.textContent = 'Email Address';
            identifierInput.placeholder = 'Enter your email address';
            identifierIcon.className = 'fas fa-envelope input-icon';
            break;
        case 'phone':
            identifierLabel.textContent = 'Phone Number';
            identifierInput.placeholder = 'Enter your phone number';
            identifierIcon.className = 'fas fa-phone input-icon';
            break;
        default:
            identifierLabel.textContent = 'Identifier';
            identifierInput.placeholder = 'Enter your identifier';
            identifierIcon.className = 'fas fa-user input-icon';
    }
    
    identifierInput.value = '';
    passwordInput.value = '';
});

// Password toggle functionality
passwordToggle.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = this.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

// Form validation
function validateForm() {
    const loginMethod = loginMethodSelect.value;
    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;

    if (!loginMethod) {
        showNotification('Please select a login method', 'error');
        return false;
    }

    if (!identifier) {
        showNotification('Please enter your identifier', 'error');
        return false;
    }

    if (!password) {
        showNotification('Please enter your password', 'error');
        return false;
    }

    // Specific validation based on login method
    switch(loginMethod) {
        case 'national-id':
            if (!/^\d{12}$/.test(identifier)) {
                showNotification('National ID must be 12 digits', 'error');
                return false;
            }
            break;
        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
                showNotification('Please enter a valid email address', 'error');
                return false;
            }
            break;
        case 'phone':
            if (!/^[\+]?[\d\s\-\(\)]+$/.test(identifier)) {
                showNotification('Please enter a valid phone number', 'error');
                return false;
            }
            break;
    }

    return true;
}

// Authenticate user
async function authenticateUser(loginMethod, identifier, password) {
    // Check demo credentials
    const demoCredential = demoCredentials[loginMethod];
    if (demoCredential && 
        identifier === demoCredential.identifier && 
        password === demoCredential.password) {
        return {
            success: true,
            user: {
                id: '123456789',
                name: 'Hemanth Namala',
                method: loginMethod,
                identifier: identifier,
                role: 'citizen'
            }
        };
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, accept any credentials that aren't the demo ones
    // In a real application, this would make an API call to your authentication server
    return {
        success: false,
        message: 'Invalid credentials. Please use demo credentials or create an account.'
    };
}

// Handle form submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    const loginMethod = loginMethodSelect.value;
    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    // Show loading
    showLoading(true);

    try {
        const result = await authenticateUser(loginMethod, identifier, password);
        
        if (result.success) {
            // Store user session
            const userData = {
                ...result.user,
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };

            // Store in localStorage or sessionStorage
            if (rememberMe) {
                localStorage.setItem('userSession', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('userSession', JSON.stringify(userData));
            }

            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to main dashboard after success message
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
        console.error('Login error:', error);
    } finally {
        showLoading(false);
    }
});

// Social login handlers
document.querySelector('.google-btn').addEventListener('click', function() {
    showNotification('Google login coming soon!', 'info');
});

document.querySelector('.microsoft-btn').addEventListener('click', function() {
    showNotification('Microsoft login coming soon!', 'info');
});

// Biometric login handlers
document.getElementById('fingerprintBtn').addEventListener('click', function() {
    simulateBiometricAuth('fingerprint');
});

document.getElementById('faceIdBtn').addEventListener('click', function() {
    simulateBiometricAuth('face-id');
});

// Simulate biometric authentication
async function simulateBiometricAuth(type) {
    showLoading(true);
    showNotification(`Initializing ${type} authentication...`, 'info');
    
    // Simulate biometric check
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // For demo, randomly succeed or fail
    const success = Math.random() > 0.3;
    
    if (success) {
        const userData = {
            id: 'bio-user-123',
            name: 'Biometric User',
            method: type,
            identifier: `${type}-authenticated`,
            role: 'citizen',
            loginTime: new Date().toISOString(),
            rememberMe: false
        };
        
        sessionStorage.setItem('userSession', JSON.stringify(userData));
        showNotification(`${type} authentication successful!`, 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showNotification(`${type} authentication failed. Please try again.`, 'error');
    }
    
    showLoading(false);
}

// Show/hide loading overlay
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Show notifications
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    let bgColor, icon;
    switch(type) {
        case 'success':
            bgColor = '#10b981';
            icon = 'fa-check-circle';
            break;
        case 'error':
            bgColor = '#ef4444';
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = '#f59e0b';
            icon = 'fa-exclamation-triangle';
            break;
        default:
            bgColor = '#3b82f6';
            icon = 'fa-info-circle';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 350px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Demo modal functions
function showDemoCredentials() {
    demoModal.style.display = 'flex';
}

function closeDemoModal() {
    demoModal.style.display = 'none';
}

function fillDemoCredentials() {
    loginMethodSelect.value = 'national-id';
    loginMethodSelect.dispatchEvent(new Event('change'));
    
    setTimeout(() => {
        identifierInput.value = demoCredentials['national-id'].identifier;
        passwordInput.value = demoCredentials['national-id'].password;
    }, 100);
    
    closeDemoModal();
    showNotification('Demo credentials filled. You can now sign in.', 'success');
}

// Add notification animations to stylesheet
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Help links
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('help-link')) {
        e.preventDefault();
        const linkText = e.target.textContent;
        
        if (linkText === 'Need Help?') {
            showDemoCredentials();
        } else {
            showNotification(`${linkText} page coming soon!`, 'info');
        }
    }
    
    if (e.target.classList.contains('forgot-password')) {
        e.preventDefault();
        showNotification('Password reset functionality coming soon!', 'info');
    }
    
    if (e.target.classList.contains('register-link')) {
        e.preventDefault();
        showNotification('Registration page coming soon!', 'info');
    }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (userSession) {
        const userData = JSON.parse(userSession);
        const loginTime = new Date(userData.loginTime);
        const currentTime = new Date();
        const timeDiff = (currentTime - loginTime) / 1000 / 60; // in minutes
        
        // Check if session is still valid (30 minutes)
        if (timeDiff < 30) {
            showNotification('Welcome back! Redirecting to dashboard...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            // Session expired
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
            showNotification('Your session has expired. Please sign in again.', 'warning');
        }
    }
    
    // Show welcome message for new users
    showNotification('Welcome to OneHub Zone! Click "Need Help?" for demo credentials.', 'info');
});

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + D to fill demo credentials
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        fillDemoCredentials();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        if (demoModal.style.display === 'flex') {
            closeDemoModal();
        }
    }
});

// Auto-focus on identifier input when login method changes
loginMethodSelect.addEventListener('change', function() {
    setTimeout(() => {
        identifierInput.focus();
    }, 100);
});

// Add input formatting for specific login methods
identifierInput.addEventListener('input', function() {
    const method = loginMethodSelect.value;
    let value = this.value;
    
    if (method === 'national-id') {
        // Remove non-digits and limit to 12 characters
        value = value.replace(/\D/g, '').slice(0, 12);
    } else if (method === 'phone') {
        // Basic phone number formatting
        value = value.replace(/[^\d\+\-\(\)\s]/g, '');
    }
    
    this.value = value;
});

// Export for potential future use
window.LoginSystem = {
    showNotification: showNotification,
    showLoading: showLoading,
    authenticateUser: authenticateUser,
    fillDemoCredentials: fillDemoCredentials
};
