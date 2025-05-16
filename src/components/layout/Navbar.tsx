import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import Avatar from '../ui/Avatar';
import Dropdown, { DropdownItem, DropdownDivider } from '../ui/Dropdown';
import Badge from '../ui/Badge';

interface NavbarProps {
  toggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  toggleSidebar, 
  showSidebarToggle = false 
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed z-30 w-full">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {showSidebarToggle && (
            <button
              onClick={toggleSidebar}
              className="text-gray-500 focus:outline-none mr-2"
            >
              <Menu size={24} />
            </button>
          )}
          <Link to="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap">
              TaskFlow
            </span>
          </Link>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                      Notifications
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 text-sm text-center">
                        <Link
                          to="/notifications"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => setShowNotifications(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Dropdown
              trigger={
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Avatar
                    src={user.photoURL}
                    name={user.name}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-gray-700 hidden md:inline-block">
                    {user.name}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>
              }
              align="right"
              width="sm"
            >
              <DropdownItem onClick={() => navigate('/profile')}>
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  Profile
                </div>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={handleSignOut}>
                <div className="flex items-center text-red-600">
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </div>
              </DropdownItem>
            </Dropdown>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;