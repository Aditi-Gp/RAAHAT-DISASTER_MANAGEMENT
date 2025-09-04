export interface User {
  id: number;
  email: string;
  password: string;
  fullName: string;
  role: 'USER' | 'VOLUNTEER' | 'ADMIN' | 'DEPARTMENT' | 'SUPER_ADMIN';
  phone?: string;
  isVerified?: boolean;
  governmentIdUrl?: string;
  // New Profile Fields
  address?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  // Volunteer-specific fields
  skills?: string[];
  // Department-specific fields
  teamId?: string;
  contactPerson?: string;
}

export const users: User[] = [
  {
    id: 1,
    email: 'user@test.com',
    password: 'password',
    fullName: 'Aarav Sharma',
    role: 'USER',
    phone: '9876543210',
    address: '123 Main St, Mumbai',
    bloodType: 'O+',
    emergencyContactName: 'Riya Sharma',
    emergencyContactPhone: '9876543211'
  },
  {
    id: 2,
    email: 'volunteer@test.com',
    password: 'password',
    fullName: 'Priya Patel',
    role: 'VOLUNTEER',
    phone: '9876543211',
    isVerified: false,
    governmentIdUrl: 'volunteer-id.pdf',
    address: '456 Park Ave, Pune',
    bloodType: 'A-',
    emergencyContactName: 'Anil Patel',
    emergencyContactPhone: '9123456789',
    skills: ['First Aid Certified', 'Boat Operator']
  },
  {
    id: 3,
    email: 'admin@test.com',
    password: 'password',
    fullName: 'Rohan Mehta',
    role: 'ADMIN',
    phone: '9876543212',
    isVerified: true,
    address: '789 Admin Tower, Delhi',
    bloodType: 'B+',
    emergencyContactName: 'Sunita Mehta',
    emergencyContactPhone: '9876543200'
  },
  {
    id: 4,
    email: 'department@test.com',
    password: 'password',
    fullName: 'Mumbai Fire Dept',
    role: 'DEPARTMENT',
    phone: '9876543213',
    isVerified: true,
    address: '789 Fire Station Rd, Mumbai',
    teamId: 'M-FIRE-01',
    contactPerson: 'Chief Vikram Singh',
    bloodType: 'AB+',
    emergencyContactName: 'Deputy Chief Anita Singh',
    emergencyContactPhone: '9876543299'
  },
  {
    id: 5,
    email: 'superadmin@test.com',
    password: 'password',
    fullName: 'Vikram Gupta',
    role: 'SUPER_ADMIN',
    phone: '9876543214',
    isVerified: true,
    address: '101 Command Center, New Delhi',
    bloodType: 'A+',
    emergencyContactName: 'Kavita Gupta',
    emergencyContactPhone: '9876543201'
  },
  {
    id: 6,
    email: 'volunteer2@test.com',
    password: 'password',
    fullName: 'Neha Reddy',
    role: 'VOLUNTEER',
    phone: '9876543215',
    isVerified: true,
    governmentIdUrl: 'volunteer2-id.pdf',
    address: '321 Green Park, Bangalore',
    bloodType: 'O-',
    emergencyContactName: 'Rajesh Reddy',
    emergencyContactPhone: '9876543202',
    skills: ['Medical Training', 'Search and Rescue']
  },
  {
    id: 7,
    email: 'admin2@test.com',
    password: 'password',
    fullName: 'Arjun Kumar',
    role: 'ADMIN',
    phone: '9876543216',
    isVerified: true,
    address: '654 Central Ave, Chennai',
    bloodType: 'B-',
    emergencyContactName: 'Priya Kumar',
    emergencyContactPhone: '9876543203'
  }
];