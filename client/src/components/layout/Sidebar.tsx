import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Map,
  BarChart3,
  LogOut,
  Shield,
  Settings,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar as AcernitySidebar, SidebarBody, SidebarLink } from '@/components/ui/Sidebar';
import { motion } from 'motion/react';
import { useState } from 'react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  // const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    {
      label: 'Disaster Map',
      href: '/dashboard',
      icon: <Map className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      roles: ['USER', 'VOLUNTEER', 'ADMIN', 'DEPARTMENT', 'SUPER_ADMIN']
    },
    {
      label: 'Insights',
      href: '/dashboard/insights',
      icon: <BarChart3 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      roles: ['USER', 'VOLUNTEER', 'ADMIN', 'DEPARTMENT', 'SUPER_ADMIN']
    },
    {
      label: 'My Profile',
      href: '/dashboard/profile',
      icon: <User className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      roles: ['USER', 'VOLUNTEER', 'ADMIN', 'DEPARTMENT', 'SUPER_ADMIN']
    },
    {
      label: 'Manage Admins',
      href: '/dashboard/manage-admins',
      icon: <Settings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      roles: ['SUPER_ADMIN']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  const Logo = () => {
    return (
      <Link
        to="/dashboard"
        className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
      >
        <Shield className="h-6 w-6 shrink-0 text-red-500" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-bold text-xl whitespace-pre text-black dark:text-white"
        >
          Raahat
        </motion.span>
      </Link>
    );
  };

  const LogoIcon = () => {
    return (
      <Link
        to="/dashboard"
        className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
      >
        <Shield className="h-6 w-6 shrink-0 text-red-500" />
      </Link>
    );
  };

  const UserProfile = () => {
    return (
      <div className="flex flex-col gap-2">
        <SidebarLink
          link={{
            label: user.fullName,
            href: "/dashboard/profile",
            icon: (
              <div className="h-7 w-7 shrink-0 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-semibold">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            ),
          }}
        />
        <motion.div
          animate={{
            display: open ? "block" : "none",
            opacity: open ? 1 : 0,
          }}
          className="text-xs text-red-400 capitalize px-2"
        >
          {user.role.toLowerCase()}
        </motion.div>
        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-100 dark:text-neutral-200 hover:text-white hover:bg-neutral-800 dark:hover:bg-neutral-700"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3 shrink-0" />
          <motion.span
            animate={{
              display: open ? "inline-block" : "none",
              opacity: open ? 1 : 0,
            }}
            className="whitespace-pre"
          >
            Logout
          </motion.span>
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <AcernitySidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {filteredMenuItems.map((item, idx) => (
                <SidebarLink key={idx} link={item} />
              ))}
            </div>
          </div>
          <div>
            <UserProfile />
          </div>
        </SidebarBody>
      </AcernitySidebar>
    </div>
  );
};