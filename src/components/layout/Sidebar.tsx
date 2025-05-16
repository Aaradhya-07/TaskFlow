import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Settings, 
  Users, 
  Bell
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: <Briefcase size={20} />,
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: <CheckSquare size={20} />,
    },
    {
      name: 'Team',
      path: '/team',
      icon: <Users size={20} />,
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: <Bell size={20} />,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings size={20} />,
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <h1 className={`text-xl font-bold ${!isOpen && 'hidden'}`}>TaskFlow</h1>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {isOpen && item.name}
            </NavLink>
          ))}
        </nav>

        {isOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Need help?
              </h3>
              <p className="text-xs text-blue-700">
                Check our documentation or contact support for assistance.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;