// Example integration in main dashboard
// /src/pages/DashboardExample.tsx

import DisasterMap from '../components/DisasterMap';
import { disasterBubbles } from '../data/mapData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardExample = () => {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Disaster Management Dashboard</h1>
        <p className="text-gray-600">Interactive disaster monitoring and emergency response system</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>India Disaster Heat Map</CardTitle>
          <CardDescription>
            Real-time interactive map showing active disasters and their severity levels across India
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DisasterMap />
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span>Low</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Disasters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{disasterBubbles.length}</div>
            <p className="text-xs text-gray-600">Currently monitored</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total SOS Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {disasterBubbles.reduce((sum, bubble) => sum + bubble.sosCount, 0)}
            </div>
            <p className="text-xs text-gray-600">Across all disasters</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {disasterBubbles.filter(b => b.severity === 'Critical').length}
            </div>
            <p className="text-xs text-gray-600">Requiring immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {disasterBubbles.filter(b => b.severity === 'High').length}
            </div>
            <p className="text-xs text-gray-600">High severity events</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardExample;
