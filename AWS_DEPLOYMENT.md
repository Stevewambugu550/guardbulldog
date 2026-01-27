# AWS Backend Deployment Guide

Since the AWS CLI is not installed on this machine, you will need to deploy using the AWS Console or install the AWS CLI.

## Option 1: AWS App Runner (Easiest)
App Runner automatically builds and deploys your application from GitHub.

1. **Push your code to GitHub**
   - Ensure your latest changes including the `Dockerfile` are pushed.

2. **Go to AWS App Runner Console**
   - Click "Create service"
   - Source: "Source code repository"
   - Connect your GitHub account and select the repository.
   - Branch: `main`
   - Deployment settings: "Automatic"

3. **Configure Build**
   - Configuration file: "Configure all settings here"
   - Runtime: "Node.js 18"
   - Build command: `npm install && npm run install-client`
   - Start command: `npm run server`
   - Port: `5000`

4. **Environment Variables**
   - Add the following environment variables in the App Runner console:
     - `DATABASE_URL`: Your Neon DB URL (postgresql://...)
     - `JWT_SECRET`: Your secure secret
     - `NODE_ENV`: `production`

## Option 2: AWS Elastic Beanstalk

1. **Create Application**
   - Go to Elastic Beanstalk Console.
   - Create Application -> "Web server environment".
   - Platform: "Node.js".
   - Upload your code (Zip the project excluding `node_modules`).

2. **Configuration**
   - Software: Set `NPM_USE_PRODUCTION=false` (to install devDependencies if needed).
   - Environment Properties: Set `DATABASE_URL`, `JWT_SECRET`.

## Database Connection
Ensure your Neon Database (PostgreSQL) allows connections from AWS IP addresses (usually set to 0.0.0.0/0 for public access with password protection).

## Frontend Connection
Once deployed, get the URL (e.g., `https://api.awsapprunner.com...`).
Update your frontend `.env` or Netlify configuration:
`REACT_APP_API_URL=https://your-new-aws-url.com`
