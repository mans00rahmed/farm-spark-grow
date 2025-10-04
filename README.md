# 🌾 FarmSim — NASA Farm Navigators Challenge (HackAthlone 2025)

FarmSim is an **educational farming simulation** designed for the **NASA Space Apps Challenge 2025 (Athlone)** under the *Farm Navigators: Using NASA Data Exploration in Agriculture* track.  
It empowers farmers, students, and enthusiasts to **simulate farming decisions**, **observe real-time crop health**, and **understand sustainable agriculture practices** through **NASA’s open Earth observation data**.

---

## 🚀 Overview

FarmSim bridges **satellite data** and **on-ground farming insights**.  
Players manage a virtual farm — making choices about **irrigation, fertilization, and soil care**.  
The game uses **real NASA datasets (NDVI, soil moisture, temperature, rainfall)** to visualize how decisions impact **crop growth and yield**.

An integrated **AI crop health analyzer** allows users to upload real crop images, compare them with satellite-derived data, and get **decision rectification suggestions**.

---

## 🌍 Key Features

- 🛰️ **NASA Open Data Integration**
  - NDVI, MODIS, SMAP & GPM datasets for realistic soil and vegetation simulation.
- 🌾 **Interactive Farm Simulation**
  - Manage your farm plot: irrigate, fertilize, and monitor the results.
- 🤖 **AI Crop Health Analysis**
  - Upload crop images to analyze plant health and receive actionable insights.
- 📊 **Dynamic Dashboard**
  - Live visualization of soil moisture, temperature, and nutrient trends.
- 🧠 **Decision Feedback System**
  - Compares farmer decisions against satellite data and suggests corrections.
- 🏆 **Gamified Learning**
  - Earn points for sustainable decisions and improved yield.

---

## 🧩 System Architecture

```
Farmer (User)
   │
   ├──> Frontend (Angular-based FarmSim UI)
   │       ├── Farm Dashboard
   │       ├── NDVI Map Visualization
   │       └── Image Upload (Crop Analyzer)
   │
   ├──> Backend (Flask / Node.js)
   │       ├── API Integration Layer (NASA APIs)
   │       ├── Crop Health AI Model (TensorFlow/PyTorch)
   │       └── Simulation Engine (Soil, Water, Yield Logic)
   │
   └──> Data Sources
           ├── NASA Earth Observations (MODIS, SMAP, GPM)
           └── Local Image Dataset (User Uploads)
```

---

## 🧠 Why This Matters

Agriculture faces a **data accessibility gap** — many farmers lack the tools to interpret satellite data.  
FarmSim converts **complex NASA datasets into interactive learning experiences**, helping users:
- Understand the impact of irrigation/fertilizer timing
- Learn sustainable farming methods
- Make data-driven decisions for real-world agriculture

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/FarmSim.git
cd FarmSim
```

### 2. Install Dependencies
#### Frontend (Angular)
```bash
cd frontend
npm install
ng serve
```

#### Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Connect NASA APIs
Create a `.env` file in the backend with:
```
NASA_API_KEY=your_api_key_here
```

---

## 🧾 Example Workflow

1. Start the simulation.  
2. Choose irrigation and fertilization levels.  
3. Observe soil and NDVI changes on the dashboard.  
4. Upload a crop image → AI detects stress or disease.  
5. Receive feedback and corrective suggestions.  
6. Earn rewards for sustainable decisions!

---

## 📂 Project Structure

```
FarmSim/
│
├── frontend/               # Angular UI
│   ├── src/app/
│   │   ├── dashboard/
│   │   ├── simulation/
│   │   ├── upload/
│   │   └── services/
│   └── assets/
│
├── backend/                # Flask API + AI Logic
│   ├── app.py
│   ├── models/
│   ├── nasa_integration/
│   └── utils/
│
├── datasets/               # NASA sample data
├── README.md
└── requirements.txt
```

---

## 🧩 Datasets Used

| Dataset | Source | Description |
|----------|---------|-------------|
| **MODIS NDVI** | NASA EarthData | Crop vegetation index |
| **SMAP Soil Moisture** | NASA JPL | Root zone and surface moisture |
| **GPM Precipitation** | NASA GSFC | Daily rainfall patterns |
| **Landsat Imagery** | USGS/NASA | High-resolution crop area mapping |

---

## 💡 Future Enhancements

- Integration with **NASA POWER API** for real-time solar/rainfall data  
- Expansion to **livestock and greenhouse** modules  
- Offline mode for low-connectivity regions  
- Multilingual UI for global farmer accessibility

---

## 👥 Team

**Team Asterisks — Athlone, Ireland 🇮🇪**  
- **Mansoor Ahmed** – Software Engineer & System Architect  
- **Devyani Teddulwar** – Data & Sustainability Research  
- *(Add other members if any)*

---

## 🏁 License

Feel free to use, modify, and share with proper attribution.

---

## 🌟 Acknowledgements

- **NASA Earth Science Division** for open data access  
- **Space Apps Challenge Team** for global collaboration  
- **Technological University of the Shannon (TUS)** for academic support  
- **HackAthlone 2025** mentors for guidance and feedback  

---

> “The future of farming lies in understanding the Earth — not just cultivating it.”
