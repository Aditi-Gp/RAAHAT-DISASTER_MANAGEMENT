// /src/data/mapData.ts

export interface BubbleData {
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  latitude: number;
  longitude: number;
  radius: number;
  sosCount: number;
}

export const disasterBubbles: BubbleData[] = [
  {
    name: 'Mumbai Floods',
    severity: 'Critical',
    latitude: 19.0760,
    longitude: 72.8777,
    radius: 15,
    sosCount: 245,
  },
  {
    name: 'Chennai Cyclonic Rain',
    severity: 'High',
    latitude: 13.0827,
    longitude: 80.2707,
    radius: 12,
    sosCount: 180,
  },
  {
    name: 'Bengaluru Urban Flood',
    severity: 'Medium',
    latitude: 12.9716,
    longitude: 77.5946,
    radius: 10,
    sosCount: 95,
  },
  {
    name: 'Jaipur Localized Event',
    severity: 'Low',
    latitude: 26.9124,
    longitude: 75.7873,
    radius: 8,
    sosCount: 40,
  },
];
