import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

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
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`font-medium hover:text-blue-500 transition-colors ${
              location.pathname === '/' ? 'text-blue-600' : ''
            }`}
          >
            Home
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
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
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

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 py-4 px-4 text-gray-800">
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
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;