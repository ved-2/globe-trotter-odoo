"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, ChevronRight, Camera, Filter, Search, ThumbsUp, MessageCircle, Clock, MapPin, Star, X, Send } from "lucide-react";

// Helper Components
const Card = ({ children, className = "" }) => <div className={`bg-gray-900/50 border border-amber-500/20 rounded-2xl backdrop-blur-sm ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;
const Button = ({ children, ...props }) => <button className="inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-lg" {...props}>{children}</button>;

// REVIEW CARD COMPONENT (WITH FIXES)
const ReviewCard = ({ review }) => {
  const [liked, setLiked] = useState(false);

  return (
    <Link href={`/community/${review._id}`} className="block h-full group">
      <Card className="hover:border-amber-500/40 transition-all duration-300 h-full flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm">{review.avatar}</div>
            <div>
              <h4 className="text-white font-semibold text-sm">{review.author}</h4>
              <div className="flex items-center space-x-1 text-xs text-gray-400"><MapPin className="w-3 h-3" /><span>{review.destination}</span></div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-2 flex-grow">{review.title}</h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">{review.content}</p>
          <div className="mt-auto pt-3 border-t border-amber-500/20 flex items-center justify-between text-gray-400 text-xs">
            <div className="flex items-center space-x-4">
              <button
                onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
                className={`flex items-center space-x-1 transition-colors z-10 relative ${liked ? 'text-amber-400' : 'hover:text-amber-400'}`}
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span>{review.likes + (liked ? 1 : 0)}</span>
              </button>
              <div className="flex items-center space-x-1"><MessageCircle className="w-4 h-4" /><span>{review.comments}</span></div>
            </div>
            <div className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{new Date(review.createdAt).toLocaleDateString()}</span></div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};


// FORM COMPONENT
const ShareExperienceForm = ({ isOpen, onClose, onReviewAdded }) => {
    // ... (This component can stay the same as the one from the "complete community section" response)
    // For brevity, it is omitted here but should be included in your file.
};


// MAIN PAGE COMPONENT
export default function CommunityPage() {
  const [isShareFormOpen, setIsShareFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const filters = [{ id: 'all', label: 'All' }, { id: 'adventure', label: 'Adventure' }, { id: 'cultural', label: 'Cultural' }];

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchReviews = useCallback(async (isNewSearch) => {
    setIsLoading(true);
    const pageToFetch = isNewSearch ? 1 : page;
    const url = `/api/reviews?page=${pageToFetch}&search=${debouncedSearchQuery}&tag=${selectedFilter}`;
    try {
      const res = await fetch(url);
      const { data, pagination } = await res.json();
      setReviews(prev => isNewSearch ? data : [...prev, ...data]);
      setHasMore(pagination.page < pagination.totalPages);
    } catch (error) { console.error("Failed to fetch reviews:", error); }
    finally { setIsLoading(false); }
  }, [page, debouncedSearchQuery, selectedFilter]);

  useEffect(() => { fetchReviews(true); }, [debouncedSearchQuery, selectedFilter]);
  useEffect(() => { if (page > 1) fetchReviews(false); }, [page]);

  const handleLoadMore = () => { if (hasMore && !isLoading) setPage(prev => prev + 1); };
  const handleReviewAdded = (newReview) => setReviews(prev => [newReview, ...prev]);

  return (
    <div className="min-h-screen bg-black text-white relative">
      <main className="relative z-10 container mx-auto px-5">
        <section className="pt-32 pb-12 text-center">
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-4">Community</h1>
          <p className="text-xl text-gray-300 mb-8">Share and discover travel experiences.</p>
          <Button onClick={() => setIsShareFormOpen(true)}>Share Your Experience <Camera className="w-5 h-5 ml-2" /></Button>
        </section>
        <section className="mb-12">
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-800/50 rounded-xl focus:outline-none" placeholder="Search experiences..." /></div>
              <div className="flex items-center space-x-2"><Filter className="w-5 h-5 text-amber-400" />{filters.map(f => <button key={f.id} onClick={() => setSelectedFilter(f.id)} className={`px-4 py-2 rounded-full text-sm ${selectedFilter === f.id ? 'bg-amber-500 text-black' : 'bg-gray-800/50 text-gray-300'}`}>{f.label}</button>)}</div>
            </div>
          </Card>
        </section>
        <section className="pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reviews.map(review => <ReviewCard key={review._id} review={review} />)}
          </div>
          {isLoading && <div className="text-center col-span-full mt-8">Loading...</div>}
          {!isLoading && reviews.length === 0 && <div className="col-span-full text-center py-12"><p>No experiences found.</p></div>}
          {hasMore && !isLoading && <div className="text-center mt-12"><Button onClick={handleLoadMore}>Load More</Button></div>}
        </section>
      </main>
      {/* Remember to include your ShareExperienceForm component definition for this to work */}
      {/* <ShareExperienceForm isOpen={isShareFormOpen} onClose={() => setIsShareFormOpen(false)} onReviewAdded={handleReviewAdded} /> */}
    </div>
  );
}