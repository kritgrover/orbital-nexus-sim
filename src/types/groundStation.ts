export interface GroundStation {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
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
    latitude: 43.65,
    longitude: -79.38,
    color: '#4ade80',
    isActive: true,
    elevation: 42.3,
    nextPassTime: '00:00:00'
  },
  {
    id: 'newyork',
    name: 'New York',
    location: 'USA',
    latitude: 40.71,
    longitude: -74.00,
    color: '#3b82f6',
    isActive: false,
    elevation: 8.2,
    nextPassTime: '00:45:12'
  },
  {
    id: 'london',
    name: 'London',
    location: 'UK',
    latitude: 51.51,
    longitude: -0.13,
    color: '#a855f7',
    isActive: false,
    elevation: -12.5,
    nextPassTime: '01:27:34'
  }
];
