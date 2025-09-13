import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import DashboardIcon from '../ui/DashboardIcon';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  
  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  };
  
  // Get user's initials for the avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled || location.pathname !== '/' 
          ? 'bg-white shadow-md text-gray-800' 
          : 'bg-transparent text-white'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <TrendingUp 
            size={28} 
            className={isScrolled || location.pathname !== '/' ? 'text-blue-600' : 'text-white'}
          />
          <span className="font-bold text-xl">InvestSmart</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <nav className="flex items-center gap-8">
            <Link 
              to="/" 
              className={`font-medium hover:text-blue-500 transition-colors ${
                location.pathname === '/' ? 'text-blue-600' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`font-medium hover:text-blue-500 transition-colors flex items-center gap-1 ${
                location.pathname === '/dashboard' ? 'text-blue-600' : ''
              }`}
            >
              <DashboardIcon size={18} color={location.pathname === '/dashboard' ? '#2563EB' : 'currentColor'} />
              Dashboard
            </Link>
            <Link 
              to="/calculator" 
              className={`font-medium hover:text-blue-500 transition-colors ${
                location.pathname === '/calculator' ? 'text-blue-600' : ''
              }`}
            >
              Calculator
            </Link>
            <Link 
              to="/strategies" 
              className={`font-medium hover:text-blue-500 transition-colors ${
                location.pathname === '/strategies' ? 'text-blue-600' : ''
              }`}
            >
              Strategies
            </Link>
            <Link 
              to="/news" 
              className={`font-medium hover:text-blue-500 transition-colors ${
                location.pathname === '/news' ? 'text-blue-600' : ''
              }`}
            >
              News
            </Link>
            <Link 
              to="/stocks" 
              className={`font-medium hover:text-blue-500 transition-colors ${
                location.pathname === '/stocks' ? 'text-blue-600' : ''
              }`}
            >
              Stocks
            </Link>
          </nav>
          
          {isAuthenticated ? (
            <div className="ml-8 relative profile-menu-container">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <ChevronDown size={16} className={isProfileMenuOpen ? "transform rotate-180" : ""} />
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                  </div>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <DashboardIcon size={16} />
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-8 flex gap-3">
              <Link 
                to="/login"
                className="font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-md transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button and User Icon */}
        <div className="flex items-center gap-4 md:hidden">
          {isAuthenticated && (
            <div className="relative profile-menu-container">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                  </div>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <DashboardIcon size={16} />
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button 
            className=""
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 py-4 px-4 text-gray-800 z-40">
          <nav className="flex flex-col gap-4">
            <Link 
              to="/" 
              onClick={closeMenu}
              className={`font-medium hover:text-blue-500 py-2 transition-colors ${
                location.pathname === '/' ? 'text-blue-600' : ''
              }`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                to="/dashboard" 
                onClick={closeMenu}
                className={`font-medium hover:text-blue-500 py-2 transition-colors flex items-center gap-2 ${
                  location.pathname === '/dashboard' ? 'text-blue-600' : ''
                }`}
              >
                <DashboardIcon size={18} color={location.pathname === '/dashboard' ? '#2563EB' : 'currentColor'} />
                Dashboard
              </Link>
            )}
            <Link 
              to="/calculator" 
              onClick={closeMenu}
              className={`font-medium hover:text-blue-500 py-2 transition-colors ${
                location.pathname === '/calculator' ? 'text-blue-600' : ''
              }`}
            >
              Calculator
            </Link>
            <Link 
              to="/strategies" 
              onClick={closeMenu}
              className={`font-medium hover:text-blue-500 py-2 transition-colors ${
                location.pathname === '/strategies' ? 'text-blue-600' : ''
              }`}
            >
              Strategies
            </Link>
            <Link 
              to="/news" 
              onClick={closeMenu}
              className={`font-medium hover:text-blue-500 py-2 transition-colors ${
                location.pathname === '/news' ? 'text-blue-600' : ''
              }`}
            >
              News
            </Link>
            <Link 
              to="/stocks" 
              onClick={closeMenu}
              className={`font-medium hover:text-blue-500 py-2 transition-colors ${
                location.pathname === '/stocks' ? 'text-blue-600' : ''
              }`}
            >
              Stocks
            </Link>
            
            {!isAuthenticated ? (
              <div className="flex flex-col gap-3 mt-2">
                <Link 
                  to="/login" 
                  onClick={closeMenu}
                  className="font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-center"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={closeMenu}
                  className="font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors text-center"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-2 py-2 mb-3">
                  <p className="font-medium text-gray-800">{user?.name || "User"}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email || ""}</p>
                </div>
                <button 
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="w-full flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;