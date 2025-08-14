// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Animate statistics numbers
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const statisticsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStatNumbers();
                statisticsObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statisticsSection = document.querySelector('.statistics');
    if (statisticsSection) {
        statisticsObserver.observe(statisticsSection);
    }

    // Animate feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card, .service-category-preview');
    const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        cardObserver.observe(card);
    });

    // Check if user is already logged in
    const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    if (userSession) {
        const userData = JSON.parse(userSession);
        const loginTime = new Date(userData.loginTime);
        const currentTime = new Date();
        const timeDiff = (currentTime - loginTime) / 1000 / 60; // in minutes
        
        // Check if session is still valid (30 minutes)
        if (timeDiff < 30) {
            showNotification('You are already logged in. Redirecting to dashboard...', 'info');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }
    }
});

// Animate statistics numbers
function animateStatNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(statNumber => {
        const target = parseInt(statNumber.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                statNumber.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                statNumber.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    });
}

// Show demo video modal
function showDemoVideo() {
    const modal = createModal(`
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-video" style="font-size: 3rem; color: #2563eb; margin-bottom: 1rem;"></i>
            <h2 style="margin-bottom: 1rem; color: #1e293b;">Demo Video</h2>
            <p style="margin-bottom: 2rem; color: #64748b;">
                Watch how OneHub Zone simplifies your government service experience.
            </p>
            <div style="background: #f8fafc; border-radius: 0.5rem; padding: 3rem; margin: 1rem 0; border: 2px dashed #e2e8f0;">
                <i class="fas fa-play-circle" style="font-size: 4rem; color: #64748b; margin-bottom: 1rem;"></i>
                <p style="color: #64748b;">Demo video coming soon!</p>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn-primary" onclick="window.location.href='login.html'">
                    <i class="fas fa-rocket"></i> Try It Now
                </button>
                <button class="btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `);
}

// Show registration modal
function showRegistration() {
    const modal = createModal(`
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-user-plus" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
            <h2 style="margin-bottom: 1rem; color: #1e293b;">Create Your Account</h2>
            <p style="margin-bottom: 2rem; color: #64748b;">
                Join thousands of citizens who have simplified their government service experience.
            </p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
                <p style="color: #16a34a; font-size: 0.875rem;">
                    <i class="fas fa-info-circle"></i>
                    Registration system is coming soon! For now, use the demo login.
                </p>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn-primary" onclick="window.location.href='login.html'">
                    <i class="fas fa-sign-in-alt"></i> Try Demo Login
                </button>
                <button class="btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `);
}

// Create modal
function createModal(content) {
    // Remove existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
        backdrop-filter: blur(5px);
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        background: white;
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideInUp 0.3s ease-out;
    `;
    
    modal.innerHTML = content;
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    return modal;
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
    }
}

// Show notification
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

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const dashboardPreview = document.querySelector('.dashboard-preview');
    
    if (hero && scrolled <= hero.offsetHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    if (dashboardPreview && scrolled <= hero.offsetHeight) {
        dashboardPreview.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// Add CSS animations to stylesheet
const landingAnimations = document.createElement('style');
landingAnimations.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
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
document.head.appendChild(landingAnimations);

// Handle footer links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
        e.preventDefault();
        const linkText = e.target.textContent;
        showNotification(`${linkText} page coming soon!`, 'info');
    }
});

// Add loading state for buttons
document.querySelectorAll('button').forEach(button => {
    if (button.onclick && button.onclick.toString().includes('window.location.href')) {
        button.addEventListener('click', function() {
            const originalContent = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = originalContent;
                this.disabled = false;
            }, 1000);
        });
    }
});

// Initialize landing page
console.log('OneHub Zone - Landing Page Loaded');
showNotification('Welcome to OneHub Zone! Your gateway to digital government services.', 'info');
