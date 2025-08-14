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

// State management variables
let currentState = 'telangana';
const stateSelector = document.getElementById('stateSelect');

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
    console.log('=== INITIALIZING SERVICE LINKS ===');
    
    // Use event delegation instead of individual event listeners
    // This ensures clicks work on dynamically added elements
    const nationalGrid = document.getElementById('nationalServicesGrid');
    const stateGrid = document.getElementById('stateServicesGrid');
    
    // Remove any existing event listeners first
    if (nationalGrid) {
        console.log('Setting up national services event delegation');
        nationalGrid.removeEventListener('click', handleServiceClick);
        nationalGrid.addEventListener('click', handleServiceClick);
    } else {
        console.error('National services grid not found');
    }
    
    if (stateGrid) {
        console.log('Setting up state services event delegation');
        stateGrid.removeEventListener('click', handleServiceClick);
        stateGrid.addEventListener('click', handleServiceClick);
    } else {
        console.error('State services grid not found');
    }
    
    // BACKUP: Also add direct click handlers to existing service links
    setTimeout(() => {
        const allServiceLinks = document.querySelectorAll('a[data-service-url]');
        console.log(`Found ${allServiceLinks.length} service links for direct event handlers`);
        
        allServiceLinks.forEach((link, index) => {
            const serviceName = link.getAttribute('data-service-name');
            const serviceUrl = link.getAttribute('data-service-url');
            console.log(`${index + 1}. ${serviceName} -> ${serviceUrl}`);
            
            // Remove any existing click handlers
            link.removeEventListener('click', directServiceLinkHandler);
            // Add direct click handler
            link.addEventListener('click', directServiceLinkHandler);
        });
    }, 1000);
    
    console.log('Service link event delegation initialized');
}

// Direct service link handler as backup
function directServiceLinkHandler(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const serviceName = link.getAttribute('data-service-name') || link.textContent.trim();
    const serviceUrl = link.getAttribute('data-service-url');
    
    console.log('=== DIRECT LINK HANDLER ===');
    console.log(`Direct click: ${serviceName} -> ${serviceUrl}`);
    
    if (serviceUrl && serviceUrl !== '#' && serviceUrl !== '') {
        showServiceModal(serviceName, serviceUrl);
    } else {
        console.error('Invalid service URL:', serviceUrl);
        showNotification('Service URL not available', 'error');
    }
}

// Handle service link clicks using event delegation
function handleServiceClick(e) {
    console.log('=== SERVICE CLICK DEBUG START ===');
    console.log('Click detected:', e.target);
    console.log('Target tagName:', e.target.tagName);
    console.log('Target classes:', e.target.className);
    console.log('Event target closest a:', e.target.closest('a'));
    
    // Check if clicked element is a service link or within a service card
    const link = e.target.closest('a[data-service-url]') || e.target.closest('.service-card a') || e.target.closest('a');
    console.log('Found link:', link);
    
    if (link && link.hasAttribute('data-service-url')) {
        e.preventDefault();
        const serviceName = link.getAttribute('data-service-name') || link.textContent.trim();
        const serviceUrl = link.getAttribute('data-service-url');
        
        console.log(`Service clicked: ${serviceName} -> ${serviceUrl}`);
        console.log('=== SERVICE CLICK DEBUG END ===');
        
        // If it's a valid URL, show modal, otherwise show error
        if (serviceUrl && serviceUrl !== '#' && serviceUrl !== '') {
            showServiceModal(serviceName, serviceUrl);
        } else {
            console.error('Invalid service URL:', serviceUrl);
            showNotification('Service URL not available', 'error');
        }
    } else {
        console.log('No service link with data-service-url found');
        console.log('=== SERVICE CLICK DEBUG END ===');
    }
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

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Show service modal
function showServiceModal(serviceName, serviceUrl) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${serviceName}</h2>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <p>You are about to access the official government service for <strong>${serviceName}</strong>.</p>
                <div class="modal-actions">
                    <button onclick="window.open('${serviceUrl}', '_blank')" class="btn-primary">
                        <i class="fas fa-external-link-alt"></i> Open Service
                    </button>
                    <button onclick="closeModal(this)" class="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
}

// Show quick action modal
function showActionModal(actionName) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${actionName}</h2>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <p>This feature will be available soon. We're working to bring you the best experience for ${actionName.toLowerCase()}.</p>
                <div class="modal-actions">
                    <button onclick="closeModal(this)" class="btn-primary">OK</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
}

// Close modal
function closeModal(element) {
    const modal = element.closest ? element.closest('.modal-overlay') : element.parentElement.parentElement.parentElement;
    if (modal) {
        modal.remove();
    }
}

// Search functionality
function performSearch() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    if (query === '') {
        alert('Please enter a search term');
        return;
    }
    
    // Filter services based on search query
    let foundServices = [];
    
    serviceLinks.forEach(link => {
        const serviceName = link.textContent.toLowerCase();
        if (serviceName.includes(query)) {
            foundServices.push({
                name: link.textContent.trim(),
                url: link.getAttribute('data-service-url') || '#'
            });
        }
    });
    
    if (foundServices.length > 0) {
        showSearchResults(foundServices, query);
    } else {
        showNotification(`No services found for "${query}"`, 'error');
    }
}

// Show search results modal
function showSearchResults(services, query) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Search Results for "${query}"</h2>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="search-results">
                    ${services.map(service => `
                        <div class="search-result-item">
                            <h4>${service.name}</h4>
                            <button onclick="window.open('${service.url}', '_blank')" class="btn-primary">
                                Access Service
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
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
                { name: 'Motor Vehicle Tax', icon: 'fa-road', url: 'https://transport.ap.gov.in/' },
                { name: 'Permit Services', icon: 'fa-file-alt', url: 'https://transport.ap.gov.in/' }
            ],
            'Property & Housing': [
                { name: 'Property Registration', icon: 'fa-home', url: 'https://webland.ap.gov.in/' },
                { name: 'Building Plan Approval', icon: 'fa-hammer', url: 'https://webland.ap.gov.in/' },
                { name: 'Patta & Title', icon: 'fa-file-alt', url: 'https://webland.ap.gov.in/' },
                { name: 'Survey Settlement', icon: 'fa-map', url: 'https://webland.ap.gov.in/' },
                { name: 'Property Tax', icon: 'fa-money-bill-wave', url: 'https://webland.ap.gov.in/' },
                { name: 'Housing Board Services', icon: 'fa-building', url: 'https://apshcl.ap.gov.in/' }
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
                { name: 'Shop & Establishment License', icon: 'fa-building', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'GST Registration', icon: 'fa-file-contract', url: 'https://services.gst.gov.in/services/login' },
                { name: 'Trade License', icon: 'fa-industry', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Food License (FSSAI)', icon: 'fa-utensils', url: 'https://foscos.fssai.gov.in/' },
                { name: 'Factory License', icon: 'fa-industry', url: 'https://mpcb.gov.in/' },
                { name: 'Professional Tax Certificate', icon: 'fa-receipt', url: 'https://aaplesarkar.mahaonline.gov.in/' }
            ],
            'Transportation': [
                { name: 'Driving License', icon: 'fa-id-card-alt', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
                { name: 'Vehicle Registration', icon: 'fa-car', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/stateSelection/form.action' },
                { name: 'Learning License', icon: 'fa-graduation-cap', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
                { name: 'Fitness Certificate', icon: 'fa-clipboard-check', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/stateSelection/form.action' },
                { name: 'Motor Vehicle Tax', icon: 'fa-road', url: 'https://transport.maharashtra.gov.in/' },
                { name: 'Permit Services', icon: 'fa-file-alt', url: 'https://transport.maharashtra.gov.in/' }
            ],
            'Property & Housing': [
                { name: 'Property Registration', icon: 'fa-home', url: 'https://igr.maharashtra.gov.in/' },
                { name: 'Building Plan Approval', icon: 'fa-hammer', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Property Card', icon: 'fa-file-alt', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Survey Settlement', icon: 'fa-map', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Property Tax', icon: 'fa-money-bill-wave', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Housing Board Services', icon: 'fa-building', url: 'https://mhada.maharashtra.gov.in/' }
            ]
        }
    }
};

// Get category icon based on category name
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
        'Legal Services': 'fa-balance-scale',
        'National Identity & Documentation': 'fa-id-card',
        'National Employment & Finance': 'fa-briefcase',
        'National Transportation': 'fa-car',
        'National Banking & Schemes': 'fa-university'
    };
    return iconMap[categoryName] || 'fa-cog';
}

// Initialize state selector functionality
function initializeStateSelector() {
    if (stateSelector) {
        stateSelector.addEventListener('change', function() {
            const selectedState = this.value;
            switchState(selectedState);
        });
    }
}

// Initialize national service links functionality
// Update state display elements
function updateStateDisplay() {
    const currentStateElements = document.querySelectorAll('#currentState');
    if (currentStateElements.length > 0 && stateServicesData[currentState]) {
        currentStateElements.forEach(element => {
            element.textContent = stateServicesData[currentState].name;
        });
    }
}

// Switch state function
function switchState(newState) {
    if (!stateServicesData[newState]) return;
    
    currentState = newState;
    
    // Always ensure national services are visible
    loadNationalServices();
    
    // Load state services
    loadStateServices(newState);
    
    // Update state display
    updateStateDisplay();
    
    // Show notification
    showNotification(`Switched to ${stateServicesData[newState].name} services`, 'success');
    
    // Save state preference
    localStorage.setItem('selectedState', newState);
}

// Load state preference
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
    if (!nationalGrid) {
        console.error('National services grid not found');
        return;
    }

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

    console.log('National services loaded successfully');
    
    // Add direct event listeners as fallback for national services too
    setTimeout(() => {
        const newNationalLinks = nationalGrid.querySelectorAll('a[data-service-url]');
        console.log(`Found ${newNationalLinks.length} national service links after loading`);
        
        newNationalLinks.forEach((link, index) => {
            const serviceName = link.getAttribute('data-service-name');
            const serviceUrl = link.getAttribute('data-service-url');
            console.log(`National link ${index + 1}: ${serviceName} -> ${serviceUrl}`);
            
            // Add direct click handler as fallback
            link.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`Direct click handler fired for: ${serviceName}`);
                if (serviceUrl && serviceUrl !== '#' && serviceUrl !== '') {
                    showServiceModal(serviceName, serviceUrl);
                } else {
                    showNotification('Service URL not available', 'error');
                }
            });
        });
    }, 100);
}

// Load State Services for current state
function loadStateServices(stateKey) {
    const stateGrid = document.getElementById('stateServicesGrid');
    if (!stateGrid) {
        console.error('State services grid not found');
        return;
    }
    
    if (!stateServicesData[stateKey]) {
        console.error('State data not found for:', stateKey);
        return;
    }

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
    const currentStateElements = document.querySelectorAll('#currentState');
    if (currentStateElements.length > 0) {
        currentStateElements.forEach(element => {
            element.textContent = stateServicesData[stateKey].name;
        });
    }

    console.log(`State services loaded for ${stateServicesData[stateKey].name}`);
    
    // Ensure event delegation is working for the newly loaded state services
    // The event delegation on stateGrid should handle all dynamically added links
    // But let's also add direct event listeners as a fallback
    setTimeout(() => {
        const newStateLinks = stateGrid.querySelectorAll('a[data-service-url]');
        console.log(`Found ${newStateLinks.length} state service links after loading`);
        
        newStateLinks.forEach((link, index) => {
            const serviceName = link.getAttribute('data-service-name');
            const serviceUrl = link.getAttribute('data-service-url');
            console.log(`State link ${index + 1}: ${serviceName} -> ${serviceUrl}`);
            
            // Add direct click handler as fallback
            link.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`Direct click handler fired for: ${serviceName}`);
                if (serviceUrl && serviceUrl !== '#' && serviceUrl !== '') {
                    showServiceModal(serviceName, serviceUrl);
                } else {
                    showNotification('Service URL not available', 'error');
                }
            });
        });
        
        // Re-initialize service links to ensure both methods work
        initializeServiceLinks();
    }, 100);
}

// Event listeners setup
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    const userData = checkAuthentication();
    if (!userData) return;
    
    console.log('OneHub Zone - Citizen Services Dashboard Loaded');
    
    // Initialize event delegation for service links FIRST
    initializeServiceLinks();
    
    // Then initialize other components
    initializeDashboard();
    initializeStateSelector();
    
    // Setup search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Setup logout functionality
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

    // Setup quick action cards
    quickActionCards.forEach(card => {
        card.addEventListener('click', function() {
            const actionName = this.querySelector('h3').textContent;
            showActionModal(actionName);
        });
    });

    // Setup emergency cards
    emergencyCards.forEach(card => {
        card.addEventListener('click', function() {
            const phoneNumber = this.querySelector('.phone-number').textContent;
            const serviceName = this.querySelector('h3').textContent;
            
            if (confirm(`Do you want to call ${serviceName} at ${phoneNumber}?`)) {
                window.open(`tel:${phoneNumber}`);
            }
        });
    });

    // Setup service filters
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

    // Load services after a short delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Loading services...');
        loadNationalServices();
        loadStatePreference();
    }, 200);
});

// Filter services based on category
function filterServices(filter) {
    const serviceCategories = document.querySelectorAll('.service-category');
    
    serviceCategories.forEach(category => {
        switch(filter) {
            case 'all':
                category.style.display = 'block';
                break;
            case 'popular':
                const index = Array.from(serviceCategories).indexOf(category);
                category.style.display = index < 4 ? 'block' : 'none';
                break;
            case 'recent':
                category.style.display = Math.random() > 0.5 ? 'block' : 'none';
                break;
            case 'favorites':
                const favIndex = Array.from(serviceCategories).indexOf(category);
                category.style.display = favIndex < 3 ? 'block' : 'none';
                break;
        }
    });
    
    showNotification(`Showing ${filter === 'all' ? 'all' : filter} services`, 'info');
}

// Debug function to create test session
function createTestSession() {
    const testUser = {
        id: 'TEST123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '9999999999',
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('userSession', JSON.stringify(testUser));
    console.log('Test session created:', testUser);
    return testUser;
}

// Test function for debugging - can be called from console
window.testServiceModal = function() {
    console.log('Testing service modal...');
    showServiceModal('Test Service', 'https://www.google.com');
};

// Test function to open a real service directly
window.testRealService = function() {
    console.log('Testing real service - opening PAN Card service...');
    showServiceModal('PAN Card', 'https://www.incometax.gov.in/iec/foportal/');
};

// Test function to check if all service links have proper data attributes
window.debugServiceLinks = function() {
    const allLinks = document.querySelectorAll('a[data-service-url]');
    console.log(`Found ${allLinks.length} service links:`);
    
    allLinks.forEach((link, index) => {
        const name = link.getAttribute('data-service-name');
        const url = link.getAttribute('data-service-url');
        console.log(`${index + 1}. ${name} -> ${url}`);
    });
    
    // Test clicking the first link programmatically
    if (allLinks.length > 0) {
        console.log('Testing first link programmatically...');
        allLinks[0].click();
    }
    
    return allLinks;
};

// Test function to verify all service links are working
window.testAllServiceLinks = function() {
    console.log('=== TESTING ALL SERVICE LINKS ===');
    
    // Test national services
    const nationalLinks = document.querySelectorAll('#nationalServicesGrid a[data-service-url]');
    console.log(`National Services: Found ${nationalLinks.length} links`);
    nationalLinks.forEach((link, index) => {
        const name = link.getAttribute('data-service-name');
        const url = link.getAttribute('data-service-url');
        console.log(`  ${index + 1}. ${name} -> ${url}`);
    });
    
    // Test state services
    const stateLinks = document.querySelectorAll('#stateServicesGrid a[data-service-url]');
    console.log(`State Services: Found ${stateLinks.length} links`);
    stateLinks.forEach((link, index) => {
        const name = link.getAttribute('data-service-name');
        const url = link.getAttribute('data-service-url');
        console.log(`  ${index + 1}. ${name} -> ${url}`);
    });
    
    console.log('=== END TEST ===');
    return {
        national: nationalLinks.length,
        state: stateLinks.length,
        total: nationalLinks.length + stateLinks.length
    };
};

// Export functions for potential future use
window.OneHubZone = {
    search: performSearch,
    showNotification: showNotification,
    showServiceModal: showServiceModal,
    showActionModal: showActionModal,
    closeModal: closeModal,
    loadNationalServices: loadNationalServices,
    loadStateServices: loadStateServices,
    switchState: switchState,
    createTestSession: createTestSession
};