// Free alternative to Google Maps Directions API using OpenRouteService
// Sign up at https://openrouteservice.org/ for free API key (2000 requests/day)

interface RoutePoint {
  lat: number;
  lng: number;
}

interface OpenRouteResponse {
  features: Array<{
    properties: {
      segments: Array<{
        distance: number; // in meters
        duration: number; // in seconds
      }>;
      summary: {
        distance: number; // in meters
        duration: number; // in seconds
      };
    };
    geometry: {
      coordinates: number[][]; // [lng, lat] format
    };
  }>;
}

export class OpenRouteService {
  private apiKey: string;
  private baseUrl = 'https://api.openrouteservice.org/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getRoute(origin: RoutePoint, destination: RoutePoint): Promise<{
    distance: number;
    duration: number;
    path: RoutePoint[];
  } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/directions/driving-car`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coordinates: [
              [origin.lng, origin.lat], // OpenRouteService uses [lng, lat]
              [destination.lng, destination.lat]
            ],
            format: 'geojson',
            instructions: false
          })
        }
      );

      if (!response.ok) {
        throw new Error(`OpenRouteService error: ${response.status}`);
      }

      const data: OpenRouteResponse = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const summary = feature.properties.summary;
        
        // Convert coordinates from [lng, lat] to [lat, lng]
        const path = feature.geometry.coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));

        return {
          distance: summary.distance, // meters
          duration: summary.duration, // seconds
          path: path
        };
      }

      return null;
    } catch (error) {
      console.error('OpenRouteService error:', error);
      return null;
    }
  }

  async findNearestShelter(
    origin: RoutePoint, 
    shelters: Array<RoutePoint & { id: string; name: string; capacity: number }>
  ): Promise<{
    shelter: RoutePoint & { id: string; name: string; capacity: number };
    distance: number;
    duration: number;
    path: RoutePoint[];
  } | null> {
    let nearestRoute: any = null;
    let shortestDistance = Infinity;

    for (const shelter of shelters) {
      const route = await this.getRoute(origin, shelter);
      
      if (route && route.distance < shortestDistance) {
        shortestDistance = route.distance;
        nearestRoute = {
          shelter,
          distance: route.distance,
          duration: route.duration,
          path: route.path
        };
      }
    }

    return nearestRoute;
  }
}

// Usage example:
// const ors = new OpenRouteService('your-openrouteservice-api-key');
// const route = await ors.getRoute(
//   { lat: 28.6139, lng: 77.2090 }, // Delhi
//   { lat: 19.0760, lng: 72.8777 }  // Mumbai
// );
