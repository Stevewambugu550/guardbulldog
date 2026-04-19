# GuardBulldog - Simplified Testing Instructions

**Hello Classmates!**

Thank you for helping to test the GuardBulldog application. Your feedback is valuable. Please follow the steps below to test the core features.

**Live Application URL:** [https://guardbulldog-bsu-final.netlify.app/](https://guardbulldog-bsu-final.netlify.app/)

---

### **Task 1: Test the Automated Email Analyzer (No Login Required)**

1.  **Go to the website:** [https://guardbulldog-bsu-final.netlify.app/](https://guardbulldog-bsu-final.netlify.app/)
2.  From the sidebar on the left, click on **"🔍 Email Analyzer"**.
3.  **Copy the complete sample email text below** (including the `From:` and `Subject:` lines).

    ```
    From: "BSU Financial Aid Office" <no-reply@updates.com>
    To: student@bowie.edu
    Subject: URGENT: Your Financial Aid is On Hold!
    
    Dear Student,
    
    Our records indicate an issue with your financial aid documentation. To avoid a delay in your disbursement, you must verify your account details immediately.
    
    Please click the link below to log in and confirm your information. Failure to do so within 24 hours will result in the suspension of your aid package.
    
    Click here to verify: http://bowiestate-financial-services.com/verify
    
    Thank you,
    BSU Financial Services
    ```

4.  **Paste the text** into the large text box on the Email Analyzer page.
5.  Click the **"Analyze Email"** button.
6.  **Verify the result:** Check if the analysis correctly identifies the email as **"Phishing"** and gives it a **High-Risk** score.

---

### **Task 2: Test as a Standard User (Student)**

1.  Navigate to the **Login** page.
2.  Use the following credentials to log in:
    *   **Email:** `student@bowie.edu`
    *   **Password:** `Student123!`
3.  Once logged in, go to the **"Report Phishing"** page from the sidebar.
4.  Fill out the form with any information you'd like (you can make it up).
5.  Click **"Submit Report"**.
6.  After submitting, go to the **"My Reports"** page.
7.  **Verify:** Check that you can see the report you just submitted with a **"Pending"** status.

---

### **Task 3: Test as an Administrator**

1.  **Log out** of the student account.
2.  Go to the **Login** page again.
3.  Use the following credentials to log in as an Admin:
    *   **Email:** `security@bowie.edu`
    *   **Password:** `Security123!`
4.  From the sidebar, go to the **"Manage Reports"** page.
5.  Find the report that was submitted by the `student@bowie.edu` account.
6.  Click on the report to view its details.
7.  Change the **Status** from "Pending" to **"Resolved"**.
8.  Add a comment in the comment box (e.g., "This is not a threat.") and click **"Add Comment"**.
9.  **Verify:** Check that the status of the report has been updated.

---

**Thank you for your help!** If you encounter any issues or have suggestions, please let Victory know.
