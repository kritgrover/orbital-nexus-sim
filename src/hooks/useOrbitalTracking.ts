import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_kmps: number;
}

interface OrbitalPathPoint {
  lat: number;
  lon: number;
  alt: number;
}

interface LookAngles {
  azimuth: number;
  elevation: number;
  range_km: number;
  is_visible: boolean;
}

interface StationData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  look_angles: LookAngles;
  is_visible: boolean;
  next_pass_minutes: number;
  next_pass_time: string | null;
}

export interface OrbitalData {
  timestamp: string;
  iss_position: ISSPosition;
  orbital_path: OrbitalPathPoint[];
  stations: StationData[];
  active_station_id: string | null;
  visible_stations_count: number;
  min_elevation: number;
  // Add these optional properties for backward compatibility with GlobeView
  look_angles?: LookAngles;
  is_visible?: boolean;
}

export const useOrbitalTracking = () => {
  const WS_URL = 'ws://localhost:8000/ws/orbital_tracking';
  const { isConnected, lastMessage } = useWebSocket(WS_URL);
  
  const [orbitalData, setOrbitalData] = useState<OrbitalData | null>(null);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'orbital_update') {
        setOrbitalData(lastMessage);
      } else if (lastMessage.type === 'connection') {
        console.log('✅ Orbital tracking connected');
        console.log('📡 Tracking', lastMessage.stations?.length || 0, 'stations');
      }
    }
  }, [lastMessage]);

  return {
    isConnected,
    orbitalData
  };
};