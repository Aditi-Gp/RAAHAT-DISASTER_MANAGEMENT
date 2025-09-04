export interface DisasterData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  fillKey: 'HIGH_IMPACT' | 'MEDIUM_IMPACT' | 'LOW_IMPACT';
  sosCount: number;
  type: string;
  dateOccurred: string;
  affectedPopulation: number;
}

export const disasterData: DisasterData[] = [
  {
    id: 1,
    name: 'Mumbai Flood',
    latitude: 19.0760,
    longitude: 72.8777,
    radius: 25,
    fillKey: 'HIGH_IMPACT',
    sosCount: 152,
    type: 'Flood',
    dateOccurred: '2024-01-15',
    affectedPopulation: 50000
  },
  {
    id: 2,
    name: 'Kerala Flood',
    latitude: 9.9312,
    longitude: 76.2673,
    radius: 15,
    fillKey: 'MEDIUM_IMPACT',
    sosCount: 78,
    type: 'Flood',
    dateOccurred: '2024-01-10',
    affectedPopulation: 25000
  },
  {
    id: 3,
    name: 'Delhi Air Quality Crisis',
    latitude: 28.6139,
    longitude: 77.2090,
    radius: 18,
    fillKey: 'HIGH_IMPACT',
    sosCount: 45,
    type: 'Air Pollution',
    dateOccurred: '2024-01-20',
    affectedPopulation: 80000
  },
  {
    id: 4,
    name: 'Bangalore Drought',
    latitude: 12.9716,
    longitude: 77.5946,
    radius: 12,
    fillKey: 'MEDIUM_IMPACT',
    sosCount: 23,
    type: 'Drought',
    dateOccurred: '2024-01-05',
    affectedPopulation: 15000
  },
  {
    id: 5,
    name: 'Chennai Cyclone',
    latitude: 13.0827,
    longitude: 80.2707,
    radius: 20,
    fillKey: 'LOW_IMPACT',
    sosCount: 12,
    type: 'Cyclone',
    dateOccurred: '2024-01-08',
    affectedPopulation: 8000
  }
];