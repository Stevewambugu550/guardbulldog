# 🚀 GuardBulldog Production Deployment Guide

This guide provides step-by-step instructions for deploying GuardBulldog to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database credentials secured
- [ ] JWT secret generated (minimum 32 characters)
- [ ] CORS origins configured for production domain
- [ ] SSL certificates ready (handled by hosting platforms)
- [ ] Admin credentials changed from defaults
- [ ] File upload limits configured
- [ ] Rate limiting configured
- [ ] Error logging enabled

---

## 🗄️ Database Setup

### Option 1: Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your database connection string

2. **Get Connection String**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

3. **Run Database Migrations**
   ```bash
   # Set DATABASE_URL in your .env
   DATABASE_URL=your_supabase_connection_string
   
   # Run seed script to create tables
   npm run seed
   ```

### Option 2: Neon Database

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Run migrations as above

### Option 3: Heroku Postgres

1. Install Heroku CLI
2. Add Postgres addon:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```
3. Connection string auto-configured in `DATABASE_URL`

---

## 🖥️ Backend Deployment (Render)

### Step 1: Prepare Repository

1. **Ensure all changes are committed**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

### Step 2: Deploy to Render

1. **Go to [render.com](https://render.com)**
2. **Create New Web Service**
   - Connect your GitHub repository
   - Select `guardbulldog` repository

3. **Configure Service**
   ```
   Name: guardbulldog-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables**
   ```
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_secure_jwt_secret_minimum_32_chars
   NODE_ENV=production
   PORT=5000
   ALLOWED_ORIGINS=https://yourdomain.netlify.app
   BCRYPT_ROUNDS=12
   ENABLE_GUEST_ACCESS=true
   GUEST_RATE_LIMIT=5
   MAX_FILE_SIZE=10485760
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://guardbulldog-api.onrender.com`

### Alternative: Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create guardbulldog-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production
heroku config:set ALLOWED_ORIGINS=https://yourdomain.netlify.app

# Deploy
git push heroku main

# Run database seed
heroku run npm run seed
```

---

## 🌐 Frontend Deployment (Netlify)

### Step 1: Configure Frontend

1. **Update API URL**
   
   Edit `client/.env.production`:
   ```env
   REACT_APP_API_URL=https://guardbulldog-api.onrender.com
   ```

2. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

### Step 2: Deploy to Netlify

#### Option A: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd client
netlify deploy --prod --dir=build
```

#### Option B: Netlify Dashboard

1. **Go to [netlify.com](https://netlify.com)**
2. **New Site from Git**
   - Connect GitHub repository
   - Select `guardbulldog` repo

3. **Build Settings**
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/build
   ```

4. **Environment Variables**
   ```
   REACT_APP_API_URL=https://guardbulldog-api.onrender.com
   ```

5. **Deploy Site**
   - Click "Deploy site"
   - Note your URL: `https://guardbulldog.netlify.app`

### Step 3: Configure Custom Domain (Optional)

1. **In Netlify Dashboard**
   - Go to Domain Settings
   - Add custom domain
   - Follow DNS configuration instructions

2. **Update Backend CORS**
   - Add your custom domain to `ALLOWED_ORIGINS`
   - Redeploy backend

---

## 🔐 Security Configuration

### 1. Update CORS Origins

In your backend environment variables:
```env
ALLOWED_ORIGINS=https://guardbulldog.netlify.app,https://yourcustomdomain.com
```

### 2. Generate Secure JWT Secret

```bash
# Generate random 64-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Change Default Admin Credentials

After first deployment:
1. Login with default credentials
2. Go to Profile Settings
3. Change password immediately
4. Update email if needed

### 4. Configure Rate Limiting

Adjust in `.env`:
```env
RATE_LIMIT_WINDOW=15  # minutes
RATE_LIMIT_MAX=100    # requests per window
GUEST_RATE_LIMIT=5    # guest submissions per day
```

---

## 🧪 Post-Deployment Testing

### 1. Test Backend API

```bash
# Health check
curl https://guardbulldog-api.onrender.com/api/health

# Should return: {"status":"OK","message":"GUARDBULLDOG API is running"}
```

### 2. Test Frontend

1. Visit your Netlify URL
2. Test user registration
3. Test login
4. Submit a test report
5. Test admin dashboard

### 3. Test Database Connection

```bash
# Check database tables exist
# Login to your database provider dashboard
# Verify tables: users, reports, report_notes, etc.
```

---

## 📊 Monitoring & Maintenance

### Application Monitoring

1. **Render Dashboard**
   - Monitor CPU/Memory usage
   - Check logs for errors
   - Set up alerts

2. **Netlify Analytics**
   - Track page views
   - Monitor build times
   - Check for 404 errors

### Database Monitoring

1. **Supabase Dashboard**
   - Monitor query performance
   - Check storage usage
   - Review connection pool

### Logging

Backend logs available at:
- Render: Dashboard → Logs tab
- Heroku: `heroku logs --tail`

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Render and Netlify support automatic deployments:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Auto-Deploy**
   - Netlify rebuilds frontend automatically
   - Render rebuilds backend automatically

### Manual Deployments

**Netlify:**
```bash
cd client
npm run build
netlify deploy --prod --dir=build
```

**Render:**
- Trigger manual deploy from dashboard
- Or push to connected branch

---

## 🆘 Troubleshooting

### Backend Issues

**Problem: Database connection fails**
```
Solution: 
1. Verify DATABASE_URL is correct
2. Check database is running
3. Verify IP whitelist (if applicable)
4. Check connection pool limits
```

**Problem: CORS errors**
```
Solution:
1. Add frontend URL to ALLOWED_ORIGINS
2. Ensure credentials: true in CORS config
3. Check protocol (http vs https)
```

### Frontend Issues

**Problem: API calls fail**
```
Solution:
1. Verify REACT_APP_API_URL is correct
2. Check backend is running
3. Verify CORS configuration
4. Check browser console for errors
```

**Problem: Build fails**
```
Solution:
1. Clear node_modules and reinstall
2. Check for syntax errors
3. Verify all dependencies installed
4. Check Node version compatibility
```

---

## 📈 Scaling Considerations

### Database Scaling

- **Supabase**: Upgrade to Pro plan for more connections
- **Neon**: Scale compute and storage independently
- **Heroku**: Upgrade Postgres plan

### Backend Scaling

- **Render**: Upgrade instance type
- **Heroku**: Add more dynos or upgrade dyno type

### CDN & Caching

- Netlify includes CDN by default
- Consider adding Redis for session caching
- Implement API response caching

---

## 🔒 Backup & Recovery

### Database Backups

**Supabase:**
- Automatic daily backups on Pro plan
- Manual backups via dashboard

**Heroku:**
```bash
heroku pg:backups:capture
heroku pg:backups:download
```

### Application Backups

- Code backed up in Git repository
- Environment variables documented in `.env.example`
- Regular database exports recommended

---

## 📞 Support

**Issues?**
- Check logs first
- Review this guide
- Contact team lead
- Open GitHub issue

**Emergency Contacts:**
- System Admin: [contact info]
- Database Admin: [contact info]
- DevOps Lead: [contact info]

---

## ✅ Deployment Verification Checklist

After deployment, verify:

- [ ] Backend API responds at `/api/health`
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] Login authentication works
- [ ] Report submission works
- [ ] Admin dashboard accessible
- [ ] File uploads work
- [ ] Email validation works
- [ ] Guest reporting works
- [ ] Database queries execute
- [ ] CORS configured correctly
- [ ] HTTPS enabled
- [ ] Admin credentials changed
- [ ] Monitoring configured
- [ ] Backups scheduled

---

**Deployment Complete! 🎉**

Your GuardBulldog application is now live and ready for production use.
