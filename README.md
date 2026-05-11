# TalentMatch — Frontend (`talentmatch-ui`)

React single-page app for the **Intelligent Talent Matching Platform** (CSIT314 coursework). It implements candidate and employer flows with client-side navigation and **localStorage** persistence until a backend is connected.

## Stack

- **React** 19 + **Vite** 8  
- **React Router** 7 (`BrowserRouter`)  
- **ESLint** (see `eslint.config.js`)

## Prerequisites

- **Node.js** 20+ recommended  
- **npm** (comes with Node)

## Setup & scripts

```bash
npm install
npm run dev      # start dev server (default: http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # serve the production build locally
npm run lint     # run ESLint


**Project layout (abbreviated)**
talentmatch-ui/
├── data/                 # JSON fixtures / dev mirror output
├── public/
├── src/
│   ├── App.jsx           # route table
│   ├── main.jsx
│   ├── pages/            # page components + CSS
│   ├── data/             # in-app data modules
│   ├── hooks/
│   └── lib/              # storage helpers
├── index.html
├── vite.config.js
└── package.json

**Repository note**
This folder is the frontend package. The GitHub remote may be a monorepo root; if so, link or document where this app lives inside that repo for other teammates.

Developed by Alyan Alam as part of CSIT314 — Systems Development Methodologies, University of Wollongong.
