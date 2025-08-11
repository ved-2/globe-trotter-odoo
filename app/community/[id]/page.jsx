"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, Star, MapPin, Tag, User, ArrowLeft, Download } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  reviewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 8,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 12,
    color: '#111827',
    marginTop: 2,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
  },
  content: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  stars: {
    fontSize: 16,
    color: '#F59E0B',
    marginLeft: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  tag: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    padding: 6,
    marginRight: 8,
    marginBottom: 6,
    borderRadius: 12,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#9CA3AF',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
  }
});

// PDF Document Component for Review
const ReviewPDFDocument = ({ reviewData }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>{reviewData.title}</Text>
          <Text style={pdfStyles.subtitle}>Travel Review</Text>
        </View>

        {/* Review Information */}
        <View style={pdfStyles.reviewInfo}>
          <View style={pdfStyles.infoColumn}>
            <Text style={pdfStyles.infoLabel}>Author</Text>
            <Text style={pdfStyles.infoValue}>{reviewData.author}</Text>
          </View>
          <View style={pdfStyles.infoColumn}>
            <Text style={pdfStyles.infoLabel}>Destination</Text>
            <Text style={pdfStyles.infoValue}>{reviewData.destination}</Text>
          </View>
          <View style={pdfStyles.infoColumn}>
            <Text style={pdfStyles.infoLabel}>Date</Text>
            <Text style={pdfStyles.infoValue}>{formatDate(reviewData.createdAt)}</Text>
          </View>
          <View style={pdfStyles.infoColumn}>
            <Text style={pdfStyles.infoLabel}>Rating</Text>
            <Text style={pdfStyles.infoValue}>{reviewData.rating}/5</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={pdfStyles.rating}>
          <Text style={pdfStyles.ratingText}>Rating: </Text>
          <Text style={pdfStyles.stars}>{renderStars(reviewData.rating)}</Text>
        </View>

        {/* Content */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Review</Text>
          <Text style={pdfStyles.content}>{reviewData.content}</Text>
        </View>

        {/* Tags */}
        {reviewData.tags && reviewData.tags.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Tags</Text>
            <View style={pdfStyles.tagsContainer}>
              {reviewData.tags.map((tag, index) => (
                <Text key={index} style={pdfStyles.tag}>#{tag}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={pdfStyles.footer}>
          Generated on {new Date().toLocaleDateString()} • Travel Review PDF
        </Text>
      </Page>
    </Document>
  );
};

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
        } catch (error) { 
          console.error(error); 
        }
        finally { 
          setIsLoading(false); 
        }
      };
      fetchReview();
    }
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-amber-400">
      Loading...
    </div>
  );

  if (!review) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
      <h1>Review Not Found</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/community" className="inline-flex items-center text-amber-400 hover:text-amber-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Community
          </Link>
          
          {/* PDF Download Button */}
          <PDFDownloadLink
            document={<ReviewPDFDocument reviewData={review} />}
            fileName={`${review.title.replace(/[^a-zA-Z0-9]/g, '_')}_Review.pdf`}
            className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-black font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            {({ loading }) =>
              loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )
            }
          </PDFDownloadLink>
        </div>

        {/* Review Content */}
        <div className="bg-gray-900/50 border border-amber-500/20 rounded-2xl p-10">
          <h1 className="text-5xl font-extrabold text-white mb-4">{review.title}</h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-400 mb-6 border-y border-amber-500/20 py-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400"/>
              <span>{review.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400"/>
              <span>{review.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400"/>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-current"/>
              <span>{review.rating}/5</span>
            </div>
          </div>

          <article className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
            {review.content}
          </article>

          {review.tags && review.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-amber-500/20">
              <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5"/>
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {review.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-500/10 rounded-full text-amber-300 text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}