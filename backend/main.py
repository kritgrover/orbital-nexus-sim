from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from datetime import datetime, timezone
from collections import deque
from tle_fetcher import TLEFetcher
from orbital_tracker import OrbitalTracker
from link_budget_calculator import LinkBudgetCalculator
from dtn_bundle_manager import DTNBundleManager, BundlePriority  # NEW

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
tle_fetcher = TLEFetcher()
link_budget_calc = LinkBudgetCalculator()

# Ground stations
# Multiple ground stations around the world
GROUND_STATIONS = [
    {"id": "toronto", "name": "Toronto", "lat": 43.6532, "lon": -79.3832},
    {"id": "london", "name": "London", "lat": 51.5074, "lon": -0.1278},
    {"id": "tokyo", "name": "Tokyo", "lat": 35.6762, "lon": 139.6503},
    {"id": "sydney", "name": "Sydney", "lat": -33.8688, "lon": 151.2093},
    {"id": "washington", "name": "Washington DC", "lat": 38.9072, "lon": -77.0369},
    {"id": "singapore", "name": "Singapore", "lat": 1.3521, "lon": 103.8198},
    {"id": "bengaluru", "name": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
    {"id": "saopaulo", "name": "São Paulo", "lat": -23.5505, "lon": -46.6333},
    {"id": "moscow", "name": "Moscow", "lat": 55.7558, "lon": 37.6173},
]

MIN_ELEVATION_FOR_VISIBILITY = -5.0

# Initialize DTN Bundle Manager
dtn_manager = DTNBundleManager(GROUND_STATIONS)  # NEW

@app.get("/")
async def root():
    return {
        "message": "ISS Orbital Tracking Backend with DTN",
        "stations": len(GROUND_STATIONS),
        "min_elevation": MIN_ELEVATION_FOR_VISIBILITY
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Basic heartbeat websocket"""
    await websocket.accept()
    print("✅ Client connected to /ws")
    
    try:
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        while True:
            await websocket.send_json({
                "type": "heartbeat",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        print("❌ Client disconnected from /ws")

@app.websocket("/ws/orbital_tracking")
async def orbital_tracking_websocket(websocket: WebSocket):
    """Real-time ISS tracking with DTN bundle management"""
    await websocket.accept()
    print("✅ Client connected to /ws/orbital_tracking")
    
    try:
        # Fetch TLE data
        tle = tle_fetcher.get_tle()
        if not tle:
            await websocket.send_json({
                "type": "error",
                "message": "Could not fetch TLE data"
            })
            await websocket.close()
            return
        
        # Initialize tracker
        tracker = OrbitalTracker(tle)
        link_budget_history = deque(maxlen=300)
        
        # Send initial connection
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "message": "Orbital tracking with DTN initialized",
            "stations": GROUND_STATIONS,
            "min_elevation": MIN_ELEVATION_FOR_VISIBILITY
        })
        
        # Calculate orbital path
        orbital_path = tracker.get_orbital_path(minutes=95, points=150)
        last_path_update = datetime.now(timezone.utc)
        
        print("🚀 Starting orbital tracking with DTN...")
        
        iteration = 0
        current_active_station = None
        
        while True:
            iteration += 1
            now = datetime.now(timezone.utc)
            
            # Get ISS position
            iss_position = tracker.get_current_position()
            
            # Calculate for all stations
            stations_data = []
            visible_stations = []
            
            for station in GROUND_STATIONS:
                look_angles = tracker.calculate_look_angles(station["lat"], station["lon"])
                is_visible = look_angles["elevation"] > MIN_ELEVATION_FOR_VISIBILITY
                
                next_pass = tracker.predict_next_pass(
                    station["lat"], 
                    station["lon"],
                    min_elevation=MIN_ELEVATION_FOR_VISIBILITY
                )
                
                pass_window = None
                if is_visible:
                    pass_window = tracker.calculate_pass_window(
                        station["lat"],
                        station["lon"],
                        min_elevation=MIN_ELEVATION_FOR_VISIBILITY
                    )
                
                station_data = {
                    "id": station["id"],
                    "name": station["name"],
                    "lat": station["lat"],
                    "lon": station["lon"],
                    "look_angles": look_angles,
                    "is_visible": is_visible,
                    "next_pass_minutes": next_pass["minutes_until"],
                    "next_pass_time": next_pass["start_time"],
                    "pass_window": pass_window
                }
                
                stations_data.append(station_data)
                
                if is_visible:
                    visible_stations.append(station_data)
            
            # Determine active station
            if visible_stations:
                visible_stations.sort(key=lambda s: s["look_angles"]["elevation"], reverse=True)
                new_active_station = visible_stations[0]["id"]
                
                if current_active_station and current_active_station != new_active_station:
                    print(f"🔄 HANDOFF: {current_active_station} → {new_active_station}")
                
                current_active_station = new_active_station
            else:
                stations_data.sort(key=lambda s: s["next_pass_minutes"] if s["next_pass_minutes"] > 0 else 999999)
                current_active_station = None
            
            # Process DTN bundles based on contacts
            for station_data in stations_data:
                # Find next visible station for forwarding
                next_visible = None
                if not station_data["is_visible"] and len(visible_stations) > 0:
                    next_visible = visible_stations[0]["id"]
                
                dtn_manager.process_contact(
                    station_data["id"],
                    station_data["is_visible"],
                    next_visible
                )
            
            # Cleanup expired bundles every 60 seconds
            if iteration % 60 == 0:
                dtn_manager.cleanup_expired()
            
            # Update orbital path every 60 seconds
            if (now - last_path_update).total_seconds() > 60:
                orbital_path = tracker.get_orbital_path(minutes=95, points=150)
                last_path_update = now
            
            # Build orbital parameters
            active_station_data = None
            if current_active_station:
                active_station_data = next(
                    (s for s in stations_data if s["id"] == current_active_station), 
                    None
                )
            
            orbital_parameters = None
            if active_station_data:
                orbital_parameters = {
                    "active_station": active_station_data["name"],
                    "latitude": iss_position["latitude"],
                    "longitude": iss_position["longitude"],
                    "altitude_km": iss_position["altitude_km"],
                    "velocity_kmps": iss_position["velocity_kmps"],
                    "azimuth": active_station_data["look_angles"]["azimuth"],
                    "elevation": active_station_data["look_angles"]["elevation"],
                    "range_km": active_station_data["look_angles"]["range_km"],
                    "next_pass_time": active_station_data["next_pass_time"],
                    "next_pass_minutes": active_station_data["next_pass_minutes"],
                    "aos_time": active_station_data["pass_window"]["aos_time"] if active_station_data["pass_window"] else None,
                    "los_time": active_station_data["pass_window"]["los_time"] if active_station_data["pass_window"] else None,
                    "pass_duration_minutes": active_station_data["pass_window"]["duration_minutes"] if active_station_data["pass_window"] else 0,
                    "is_in_pass": active_station_data["pass_window"]["is_in_pass"] if active_station_data["pass_window"] else False
                }
            
            # Calculate link budget
            link_status = None
            if active_station_data:
                radial_velocity_data = tracker.calculate_radial_velocity(
                    active_station_data["lat"],
                    active_station_data["lon"]
                )
                
                link_budget = link_budget_calc.calculate_link_budget(
                    active_station_data["look_angles"]["range_km"],
                    active_station_data["look_angles"]["elevation"],
                    radial_velocity_data["radial_velocity_kmps"]
                )
                
                link_status = {
                    "signal_strength_dbm": link_budget["signal_strength_dbm"],
                    "connection_state": link_budget["connection_state"],
                    "latency_ms": link_budget["latency_ms"],
                    "doppler_shift_khz": link_budget["doppler_shift_khz"],
                    "snr_db": link_budget["snr_db"],
                    "range_km": link_budget["range_km"],
                    "radial_velocity_kmps": radial_velocity_data["radial_velocity_kmps"]
                }
                
                link_budget_history.append({
                    "timestamp": now.isoformat(),
                    "snr_db": link_budget["snr_db"],
                    "signal_strength_dbm": link_budget["signal_strength_dbm"]
                })
            else:
                link_status = {
                    "signal_strength_dbm": -120.0,
                    "connection_state": "IDLE",
                    "latency_ms": 0.0,
                    "doppler_shift_khz": 0.0,
                    "snr_db": -50.0,
                    "range_km": 0.0,
                    "radial_velocity_kmps": 0.0
                }
            
            # Get DTN bundle queues for all stations
            dtn_queues = dtn_manager.get_all_queues()
            
            # Prepare data packet
            data = {
                "type": "orbital_update",
                "timestamp": now.isoformat(),
                "iss_position": iss_position,
                "orbital_path": orbital_path,
                "stations": stations_data,
                "active_station_id": current_active_station,
                "visible_stations_count": len(visible_stations),
                "min_elevation": MIN_ELEVATION_FOR_VISIBILITY,
                "orbital_parameters": orbital_parameters,
                "link_status": link_status,
                "link_budget_history": list(link_budget_history),
                "dtn_queues": dtn_queues  # NEW
            }
            
            # Send data
            await websocket.send_json(data)
            
            # Update every 1 second
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        print("❌ Client disconnected")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

# NEW: Endpoint to create bundles
@app.post("/api/bundle/create")
async def create_bundle(request: dict):
    """Create a new DTN bundle"""
    try:
        bundle = dtn_manager.create_bundle(
            source_station=request.get("source_station", "toronto"),
            destination=request.get("destination", "ISS"),
            payload=request.get("payload", ""),
            priority=request.get("priority", "NORMAL"),
            ttl_hours=request.get("ttl_hours", 24)
        )
        return {"success": True, "bundle": bundle.to_dict()}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)