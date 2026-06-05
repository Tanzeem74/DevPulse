# 📌 DevPulse – Internal Tech Issue Tracker

A collaborative backend system for software teams to report bugs, suggest features, and manage issue resolution workflows efficiently.

---

## 🌐 Live API URL

https://your-project-name.onrender.com

## 🚀 Project Overview

**DevPulse** is a RESTful API built using **Node.js, Express, TypeScript, and PostgreSQL**.  
It provides authentication, role-based access control, and full issue lifecycle management without using ORMs or query builders.

---

## 🛠️ Tech Stack

- Node.js (LTS)
- Express.js
- TypeScript
- PostgreSQL (Raw SQL using `pg`)
- JWT (jsonwebtoken)
- bcrypt (password hashing)

---

## 👥 User Roles

### 🧑 Contributor
- Register & login
- Create issues (bug / feature request)
- View all issues
- Update only own issues (if status is open)

### 🧑‍💼 Maintainer
- All contributor permissions
- Update any issue
- Delete any issue

---

## 🔐 Authentication Flow

1. User logs in with email & password  
2. Server validates credentials  
3. JWT token is generated containing:
   - id
   - email
   - role  
4. Token is sent in request header:



5. Middleware verifies token and attaches user to request

---

## 🗄️ Database Schema

### Users Table

| Field | Type | Description |
|------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(100) | User full name |
| email | VARCHAR(150) | Unique email |
| password | TEXT | Hashed password |
| role | VARCHAR(20) | contributor / maintainer |
| created_at | TIMESTAMP | Auto timestamp |
| updated_at | TIMESTAMP | Auto timestamp |

---

### Issues Table

| Field | Type | Description |
|------|------|-------------|
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Issue title |
| description | TEXT | Issue details |
| type | VARCHAR(20) | bug / feature_request |
| status | VARCHAR(20) | open / in_progress / resolved |
| reporter_id | INTEGER | User ID (no foreign key constraint) |
| created_at | TIMESTAMP | Auto timestamp |
| updated_at | TIMESTAMP | Auto timestamp |

---

## 🌐 API Endpoints

### 🔐 Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login user & get JWT token |

---

### 🐞 Issue Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/issues | Create new issue | Authenticated |
| GET | /api/issues | Get all issues | Public |
| GET | /api/issues/:id | Get single issue | Public |
| PATCH | /api/issues/:id | Update issue | Role-based |
| DELETE | /api/issues/:id | Delete issue | Maintainer only |

## 📦 Installation & Setup Guide

Follow these steps to run the project locally:

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/devpulse.git](https://github.com/Tanzeem74/DevPulse.git
cd devpulse
```
## 📦 Install Dependencies

After cloning the project, install all required packages using npm:

```bash
npm install
```
