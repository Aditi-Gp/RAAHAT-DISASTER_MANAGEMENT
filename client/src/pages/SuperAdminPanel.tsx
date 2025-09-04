import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { users } from '@/data/users';
import { Settings, Shield, CheckCircle, Clock } from 'lucide-react';

export const SuperAdminPanel = () => {
  const { toast } = useToast();

  const admins = users.filter(user => user.role === 'ADMIN');
  const verifiedAdmins = admins.filter(admin => admin.isVerified);
  const pendingAdmins = admins.filter(admin => !admin.isVerified);

  const handleVerifyAdmin = (_adminId: number) => {
    toast({
      title: "Admin Verified",
      description: "Admin account has been successfully verified and activated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
          <p className="text-gray-600">Manage admin accounts and system-wide settings</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Total Admins</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{admins.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Verified</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedAdmins.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>Pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingAdmins.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((verifiedAdmins.length / admins.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Account Management</CardTitle>
          <CardDescription>
            Review and manage administrator accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.fullName}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.phone}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={admin.isVerified ? "secondary" : "destructive"}
                      className={admin.isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {admin.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.isVerified ? (
                      <Button variant="outline" size="sm" disabled>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleVerifyAdmin(admin.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Verify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-medium">{users.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Volunteers</span>
                <span className="font-medium">
                  {users.filter(u => u.role === 'VOLUNTEER' && u.isVerified).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Department Users</span>
                <span className="font-medium">
                  {users.filter(u => u.role === 'DEPARTMENT').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Super Admins</span>
                <span className="font-medium">
                  {users.filter(u => u.role === 'SUPER_ADMIN').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Admin verified</p>
                <p className="text-gray-600">Rohan Mehta was verified 2 hours ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">New volunteer registered</p>
                <p className="text-gray-600">Neha Reddy submitted application 4 hours ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">System maintenance</p>
                <p className="text-gray-600">Scheduled maintenance completed 6 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};