"use client";
import React from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, PenBox, Globe, ChevronRight, Menu, X, LogIn } from "lucide-react";
import { Button } from "./ui/button";

const Header = ({ currentPath = "/" }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Community", href: "/community" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleNavClick = (href) => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-b border-amber-500/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <Globe className="w-8 h-8 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">GlobeTrotter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors duration-200 font-medium ${
                  currentPath === item.href
                    ? "text-amber-400"
                    : "text-gray-300 hover:text-amber-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/create-trip">
              <Button className="flex items-center gap-2">
                <PenBox size={18} />
                <span className="hidden md:inline">Create Trip</span>
              </Button>
            </Link>

            <SignedOut>
              <SignInButton forceRedirectUrl="/onboarding">
                <Button variant="outline" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: { avatarBox: "w-10 h-10" },
                }}
              />
            </SignedIn>
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
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full text-left transition-colors duration-200 font-medium ${
                    currentPath === item.href
                      ? "text-amber-400"
                      : "text-gray-300 hover:text-amber-400"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-amber-500/20 space-y-3">
                <SignedOut>
                  <SignInButton forceRedirectUrl="/onboarding">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" /> Login
                    </Button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={18} /> Dashboard
                    </Button>
                  </Link>
                </SignedIn>

                <Link href="/create-trip">
                  <Button className="w-full justify-center gap-2">
                    <PenBox size={18} /> Create Trip
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
