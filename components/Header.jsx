"use client";
import React from "react";
import { Globe, ChevronRight, Menu, X, LogIn } from "lucide-react";

// Enhanced Button component
const Button = ({ children, size = "md", variant = "default", className = "", ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  
  const variantClasses = {
    default: "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 hover:shadow-lg hover:shadow-amber-500/25 transform hover:-translate-y-1",
    outline: "border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black hover:shadow-lg hover:shadow-amber-500/25 transform hover:-translate-y-1",
    ghost: "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
  };
  
  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Header = ({ currentPath = "/" }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items with conditional highlighting
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      // Handle anchor links
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Handle page navigation - you would implement your routing logic here
      console.log(`Navigate to: ${href}`);
      // Example: router.push(href) for Next.js
      // or window.location.href = href for basic navigation
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/80 backdrop-blur-md border-b border-amber-500/20' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => handleNavClick('/')}
          >
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <Globe className="w-8 h-8 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">GlobeTrotter</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={`transition-colors duration-200 font-medium ${
                  currentPath === item.href 
                    ? 'text-amber-400' 
                    : 'text-gray-300 hover:text-amber-400'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              className="text-gray-300 hover:text-amber-400 transition-colors duration-200 flex items-center space-x-2"
              onClick={() => handleNavClick('/login')}
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
            <Button 
              size="md" 
              className="group"
              onClick={() => handleNavClick('/signup')}
            >
              Get Started
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-amber-400 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-amber-500/20">
            <div className="px-5 py-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={`block w-full text-left transition-colors duration-200 font-medium ${
                    currentPath === item.href 
                      ? 'text-amber-400' 
                      : 'text-gray-300 hover:text-amber-400'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4 border-t border-amber-500/20 space-y-3">
                <button 
                  className="w-full text-left text-gray-300 hover:text-amber-400 transition-colors duration-200 flex items-center space-x-2"
                  onClick={() => handleNavClick('/login')}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <Button 
                  size="md" 
                  className="w-full justify-center"
                  onClick={() => handleNavClick('/signup')}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;