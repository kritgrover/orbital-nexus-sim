export interface GroundStation {
  id: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  color: string;
  isActive: boolean;
  elevation: number;
  nextPassTime: string;
}

export const DEFAULT_STATIONS: GroundStation[] = [
  {
    id: 'toronto',
    name: 'Toronto',
    location: 'Canada',
    lat: 43.6532,
    lon: -79.3832,
    color: '#4ade80',
    isActive: true,
    elevation: 0,
    nextPassTime: '--:--',
  },
  {
    id: 'london',
    name: 'London',
    location: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    color: '#3b82f6',
    isActive: false,
    elevation: 0,
    nextPassTime: '--:--',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    location: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    color: '#f59e0b',
    isActive: false,
    elevation: 0,
    nextPassTime: '--:--',
  },
  {
    id: 'sydney',
    name: 'Sydney',
    location: 'Australia',
    lat: -33.8688,
    lon: 151.2093,
    color: '#ec4899',
    isActive: false,
    elevation: 0,
    nextPassTime: '--:--',
  },
  {
    id: 'newyork',
    name: 'New York',
    location: 'USA',
    lat: 40.7128,
    lon: -74.0060,
    color: '#8b5cf6',
    isActive: false,
    elevation: 0,
    nextPassTime: '--:--',
  },
  {
    id: 'singapore',
    name: 'Singapore',
    location: 'Singapore',
    lat: 1.3521,
    lon: 103.8198,
    color: '#06b6d4',
    isActive: false,
    elevation: 0,
    nextPassTime: '--:--',
  },
];