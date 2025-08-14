// DOM Elements
const searchInput = document.querySelector('.search-box input');
const searchBtn = document.querySelector('.search-btn');
let serviceLinks = []; // Will be populated after DOM loads
const quickActionCards = document.querySelectorAll('.quick-action-card');
const emergencyCards = document.querySelectorAll('.emergency-card');
const userNameElement = document.getElementById('userName');
const userIdElement = document.getElementById('userId');
const logoutBtn = document.getElementById('logoutBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

// Authentication check
function checkAuthentication() {
    const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (!userSession) {
        window.location.href = 'login.html';
        return null;
    }
    
    const userData = JSON.parse(userSession);
    const loginTime = new Date(userData.loginTime);
    const currentTime = new Date();
    const timeDiff = (currentTime - loginTime) / 1000 / 60; // in minutes
    
    // Check if session is still valid (30 minutes)
    if (timeDiff > 30) {
        // Session expired
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('userSession');
        alert('Your session has expired. Please sign in again.');
        window.location.href = 'login.html';
        return null;
    }
    
    return userData;
}

// Initialize dashboard with user data
function initializeDashboard() {
    const userData = checkAuthentication();
    if (!userData) return;
    
    // Update user info in header
    if (userNameElement) {
        userNameElement.textContent = userData.name || 'Demo User';
        userNameElement.style.display = 'block';
        userNameElement.style.opacity = '1';
    }
    if (userIdElement) {
        userIdElement.textContent = `ID: ${userData.id || 'N/A'}`;
        userIdElement.style.display = 'block';
        userIdElement.style.opacity = '1';
    }
    
    // Generate random dashboard stats
    updateDashboardStats();
    
    // Show welcome message
    showNotification(`Welcome back, ${userData.name || 'User'}!`, 'success');
    
    // Initialize service links after DOM is ready
    setTimeout(() => {
        serviceLinks = document.querySelectorAll('.service-list a');
        initializeServiceLinks();
    }, 500);
}

// Initialize service links functionality
function initializeServiceLinks() {
    // Re-query service links after DOM update
    serviceLinks = document.querySelectorAll('.service-list a');
    
    serviceLinks.forEach(link => {
        // Remove existing event listeners by cloning
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceName = newLink.getAttribute('data-service-name') || newLink.textContent.trim();
            const serviceUrl = newLink.getAttribute('data-service-url') || '#';
            showServiceModal(serviceName, serviceUrl);
        });
    });
    
    console.log(`Initialized ${serviceLinks.length} service links`);
}

// Update dashboard statistics
function updateDashboardStats() {
    const activeApplicationsElement = document.getElementById('activeApplications');
    const pendingApprovalsElement = document.getElementById('pendingApprovals');
    const completedServicesElement = document.getElementById('completedServices');
    
    // Simulate realistic data
    const stats = {
        active: Math.floor(Math.random() * 5) + 1,
        pending: Math.floor(Math.random() * 3) + 1,
        completed: Math.floor(Math.random() * 10) + 5
    };
    
    if (activeApplicationsElement) {
        animateNumber(activeApplicationsElement, stats.active);
    }
    if (pendingApprovalsElement) {
        animateNumber(pendingApprovalsElement, stats.pending);
    }
    if (completedServicesElement) {
        animateNumber(completedServicesElement, stats.completed);
    }
}

// Animate numbers
function animateNumber(element, target) {
    let current = 0;
    const increment = target / 20;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 50);
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
            showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    });
}

// Service filter functionality
if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterServices(filter);
        });
    });
}

// Filter services based on category
function filterServices(filter) {
    const serviceCategories = document.querySelectorAll('.service-category');
    
    serviceCategories.forEach(category => {
        switch(filter) {
            case 'all':
                category.style.display = 'block';
                break;
            case 'popular':
                // Show only first 4 categories as "popular"
                const index = Array.from(serviceCategories).indexOf(category);
                category.style.display = index < 4 ? 'block' : 'none';
                break;
            case 'recent':
                // Show random 3 categories as "recent"
                category.style.display = Math.random() > 0.5 ? 'block' : 'none';
                break;
            case 'favorites':
                // Show only first 3 categories as "favorites"
                const favIndex = Array.from(serviceCategories).indexOf(category);
                category.style.display = favIndex < 3 ? 'block' : 'none';
                break;
        }
    });
    
    showNotification(`Showing ${filter === 'all' ? 'all' : filter} services`, 'info');
}

// Search functionality
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        alert('Please enter a search term');
        return;
    }
    
    // Filter services based on search query
    let foundServices = [];
    
    serviceLinks.forEach(link => {
        const serviceName = link.textContent.toLowerCase();
        const serviceCategory = link.closest('.service-category').querySelector('.category-header h3').textContent.toLowerCase();
        
        if (serviceName.includes(query) || serviceCategory.includes(query)) {
            foundServices.push({
                name: link.textContent.trim(),
                category: serviceCategory,
                element: link
            });
        }
    });
    
    if (foundServices.length > 0) {
        // Highlight found services
        highlightSearchResults(foundServices);
        
        // Scroll to first result
        foundServices[0].element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        showNotification(`Found ${foundServices.length} service(s) matching "${query}"`);
    } else {
        showNotification(`No services found for "${query}"`);
    }
}

// Highlight search results
function highlightSearchResults(results) {
    // Clear previous highlights
    serviceLinks.forEach(link => {
        link.style.backgroundColor = '';
        link.style.transform = '';
    });
    
    // Highlight new results
    results.forEach(result => {
        result.element.style.backgroundColor = '#e0f2fe';
        result.element.style.transform = 'scale(1.02)';
    });
    
    // Remove highlights after 3 seconds
    setTimeout(() => {
        results.forEach(result => {
            result.element.style.backgroundColor = '';
            result.element.style.transform = '';
        });
    }, 3000);
}

// Show notification
function showNotification(message) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
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

// Event Listeners
searchBtn.addEventListener('click', performSearch);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Service link interactions
serviceLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const serviceName = link.textContent.trim();
        showServiceModal(serviceName);
    });
});

// Quick action card interactions
quickActionCards.forEach(card => {
    card.addEventListener('click', () => {
        const actionTitle = card.querySelector('h3').textContent;
        showActionModal(actionTitle);
    });
    
    // Add hover sound effect (optional)
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(-5px) scale(1)';
    });
});

// Emergency card interactions
emergencyCards.forEach(card => {
    card.addEventListener('click', () => {
        const phoneNumber = card.querySelector('.phone-number').textContent;
        const serviceName = card.querySelector('h3').textContent;
        
        if (confirm(`Call ${serviceName} at ${phoneNumber}?`)) {
            // In a real app, this would initiate a phone call
            window.open(`tel:${phoneNumber}`, '_blank');
        }
    });
});

// Service Modal
function showServiceModal(serviceName, serviceUrl) {
    const stateData = stateServicesData[currentState];
    const modal = createModal(`
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-info-circle" style="font-size: 3rem; color: #2563eb; margin-bottom: 1rem;"></i>
            <h2 style="margin-bottom: 1rem; color: #1e293b;">${serviceName}</h2>
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
                <p style="color: #0c4a6e; font-size: 0.875rem;">
                    <i class="fas fa-map-marker-alt"></i>
                    ${stateData.name} State Service
                </p>
            </div>
            <p style="margin-bottom: 2rem; color: #64748b;">
                To apply for ${serviceName}, you will be redirected to the official ${stateData.name} government website.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn-primary" onclick="openOfficialSite('${serviceUrl}', '${serviceName}')">
                    <i class="fas fa-external-link-alt"></i> Go to Official Site
                </button>
                <button class="btn-secondary" onclick="viewRequirements('${serviceName}')">
                    <i class="fas fa-list"></i> View Requirements
                </button>
                <button class="btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `);
}

// Action Modal
function showActionModal(actionTitle) {
    const modal = createModal(`
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-rocket" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
            <h2 style="margin-bottom: 1rem; color: #1e293b;">${actionTitle}</h2>
            <p style="margin-bottom: 2rem; color: #64748b;">
                This quick action will help you ${actionTitle.toLowerCase()} efficiently.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn-primary" onclick="executeAction('${actionTitle}')">
                    <i class="fas fa-bolt"></i> Continue
                </button>
                <button class="btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `);
}

// Create Modal
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
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    return modal;
}

// Close Modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
    }
}

// Action Functions
function startApplication(serviceName) {
    showNotification(`Starting application for ${serviceName}...`);
    closeModal();
    // In a real app, this would redirect to the application form
    setTimeout(() => {
        showNotification(`Redirecting to ${serviceName} application form`);
    }, 1000);
}

function viewRequirements(serviceName) {
    showNotification(`Loading requirements for ${serviceName}...`);
    closeModal();
    // In a real app, this would show the requirements
    setTimeout(() => {
        showNotification(`Displaying requirements for ${serviceName}`);
    }, 1000);
}

function executeAction(actionTitle) {
    showNotification(`Executing ${actionTitle}...`);
    closeModal();
    // In a real app, this would perform the specific action
    setTimeout(() => {
        showNotification(`${actionTitle} initiated successfully`);
    }, 1000);
}

// Open Official Government Website
function openOfficialSite(serviceUrl, serviceName) {
    if (serviceUrl && serviceUrl !== '#') {
        // Show loading notification
        showNotification(`Redirecting to official ${serviceName} website...`, 'info');
        
        // Close modal first
        closeModal();
        
        // Open the government website in a new tab after a short delay
        setTimeout(() => {
            window.open(serviceUrl, '_blank', 'noopener,noreferrer');
            showNotification(`Opened ${serviceName} in new tab`, 'success');
        }, 500);
    } else {
        showNotification('Official website link not available', 'warning');
        closeModal();
    }
}

// Add modal animations to stylesheet
const modalStyles = document.createElement('style');
modalStyles.textContent = `
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
`;
document.head.appendChild(modalStyles);

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

// Add loading states for interactive elements
function addLoadingState(element, duration = 1000) {
    const originalText = element.textContent;
    element.textContent = 'Loading...';
    element.disabled = true;
    element.style.opacity = '0.7';
    
    setTimeout(() => {
        element.textContent = originalText;
        element.disabled = false;
        element.style.opacity = '1';
    }, duration);
}

// National Services (Common for all states)
const nationalServices = {
    'National Identity & Documentation': [
        { name: 'Aadhaar Card', icon: 'fa-id-card', url: 'https://uidai.gov.in/' },
        { name: 'PAN Card', icon: 'fa-credit-card', url: 'https://www.incometax.gov.in/iec/foportal/' },
        { name: 'Voter ID Card', icon: 'fa-vote-yea', url: 'https://voters.eci.gov.in/' },
        { name: 'Passport', icon: 'fa-passport', url: 'https://passportindia.gov.in/' }
    ],
    'National Employment & Finance': [
        { name: 'EPFO Services', icon: 'fa-piggy-bank', url: 'https://www.epfindia.gov.in/' },
        { name: 'ESIC Services', icon: 'fa-medkit', url: 'https://www.esic.nic.in/' },
        { name: 'Income Tax Filing', icon: 'fa-file-invoice-dollar', url: 'https://www.incometax.gov.in/' },
        { name: 'GST Registration', icon: 'fa-file-contract', url: 'https://www.gst.gov.in/' }
    ],
    'National Transportation': [
        { name: 'Driving License', icon: 'fa-id-card-alt', url: 'https://parivahan.gov.in/' },
        { name: 'Vehicle Registration', icon: 'fa-car', url: 'https://parivahan.gov.in/' },
        { name: 'Learning License', icon: 'fa-graduation-cap', url: 'https://parivahan.gov.in/' },
        { name: 'International Driving Permit', icon: 'fa-globe', url: 'https://parivahan.gov.in/' }
    ],
    'National Banking & Schemes': [
        { name: 'Jan Dhan Account', icon: 'fa-university', url: 'https://pmjdy.gov.in/' },
        { name: 'Mudra Loan', icon: 'fa-hand-holding-usd', url: 'https://www.mudra.org.in/' },
        { name: 'Kisan Credit Card', icon: 'fa-tractor', url: 'https://pmkisan.gov.in/' },
        { name: 'Digital India Services', icon: 'fa-digital-tachograph', url: 'https://digitalindia.gov.in/' }
    ]
};

// State-specific services data
const stateServicesData = {
    telangana: {
        name: 'Telangana',
        services: {
            'Identity & Documentation': [
                { name: 'Voter ID Card', icon: 'fa-id-card', url: 'https://voters.eci.gov.in/login' },
                { name: 'Birth Certificate', icon: 'fa-certificate', url: 'https://webland.telangana.gov.in/webland/jsp/common/homeAction.action' },
                { name: 'Marriage Certificate', icon: 'fa-ring', url: 'https://webland.telangana.gov.in/webland/jsp/common/homeAction.action' },
                { name: 'Death Certificate', icon: 'fa-cross', url: 'https://webland.telangana.gov.in/webland/jsp/common/homeAction.action' },
                { name: 'Caste Certificate', icon: 'fa-id-badge', url: 'https://webland.telangana.gov.in/webland/jsp/common/homeAction.action' },
                { name: 'Income Certificate', icon: 'fa-file-invoice-dollar', url: 'https://webland.telangana.gov.in/webland/jsp/common/homeAction.action' }
            ],
            'Business & Licensing': [
                { name: 'Shop & Establishment License', icon: 'fa-building', url: 'https://industries.telangana.gov.in/tsipass/' },
                { name: 'GST Registration', icon: 'fa-file-contract', url: 'https://services.gst.gov.in/services/login' },
                { name: 'Trade License', icon: 'fa-industry', url: 'https://ghmc.gov.in/onlineservices/trade-license/' },
                { name: 'Food License (FSSAI)', icon: 'fa-utensils', url: 'https://foscos.fssai.gov.in/portal/' },
                { name: 'Pollution Control Board NOC', icon: 'fa-shield-alt', url: 'https://tspcb.cgg.gov.in/CTE_CTO_Online_Services.html' },
                { name: 'Professional Tax Registration', icon: 'fa-receipt', url: 'https://cfo.telangana.gov.in/cfo/professionalTax.htm' }
            ],
            'Transportation': [
                { name: 'Driving License', icon: 'fa-id-card-alt', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
                { name: 'Vehicle Registration', icon: 'fa-car', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/stateSelection/form.action' },
                { name: 'Learning License', icon: 'fa-graduation-cap', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
                { name: 'Vehicle Fitness Certificate', icon: 'fa-clipboard-check', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/stateSelection/form.action' },
                { name: 'Road Tax Payment', icon: 'fa-road', url: 'https://transport.telangana.gov.in/html/eservices.html' },
                { name: 'International Driving Permit', icon: 'fa-globe', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' }
            ],
            'Property & Housing': [
                { name: 'Property Registration', icon: 'fa-home', url: 'https://webland.telangana.gov.in/webland/jsp/common/homeAction.action' },
                { name: 'Building Approval', icon: 'fa-hammer', url: 'https://ghmc.gov.in/onlineservices/building-permission/' },
                { name: 'Patta Transfer', icon: 'fa-exchange-alt', url: 'https://webland.telangana.gov.in/webland/jsp/common/homeAction.action' },
                { name: 'Survey Settlement', icon: 'fa-map', url: 'https://webland.telangana.gov.in/webland/jsp/common/homeAction.action' },
                { name: 'Property Tax', icon: 'fa-money-bill-wave', url: 'https://ghmc.gov.in/onlineservices/property-tax/' },
                { name: 'Occupancy Rights', icon: 'fa-key', url: 'https://webland.telangana.gov.in/webland/jsp/common/homeAction.action' }
            ]
        }
    },
    tamilnadu: {
        name: 'Tamil Nadu',
        services: {
            'Identity & Documentation': [
                { name: 'Voter ID Card', icon: 'fa-id-card', url: 'https://voters.eci.gov.in/login' },
                { name: 'Birth Certificate', icon: 'fa-certificate', url: 'https://serviceonline.gov.in/serviceLinkHome.html?serviceToken=H7v1muo7au&newLink=N&%3Ccsrf:token%20uri=%27serviceLinkHome.html%27/%3E' },
                { name: 'Marriage Certificate', icon: 'fa-ring', url: 'https://serviceonline.gov.in/serviceLinkHome.html?serviceToken=H7v1muo7au&newLink=N&%3Ccsrf:token%20uri=%27serviceLinkHome.html%27/%3E' },
                { name: 'Death Certificate', icon: 'fa-cross', url: 'https://serviceonline.gov.in/serviceLinkHome.html?serviceToken=H7v1muo7au&newLink=N&%3Ccsrf:token%20uri=%27serviceLinkHome.html%27/%3E' },
                { name: 'Community Certificate', icon: 'fa-users', url: 'https://serviceonline.gov.in/serviceLinkHome.html?serviceToken=H7v1muo7au&newLink=N&%3Ccsrf:token%20uri=%27serviceLinkHome.html%27/%3E' },
                { name: 'Income Certificate', icon: 'fa-file-invoice-dollar', url: 'https://serviceonline.gov.in/serviceLinkHome.html?serviceToken=H7v1muo7au&newLink=N&%3Ccsrf:token%20uri=%27serviceLinkHome.html%27/%3E' }
            ],
            'Business & Licensing': [
                { name: 'Shop & Establishment License', icon: 'fa-building', url: 'https://www.investingintamilnadu.com/single-window-clearance' },
                { name: 'GST Registration', icon: 'fa-file-contract', url: 'https://services.gst.gov.in/services/login' },
                { name: 'Trade License', icon: 'fa-industry', url: 'https://www.tntax.gov.in/tntax/' },
                { name: 'Food License (FSSAI)', icon: 'fa-utensils', url: 'https://foscos.fssai.gov.in/portal/' },
                { name: 'Factory License', icon: 'fa-industry', url: 'https://tnpcb.gov.in/pdf/OnlineServices.pdf' },
                { name: 'Professional Tax Certificate', icon: 'fa-receipt', url: 'https://www.tntax.gov.in/ptax/ptax.htm' }
            ],
            'Transportation': [
                { name: 'Driving License', icon: 'fa-id-card-alt', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
                { name: 'Vehicle Registration', icon: 'fa-car', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/stateSelection/form.action' },
                { name: 'Learning License', icon: 'fa-graduation-cap', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
                { name: 'Fitness Certificate', icon: 'fa-clipboard-check', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/stateSelection/form.action' },
                { name: 'Motor Vehicle Tax', icon: 'fa-road', url: 'https://tnrto.gov.in/online_tax_payment.html' },
                { name: 'Permit Services', icon: 'fa-file-alt', url: 'https://tnrto.gov.in/permit_services.html' }
            ],
            'Property & Housing': [
                { name: 'Property Registration', icon: 'fa-home', url: 'https://tnreginet.gov.in/portal/login' },
                { name: 'Building Plan Approval', icon: 'fa-hammer', url: 'https://www.chennaicorporation.gov.in/building-plan-approval/' },
                { name: 'Patta & Chitta', icon: 'fa-file-alt', url: 'https://webland.tn.gov.in/portal/login' },
                { name: 'Survey Settlement', icon: 'fa-map', url: 'https://webland.tn.gov.in/portal/login' },
                { name: 'Property Tax', icon: 'fa-money-bill-wave', url: 'https://www.chennaicorporation.gov.in/property-tax-online/' },
                { name: 'Housing Board Services', icon: 'fa-building', url: 'https://www.tnhb.tn.gov.in/online-services.html' }
            ]
        }
    },
    andhrapradesh: {
        name: 'Andhra Pradesh',
        services: {
            'Identity & Documentation': [
                { name: 'Voter ID Card', icon: 'fa-id-card', url: 'https://voters.eci.gov.in/login' },
                { name: 'Birth Certificate', icon: 'fa-certificate', url: 'https://webland.ap.gov.in/VRO/' },
                { name: 'Marriage Certificate', icon: 'fa-ring', url: 'https://webland.ap.gov.in/VRO/' },
                { name: 'Death Certificate', icon: 'fa-cross', url: 'https://webland.ap.gov.in/VRO/' },
                { name: 'Caste Certificate', icon: 'fa-users', url: 'https://webland.ap.gov.in/VRO/' },
                { name: 'Income Certificate', icon: 'fa-file-invoice-dollar', url: 'https://webland.ap.gov.in/VRO/' }
            ],
            'Business & Licensing': [
                { name: 'AP Shop & Establishment License', icon: 'fa-building', url: 'https://appcb.ap.gov.in/' },
                { name: 'GST Registration', icon: 'fa-file-contract', url: 'https://services.gst.gov.in/services/login' },
                { name: 'Trade License', icon: 'fa-industry', url: 'https://webland.ap.gov.in/' },
                { name: 'Food License (FSSAI)', icon: 'fa-utensils', url: 'https://foscos.fssai.gov.in/' },
                { name: 'Industrial License', icon: 'fa-cogs', url: 'https://appcb.ap.gov.in/OnlineServices.do' },
                { name: 'Professional Tax Registration', icon: 'fa-receipt', url: 'https://cfo.ap.gov.in/' }
            ],
            'Transportation': [
                { name: 'Driving License', icon: 'fa-id-card-alt', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
                { name: 'Vehicle Registration', icon: 'fa-car', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/stateSelection/form.action' },
                { name: 'Learning License', icon: 'fa-graduation-cap', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
                { name: 'Fitness Certificate', icon: 'fa-clipboard-check', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/stateSelection/form.action' },
                { name: 'Road Tax & Fees', icon: 'fa-road', url: 'https://aptransport.org/online-services/' },
                { name: 'Permit Application', icon: 'fa-file-alt', url: 'https://aptransport.org/online-services/' }
            ],
            'Property & Housing': [
                { name: 'Property Registration', icon: 'fa-home', url: 'https://webland.ap.gov.in/' },
                { name: 'Building Permission', icon: 'fa-hammer', url: 'https://webland.ap.gov.in/' },
                { name: 'Land Records', icon: 'fa-map', url: 'https://webland.ap.gov.in/' },
                { name: 'Patta Services', icon: 'fa-file-alt', url: 'https://webland.ap.gov.in/' },
                { name: 'Property Tax', icon: 'fa-money-bill-wave', url: 'https://webland.ap.gov.in/' },
                { name: 'Housing Scheme', icon: 'fa-building', url: 'https://apshcl.ap.gov.in/' }
            ]
        }
    },
    maharashtra: {
        name: 'Maharashtra',
        services: {
            'Identity & Documentation': [
                { name: 'Voter ID Card', icon: 'fa-id-card', url: 'https://voters.eci.gov.in/login' },
                { name: 'Birth Certificate', icon: 'fa-certificate', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Marriage Certificate', icon: 'fa-ring', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Death Certificate', icon: 'fa-cross', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Caste Certificate', icon: 'fa-users', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Income Certificate', icon: 'fa-file-invoice-dollar', url: 'https://aaplesarkar.mahaonline.gov.in/' }
            ],
            'Business & Licensing': [
                { name: 'Shop & Establishment License', icon: 'fa-building', url: 'https://mahafacilitation.gov.in/' },
                { name: 'GST Registration', icon: 'fa-file-contract', url: 'https://services.gst.gov.in/services/login' },
                { name: 'Trade License', icon: 'fa-industry', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Food License (FSSAI)', icon: 'fa-utensils', url: 'https://foscos.fssai.gov.in/' },
                { name: 'Factory License', icon: 'fa-cogs', url: 'https://mpcb.gov.in/online-services' },
                { name: 'Professional Tax Certificate', icon: 'fa-receipt', url: 'https://aaplesarkar.mahaonline.gov.in/' }
            ],
            'Transportation': [
                { name: 'Driving License', icon: 'fa-id-card-alt', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
                { name: 'Vehicle Registration', icon: 'fa-car', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/stateSelection/form.action' },
                { name: 'Learning License', icon: 'fa-graduation-cap', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
                { name: 'Fitness Certificate', icon: 'fa-clipboard-check', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/stateSelection/form.action' },
                { name: 'Motor Vehicle Tax', icon: 'fa-road', url: 'https://transport.maharashtra.gov.in/1035/Online-Services' },
                { name: 'Permit Services', icon: 'fa-file-alt', url: 'https://transport.maharashtra.gov.in/1035/Online-Services' }
            ],
            'Property & Housing': [
                { name: 'Property Registration', icon: 'fa-home', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Building Plan Approval', icon: 'fa-hammer', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: '7/12 Extract', icon: 'fa-file-alt', url: 'https://bhulekh.mahabhumi.gov.in/' },
                { name: '8A Extract', icon: 'fa-map', url: 'https://bhulekh.mahabhumi.gov.in/' },
                { name: 'Property Tax', icon: 'fa-money-bill-wave', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Housing Board Services', icon: 'fa-building', url: 'https://mhada.maharashtra.gov.in/english' }
            ]
        }
    }
};

// Current selected state
let currentState = 'telangana';

// DOM Elements for state functionality
const stateSelector = document.getElementById('stateSelect');
const currentStateDisplay = document.getElementById('currentState');

// Update state display
function updateStateDisplay() {
    if (currentStateDisplay) {
        currentStateDisplay.textContent = `Current State: ${stateServicesData[currentState].name}`;
    }
}

// Initialize state selector
function initializeStateSelector() {
    if (!stateSelector) return;
    
    // Clear existing options first to prevent duplicates
    stateSelector.innerHTML = '<option value="">Select State</option>';
    
    // Populate state selector options
    Object.keys(stateServicesData).forEach(stateKey => {
        const state = stateServicesData[stateKey];
        const option = document.createElement('option');
        option.value = stateKey;
        option.textContent = state.name;
        stateSelector.appendChild(option);
    });
    
    // Set initial state display
    updateStateDisplay();
    
    // Change event listener
    stateSelector.addEventListener('change', function() {
        const selectedState = this.value;
        if (stateServicesData[selectedState]) {
            currentState = selectedState;
            updateStateDisplay();
            filterServicesByState(currentState);
        }
    });
}

// Filter services by current state
function filterServicesByState(stateKey) {
    const allServices = document.querySelectorAll('.service-category');
    
    allServices.forEach(category => {
        const categoryName = category.querySelector('.category-header h3').textContent;
        const services = stateServicesData[stateKey].services[categoryName] || [];
        
        if (services.length > 0) {
            category.style.display = 'block';
            const serviceList = category.querySelector('.service-list');
            serviceList.innerHTML = ''; // Clear existing services
            
            // Add services for the current state
            services.forEach(service => {
                const serviceItem = document.createElement('a');
                serviceItem.href = '#';
                serviceItem.className = 'service-item';
                serviceItem.setAttribute('data-service-name', service.name);
                serviceItem.setAttribute('data-service-url', service.url);
                serviceItem.innerHTML = `
                    <i class="fas ${service.icon}" aria-hidden="true"></i>
                    ${service.name}
                `;
                
                serviceItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    showServiceModal(service.name, service.url);
                });
                
                serviceList.appendChild(serviceItem);
            });
        } else {
            category.style.display = 'none';
        }
    });
    
    showNotification(`Services updated for ${stateServicesData[stateKey].name}`, 'info');
}

// State switching functionality
function switchState(newState) {
    if (!stateServicesData[newState]) return;
    
    currentState = newState;
    
    // Load state services
    loadStateServices(newState);
    
    // Update state display
    updateStateDisplay();
    
    // Show notification
    showNotification(`Switched to ${stateServicesData[newState].name} services`, 'success');
    
    // Save state preference
    localStorage.setItem('selectedState', newState);
}

// Update services display for selected state
function updateServicesForState(state) {
    const stateData = stateServicesData[state];
    const servicesGrid = document.querySelector('.services-grid');
    
    if (!servicesGrid) return;
    
    // Clear existing services
    servicesGrid.innerHTML = '';
    
    // Add state-specific services
    Object.keys(stateData.services).forEach(categoryName => {
        const category = stateData.services[categoryName];
        
        const categoryElement = document.createElement('div');
        categoryElement.className = 'service-category';
        categoryElement.innerHTML = `
            <div class="category-header">
                <i class="fas ${getCategoryIcon(categoryName)}"></i>
                <h3>${categoryName}</h3>
                <span class="state-badge">${stateData.name}</span>
            </div>
            <ul class="service-list">
                ${category.map(service => `
                    <li>
                        <a href="#" data-service-name="${service.name}" data-service-url="${service.url}">
                            <i class="fas ${service.icon}"></i> 
                            ${service.name}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
        
        servicesGrid.appendChild(categoryElement);
    });
    
    // Re-initialize service links
    initializeServiceLinks();
}

// Get category icon
function getCategoryIcon(categoryName) {
    const iconMap = {
        'Identity & Documentation': 'fa-id-card',
        'Business & Licensing': 'fa-briefcase',
        'Transportation': 'fa-car',
        'Property & Housing': 'fa-home',
        'Health & Welfare': 'fa-heartbeat',
        'Education': 'fa-graduation-cap',
        'Utilities': 'fa-bolt',
        'Financial Services': 'fa-coins',
        'Legal Services': 'fa-balance-scale'
    };
    return iconMap[categoryName] || 'fa-cog';
}

// State selector event listener
if (stateSelector) {
    stateSelector.addEventListener('change', function() {
        switchState(this.value);
    });
}

// Load saved state preference
function loadStatePreference() {
    const savedState = localStorage.getItem('selectedState');
    if (savedState && stateServicesData[savedState]) {
        currentState = savedState;
        if (stateSelector) {
            stateSelector.value = savedState;
        }
        switchState(savedState);
    } else {
        // Default to first state
        const firstState = Object.keys(stateServicesData)[0];
        currentState = firstState;
        if (stateSelector) {
            stateSelector.value = firstState;
        }
        switchState(firstState);
    }
}

// Load National Services
function loadNationalServices() {
    const nationalGrid = document.getElementById('nationalServicesGrid');
    if (!nationalGrid) return;

    nationalGrid.innerHTML = '';

    Object.keys(nationalServices).forEach(categoryName => {
        const services = nationalServices[categoryName];
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'service-category';
        
        const categoryIcon = getCategoryIcon(categoryName);
        categoryDiv.innerHTML = `
            <div class="category-header">
                <i class="fas ${categoryIcon}"></i>
                <h3>${categoryName}</h3>
            </div>
            <ul class="service-list">
                ${services.map(service => `
                    <li>
                        <a href="#" data-service-name="${service.name}" data-service-url="${service.url}">
                            <i class="fas ${service.icon}"></i> 
                            ${service.name}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;

        nationalGrid.appendChild(categoryDiv);
    });

    // Initialize national service links
    initializeNationalServiceLinks();
}

// Load State Services for current state
function loadStateServices(stateKey) {
    const stateGrid = document.getElementById('stateServicesGrid');
    if (!stateGrid || !stateServicesData[stateKey]) return;

    stateGrid.innerHTML = '';

    Object.keys(stateServicesData[stateKey].services).forEach(categoryName => {
        const services = stateServicesData[stateKey].services[categoryName];
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'service-category';
        
        const categoryIcon = getCategoryIcon(categoryName);
        categoryDiv.innerHTML = `
            <div class="category-header">
                <i class="fas ${categoryIcon}"></i>
                <h3>${categoryName}</h3>
            </div>
            <ul class="service-list">
                ${services.map(service => `
                    <li>
                        <a href="#" data-service-name="${service.name}" data-service-url="${service.url}">
                            <i class="fas ${service.icon}"></i> 
                            ${service.name}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;

        stateGrid.appendChild(categoryDiv);
    });

    // Update current state display
    const currentStateSpan = document.getElementById('currentState');
    if (currentStateSpan) {
        currentStateSpan.textContent = stateServicesData[stateKey].name;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    const userData = checkAuthentication();
    if (!userData) return;
    
    console.log('OneHub Zone - Citizen Services Dashboard Loaded');
    initializeDashboard();
    initializeStateSelector();
    loadNationalServices();
    
    // Add stagger animation to service categories
    const serviceCategories = document.querySelectorAll('.service-category');
    serviceCategories.forEach((category, index) => {
        category.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add stagger animation to quick action cards
    const quickActions = document.querySelectorAll('.quick-action-card');
    quickActions.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Load national services
    loadNationalServices();
    
    // Load saved state preference (this will also load state services)
    loadStatePreference();
});

// Handle form submissions (if any forms are added later)
function handleFormSubmit(formData, serviceType) {
    showNotification(`Submitting ${serviceType} application...`);
    
    // Simulate API call
    setTimeout(() => {
        const applicationId = generateApplicationId();
        showNotification(`Application submitted successfully! Reference ID: ${applicationId}`);
    }, 2000);
}

// Generate random application ID
function generateApplicationId() {
    const prefix = 'APP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

// Export functions for potential future use
window.OneHubZone = {
    search: performSearch,
    showNotification: showNotification,
    showServiceModal: showServiceModal,
    showActionModal: showActionModal,
    closeModal: closeModal
};
