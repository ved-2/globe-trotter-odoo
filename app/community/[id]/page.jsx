"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, Star, MapPin, Tag, User, ArrowLeft } from 'lucide-react';

export default function ReviewDetailPage() {
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchReview = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/reviews/${id}`);
          if (!res.ok) throw new Error('Failed to fetch');
          const { data } = await res.json();
          setReview(data);
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
      };
      fetchReview();
    }
  }, [id]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-amber-400">Loading...</div>;
  if (!review) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500"><h1>Review Not Found</h1></div>;

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/community" className="inline-flex items-center text-amber-400 hover:text-amber-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Community
          </Link>
        </div>
        <div className="bg-gray-900/50 border border-amber-500/20 rounded-2xl p-10">
          <h1 className="text-5xl font-extrabold text-white mb-4">{review.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-400 mb-6 border-y border-amber-500/20 py-4">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-amber-400"/><span>{review.author}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400"/><span>{review.destination}</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400"/><span>{new Date(review.createdAt).toLocaleDateString()}</span></div>
            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 fill-current"/><span>{review.rating}/5</span></div>
          </div>
          <article className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">{review.content}</article>
          <div className="mt-8 pt-6 border-t border-amber-500/20">
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2"><Tag className="w-5 h-5"/>Tags</h3>
            <div className="flex flex-wrap gap-2">
              {review.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-amber-500/10 rounded-full text-amber-300 text-sm">{tag}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}