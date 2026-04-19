# GuardBulldog - Application Testing and Login Guide

**To:** Dr. Azene Zenebe  
**From:** GuardBulldog Development Team  
**Date:** April 19, 2026  
**Subject:** GuardBulldog Application Login Credentials and Testing Instructions

---

## 1. Application Access

The deployed application is accessible at the following URL:

**[https://guardbulldog-bsu-final.netlify.app/](https://guardbulldog-bsu-final.netlify.app/)**

## 2. User Account Credentials for Testing

We have created four distinct user roles for comprehensive testing. Please use the following credentials to log in and test the application's features from different perspectives.

### **Super Admin Account**
- **Role**: Full system control, including user management, report management, and system settings.
- **Email**: `admin@bowie.edu`
- **Password**: `Admin123!`

### **Admin Account (Security Officer)**
- **Role**: Manages reports and users, views system statistics.
- **Email**: `security@bowie.edu`
- **Password**: `Security123!`

### **Standard User Account (Student)**
- **Role**: Can submit and track reports, access education modules.
- **Email**: `student@bowie.edu`
- **Password**: `Student123!`

### **Standard User Account (Faculty)**
- **Role**: Can submit and track reports, access education modules.
- **Email**: `faculty@bowie.edu`
- **Password**: `Faculty123!`

---

## 3. Testing Instructions

We recommend the following testing scenarios to evaluate the core functionalities of the GuardBulldog application.

### **Scenario 1: Guest User - Automated Email Analysis (No Login Required)**

1.  **Navigate** to the application: [https://guardbulldog-bsu-final.netlify.app/](https://guardbulldog-bsu-final.netlify.app/)
2.  Click on the **"🔍 Email Analyzer"** button in the main navigation or hero section.
3.  **Copy and paste** the complete content of a sample email (including headers) into the text area.
4.  Click **"Analyze Email"**.
5.  **Verify** that the analysis results are displayed, including a risk score, threat level, and detailed indicators.

### **Scenario 2: Standard User (Student/Faculty) - Reporting and Tracking**

1.  **Login** as the Student user (`student@bowie.edu` / `Student123!`).
2.  From the dashboard, navigate to **"Report Phishing"**.
3.  Fill out the form with details of a suspicious email and submit.
4.  **Verify** that you receive a success confirmation with a Report ID.
5.  Navigate to **"My Reports"**.
6.  **Verify** that the newly submitted report is visible in the list with a "pending" status.

### **Scenario 3: Admin User - Report Management**

1.  **Login** as the Admin user (`security@bowie.edu` / `Security123!`).
2.  Navigate to the **"Admin Dashboard"**. Verify that you can see system statistics.
3.  Navigate to **"Manage Reports"**.
4.  **Locate** the report submitted by the Student user in the previous scenario.
5.  **Change the status** of the report from "pending" to "investigating" and add a comment.
6.  **Log out** and log back in as the Student user.
7.  Navigate to **"My Reports"** and verify that the report status has been updated.

### **Scenario 4: Super Admin User - User Management**

1.  **Login** as the Super Admin user (`admin@bowie.edu` / `Admin123!`).
2.  Navigate to **"Manage Users"**.
3.  **Verify** that you can see a list of all registered users.
4.  **Change the role** of the 'Faculty' user from 'user' to 'admin'.
5.  **Log out** and log back in as the Faculty user (`faculty@bowie.edu` / `Faculty123!`).
6.  **Verify** that the Faculty user now has access to the Admin Dashboard and administrative features.

---

## 4. Live Demonstration / Recorded Demo

As requested, we are available to provide a live virtual demonstration at your convenience. We can also provide a pre-recorded video walkthrough of the application's features. Please let us know your preference.

We look forward to your feedback.

Sincerely,  
The GuardBulldog Development Team
