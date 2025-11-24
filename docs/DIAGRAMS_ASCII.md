# Text-Based Diagrams (ASCII Art)

This file contains simplified, text-based representations of the system diagrams that you can screenshot or copy.

## 1. Use Case Diagram

This diagram shows the main actions that Users and Admins can perform.

```
===================================
    GUARDBULLDOG Use Case Diagram
===================================

Actors:
  - User (Student/Staff)
  - Admin (Security Analyst)
    (Note: An Admin has all User permissions plus their own)

+------------------------------------+
|           USER ACTIONS             |
+------------------------------------+
|                                    |
|   (User) ---> [Register Account]   |
|   (User) ---> [Login]              |
|   (User) ---> [Report Phishing]    |
|   (User) ---> [Complete Module]    |
|                                    |
+------------------------------------+

+------------------------------------+
|           ADMIN ACTIONS            |
+------------------------------------+
|                                    |
|   (Admin) --> [Review Incident]    |
|   (Admin) --> [Manage Content]     |
|   (Admin) --> [View Analytics]     |
|                                    |
+------------------------------------+

(Note: All actions, except registration, require the user to be logged in.)

```

---

## 2. Sequence Diagram: Report a Phishing Email

This shows the steps when a user reports a suspicious email.

```
  User          React SPA       Backend API      Message Queue     Worker Service
   |                |                 |                 |                 |
   |--Submit Report->|                 |                 |                |
   |                |--POST /incidents->|                 |               |
   |                |                 |--Publish Msg--->|                 |
   |                |                 |<--Success 200---|                 |
   |<--Show Success--|                 |                 |                |
   |                |                 |                 |--Deliver Msg--->| 
   |                |                 |                 |                 |--Process...
   |                |                 |                 |                 |--Save to DB
   |                |                 |                 |                 |--Ack Msg
   |                |                 |                 |<----------------|

```

---

## 3. Sequence Diagram: User Authentication (Login)

This shows the steps for a user logging into the system.

```
  User          React SPA       Backend API         Database
   |                |                 |                 |
   |--Enter Credentials->|                 |            |
   |                |--POST /login----->|               |
   |                |                 |--Find User------ 
   |                |                 |<--User Record---| 
   |                |                 |--Verify Passwd--| 
   |                |                 | (Success)       |
   |                |                 |--Generate JWT---| 
   |                |<--Token----------|                |
   |--Redirect------|                 |                 |
   |                |                 |                 |

```
