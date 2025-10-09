from skyfield.api import load, wgs84, EarthSatellite
from datetime import datetime, timezone
import numpy as np
from typing import Dict, List, Tuple

class OrbitalTracker:
    """Tracks ISS position using SGP4 propagation"""
    
    def __init__(self, tle_lines: Tuple[str, str, str]):
        self.ts = load.timescale()
        
        # Create satellite object from TLE
        name, line1, line2 = tle_lines
        self.satellite = EarthSatellite(line1, line2, name, self.ts)
        
        print(f"🛰️  Initialized tracker for: {name}")
    
    def get_current_position(self) -> Dict:
        """Get current ISS position"""
        t = self.ts.now()
        geocentric = self.satellite.at(t)
        subpoint = wgs84.subpoint(geocentric)
        
        # Get velocity for speed calculation
        position = geocentric.position.km
        velocity = geocentric.velocity.km_per_s
        speed = np.linalg.norm(velocity)
        
        return {
            "latitude": float(subpoint.latitude.degrees),
            "longitude": float(subpoint.longitude.degrees),
            "altitude_km": float(subpoint.elevation.km),
            "velocity_kmps": float(speed)
        }
    
    def get_orbital_path(self, minutes=95, points=100) -> List[Dict]:
        """Generate orbital path points for next N minutes"""
        t_start = self.ts.now()
        
        # Create time array
        times = self.ts.utc(
            t_start.utc_datetime().year,
            t_start.utc_datetime().month,
            t_start.utc_datetime().day,
            t_start.utc_datetime().hour,
            t_start.utc_datetime().minute,
            np.linspace(0, minutes * 60, points)
        )
        
        path = []
        for t in times:
            geocentric = self.satellite.at(t)
            subpoint = wgs84.subpoint(geocentric)
            
            path.append({
                "lat": float(subpoint.latitude.degrees),
                "lon": float(subpoint.longitude.degrees),
                "alt": float(subpoint.elevation.km)
            })
        
        return path
    
    def calculate_look_angles(self, ground_lat: float, ground_lon: float) -> Dict:
        """Calculate azimuth, elevation, and range from ground station"""
        t = self.ts.now()
        
        # Ground station location
        ground_station = wgs84.latlon(ground_lat, ground_lon)
        
        # Calculate difference
        difference = self.satellite - ground_station
        topocentric = difference.at(t)
        
        alt, az, distance = topocentric.altaz()
        
        return {
            "azimuth": float(az.degrees),
            "elevation": float(alt.degrees),
            "range_km": float(distance.km),
            "is_visible": bool(alt.degrees > 0)
        }
    
    def predict_next_pass(self, ground_lat: float, ground_lon: float, 
                         min_elevation: float = 10.0, max_hours: int = 24) -> Dict:
        """Predict next pass over ground station"""
        t_start = self.ts.now()
        ground_station = wgs84.latlon(ground_lat, ground_lon)
        
        # Check next max_hours in 1-minute increments
        for minutes_ahead in range(0, max_hours * 60, 1):
            # Calculate future time
            future_datetime = t_start.utc_datetime()
            total_minutes = future_datetime.minute + minutes_ahead
            hours_to_add = total_minutes // 60
            minutes_remainder = total_minutes % 60
            
            t = self.ts.utc(
                future_datetime.year,
                future_datetime.month,
                future_datetime.day,
                future_datetime.hour + hours_to_add,
                minutes_remainder,
                future_datetime.second
            )
            
            # Calculate satellite position relative to ground station
            difference = self.satellite - ground_station
            topocentric = difference.at(t)
            alt, az, distance = topocentric.altaz()
            
            # If elevation is above threshold, this is the next pass
            if alt.degrees > min_elevation:
                return {
                    "start_time": t.utc_iso(),
                    "minutes_until": int(minutes_ahead),
                    "max_elevation": float(alt.degrees),
                    "azimuth": float(az.degrees)
                }
        
        # No pass found within max_hours
        return {
            "start_time": None,
            "minutes_until": -1,
            "max_elevation": 0.0,
            "azimuth": 0.0
        }
    
    def generate_coverage_cone(self, ground_lat: float, ground_lon: float, 
                               opening_angle: float = 70, segments: int = 32) -> Dict:
        """Generate 3D cone vertices for ground station coverage"""
        
        # Check if ISS is in view
        look_angles = self.calculate_look_angles(ground_lat, ground_lon)
        
        # Cone geometry (simplified for visualization)
        vertices = []
        
        # Apex at ground station
        apex = {"lat": float(ground_lat), "lon": float(ground_lon), "alt": 0.0}
        
        # Generate circle at top of cone
        for i in range(segments):
            angle = (2 * np.pi * i) / segments
            # Simplified: create circle around station
            lat_offset = (opening_angle / 2) * np.cos(angle) / 111  # rough km to degrees
            lon_offset = (opening_angle / 2) * np.sin(angle) / (111 * np.cos(np.radians(ground_lat)))
            
            vertices.append({
                "lat": float(ground_lat + lat_offset),
                "lon": float(ground_lon + lon_offset),
                "alt": 0.0
            })
        
        return {
            "apex": apex,
            "vertices": vertices,
            "opening_angle": float(opening_angle),
            "is_active": bool(look_angles["is_visible"])
        }