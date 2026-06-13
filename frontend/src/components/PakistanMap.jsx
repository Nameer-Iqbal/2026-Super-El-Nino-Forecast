import React from "react";
import mapImg from "../assets/Map.jpg";

const PROVINCES = [
  { id: "Gilgit-Baltistan", name: "Gilgit-Baltistan", top: "18%", left: "62%" },
  { id: "AJ&K", name: "Jammu & Kashmir", top: "31%", left: "70%" },
  { id: "Khyber Pakhtunkhwa", name: "KPK", top: "30%", left: "48%" },
  { id: "Punjab", name: "Punjab", top: "48%", left: "62%" },
  { id: "Balochistan", name: "Balochistan", top: "58%", left: "28%" },
  { id: "Sindh", name: "Sindh", top: "72%", left: "54%" }
];

export default function PakistanMap({ selectedRegion, onSelectRegion, regionRisks }) {
  const getRiskBadgeStyles = (level) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return "bg-rose-600/90 border-rose-400 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]";
      case "HIGH":
        return "bg-amber-600/90 border-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]";
      case "MEDIUM":
        return "bg-yellow-600/90 border-yellow-400 text-white shadow-[0_0_10px_rgba(234,179,8,0.5)]";
      case "LOW":
      default:
        return "bg-emerald-600/90 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
      <div className="text-center">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
          Regional Map Focus
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Select a region below to view safety directives and checklists</p>
      </div>

      {/* Map Bounding Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl border border-slate-800 bg-white/5">
        <img
          src={mapImg}
          alt="Pakistan Regional Map"
          className="w-full h-full object-cover opacity-95 scale-[1.42] origin-[54%_48%]"
        />
      </div>

      {/* Grid of options to look at each province individually */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-400">Select Region Focus:</span>
        <div className="grid grid-cols-3 gap-2">
          {PROVINCES.map((prov) => {
            const risk = regionRisks[prov.id] || "Low";
            const isSelected = selectedRegion === prov.id;
            
            return (
              <button
                key={prov.id}
                onClick={() => onSelectRegion(prov.id)}
                className={`px-2 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  isSelected
                    ? "bg-sky-500/20 text-sky-300 border-sky-400/60 shadow-[0_0_8px_rgba(56,189,248,0.2)]"
                    : "bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800/80 hover:text-slate-300"
                }`}
              >
                {prov.name === "Khyber Pakhtunkhwa" ? "KPK" : prov.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
