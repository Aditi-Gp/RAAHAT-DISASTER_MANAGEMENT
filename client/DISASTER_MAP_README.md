# Disaster Map Implementation

This implementation provides a fully functional and interactive disaster map for the Raahat application using datamaps.github.io with a focus on India.

## Features

### ✅ Fixed Issues

-   **Module Definition**: Properly imported d3 and topojson-client as npm packages instead of relying on global scripts
-   **D3.js Integration**: Correctly imported and configured d3.js v7+ with proper TypeScript support
-   **India-focused Map**: Uses India-specific TopoJSON data with proper projection and centering
-   **Responsive Design**: Map automatically resizes with container and window changes

### 🗺️ Map Features

-   **Interactive Bubbles**: Hover-enabled bubbles showing disaster information
-   **Severity Colors**:
    -   Critical: Red (#E53E3E)
    -   High: Orange (#ED8936)
    -   Medium: Yellow (#ECC94B)
    -   Low: Green (#48BB78)
-   **Popups**: Rich popup templates with disaster details and SOS counts
-   **Responsive Layout**: Adapts to different screen sizes

## File Structure

```
src/
├── components/
│   └── DisasterMap.tsx          # Main map component
├── data/
│   └── mapData.ts              # Bubble data and interfaces
├── pages/
│   ├── DisasterMapPage.tsx     # Updated page with new map
│   └── DashboardExample.tsx    # Example integration
└── types/
    └── datamaps.d.ts          # TypeScript declarations
```

## Dependencies Added

```json
{
    "dependencies": {
        "d3": "^7.x.x",
        "topojson-client": "^3.x.x",
        "datamaps": "^0.5.x"
    },
    "devDependencies": {
        "@types/d3": "^7.x.x",
        "@types/topojson-client": "^3.x.x"
    }
}
```

## Usage

### Basic Usage

```tsx
import DisasterMap from "@/components/DisasterMap";
import { disasterBubbles } from "@/data/mapData";

function Dashboard() {
    return (
        <div className="w-full h-[600px]">
            <DisasterMap bubbles={disasterBubbles} />
        </div>
    );
}
```

### Custom Bubble Data

```tsx
const customBubbles: BubbleData[] = [
    {
        name: "Custom Event",
        severity: "High",
        latitude: 28.6139,
        longitude: 77.209,
        radius: 12,
        sosCount: 150,
    },
];

<DisasterMap bubbles={customBubbles} />;
```

## Data Interface

```typescript
interface BubbleData {
    name: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    latitude: number;
    longitude: number;
    radius: number;
    sosCount: number;
}
```

## Technical Implementation

### Key Components

1. **DisasterMap Component**:

    - Uses React hooks (useEffect, useRef) for proper DOM integration
    - Handles Datamap initialization after component mounting
    - Manages responsive behavior and cleanup

2. **Map Configuration**:

    - India-specific projection using d3.geoMercator
    - Custom TopoJSON data for accurate India boundaries
    - Proper scaling and centering for optimal view

3. **Bubble Integration**:
    - Dynamic bubble rendering based on severity
    - Interactive popups with formatted data
    - Color-coded severity indicators

### Error Prevention

-   **DOM Ready Check**: Ensures DOM element exists before map initialization
-   **Script Loading**: Proper async script loading with promises
-   **Global Variable Management**: Safe handling of d3 and topojson globals
-   **TypeScript Support**: Custom type declarations for external libraries

## Performance Considerations

-   **Lazy Loading**: Scripts are loaded only when component mounts
-   **Memory Management**: Proper cleanup of event listeners
-   **Responsive Handling**: Efficient resize event management

## Browser Compatibility

-   Modern browsers with ES2020 support
-   SVG rendering capability required
-   Responsive design works on mobile and desktop

## Future Enhancements

-   Real-time data integration via WebSocket
-   Custom map layers and overlays
-   Advanced filtering and search capabilities
-   Animation support for dynamic updates
-   Clustering for high-density areas
