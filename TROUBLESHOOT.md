# 🔍 TROUBLESHOOT LOGIN/REGISTER ISSUES

## **Quick Test - Do This First:**

### **Test 1: Is Backend Running?**

Open this link in your browser:
```
https://guardbulldog-api.onrender.com/api/health
```

**What do you see?**

✅ **If you see:** `{"status":"OK","message":"GUARDBULLDOG API is running"}`
   → Backend is working! Go to Test 2.

❌ **If you see:** "Application failed to respond" or error
   → Backend is NOT deployed. Follow Backend Setup below.

---

### **Test 2: Check Frontend Environment Variable**

1. Open your Netlify site
2. Press F12 (open developer console)
3. Go to "Console" tab
4. Type this and press Enter:
   ```javascript
   console.log(process.env.REACT_APP_API_URL)
   ```

**What do you see?**

✅ Should show: `https://guardbulldog-api.onrender.com`
❌ If it shows `undefined` or wrong URL → Follow Frontend Fix below.

---

## **🔧 FIXES:**

### **FIX 1: Backend Not Running**

#### **Option A: Quick Deploy to Render**

1. Go to: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub → Select "guardbulldog"
4. Settings:
   - Name: `guardbulldog-api`
   - Build: `npm install`
   - Start: `node server/index.js`
   - Environment Variables:
     ```
     NODE_ENV=production
     JWT_SECRET=guardbulldog_secret_2024
     PORT=5000
     ```
5. Click "Create Web Service"
6. Wait 10 minutes

---

### **FIX 2: Frontend Environment Variable Missing**

1. Go to Netlify Dashboard
2. Select your site
3. Site settings → Environment variables
4. Click "Add a variable"
5. Add:
   - Key: `REACT_APP_API_URL`
   - Value: `https://guardbulldog-api.onrender.com`
6. Click "Save"
7. Deployments → "Trigger deploy" → "Deploy site"
8. Wait 2 minutes

---

## **💡 ALTERNATIVE: RUN BOTH LOCALLY (FASTEST FOR NOW)**

If deployment is taking too long, run both locally:

### **Terminal 1 - Backend:**
```powershell
cd C:\Users\USER\CascadeProjects\GUARDBULLDOG
npm start
```

### **Terminal 2 - Frontend:**
```powershell
cd C:\Users\USER\CascadeProjects\GUARDBULLDOG\client
npm start
```

Then go to: **http://localhost:3000**

Everything will work perfectly locally!

---

## **🎯 WHAT TO DO NOW:**

**Choose ONE:**

1. **For Presentation:** Run locally (fastest, works immediately)
2. **For Online:** Deploy backend to Render first, then frontend to Netlify

**Which do you prefer?**
