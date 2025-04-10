
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Users, CreditCard, User, Menu, X } from 'lucide-react';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (!user) return null;

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: <Home className="mr-2 h-4 w-4" /> },
    { path: '/properties', label: 'Propriétés', icon: <Home className="mr-2 h-4 w-4" /> },
    { path: '/roommates', label: 'Colocataires', icon: <Users className="mr-2 h-4 w-4" /> },
    { path: '/transactions', label: 'Transactions', icon: <CreditCard className="mr-2 h-4 w-4" /> },
    { path: '/profile', label: 'Profil', icon: <User className="mr-2 h-4 w-4" /> },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-primary">CoRent</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? 'border-primary text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button
              onClick={() => signOut()}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              Déconnexion
            </Button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } block pl-3 pr-4 py-2 border-l-4 ${
                location.pathname === item.path ? 'border-primary' : 'border-transparent'
              } text-base font-medium`}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                {item.icon}
                {item.label}
              </div>
            </Link>
          ))}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <Button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              variant="ghost"
              className="w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
