export interface SOSAlert {
  id: number;
  text: string;
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  createdBy: number;
  assignedTo?: number;
  createdAt: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const sosAlerts: SOSAlert[] = [
  {
    id: 101,
    text: 'Trapped on the second floor, water is rising rapidly!',
    status: 'NEW',
    urgency: 'Critical',
    location: 'Bandra, Mumbai',
    createdBy: 1,
    createdAt: '2024-01-15T10:30:00Z',
    coordinates: { lat: 19.0596, lng: 72.8295 }
  },
  {
    id: 102,
    text: 'Need food and water for 5 people, including 2 children.',
    status: 'ASSIGNED',
    urgency: 'High',
    location: 'Kochi, Kerala',
    createdBy: 1,
    assignedTo: 2,
    createdAt: '2024-01-14T14:20:00Z',
    coordinates: { lat: 9.9312, lng: 76.2673 }
  },
  {
    id: 103,
    text: 'Elderly person needs medical assistance urgently.',
    status: 'IN_PROGRESS',
    urgency: 'Critical',
    location: 'Thiruvananthapuram, Kerala',
    createdBy: 1,
    assignedTo: 6,
    createdAt: '2024-01-13T16:45:00Z',
    coordinates: { lat: 8.5241, lng: 76.9366 }
  },
  {
    id: 104,
    text: 'Road blocked by fallen tree, need evacuation.',
    status: 'NEW',
    urgency: 'Medium',
    location: 'Powai, Mumbai',
    createdBy: 1,
    createdAt: '2024-01-15T08:15:00Z',
    coordinates: { lat: 19.1176, lng: 72.9060 }
  },
  {
    id: 105,
    text: 'Running out of drinking water supplies.',
    status: 'NEW',
    urgency: 'High',
    location: 'Alappuzha, Kerala',
    createdBy: 1,
    createdAt: '2024-01-14T12:30:00Z',
    coordinates: { lat: 9.4981, lng: 76.3388 }
  }
];