"use client";
import React from "react";
import Header from "./Header";
import { Globe } from "lucide-react";

// Enhanced floating particles for consistent background
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className={`absolute rounded-full animate-pulse ${
          i % 3 === 0 ? 'bg-amber-400' : i % 3 === 1 ? 'bg-orange-400' : 'bg-yellow-400'
        }`}
        style={{
          width: `${Math.random() * 4 + 1}px`,
          height: `${Math.random() * 4 + 1}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
          opacity: Math.random() * 0.5 + 0.2,
        }}
      />
    ))}
  </div>
);

// Footer component
const Footer = () => (
  <footer className="py-12 border-t border-amber-500/20 relative z-10 bg-black/40">
    <div className="container mx-auto px-5 text-center">
      <div className="flex justify-center items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
          <Globe className="w-6 h-6 text-black" />
        </div>
        <span className="text-xl font-bold text-white">GlobeTrotter</span>
      </div>
      <p className="text-gray-400">© 2025 GlobeTrotter. Making travel planning magical.</p>
    </div>
  </footer>
);

const Layout = ({ children, currentPath = "/", showBackground = true, showFooter = true }) => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced background effects - can be toggled */}
      {showBackground && (
        <>
          <div className="fixed inset-0 bg-gradient-to-br from-amber-900/10 via-black to-orange-900/10" />
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(251,191,36,0.1),transparent_50%)]" />
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(249,115,22,0.1),transparent_50%)]" />
          <FloatingParticles />
        </>
      )}
      
      {/* Header - always present */}
      <Header currentPath={currentPath} />
      
      {/* Main content with proper spacing for fixed header */}
      <main className="relative z-10 pt-20">
        {children}
      </main>
      
      {/* Footer - can be toggled */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;