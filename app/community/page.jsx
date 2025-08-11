"use client";
import React from "react";
import { 
  Map, Calendar, Users, ChevronRight, ArrowRight, Sparkles, Globe, Star, 
  Menu, X, User, LogIn, Settings, Heart, Shield, Zap, Send, MapPin, 
  Clock, Camera, MessageCircle, ThumbsUp, Share2, Filter, Search
} from "lucide-react";

const testReviews = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "SC",
    location: "Tokyo, Japan",
    rating: 5,
    date: "2 days ago",
    title: "Cherry Blossom Season in Tokyo",
    content: "GlobeTrotter helped me plan the perfect 10-day Tokyo trip during cherry blossom season! The AI recommendations were spot-on, especially for the hidden gems in Shinjuku Gyoen. The collaborative planning feature made it easy to coordinate with my travel buddy.",
    images: 3,
    likes: 24,
    comments: 8,
    destination: "Tokyo",
    tags: ["Solo Travel", "Cherry Blossoms", "Cultural", "Photography"]
  },
  {
    id: 2,
    author: "Emily Rodriguez",
    avatar: "ER",
    location: "Machu Picchu, Peru",
    rating: 4,
    date: "1 week ago",
    title: "Adventure of a Lifetime",
    content: "The Inca Trail trek was challenging but incredible! GlobeTrotter's altitude acclimatization tips and packing suggestions were perfect. The interactive maps helped us understand the route better. Only wish there were more vegetarian food options in the recommendations.",
    images: 7,
    likes: 33,
    comments: 15,
    destination: "Peru",
    tags: ["Adventure", "Hiking", "Cultural", "Photography"]
  },
  {
    id: 3,
    author: "David Kim",
    avatar: "DK",
    location: "Bali, Indonesia",
    rating: 5,
    date: "2 weeks ago",
    title: "Digital Nomad Haven",
    content: "Spent 3 months in Bali working remotely. GlobeTrotter's co-working space recommendations and visa guidance were invaluable. The community here helped me find the best cafes with reliable WiFi. Already planning my next destination using the platform!",
    images: 4,
    likes: 18,
    comments: 6,
    destination: "Bali",
    tags: ["Digital Nomad", "Remote Work", "Long Stay", "Co-working"]
  },
  {
    id: 4,
    author: "Anna Petrov",
    avatar: "AP",
    location: "Northern Lights, Iceland",
    rating: 5,
    date: "3 weeks ago",
    title: "Chasing the Aurora",
    content: "Iceland in winter was breathtaking! GlobeTrotter's weather-based activity suggestions helped us maximize our chances of seeing the Northern Lights. We got lucky on night 3 - the aurora forecast feature was incredibly accurate. The Blue Lagoon was overrated though!",
    images: 6,
    likes: 56,
    comments: 22,
    destination: "Iceland",
    tags: ["Northern Lights", "Winter", "Photography", "Natural Wonders"]
  },
  {
    id: 5,
    author: "Jake Morrison",
    avatar: "JM",
    location: "Safari, Kenya",
    rating: 4,
    date: "1 month ago",
    title: "Wildlife Photography Safari",
    content: "Amazing safari experience in Masai Mara! The wildlife tracking features and photography tips in GlobeTrotter were fantastic. Saw the Big Five and captured some incredible shots. The local guide recommendations were authentic and knowledgeable.",
    images: 12,
    likes: 67,
    comments: 28,
    destination: "Kenya",
    tags: ["Safari", "Wildlife", "Photography", "Adventure"]
  }
];
const FloatingParticles = () => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-pulse ${
              i % 3 === 0 ? 'bg-amber-400' : i % 3 === 1 ? 'bg-orange-400' : 'bg-yellow-400'
            }`}
            style={{
              width: '2px',
              height: '2px',
              left: '50%',
              top: '50%',
              animationDelay: '2s',
              animationDuration: '5s',
              opacity: 0.3,
            }}
          />
        ))}
      </div>
    );
  }

  return (
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
};



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

// Card components
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

// Share Experience Form
const ShareExperienceForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = React.useState({
    title: '',
    destination: '',
    content: '',
    rating: 5,
    tags: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally submit to your backend
    console.log('Submitting experience:', formData);
    onClose();
    setFormData({ title: '', destination: '', content: '', rating: 5, tags: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-amber-500/20">
          <h3 className="text-2xl font-bold text-white">Share Your Travel Experience</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-amber-400 font-medium mb-2">Trip Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-xl text-white focus:border-amber-500 focus:outline-none transition-colors duration-200"
              placeholder="e.g., Amazing Week in Bali"
              required
            />
          </div>
          
          <div>
            <label className="block text-amber-400 font-medium mb-2">Destination</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-xl text-white focus:border-amber-500 focus:outline-none transition-colors duration-200"
              placeholder="e.g., Bali, Indonesia"
              required
            />
          </div>

          <div>
            <label className="block text-amber-400 font-medium mb-2">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, rating: star})}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`w-8 h-8 transition-colors duration-200 ${
                      star <= formData.rating 
                        ? 'text-amber-400 fill-current' 
                        : 'text-gray-600 hover:text-amber-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-amber-400 font-medium mb-2">Your Experience</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={6}
              className="w-full px-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-xl text-white focus:border-amber-500 focus:outline-none transition-colors duration-200 resize-none"
              placeholder="Tell us about your amazing journey..."
              required
            />
          </div>
          
          <div>
            <label className="block text-amber-400 font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-xl text-white focus:border-amber-500 focus:outline-none transition-colors duration-200"
              placeholder="e.g., Adventure, Beach, Family, Cultural"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="group">
              Share Experience
              <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }) => {
  const [liked, setLiked] = React.useState(false);

  return (
    <Card className="group hover:scale-105 transform transition-all duration-300 h-fit">
      <CardContent className="p-4">
        {/* Author Header */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
            {review.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm truncate">{review.author}</h4>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{review.destination}</span>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-amber-400 text-sm ml-1">{review.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors duration-300 line-clamp-2">
          {review.title}
        </h3>

        {/* Content */}
        <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-4">
          {review.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {review.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs"
            >
              {tag}
            </span>
          ))}
          {review.tags.length > 2 && (
            <span className="px-2 py-1 bg-gray-800/50 rounded-full text-gray-400 text-xs">
              +{review.tags.length - 2}
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center space-x-3">
            {review.images > 0 && (
              <div className="flex items-center space-x-1">
                <Camera className="w-3 h-3" />
                <span>{review.images}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{review.date}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-500/20">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center space-x-1 transition-colors duration-200 ${
                liked ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-xs">{review.likes + (liked ? 1 : 0)}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-400 hover:text-amber-400 transition-colors duration-200">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{review.comments}</span>
            </button>
          </div>
          
          <button className="text-gray-400 hover:text-amber-400 transition-colors duration-200">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

// Community Page Component
export default function CommunityPage() {
  const [isShareFormOpen, setIsShareFormOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState('all');

  const filters = [
    { id: 'all', label: 'All Experiences' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'romance', label: 'Romance' },
    { id: 'solo', label: 'Solo Travel' },
    { id: 'family', label: 'Family' }
  ];

  const filteredReviews = testReviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         review.tags.some(tag => tag.toLowerCase().includes(selectedFilter.toLowerCase()));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900/10 via-black to-orange-900/10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(251,191,36,0.1),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(249,115,22,0.1),transparent_50%)]" />
      <FloatingParticles />
      
      
   
      
      {/* Hero Section */}
      <section className="container mx-auto pt-32 pb-12 text-center relative z-10 px-5">
        <div className="relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full filter blur-3xl animate-pulse" />
          
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-2xl shadow-amber-500/50">
              <Users className="w-12 h-12 text-black" />
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold pb-6 relative z-10">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white mb-4 block">
              Travel Community
            </span>
            <span className="flex mx-auto gap-3 items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400">
              Share Your Adventures
              <Heart className="w-12 h-12 lg:w-16 lg:h-16 text-amber-400 animate-pulse" />
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with fellow travelers, share your experiences, and discover inspiring stories from around the globe
          </p>
          
          <Button 
            size="lg" 
            className="group shadow-2xl shadow-amber-500/25"
            onClick={() => setIsShareFormOpen(true)}
          >
            Share Your Experience
            <Camera className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
          </Button>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-5 relative z-10 mb-12">
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-xl text-white focus:border-amber-500 focus:outline-none transition-colors duration-200"
                placeholder="Search destinations, experiences..."
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0">
              <Filter className="w-5 h-5 text-amber-400 flex-shrink-0" />
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                    selectedFilter === filter.id
                      ? 'bg-amber-500 text-black'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-amber-500/20 hover:text-amber-400'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Community Stats */}
      <section className="container mx-auto px-5 relative z-10 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { number: "2.3K", label: "Travel Stories" },
            { number: "15K", label: "Community Members" },
            { number: "89", label: "Countries Shared" },
            { number: "4.8/5", label: "Average Rating" }
          ].map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-1">
                {stat.number}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="container mx-auto px-5 relative z-10 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No experiences found matching your search.</p>
                    <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {filteredReviews.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="group">
              Load More Stories
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center px-5 relative z-10">
        <div className="container mx-auto">
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full filter blur-3xl" />
            
            <div className="relative z-10 bg-gray-900/40 border border-amber-500/30 rounded-3xl p-12 backdrop-blur-sm">
              <h3 className="text-4xl font-bold mb-6 text-white">
                Ready to Share Your Next 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500"> Adventure?</span>
              </h3>
              <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Join our growing community of travelers and inspire others with your unique experiences and discoveries.
              </p>
              <Button 
                size="lg" 
                className="animate-bounce hover:animate-none group text-lg px-12 py-5 shadow-2xl shadow-amber-500/30"
                onClick={() => setIsShareFormOpen(true)}
              >
                Share Your Story
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

      {/* Share Experience Modal */}
      <ShareExperienceForm 
        isOpen={isShareFormOpen} 
        onClose={() => setIsShareFormOpen(false)} 
      />
    </div>
  );
}