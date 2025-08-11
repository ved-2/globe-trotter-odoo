"use client";
import "@copilotkit/react-ui/styles.css";
import "react-day-picker/dist/style.css"; // Styles for the calendar

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { Loader2 } from "lucide-react";
import { addDays, format } from 'date-fns';

// Import the new components
import TripHeader from "@/components/trip/TripHeader";
import ItineraryView from "@/components/trip/ItineraryView";
import SidePanel from "@/components/trip/SidePanel";
import HotelSuggestions from "@/components/trip/HotelSuggestions";
import LoadingSkeleton from "@/components/trip/LoadingSkeleton";
import ErrorDisplay from "@/components/trip/ErrorDisplay";

const TravelPlan = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const hiddenPdfRef = useRef(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!params?.id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/trips/${params.id}`);
        if (!res.ok) throw new Error("Trip not found or access denied.");
        const { trip } = await res.json();

        if (!trip.itinerary) trip.itinerary = [];
        setPlan(trip);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) fetchTrip();
  }, [params?.id, isSignedIn]);

  const generatePDF = async () => {
    if (!hiddenPdfRef.current) return;

    setIsGenerating(true);
    try {
      const opt = {
        margin: [10, 10],
        filename: plan?.title ? `${plan.title.replace(/\s+/g, "-")}.pdf` : "travel-plan.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(hiddenPdfRef.current).save();
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isLoaded || loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  if (!plan) return <div className="text-center p-8">Could not load travel plan.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TripHeader plan={plan} />

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Travel Itinerary</h2>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? "Generating PDF..." : "Download as PDF 📥"}
          </button>
        </div>

        {/* Main Content */}
        <ItineraryView itinerary={plan.itinerary} />

        <SidePanel
          tripDays={plan.itinerary.map((_, i) => new Date(new Date(plan.startDate).getTime() + i * 86400000))}
          destination={plan.destination?.name || plan.location}
        />

        <HotelSuggestions hotels={plan.hotels} />

        {/* Hidden container for PDF generation */}
        <div style={{ position: "fixed", top: "-9999px", left: "-9999px" }}>
          <div
            ref={hiddenPdfRef}
            style={{ backgroundColor: "white", color: "black", padding: "20px", maxWidth: "800px" }}
          >
            <h1 style={{ textAlign: "center" }}>{plan.title || "Travel Plan"}</h1>
            {plan.itinerary.map((day, idx) => (
              <div key={idx} style={{ marginBottom: "20px" }}>
                <h2>Day {idx + 1}: {day.title || `Day ${idx + 1}`}</h2>
                <ul>
                  {day.activities?.map((act, i) => (
                    <li key={i}>
                      <strong>{act.title || act.placeName}</strong>: {act.description || "No description"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPlan;
