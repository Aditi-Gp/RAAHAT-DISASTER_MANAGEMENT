import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bot, MapPin, Clock, Users, Wrench, Route, Navigation } from 'lucide-react';

export const DisasterTeamDashboard = () => {
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);

  // Mock data for active alerts
  const activeAlerts = [
    {
      id: 1,
      priority: 'High',
      message: 'Flood reported in Andheri East. Awaiting dispatch orders.',
      time: '2 mins ago',
      type: 'flood'
    },
    {
      id: 2,
      priority: 'Info',
      message: 'Volunteer check-in point established at Mumbai Central.',
      time: '15 mins ago',
      type: 'info'
    },
    {
      id: 3,
      priority: 'Medium',
      message: 'Traffic congestion reported on Western Express Highway.',
      time: '30 mins ago',
      type: 'traffic'
    }
  ];

  // Mock AI suggestions
  const aiSuggestions = {
    manpower: '50 Personnel (10 Medical, 40 Rescue)',
    equipment: '10 inflatable boats, 200 life jackets, 50 first-aid kits',
    duration: '48-72 Hours',
    estimatedCost: '₹2.5 Lakhs',
    riskLevel: 'High'
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disaster Team Dashboard</h1>
        <p className="text-gray-600">Real-time operations and resource management for disaster response</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle>⚠ Active Alerts</CardTitle>
            </div>
            <CardDescription>
              Real-time notifications and dispatch orders from command center
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getPriorityColor(alert.priority)} variant="outline">
                        {alert.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                    <p className="text-sm text-gray-800">{alert.message}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Resource Suggestions Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <CardTitle>🤖 AI Resource & Manpower Plan</CardTitle>
            </div>
            <CardDescription>
              AI-generated recommendations for current disaster scenario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Manpower Needed</p>
                  <p className="text-sm text-gray-600">{aiSuggestions.manpower}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Wrench className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Equipment Required</p>
                  <p className="text-sm text-gray-600">{aiSuggestions.equipment}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium text-sm">Estimated Duration</p>
                  <p className="text-sm text-gray-600">{aiSuggestions.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="font-medium text-sm">Risk Level</p>
                  <Badge variant="destructive" className="text-xs">
                    {aiSuggestions.riskLevel}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route & Logistics Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <CardTitle>🗺 Safest Route to Staging Area</CardTitle>
            </div>
            <CardDescription>
              Optimized routing avoiding danger zones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    <Route className="h-4 w-4 mr-2" />
                    View Recommended Route
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Navigation className="h-5 w-5" />
                      <span>Recommended Safe Route</span>
                    </DialogTitle>
                    <DialogDescription>
                      Optimized path to staging area avoiding flood zones and traffic congestion
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Static Map Image Placeholder */}
                    <div className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium">Interactive Route Map</p>
                        <p className="text-sm text-gray-500">Safe path highlighted in green</p>
                        <p className="text-sm text-gray-500">Avoid red zones (flooded areas)</p>
                      </div>
                    </div>
                    
                    {/* Route Instructions */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-800 mb-2">⚠ Important Instructions</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Route is clear of flooding as of last update (5 mins ago)</li>
                        <li>• Caution advised near Western Express Highway due to heavy traffic</li>
                        <li>• Estimated travel time: 25-30 minutes</li>
                        <li>• Alternative route available via Eastern Freeway (+10 mins)</li>
                      </ul>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button className="flex-1">
                        <Navigation className="h-4 w-4 mr-2" />
                        Start Navigation
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Download Route
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Current Status:</strong> Route is clear of flooding. Caution advised near the Western Express Highway due to heavy traffic.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
