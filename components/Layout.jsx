"use client";
import React from "react";
import Header from "./Header";
import { Globe } from "lucide-react";

const FloatingParticles = () => {
  const [particles, setParticles] = React.useState([]);

  React.useEffect(() => {
    // Generate random particles ONLY on client
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      width: Math.random() * 4 + 1,
      height: Math.random() * 4 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      opacity: Math.random() * 0.5 + 0.2,
      colorClass:
        i % 3 === 0
          ? "bg-amber-400"
          : i % 3 === 1
          ? "bg-orange-400"
          : "bg-yellow-400",
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full animate-pulse ${p.colorClass}`}
          style={{
            width: `${p.width}px`,
            height: `${p.height}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

const Footer = () => (
  <footer className="py-12 border-t border-amber-500/20 relative z-10 bg-black/40">
    <div className="container mx-auto px-5 text-center">
      <div className="flex justify-center items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
          <Globe className="w-6 h-6 text-black" />
        </div>
        <span className="text-xl font-bold text-white">GlobeTrotter</span>
      </div>
      <p className="text-gray-400">
        © 2025 GlobeTrotter. Making travel planning magical.
      </p>
    </div>
  </footer>
);

const Layout = ({
  children,
  currentPath = "/",
  showBackground = true,
  showFooter = true,
}) => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {showBackground && (
        <>
          <div className="fixed inset-0 bg-gradient-to-br from-amber-900/10 via-black to-orange-900/10" />
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(251,191,36,0.1),transparent_50%)]" />
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(249,115,22,0.1),transparent_50%)]" />
          <FloatingParticles />
        </>
      )}

      <Header currentPath={currentPath} />

      <main className="relative z-10 pt-20">{children}</main>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
