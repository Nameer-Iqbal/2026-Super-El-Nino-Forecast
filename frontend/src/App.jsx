import React, { useState, useEffect } from "react";
import PakistanMap from "./components/PakistanMap";

const MONTHS = [
  { name: "Jan", season: "Winter" },
  { name: "Feb", season: "Winter" },
  { name: "Mar", season: "SpringSummer" },
  { name: "Apr", season: "SpringSummer" },
  { name: "May", season: "SpringSummer" },
  { name: "Jun", season: "Monsoon" },
  { name: "Jul", season: "Monsoon" },
  { name: "Aug", season: "Monsoon" },
  { name: "Sep", season: "Monsoon" },
  { name: "Oct", season: "SpringSummer" },
  { name: "Nov", season: "SpringSummer" },
  { name: "Dec", season: "Winter" }
];

const REGION_IDS = ["Punjab", "Sindh", "Balochistan", "Khyber Pakhtunkhwa", "Gilgit-Baltistan", "AJ&K"];

const getPublicAdvisories = (level, season) => {
  if (season?.toUpperCase() === "MONSOON") {
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return [
          "Evacuate immediately if advised by local emergency response teams.",
          "Avoid all contact with raw sewage, active floodwaters, and downed electrical lines.",
          "Disconnect main gas valves and turn off primary electrical switches if water enters the home.",
          "Assemble emergency go-bags with identification, cash, water purification tablets, and non-perishable food.",
          "Move valuables, files, and critical electronics to upper floors or high platforms.",
          "Listen to local radio/news broadcasts and stay tuned for early warnings."
        ];
      case "HIGH":
        return [
          "Do not walk, swim, or drive through floodwaters ('Turn Around, Don't Drown').",
          "Identify and map the fastest route to the nearest high-ground community shelter.",
          "Keep mobile phones and emergency flashlights fully charged with backup power banks.",
          "Store at least a 72-hour supply of dry rations and clean drinking water."
        ];
      case "MEDIUM":
        return [
          "Avoid traveling during heavy downpours, especially near landslide-prone hilly terrains.",
          "Clear domestic gutters and street drains of plastic waste to prevent localized water ponding.",
          "Boil or treat all domestic water reserves to prevent contamination and waterborne disease outbreaks.",
          "Secure livestock on elevated platforms or move them away from low-lying streams."
        ];
      case "LOW":
      default:
        return [
          "Monitor meteorological alerts and NDMA Disaster Alert app notices.",
          "Inspect residential structural drains, roof tiles, and downspouts for blockages.",
          "Maintain a basic first-aid kit and keep emergency service contacts handy."
        ];
    }
  }

  // Original Heatwave advisories (do not alter)
  switch (level?.toUpperCase()) {
    case "CRITICAL":
      return [
        "Extreme care needed for vulnerable people.",
        "Avoid heat exposure.",
        "Drink sufficient fluids.",
        "Replenish body salt through ORS.",
        "Wear light colored and loose cotton clothes.",
        "Walk and sit under shades.",
        "Call emergency helpline for any additional assistance."
      ];
    case "HIGH":
      return [
        "Avoid heat exposure.",
        "Drink sufficient fluids.",
        "Replenish body salt through IV fluids.",
        "Wear light colored and loose cotton clothes.",
        "Walk and sit under shades."
      ];
    case "MEDIUM":
      return [
        "Avoid outdoor activities.",
        "Cover your head.",
        "Drink more water.",
        "Wear light colored and loose cotton clothes."
      ];
    case "LOW":
    default:
      return [
        "Monitor local temperature reports.",
        "Drink sufficient water throughout the day.",
        "Avoid prolonged direct exposure to midday sun."
      ];
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState("forecast"); // "forecast", "precautions", "contacts"
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(5); // Default: June
  const [selectedRegion, setSelectedRegion] = useState("Punjab");

  // Forecast index state
  const [forecast, setForecast] = useState(null);
  // Advisories state
  const [advisory, setAdvisory] = useState(null);

  // Region-wise risk status map for current season
  const [regionRisks, setRegionRisks] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiLatency, setApiLatency] = useState(0);

  const selectedMonth = MONTHS[selectedMonthIdx].name;
  const selectedSeason = MONTHS[selectedMonthIdx].season;

  // Base API configuration (uses environment variable on production, falls back to localhost)
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000/api";

  const fetchData = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const forecastRes = await fetch(`${API_BASE}/forecast?month=${selectedMonth}`);
      const forecastData = await forecastRes.json();
      setForecast(forecastData);

      const advisoryRes = await fetch(`${API_BASE}/advisories?region=${selectedRegion}&season=${selectedSeason}`);
      const advisoryData = await advisoryRes.json();
      setAdvisory(advisoryData);

      const riskPromises = REGION_IDS.map(async (rId) => {
        try {
          const res = await fetch(`${API_BASE}/advisories?region=${rId}&season=${selectedSeason}`);
          const data = await res.json();
          return { id: rId, risk: data.risk_level };
        } catch {
          return { id: rId, risk: "Low" };
        }
      });
      const riskResults = await Promise.all(riskPromises);
      const riskMap = {};
      riskResults.forEach(item => {
        riskMap[item.id] = item.risk;
      });
      setRegionRisks(riskMap);

      setApiLatency(performance.now() - start);
    } catch (err) {
      console.warn("Network error fetching API, using offline fallback:", err);
      simulateOfflineFallback();
      setApiLatency(performance.now() - start);
    } finally {
      setLoading(false);
    }
  };

  const simulateOfflineFallback = () => {
    const mockSST = {
      "Jan": { nino34: 0.8, oni: 0.9, phase: "Weak El Nino" },
      "Feb": { nino34: 1.1, oni: 1.0, phase: "Moderate El Nino" },
      "Mar": { nino34: 1.4, oni: 1.3, phase: "Moderate El Nino" },
      "Apr": { nino34: 1.8, oni: 1.6, phase: "Strong El Nino" },
      "May": { nino34: 2.1, oni: 1.9, phase: "Strong El Nino" },
      "Jun": { nino34: 2.4, oni: 2.2, phase: "Super El Nino" },
      "Jul": { nino34: 2.6, oni: 2.4, phase: "Super El Nino" },
      "Aug": { nino34: 2.5, oni: 2.5, phase: "Super El Nino" },
      "Sep": { nino34: 2.3, oni: 2.4, phase: "Super El Nino" },
      "Oct": { nino34: 2.0, oni: 2.1, phase: "Strong El Nino" },
      "Nov": { nino34: 1.7, oni: 1.8, phase: "Strong El Nino" },
      "Dec": { nino34: 1.3, oni: 1.4, phase: "Moderate El Nino" }
    }[selectedMonth];

    const mockIOD = {
      "Jan": { dmi: -0.1, phase: "Neutral" },
      "Feb": { dmi: 0.0, phase: "Neutral" },
      "Mar": { dmi: 0.1, phase: "Neutral" },
      "Apr": { dmi: 0.3, phase: "Neutral" },
      "May": { dmi: 0.5, phase: "Positive" },
      "Jun": { dmi: 0.7, phase: "Positive (Multiplying)" },
      "Jul": { dmi: 0.9, phase: "Positive (Multiplying)" },
      "Aug": { dmi: 0.8, phase: "Positive (Multiplying)" },
      "Sep": { dmi: 0.6, phase: "Positive (Multiplying)" },
      "Oct": { dmi: 0.4, phase: "Neutral" },
      "Nov": { dmi: 0.2, phase: "Neutral" },
      "Dec": { dmi: 0.0, phase: "Neutral" }
    }[selectedMonth];

    let interactionDesc = "Neutral interaction";
    let interactionCode = "NEUTRAL";
    if (mockSST.oni >= 0.5) {
      if (mockIOD.dmi >= 0.4) {
        interactionDesc = "IOD Positive phase actively multiplies El Niño precipitation and flood risks.";
        interactionCode = "MULTIPLY";
      } else if (mockIOD.dmi <= -0.4) {
        interactionDesc = "IOD Negative phase masks/dampens Pacific El Niño anomalies.";
        interactionCode = "MASK";
      }
    }

    setForecast({
      month: selectedMonth,
      sst: mockSST,
      iod: mockIOD,
      interaction: { description: interactionDesc, code: interactionCode },
      performance: { source: "Offline Fallback Cache" }
    });

    const mockAdvisory = {
      "Punjab": {
        "Monsoon": { risk_level: "High", impact: "Riverine flooding in Indus and Chenab basins, urban flooding.", institutional: ["Reinforce embankments.", "Establish relief camps."] },
        "Winter": { risk_level: "Low", impact: "Dense fog and dry winter spell.", institutional: ["Coordinate highway traffic."] },
        "SpringSummer": { risk_level: "Medium", impact: "Heatwaves and dry windstorms.", institutional: ["Set up cooling centers."] }
      },
      "Sindh": {
        "Monsoon": { risk_level: "Critical", impact: "Flash floods in Kirthar torrents, urban flooding in Karachi.", institutional: ["De-silt drains.", "Evacuate low-lying coastal areas."] },
        "Winter": { risk_level: "Low", impact: "Mild dry winter spell.", institutional: ["Manage canal distribution."] },
        "SpringSummer": { risk_level: "High", impact: "Jacobabad heatwaves, maritime swell risks.", institutional: ["Set up cooling centers.", "Alert fishermen."] }
      },
      "Balochistan": {
        "Monsoon": { risk_level: "High", impact: "Flash flooding in dry streams, mudslides.", institutional: ["Deploy rescue along N-25/N-40."] },
        "Winter": { risk_level: "High", impact: "Severe cold waves, snow blockades on passes.", institutional: ["Clear snow at Kozak Pass."] },
        "SpringSummer": { risk_level: "Medium", impact: "Drought and water table depletion.", institutional: ["Construct check dams."] }
      },
      "Khyber Pakhtunkhwa": {
        "Monsoon": { risk_level: "Critical", impact: "Landslides in hilly districts (Swat, Kaghan).", institutional: ["Clear landslide blockades.", "Monitor Kabul river level."] },
        "Winter": { risk_level: "Medium", impact: "Heavy snowfall blocking remote valleys.", institutional: ["Keep supply chains open."] },
        "SpringSummer": { risk_level: "Medium", impact: "GLOF events in Chitral.", institutional: ["Install warning sensors."] }
      },
      "Gilgit-Baltistan": {
        "Monsoon": { risk_level: "High", impact: "GLOF events and landslide road blocks.", institutional: ["Pre-position food reserves."] },
        "Winter": { risk_level: "High", impact: "Extreme sub-zero winter temperatures.", institutional: ["Stock medical centers with winter kits."] },
        "SpringSummer": { risk_level: "Critical", impact: "Rapid glacial melt causing valley floods.", institutional: ["Map evacuation paths."] }
      },
      "AJ&K": {
        "Monsoon": { risk_level: "High", impact: "Landslides in Jhelum and Neelum valleys.", institutional: ["Coordinate controlled dam release."] },
        "Winter": { risk_level: "Medium", impact: "Heavy snowfall in Leepa/upper Neelum.", institutional: ["Provide heating fuel subsidies."] },
        "SpringSummer": { risk_level: "Low", impact: "Sudden hail storm crop damage.", institutional: ["Provide agricultural advisory."] }
      }
    }[selectedRegion][selectedSeason];

    setAdvisory({
      region: selectedRegion,
      season: selectedSeason,
      risk_level: mockAdvisory.risk_level,
      impact_profile: mockAdvisory.impact,
      institutional_directives: mockAdvisory.institutional,
      performance: { source: "Offline Fallback Cache" }
    });

    const riskMap = {};
    REGION_IDS.forEach(rId => {
      const regionData = {
        "Punjab": { "Monsoon": "High", "Winter": "Low", "SpringSummer": "Medium" },
        "Sindh": { "Monsoon": "Critical", "Winter": "Low", "SpringSummer": "High" },
        "Balochistan": { "Monsoon": "High", "Winter": "High", "SpringSummer": "Medium" },
        "Khyber Pakhtunkhwa": { "Monsoon": "Critical", "Winter": "Medium", "SpringSummer": "Medium" },
        "Gilgit-Baltistan": { "Monsoon": "High", "Winter": "High", "SpringSummer": "Critical" },
        "AJ&K": { "Monsoon": "High", "Winter": "Medium", "SpringSummer": "Low" }
      }[rId][selectedSeason];
      riskMap[rId] = regionData;
    });
    setRegionRisks(riskMap);
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonthIdx, selectedRegion]);

  const getRiskBadgeColor = (level) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return "bg-rose-950/60 text-rose-300 border-rose-500/50 shadow-rose-900/30";
      case "HIGH":
        return "bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-amber-900/30";
      case "MEDIUM":
        return "bg-yellow-950/60 text-yellow-300 border-yellow-500/50 shadow-yellow-900/30";
      case "LOW":
      default:
        return "bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-emerald-900/30";
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header Banner */}
      <header className="glass-panel border-b border-slate-800 py-6 px-8 mb-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className="bg-sky-500/10 p-2 sm:p-2.5 rounded-lg border border-sky-500/30 pulse-glow flex-shrink-0">
              <svg className="w-6 h-6 sm:w-8 h-8 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 18.5V20M4.22 4.22l1.06 1.06M17.72 17.72l1.06 1.06M2 12h1.5M18.5 12H20M4.22 19.78l1.06-1.06M17.72 5.28l1.06-1.06m-6.5 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Pakistan El Niño Predictive Platform
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Multi-basin climate monitoring & NIDM-NDMA safety guidelines
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 sm:gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full flex-nowrap scrollbar-thin">
            <button
              onClick={() => setActiveTab("forecast")}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === "forecast" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Forecast & Advisories
            </button>
            <button
              onClick={() => setActiveTab("precautions")}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === "precautions" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
            >
              NDMA Precautions
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === "contacts" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Emergency Contacts
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        {activeTab === "forecast" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Timeline Controls */}
            <section className="lg:col-span-12 glass-panel p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sky-400 font-bold text-sm tracking-wide">Chronological Forecast Tracker</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-950/80 text-sky-300 rounded border border-sky-800/60 shadow-[0_0_8px_rgba(56,189,248,0.15)]">2026 Season</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Drag slider to shift climate operational months</span>
              </div>

              {/* Month Slider */}
              <div className="relative pt-6 pb-6 px-4 bg-slate-950/30 rounded-2xl border border-slate-800/40 mb-2">
                <div className="relative mb-6">
                  {/* Slider Track and Input */}
                  <input
                    type="range"
                    min="0"
                    max="11"
                    value={selectedMonthIdx}
                    onChange={(e) => setSelectedMonthIdx(parseInt(e.target.value))}
                    className="custom-slider w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, var(--color-sky-500) 0%, var(--color-sky-400) ${(selectedMonthIdx / 11) * 100}%, var(--color-slate-800) ${(selectedMonthIdx / 11) * 100}%, var(--color-slate-800) 100%)`
                    }}
                  />
                </div>

                {/* Timeline Buttons / Month Indicators */}
                <div className="flex justify-between gap-1 relative">
                  {MONTHS.map((m, idx) => {
                    const isActive = idx === selectedMonthIdx;
                    // Determine season style
                    let seasonBadgeClass = "";
                    if (m.season === "Winter") {
                      seasonBadgeClass = isActive 
                        ? "bg-blue-500/20 text-blue-300 border-blue-400/40" 
                        : "bg-slate-900/60 text-blue-400/60 border-slate-800/30";
                    } else if (m.season === "SpringSummer") {
                      seasonBadgeClass = isActive 
                        ? "bg-amber-500/20 text-amber-300 border-amber-400/40" 
                        : "bg-slate-900/60 text-amber-400/60 border-slate-800/30";
                    } else { // Monsoon
                      seasonBadgeClass = isActive 
                        ? "bg-teal-500/20 text-teal-300 border-teal-400/40" 
                        : "bg-slate-900/60 text-teal-400/60 border-slate-800/30";
                    }

                    return (
                      <button
                        key={m.name}
                        onClick={() => setSelectedMonthIdx(idx)}
                        className={`flex flex-col items-center transition-all cursor-pointer min-w-[24px] sm:min-w-[48px] focus:outline-none group`}
                      >
                        <span className={`text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 ${
                          isActive 
                            ? "text-sky-400 scale-110 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]" 
                            : "text-slate-400 group-hover:text-slate-200"
                        }`}>
                          {m.name}
                        </span>
                        
                        {/* Connecting visual pointer */}
                        <div className={`w-1 h-1.5 my-1.5 transition-all rounded-full ${
                          isActive ? "bg-sky-400 scale-125 shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "bg-transparent group-hover:bg-slate-700/50"
                        }`} />

                        <span className={`hidden sm:inline-block text-[9px] font-bold transition-all duration-200 px-1.5 py-0.5 rounded border whitespace-nowrap ${seasonBadgeClass}`}>
                          {m.season === "SpringSummer" ? "Spring/Sum" : m.season}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Left Column: Map & Global Climate Metrics */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <PakistanMap
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                regionRisks={regionRisks}
              />

              {/* Climate Metrics panel */}
              <section className="glass-panel p-6 rounded-2xl flex flex-col gap-5">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400 border-b border-slate-800 pb-2">
                  Multi-Basin Ocean Indices
                </h3>

                {/* Pacific SST index */}
                <div className="flex items-start justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pacific SST (NINO 3.4 / ONI)</h4>
                    <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-2">
                      {forecast?.sst?.nino34 ? `+${forecast.sst.nino34.toFixed(1)}°C` : "N/A"}
                      <span className="text-xs font-medium text-slate-400">anomaly</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Global Intensity: <strong className="text-rose-400">{forecast?.sst?.phase || "N/A"}</strong></p>
                  </div>
                  <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>

                {/* Indian Ocean Dipole index */}
                <div className="flex items-start justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Indian Ocean Dipole (Arabian Sea)</h4>
                    <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-2">
                      {forecast?.iod?.dmi ? `+${forecast.iod.dmi.toFixed(2)}` : "N/A"}
                      <span className="text-xs font-medium text-slate-400">DMI Index</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">IOD State: <strong className="text-sky-400">{forecast?.iod?.phase || "N/A"}</strong></p>
                  </div>
                  <div className="bg-sky-500/10 p-2 rounded-lg border border-sky-500/20">
                    <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </div>
                </div>

                {/* Multi-Basin Interaction warning */}
                {forecast?.interaction && (
                  <div className={`p-4 rounded-xl border flex gap-3 ${forecast.interaction.code === "MULTIPLY"
                    ? "bg-rose-950/40 border-rose-900/70 text-rose-200"
                    : forecast.interaction.code === "MASK"
                      ? "bg-teal-950/40 border-teal-900/70 text-teal-200"
                      : "bg-slate-900/40 border-slate-800 text-slate-300"
                    }`}>
                    <div className="mt-0.5">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">Multi-Basin Interaction Factor</h4>
                      <p className="text-xs mt-1 leading-relaxed">{forecast.interaction.description}</p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Localized Advisories Console */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <section className="glass-panel p-6 rounded-2xl flex-1 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">Active Regional Advisory</span>
                    <h2 className="text-2xl font-bold text-white mt-0.5">{selectedRegion}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedSeason} Phase
                    </span>
                    {advisory && (
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg border shadow-sm ${getRiskBadgeColor(advisory.risk_level)}`}>
                        {advisory.risk_level} Risk
                      </span>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12">
                    <svg className="w-8 h-8 text-sky-400 animate-spin mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span className="text-xs text-slate-400">Parsing Contingency Outlines...</span>
                  </div>
                ) : advisory ? (
                  <div className="flex-1 flex flex-col gap-6">
                    {/* Expected impact */}
                    <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/60">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Forecast Seasonal Impact</h4>
                      <p className="text-sm text-slate-200 font-medium leading-relaxed">
                        {advisory.impact_profile}
                      </p>
                    </div>

                    {/* Public Advisory */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        Public Safety Advisory
                      </h4>
                      <ul className="space-y-2.5">
                        {getPublicAdvisories(advisory.risk_level, selectedSeason).map((adv, idx) => (
                          <li key={idx} className="text-xs text-slate-300 leading-relaxed bg-slate-900/20 p-3 rounded-lg border border-slate-800/40">
                            - {adv}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Household Checklist & Precautions */}
                    {((advisory.household_checklist && advisory.household_checklist.length > 0) || (advisory.household_directives && advisory.household_directives.length > 0)) && (
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Household Contingency Precautions
                        </h4>
                        <ul className="space-y-2.5">
                          {(advisory.household_checklist || advisory.household_directives).map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 leading-relaxed bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/40 flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    Select a region on the map or adjust the slider to load public safety outlines.
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* Tab 2: NDMA Precautions & Strategies */}
        {activeTab === "precautions" && (
          <div className="flex flex-col gap-8">
            {/* Heatwave Section */}
            <div>
              <h3 className="text-xl font-extrabold text-amber-400 mb-4 tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></span>
                Heatwave Risk Management Guidelines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                    Public Engagement & Heatwave Safety
                  </h4>
                  <div className="space-y-4 text-sm text-slate-300">
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Avoid Peak Hours Exposure</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        The highest temperatures are recorded between <strong className="text-white">11:00 AM and 4:00 PM</strong>. Avoid direct sun exposure and strenuous outdoor tasks during this window.
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Maintain Hydration</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Continuously consume water and replenishing fluids like ORS. Avoid high-sugar drinks and work in shade wherever possible.
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Protective Wear</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Cover your head when outside. Wear loose-fitting, light-colored cotton clothing to aid body thermal regulation.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                    Management & Resilient Infrastructure
                  </h4>
                  <div className="space-y-4 text-sm text-slate-300">
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Early Warning Systems</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Ensure the integration of meteorological forecasts with WhatsApp groups, mobile alerts, SMS broadcast, and digital billboards in urban squares.
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Climate-Responsive Design</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Promote cool roofing techniques, passive indoor ventilation, heat-reflective pavements, and expanded green cover to combat the Urban Heat Island (UHI) effect.
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Emergency Relief Deployment</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Establish mobile cooling camps, coordinate community volunteers to monitor heatstroke signs, and set up rapid distribution paths for IV fluids and clean water.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Urban Flooding Section */}
            <div>
              <h3 className="text-xl font-extrabold text-sky-400 mb-4 tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 bg-sky-400 rounded-full animate-pulse"></span>
                NDMA Urban Flooding Preparedness & Prevention
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                    Structural & Legislative Preparedness
                  </h4>
                  <div className="space-y-4 text-sm text-slate-300">
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Drain Cleaning & De-silting</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Conduct thorough widening, dredging, and de-silting of major stormwater and sewerage drains (nullahs) well ahead of the monsoon season to prevent channel choking.
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Regulation Enforcement & Anti-Encroachment</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Remove illegal encroachments along floodplains and drainage systems on top priority to reclaim original water flow widths. Enact provincial legislation banning garbage dumping in nullahs.
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Pumping Stations & Backup Power</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Assure regular servicing of stormwater and sewage disposal pumping stations. Install dedicated high-capacity generators to maintain pumping operations during power grid blackouts.
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Hazard Mapping & Warning Systems</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Create high-resolution flood hazard maps of major cities based on drainage capacities, and install real-time water level warning sensors on high-risk streams.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                    Nature-Based Solutions & Green Infrastructure
                  </h4>
                  <div className="space-y-4 text-sm text-slate-300">
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Sponge City & Urban Absorption</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Incorporate sponge city designs utilizing permeable pavements, urban green spaces, and constructed wetlands to naturally absorb, filter, and store excess stormwater.
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Permeable Infrastructure</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Redesign alleys and public plazas using porous concrete, asphalt, or interlocking blocks that allow surface water to infiltrate the soil and recharge groundwater.
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Bioswales & Rainwater Harvesting</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Install vegetated bioswales along avenues to filter and slow down stormwater runoff. Promote rooftop rainwater collection tanks to decrease initial volume surges.
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      <h5 className="font-semibold text-white mb-2">Water Squares & Floodable Parks</h5>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Design multi-use public squares (e.g., Rotterdam model) that act as recreation plazas during dry spells and transform into temporary detention basins to catch stormwater during heavy rains.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Emergency Contacts */}
        {activeTab === "contacts" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-sky-400 mb-2">Core Emergency Numbers</h2>
              <p className="text-xs text-slate-400">Available nationwide and regionally for immediate disaster response and medical support.</p>
            </div>

            <div className="glass-panel overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-full">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">Service</th>
                    <th className="p-4">Helpline Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 text-sm">
                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-semibold text-white">Pakistan Emergency Helpline</td>
                    <td className="p-4 text-sky-400 font-bold text-base">911</td>
                  </tr>
                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-semibold text-white">Police Emergency</td>
                    <td className="p-4 text-sky-400 font-bold text-base">15</td>
                  </tr>
                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-semibold text-white">Rescue / Ambulance</td>
                    <td className="p-4 text-sky-400 font-bold text-base">1122</td>
                  </tr>
                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-semibold text-white">Edhi Ambulance</td>
                    <td className="p-4 text-sky-400 font-bold text-base">115</td>
                  </tr>
                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-semibold text-white">Fire Brigade</td>
                    <td className="p-4 text-sky-400 font-bold text-base">16</td>
                  </tr>
                  <tr className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-semibold text-white">Motorway Police (NH&MP)</td>
                    <td className="p-4 text-sky-400 font-bold text-base">130</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
