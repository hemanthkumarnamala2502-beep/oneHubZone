# OneHub Zone - Corporate Network Sharing Guide

## 🏢 Cognizant-Safe Deployment Options

### Option 1: Local Network Server (Safest)
```bash
# If Python is available (usually is):
python -m http.server 8080

# Then share: http://YOUR_IP:8080
```

### Option 2: File Sharing
1. **Zip your project folder**
2. **Share via email/Teams** 
3. **Recipients extract and open index.html**

### Option 3: Microsoft Ecosystem
- **SharePoint**: Upload files and share links
- **OneDrive**: Upload and share folder
- **Teams**: Share in channel files

### Option 4: GitHub (Microsoft-owned)
- Usually allowed since Microsoft acquisition
- Free GitHub Pages hosting
- Professional and secure

### Option 5: Azure (Pre-approved)
- Azure Static Web Apps (Free)
- Cognizant is Microsoft partner
- Enterprise-grade security

## ⚡ Quick Start (Right Now)

### Immediate Sharing via File:
1. Zip your project folder
2. Share via email/Teams
3. Recipients just open `index.html`

### Network Sharing (if allowed):
```bash
# Start local server
python -m http.server 8080

# Find your IP
ipconfig

# Share: http://YOUR_IP:8080
```

## 📋 Check with IT First
Before using external services, verify with Cognizant IT:
- GitHub Pages ✓ (Usually allowed)
- Azure Services ✓ (Partner approved)
- Netlify/Vercel ? (Check policy)
- Firebase ? (Check policy)

## 🔒 Security Compliant Options
1. **Internal file sharing** (Teams/SharePoint)
2. **GitHub with private repos** (then public Pages)
3. **Azure Static Apps** (enterprise secure)
4. **Local network sharing** (controlled environment)
