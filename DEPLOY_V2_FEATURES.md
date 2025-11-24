# 🚀 GuardBulldog V2.0 - Deployment Guide

**Quick Start Guide for Implementing Recommended Features**

---

## 📋 Prerequisites

Before deploying V2 features, ensure you have:
- [x] PostgreSQL database access
- [x] Node.js v14+ installed
- [x] npm packages up to date
- [x] Backup of existing database
- [x] Access to deployment platforms (Netlify/Heroku)

---

## Step 1: Deploy Database Schema 🗄️

### Option A: Automated Deployment (Recommended)

```bash
# Navigate to project directory
cd C:\Users\USER\CascadeProjects\GUARDBULLDOG

# Connect to your database and run the schema update
psql -d guardbulldog -U your_username -f server/database-updates-v2.sql

# Or if using Heroku Postgres:
heroku pg:psql --app your-app-name < server/database-updates-v2.sql
```

### Option B: Manual Deployment

1. Open your PostgreSQL client (pgAdmin, DBeaver, etc.)
2. Connect to the `guardbulldog` database
3. Open `server/database-updates-v2.sql`
4. Execute the entire script
5. Verify tables were created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

### Verification Checklist:
- [ ] All 8 new tables created
- [ ] Indexes created (25+)
- [ ] Triggers and functions working
- [ ] Views accessible
- [ ] Sample data populated

---

## Step 2: Install Required npm Packages 📦

```bash
# Backend dependencies
npm install axios node-cache email-templates

# IP Intelligence
npm install ipinfo geoip-lite

# AI/ML Dependencies (for future Phase 2)
npm install natural compromise sentiment

# Email parsing
npm install mailparser

# Rate limiting
npm install express-rate-limit

# Install frontend dependencies
cd client
npm install recharts react-chartjs-2 chart.js
cd ..
```

---

## Step 3: Set Up Environment Variables 🔐

Add these to your `.env` file:

```env
# Existing variables
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
PORT=5000

# V2 Feature Variables
IPINFO_API_KEY=your_ipinfo_api_key
ENABLE_GUEST_ACCESS=true
GUEST_RATE_LIMIT=5
GUEST_RATE_WINDOW=3600000

# AI Detection
AI_DETECTION_ENABLED=true
AI_CONFIDENCE_THRESHOLD=0.7

# Email Intelligence
EMAIL_PARSING_ENABLED=true
THREAT_INTELLIGENCE_ENABLED=true
```

### Getting API Keys:

1. **IPinfo.io API Key:**
   - Visit: https://ipinfo.io/signup
   - Sign up for free tier (50k requests/month)
   - Copy your access token
   - Add to `.env`: `IPINFO_API_KEY=your_token_here`

---

## Step 4: Test Database Connection ✅

Create a test script: `test-db-connection.js`

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function testConnection() {
    try {
        // Test basic connection
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connected:', result.rows[0]);
        
        // Test new tables
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('guest_reports', 'ip_intelligence', 'email_sources')
        `);
        console.log('✅ New tables found:', tables.rowCount);
        
        // Test IP intelligence
        const ipTest = await pool.query('SELECT COUNT(*) FROM ip_intelligence');
        console.log('✅ IP Intelligence records:', ipTest.rows[0].count);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database error:', error);
        process.exit(1);
    }
}

testConnection();
```

Run the test:
```bash
node test-db-connection.js
```

---

## Step 5: Deploy to Production 🌐

### Frontend Deployment (Netlify):

```bash
# Build the React app
cd client
npm run build

# Deploy to Netlify
# Option 1: Drag & drop the 'build' folder to Netlify dashboard
# Option 2: Use Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build
```

### Backend Deployment (Heroku):

```bash
# Make sure you're logged in
heroku login

# Add new environment variables
heroku config:set IPINFO_API_KEY=your_key --app your-app-name
heroku config:set ENABLE_GUEST_ACCESS=true --app your-app-name

# Push database schema
heroku pg:psql --app your-app-name < server/database-updates-v2.sql

# Deploy code
git add .
git commit -m "Add V2 features: Guest access, IP intelligence, AI detection"
git push heroku main

# Check logs
heroku logs --tail --app your-app-name
```

---

## Step 6: Verify Deployment ✅

### Test Checklist:

1. **Database Tables:**
   ```bash
   heroku pg:psql --app your-app-name
   \dt
   # Should see all new tables
   ```

2. **API Endpoints:**
   ```bash
   # Test health endpoint
   curl https://your-app.herokuapp.com/api/health
   
   # Test guest submission (should be implemented next)
   # curl -X POST https://your-app.herokuapp.com/api/reports/guest-submit
   ```

3. **Frontend Access:**
   - Visit: https://guardbulldog1234.netlify.app
   - Check console for errors
   - Test guest access form (once implemented)

---

## Step 7: Monitor & Test 📊

### Set Up Monitoring:

1. **Heroku Logs:**
   ```bash
   heroku logs --tail --app your-app-name
   ```

2. **Database Performance:**
   ```bash
   heroku pg:info --app your-app-name
   heroku pg:diagnose --app your-app-name
   ```

3. **API Response Times:**
   - Use Heroku metrics dashboard
   - Monitor slow queries
   - Check error rates

### Load Testing:

```bash
# Install Apache Bench
# Windows: Download from Apache website
# Mac: brew install ab

# Test API endpoint
ab -n 100 -c 10 https://your-app.herokuapp.com/api/health

# Should see:
# - All requests successful
# - Average response time < 300ms
# - No failed requests
```

---

## 🎯 Implementation Roadmap

### Phase 1: Database ✅ READY
- [x] Schema designed
- [ ] Deploy to production
- [ ] Test all tables and triggers
- [ ] Verify indexes working

### Phase 2: Backend APIs (Week 1-2)
- [ ] Guest access endpoints
- [ ] IP intelligence service
- [ ] Email parsing module
- [ ] Basic AI detection rules

### Phase 3: Frontend (Week 3)
- [ ] Guest submission portal
- [ ] Report tracking page
- [ ] Enhanced analytics dashboards
- [ ] User inquiry interface

### Phase 4: AI Integration (Week 4-5)
- [ ] ML model development
- [ ] Training data collection
- [ ] Model deployment
- [ ] Performance optimization

### Phase 5: Testing & Launch (Week 6)
- [ ] End-to-end testing
- [ ] User acceptance testing
- [ ] Bug fixes
- [ ] Production launch

---

## 📝 Quick Commands Reference

```bash
# Database Operations
psql -d guardbulldog -f server/database-updates-v2.sql  # Deploy schema
psql -d guardbulldog -c "SELECT COUNT(*) FROM guest_reports"  # Check data

# Development
npm run dev  # Start dev server
npm test  # Run tests
npm run build  # Build for production

# Heroku
heroku logs --tail  # View logs
heroku restart  # Restart server
heroku pg:backups:capture  # Backup database

# Git
git status  # Check changes
git add .  # Stage all changes
git commit -m "message"  # Commit
git push origin main  # Push to GitHub
git push heroku main  # Deploy to Heroku
```

---

## 🆘 Troubleshooting

### Issue: Database Schema Not Created

**Solution:**
```bash
# Check connection
psql -d guardbulldog -c "SELECT version()"

# Check for errors in script
psql -d guardbulldog -f server/database-updates-v2.sql -a

# Verify tables
psql -d guardbulldog -c "\dt"
```

### Issue: API Key Not Working

**Solution:**
```bash
# Verify environment variable
heroku config --app your-app-name

# Test API key
curl "https://ipinfo.io/8.8.8.8?token=YOUR_API_KEY"
```

### Issue: Netlify Build Fails

**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Check for build errors
npm run build --verbose
```

---

## 📚 Additional Resources

- **IPinfo Documentation:** https://ipinfo.io/developers
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Heroku Postgres:** https://devcenter.heroku.com/categories/postgres
- **Netlify Deploy:** https://docs.netlify.com/site-deploys/create-deploys/

---

## ✅ Post-Deployment Checklist

After deploying, verify:
- [ ] All database tables exist and are accessible
- [ ] Environment variables are set correctly
- [ ] API endpoints respond without errors
- [ ] Frontend loads without console errors
- [ ] Guest access functionality works
- [ ] IP intelligence captures data
- [ ] Monitoring and logging active
- [ ] Backup procedures in place
- [ ] Documentation updated
- [ ] Team trained on new features

---

## 📊 Success Metrics to Track

Monitor these KPIs after deployment:
- Number of guest submissions per day
- IP intelligence data accuracy
- AI detection accuracy rate
- Average response time for reports
- User adoption of new features
- System uptime and performance

---

**Deployment Support:** Contact Victory Ubogu  
**Last Updated:** November 24, 2025

**🛡️ Ready to Deploy GuardBulldog V2.0! 🚀**
