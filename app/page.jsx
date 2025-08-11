"use client";
import React from "react";
import { 
  Map, Calendar, Users, ChevronRight, ArrowRight, Sparkles, Globe, Star, 
  Menu, X, User, LogIn, Settings, Heart, Shield, Zap 
} from "lucide-react";

const faqs = [
  {
    question: "What is GlobeTrotter?",
    answer:
      "GlobeTrotter is your all-in-one travel planning platform. From crafting personalized itineraries to managing bookings and collaborating with friends, we make your travel dreams a reality.",
  },
  {
    question: "Can I plan trips with friends?",
    answer:
      "Absolutely! Invite friends to your trip, collaborate on destinations, share budgets, and finalize plans together in real-time.",
  },
  {
    question: "Does GlobeTrotter work for solo travelers?",
    answer:
      "Yes! Whether you're going solo or in a group, GlobeTrotter tailors the planning experience to your needs.",
  },
  {
    question: "Can I track my expenses?",
    answer:
      "Yes, our built-in budget tracker helps you keep an eye on expenses so you can enjoy your trip without financial stress.",
  },
  {
    question: "Is GlobeTrotter free to use?",
    answer:
      "We offer a free version with core features. Upgrade to unlock advanced tools like AI-powered trip suggestions and premium destination guides.",
  },
];

const features = [
  {
    title: "AI-Powered Recommendations",
    description: "Get personalized destination suggestions based on your preferences, budget, and travel style.",
    icon: Zap,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    title: "Smart Itinerary Builder",
    description: "Create detailed day-by-day plans with our intuitive drag-and-drop interface and real-time optimization.",
    icon: Calendar,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "Collaborative Planning",
    description: "Invite friends and family to contribute to your trip planning with real-time synchronization.",
    icon: Users,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    title: "Interactive Maps",
    description: "Visualize your journey with detailed maps, local attractions, and hidden gems curated by locals.",
    icon: Map,
    gradient: "from-orange-500 to-red-500"
  },
  {
    title: "Budget Tracking",
    description: "Keep your expenses in check with smart budget alerts and spending insights across categories.",
    icon: Shield,
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    title: "Local Experiences",
    description: "Discover authentic local experiences and activities recommended by fellow travelers.",
    icon: Heart,
    gradient: "from-pink-500 to-rose-500"
  }
];

// Enhanced floating particles with different colors
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

// Enhanced Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/80 backdrop-blur-md border-b border-amber-500/20' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <Globe className="w-8 h-8 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">GlobeTrotter</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-amber-400 transition-colors duration-200 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-300 hover:text-amber-400 transition-colors duration-200 flex items-center space-x-2">
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
            <Button size="md" className="group">
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
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-gray-300 hover:text-amber-400 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-amber-500/20 space-y-3">
                <button className="w-full text-left text-gray-300 hover:text-amber-400 transition-colors duration-200 flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <Button size="md" className="w-full justify-center">
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

// Enhanced Card components
const Card = ({ children, className = "", ...props }) => (
  <div 
    className={`bg-gray-900/50 border border-amber-500/20 rounded-2xl backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "", ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

// Accordion components (unchanged functionality)
const Accordion = ({ children, ...props }) => (
  <div className="space-y-4" {...props}>
    {children}
  </div>
);

const AccordionItem = ({ children, ...props }) => (
  <Card className="overflow-hidden">
    {children}
  </Card>
);

const AccordionTrigger = ({ children, onClick, isOpen, ...props }) => (
  <button
    className="flex justify-between items-center w-full p-6 text-left hover:bg-amber-500/5 transition-colors duration-200"
    onClick={onClick}
    {...props}
  >
    <span className="text-lg font-semibold text-white">{children}</span>
    <ChevronRight className={`w-5 h-5 text-amber-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
  </button>
);

const AccordionContent = ({ children, isOpen, ...props }) => (
  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
    <div className="p-6 pt-0 text-gray-300 leading-relaxed">
      {children}
    </div>
  </div>
);

// Enhanced Features Section with 3x2 grid
const EnhancedFeatures = () => (
  <div className="container mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-5xl font-bold text-white mb-6">
        Features That Make Travel 
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500"> Extraordinary</span>
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
        Discover the advanced tools and intelligent features that transform your travel planning from overwhelming to effortless
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card key={index} className="group hover:scale-105 transform transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative z-10 text-center">
              <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform duration-500 shadow-lg`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

// Stats Section
const StatsSection = () => (
  <section className="py-20 px-5 relative z-10">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        {[
          { number: "50K+", label: "Happy Travelers" },
          { number: "120+", label: "Countries Covered" },
          { number: "1M+", label: "Trips Planned" },
          { number: "4.9/5", label: "User Rating" }
        ].map((stat, index) => (
          <div key={index} className="group">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2 group-hover:scale-110 transition-transform duration-300">
              {stat.number}
            </div>
            <div className="text-gray-300 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default function Home() {
  const [openFAQ, setOpenFAQ] = React.useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900/10 via-black to-orange-900/10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(251,191,36,0.1),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(249,115,22,0.1),transparent_50%)]" />
      <FloatingParticles />
      
      {/* Header */}
      <Header />
      
      {/* ================= HERO SECTION ================= */}
      <section className="container mx-auto py-32 text-center relative z-10 px-5">
        <div className="relative">
          {/* Enhanced hero glow effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/15 rounded-full filter blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
          
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full animate-bounce shadow-2xl shadow-amber-500/50">
              <Globe className="w-12 h-12 text-black" />
            </div>
          </div>
          
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold pb-6 flex flex-col relative z-10">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white mb-4">
              Plan Your Perfect Trip
            </span>
            <span className="flex mx-auto gap-3 sm:gap-4 items-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400">
              with GlobeTrotter
              <Sparkles className="w-12 h-12 lg:w-16 lg:h-16 text-amber-400 animate-spin" />
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Your intelligent travel companion powered by AI. Create personalized itineraries, 
            collaborate with friends, and discover hidden gems around the world.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <Button size="lg" className="group shadow-2xl shadow-amber-500/25">
              Start Planning Free
              <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <StatsSection />

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="py-20 px-5 relative z-10">
        <EnhancedFeatures />
      </section>

      {/* ================= TRUSTED BY SECTION ================= */}
      <section className="py-20 text-center relative z-10 px-5">
        <div className="container mx-auto">
          <h3 className="text-4xl font-bold mb-6 text-white">
            Trusted by 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500"> Travelers Worldwide</span>
          </h3>
          <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto">
            Join thousands of adventurers who've discovered the joy of stress-free travel planning with our AI-powered platform
          </p>
          
          {/* Enhanced trust indicators */}
          <div className="flex justify-center items-center space-x-4 text-amber-400 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-current animate-pulse hover:scale-125 transition-transform duration-300" style={{animationDelay: `${i * 0.2}s`}} />
            ))}
          </div>
          <p className="text-gray-400 text-lg">4.9/5 stars from 50,000+ happy travelers</p>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="py-20 px-5 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-4xl font-bold mb-12 text-center text-white">
            Frequently Asked 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500"> Questions</span>
          </h3>
          
          <Accordion>
            {faqs.map((faq, index) => (
              <AccordionItem key={index}>
                <AccordionTrigger 
                  onClick={() => toggleFAQ(index)}
                  isOpen={openFAQ === index}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent isOpen={openFAQ === index}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-20 text-center px-5 relative z-10">
        <div className="container mx-auto">
          <div className="relative">
            {/* Enhanced CTA glow effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full filter blur-3xl" />
            
            <div className="relative z-10 bg-gray-900/40 border border-amber-500/30 rounded-3xl p-12 backdrop-blur-sm">
              <h3 className="text-5xl font-bold mb-6 text-white">
                Ready to Plan Your Next 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500"> Adventure?</span>
              </h3>
              <p className="text-xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Join over 50,000 travelers worldwide who use GlobeTrotter to design unforgettable
                journeys. Your perfect trip is just one click away.
              </p>
              <Button size="lg" className="animate-bounce hover:animate-none group text-lg px-12 py-5 shadow-2xl shadow-amber-500/30">
                Start Planning For Free 
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-amber-500/20 relative z-10">
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
    </div>
  );
}