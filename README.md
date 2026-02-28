# 🛰️ PULSE.SYD | Live Event Aggregator & Curation Engine

An automated, high-performance MERN stack platform that intercepts, curates, and publishes real-time event data across Sydney.

PULSE.SYD is not just an event directory. It is a self-healing data aggregation engine that utilizes custom-built web scrapers to fetch data from sources like Sydney.com and Eventbrite, processes them through a secure MD5 hashing pipeline to prevent duplicates, and provides administrators with a powerful curation dashboard to manage the lifecycle of live events.

---

## 🚀 Key Features

### 🧠 Smart Data Pipeline (Backend)

**Automated Interception**  
Headless browser scraping using Puppeteer triggered via a secure, webhook-protected cron job.

**Delta-Update Fingerprinting**  
Generates unique MD5 hashes based on:

Title + Date + Venue

The system intelligently detects:
- Brand new events
- Updated event details
- Removed events from the source

**Self-Cleaning Architecture**
- Auto-archives expired events
- Auto-hides canceled events
- No manual admin cleanup required

---

### 🎨 Premium User Interface (Frontend)

**Real-Time LIVE NOW Engine**  
Intelligently bypasses outdated source dates if the scraper confirms the event is actively happening today. Displays a pulsing neon badge for real-time engagement.

**Glassmorphism Design**
- Dark-mode optimized UI
- Tailwind CSS custom animations
- Framer Motion transitions
- Lucide Icons integration
- Modern layered aesthetic

**Smart Admin Dashboard**
Protected Admin Portal powered by Google OAuth 2.0 with advanced filtering:
- Filter by City
- Filter by Keyword
- Filter by Status
- Filter by Date Range

Administrators control which events go live on the public feed.

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|------------|----------|
| React.js (Vite) | SPA framework |
| Tailwind CSS | Styling & UI animations |
| Framer Motion | Motion & transitions |
| Axios | API communication |
| React Router | Client-side routing |

### Backend

| Technology | Purpose |
|------------|----------|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| MongoDB Atlas | Cloud database |
| Mongoose | Schema modeling |
| Puppeteer | Headless web scraping |
| Node-Cron | Scheduled automation |
| Passport.js | Google OAuth 2.0 authentication |
| Crypto (MD5) | Hash-based fingerprinting |

---

## ⚙️ Core Engine Logic

The heart of PULSE.SYD is its lifecycle management system (`engine.js`).

When the scraper runs, the engine evaluates incoming data against the database using four lifecycle cases:

**Discovery (status: 'new')**  
A new hash is detected. The event is saved and sent to the Admin Dashboard for review.

**Mutation Tracking (status: 'updated')**  
An existing event is found but the hash has changed (venue moved, date changed, description updated). The database overwrites old details and flags it as updated.

**Stale Data Cleanup (status: 'inactive')**  
If the scraper fails to find an un-imported event that existed previously, it is marked inactive to keep the dashboard clean.

**Automated Archiving**  
If a previously published (imported) event passes its end date and disappears from the source site, the engine safely archives it and removes it from the public feed permanently.

---

## 🏗 System Architecture

Puppeteer Scraper  
        ↓  
MD5 Fingerprint Engine  
        ↓  
MongoDB Atlas  
        ↓  
Admin Dashboard  
        ↓  
Public Event Feed  

---
