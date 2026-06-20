# Pakistan El Niño Predictive Platform 🇵🇰🌦️

A high-performance, scientific monitoring platform that tracks multi-basin ocean indices (Pacific NINO 3.4 and Indian Ocean Dipole) to predict rainfall anomalies and monsoon flood risks in Pakistan. The platform maps these predictions to regional disaster preparedness guidelines and household safety checklists aligned with National Disaster Management Authority (NDMA) frameworks.

---

## 📂 Repository Structure

This repository is structured as a monorepo containing both the frontend user interface and the backend API server:

```text
2026-Super-El-Nino-Forecast/
├── backend/               # Python Flask API Server
│   ├── data/              # Local backup datasets and contingency maps
│   ├── app.py             # Flask application entry point and routing
│   ├── data_loader.py     # Smart caching and data retrieval engine
│   └── requirements.txt   # Python dependencies
└── frontend/              # Vite + React Client
    ├── src/               # React components and styles
    │   ├── components/    # Reusable components (e.g., Pakistan Map)
    │   ├── App.jsx        # Main application state and timeline
    │   └── index.css      # Custom dark-theme styling and custom slider
    ├── package.json       # Node devDependencies and scripts
    └── vite.config.js     # Bundler configuration
```

---

## ⚙️ How it Works & Data Pipeline

The platform uses a **deterministic, rule-based scientific approach** to forecast climate risks:

1. **Oceanic Indices Fetching:**
   * **Pacific SST (NINO 3.4 / ONI):** Fetched dynamically from [NOAA CPC](https://www.cpc.ncep.noaa.gov/data/indices/sstoi.indices).
   * **Indian Ocean Dipole (DMI):** Fetched dynamically from the [Australian Bureau of Meteorology (BOM)](http://www.bom.gov.au/climate/iod/monitoring/dmi.txt).
   * *A RAM-caching system preserves these metrics in memory for sub-5ms processing. On network failure, it falls back to local data snapshots (`backend/data/`).*

2. **Interaction Forecasting:**
   * **Multiply Phase:** If El Niño is active (Oceanic Niño Index $\ge 0.5$) and the Indian Ocean Dipole is positive (DMI $\ge 0.4$), the positive IOD actively multiplies Pacific El Niño precipitation and flood risks in Pakistan.
   * **Mask Phase:** If El Niño is active but the IOD is negative (DMI $\le -0.4$), the negative IOD acts as a buffer, masking or suppressing Pacific El Niño anomalies.

3. **Regional Advisories Mapping:**
   * Uses the selected operational month and province selection to query local NDMA outlines (`baseline_contingency.json`) and outputs targeted institutional directives and household check-lists.

---

## 🚀 Local Development Setup

### 1. Run the Backend API
Make sure you have Python 3.10+ installed.

```bash
# Navigate to the backend directory
cd backend

# Install python dependencies
pip install -r requirements.txt

# Start the Flask development server (runs on port 5000)
python app.py
```
The API will be live at `http://127.0.0.1:5000/api`. You can check server health at `http://127.0.0.1:5000/api/health`.

### 2. Run the Frontend Dashboard
Make sure you have Node.js (v20+ or v22.12+) installed.

```bash
# Navigate to the frontend directory
cd ../frontend

# Install node dependencies
npm install

# Run the local development server (runs on port 5173)
npm run dev
```
Open `http://localhost:5173/` in your browser to view the application.

---

## 🌐 Production Deployment

### Backend (Render Web Service)
1. Create a new **Web Service** on [Render.com](https://render.com/).
2. Connect your GitHub repository.
3. Configure the settings:
   * **Root Directory:** `backend`
   * **Language/Runtime:** `Python`
   * **Build Command:** `pip install -r requirements.txt; pip install gunicorn`
   * **Start Command:** `gunicorn app:app`
4. Click **Deploy**. Note your public backend URL (e.g., `https://your-app.onrender.com`).

### Frontend (Vercel Static Site)
1. Create a new project on [Vercel.com](https://vercel.com/) and import this repository.
2. Configure the project settings:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Vite`
3. Expand **Environment Variables** and add:
   * **Key:** `VITE_API_BASE`
   * **Value:** `https://your-app.onrender.com/api` *(Your Render backend URL with `/api` appended)*
4. Click **Deploy**.

---

## 🛠️ Technology Stack
* **Frontend:** Vite, React 19, Tailwind CSS v4, HTML5.
* **Backend:** Python 3, Flask, Gunicorn (production WSGI), Pandas.
* **Data Sources:** National Oceanic and Atmospheric Administration (NOAA) & Bureau of Meteorology (BOM).
