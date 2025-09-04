import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Users, Activity } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Emergency Response at
            <span className="text-red-600"> Lightning Speed</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Raahat connects disaster victims, volunteers, and emergency services in real-time, 
            ensuring rapid response and coordinated relief efforts when every second counts.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Disaster Management
            </h2>
            <p className="text-lg text-gray-600">
              Our platform provides end-to-end solutions for disaster preparedness and response
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Real-time SOS</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Instant emergency alerts with GPS location tracking for immediate response coordination
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-colors">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Volunteer Network</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Verified volunteer network with skill-based matching for efficient disaster response
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center">
                <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Live Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interactive disaster heat maps with real-time updates and impact assessment
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Multi-level Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Role-based dashboards for users, volunteers, admins, and government departments
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-red-600 mb-2">24/7</h3>
              <p className="text-lg text-gray-600">Emergency Response</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-orange-600 mb-2">1000+</h3>
              <p className="text-lg text-gray-600">Verified Volunteers</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">98%</h3>
              <p className="text-lg text-gray-600">Response Success Rate</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};