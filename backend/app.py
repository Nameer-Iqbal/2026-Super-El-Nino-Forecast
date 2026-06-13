import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from data_loader import load_sst_data, load_iod_data, load_contingency_data, clear_cache

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Warm up cache on startup (Smart Data Loading concept)
try:
    load_sst_data()
    load_iod_data()
    load_contingency_data()
except Exception as e:
    app.logger.error(f"Error warming up cache: {e}")

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "timestamp": time.time()})

@app.route("/api/forecast", methods=["GET"])
def get_forecast():
    """
    Returns Pacific El Nino and Indian Ocean Dipole metrics for a requested month.
    Measures and returns request processing time to verify <150ms constraints.
    """
    start_time = time.time()
    month = request.args.get("month", "Jun").strip().capitalize()[:3]
    
    sst_records = load_sst_data()
    iod_records = load_iod_data()
    
    # Find matching month records
    sst_match = next((x for x in sst_records if x["month"] == month), None)
    iod_match = next((x for x in iod_records if x["month"] == month), None)
    
    if not sst_match or not iod_match:
        # If month not found, default to first record
        sst_match = sst_records[5]  # Default to June
        iod_match = iod_records[5]
    
    # Algorithmic check: Does IOD multiply or mask El Niño impact?
    # If ONI >= 0.5 (El Nino) and IOD is Positive (DMI >= 0.4), it multiplies severity.
    # If ONI >= 0.5 (El Nino) and IOD is Negative (DMI <= -0.4), it masks/suppresses severity.
    oni_val = sst_match.get("oni", 0.0)
    dmi_val = iod_match.get("dmi", 0.0)
    
    interaction = "Neutral interaction"
    interaction_code = "NEUTRAL"
    if oni_val >= 0.5:
        if dmi_val >= 0.4:
            interaction = "IOD Positive phase actively multiplies El Niño precipitation and flood risks."
            interaction_code = "MULTIPLY"
        elif dmi_val <= -0.4:
            interaction = "IOD Negative phase masks/dampens Pacific El Niño anomalies."
            interaction_code = "MASK"
            
    latency_ms = (time.time() - start_time) * 1000
    
    return jsonify({
        "month": month,
        "sst": sst_match,
        "iod": iod_match,
        "interaction": {
            "description": interaction,
            "code": interaction_code
        },
        "performance": {
            "latency_ms": round(latency_ms, 3),
            "source": "RAM Cache"
        }
    })

@app.route("/api/advisories", methods=["GET"])
def get_advisories():
    """
    Processes national hazard directives and returns structured checklists.
    Parameters:
      - region: e.g. Punjab, Sindh, Balochistan, KPK, Gilgit-Baltistan, AJ&K
      - season: e.g. Monsoon, Winter, SpringSummer
    """
    start_time = time.time()
    region = request.args.get("region", "Punjab").strip()
    season = request.args.get("season", "Monsoon").strip()
    
    contingency = load_contingency_data()
    
    # Case-insensitive / dynamic fallback check
    matched_region = None
    for k in contingency.keys():
        if k.lower() == region.lower():
            matched_region = k
            break
            
    if not matched_region:
        return jsonify({"error": f"Region '{region}' not found in public safety outlines."}), 404
        
    region_data = contingency[matched_region]
    
    # Season fallback
    matched_season = "Monsoon"
    if "winter" in season.lower():
        matched_season = "Winter"
    elif "spring" in season.lower() or "summer" in season.lower() or "heat" in season.lower():
        matched_season = "SpringSummer"
        
    advisory = region_data.get(matched_season, region_data["Monsoon"])
    
    latency_ms = (time.time() - start_time) * 1000
    
    return jsonify({
        "region": matched_region,
        "season": matched_season,
        "risk_level": advisory["risk_level"],
        "impact_profile": advisory["impact"],
        "institutional_directives": advisory["institutional"],
        "household_checklist": advisory["household"],
        "performance": {
            "latency_ms": round(latency_ms, 3),
            "source": "RAM Cache"
        }
    })

@app.route("/api/cache", methods=["POST"])
def manage_cache():
    """Trigger clearing the in-memory cache."""
    clear_cache()
    # Rewarm
    load_sst_data()
    load_iod_data()
    load_contingency_data()
    return jsonify({"message": "Cache successfully cleared and reloaded."})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
