# TalentMatch — Backend (`Talent_matching`)

Flask backend API for the **Intelligent Talent Matching Platform** (CSIT314 coursework). It implements authentication, role-based access, candidate profiles, employer job posting, job applications, recommendations, search, fuzzy matching, membership control, and admin functions.

## Stack

- **Python** 3.10+
- **Flask**
- **Flask SQLAlchemy**
- **Flask JWT Extended**
- **Flask CORS**
- **SQLite** for local development/testing
- **Supabase/PostgreSQL** for database integration
- **Thunder Client / REST Client** for API testing

## Prerequisites

- **Python** 3.10+ recommended
- **pip**
- A virtual environment is recommended
- Supabase database URL is only required if connecting to the shared database

## Setup & scripts

```bash
py -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
py seed_data.py
py app.py
```

The backend runs by default at:

```text
http://127.0.0.1:5000
```

To check if the backend is running, open:

```text
http://127.0.0.1:5000/
```

Expected response:

```json
{
  "message": "Intelligent Talent Matching Platform Backend is running"
}
```

## Demo accounts

After running `seed_data.py`, the following test accounts are available:

```text
Admin
Email: admin@test.com
Password: 123456

Employer
Email: abz0@test.com
Password: 123456

Candidate
Email: sk12@test.com
Password: 123456
```

## Main API groups

```text
/auth       # registration and login
/candidate  # candidate profile, jobs, recommendations, search, applications
/employer   # job posting, applications, candidate search, recommendations
/admin      # user view and membership management
```

## Authentication

Most routes require a JWT token. After logging in, copy the access token and include it in the request header:

```text
Authorization: Bearer <access_token>
```

Candidate routes require a candidate token.  
Employer routes require an employer token.  
Admin routes require an admin token.

## Project layout

```text
Talent_matching/
├── app.py                  # Flask app entry point
├── config.py               # app configuration and database connection
├── models.py               # SQLAlchemy database models
├── seed_data.py            # creates demo users, jobs, profiles and applications
├── migrate_db.py           # local SQLite migration helper
├── schema.sql              # Supabase/PostgreSQL schema
├── requirements.txt
├── README.md
│
├── routes/
│   ├── auth_routes.py      # register and login routes
│   ├── candidate_routes.py # candidate profile, jobs, recommendations and applications
│   ├── employer_routes.py  # employer job posting, applications and candidate search
│   └── admin_routes.py     # admin user and membership management
│
└── services/
    └── search_service.py   # keyword search, filters, salary range and fuzzy matching
```

## Main features

```text
User registration and login
JWT authentication
Password hashing
Role-based access control
Candidate profile creation and update
Employer job posting
Candidate job applications
Application status updates
Candidate job recommendations
Employer recommended candidates
Keyword search
Filter search
Keyword plus filter search
Fuzzy search
Salary range filtering
Membership-based recommendation limits
Admin membership control
Seed data for testing and demo
```

## Files not pushed to GitHub

The following files and folders should not be uploaded:

```text
.env
venv/
__pycache__/
instance/
*.db
*.sqlite
*.sqlite3
node_modules/
dist/
```

These files are ignored using `.gitignore`.

## Repository note

This folder is the backend package. The GitHub remote may be a monorepo root; if so, document where this backend folder lives inside the repository so other teammates know where to run it from.

Developed by Saad as part of CSIT314 — Systems Development Methodologies, University of Wollongong.
