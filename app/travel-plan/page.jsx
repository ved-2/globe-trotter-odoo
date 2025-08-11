"use client";

import React, { useEffect, useState } from "react";

const TravelPlan = () => {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("tripPlan");
    if (data) {
      try {
        const cleaned = data.trim();
        const jsonStart = cleaned.indexOf("{");
        const jsonEnd = cleaned.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(jsonString);
          setPlan(parsed);
        }
      } catch (err) {
        console.error("Invalid JSON in tripPlan:", err);
      }
    }
  }, []);

  if (!plan) {
    return (
      <div className="p-10 text-center text-xl text-gray-500">
        No travel plan found.
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-10 md:px-20 lg:px-32 py-10">
      <h1 className="text-3xl font-bold mb-4">🧳 Your Travel Plan</h1>

      {/* General Info */}
      <div className="bg-white p-6 shadow rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-2">Trip Details</h2>
        <ul className="list-disc ml-5 text-gray-700">
          <li>
            <strong>Location:</strong> {plan.location}
          </li>
          <li>
            <strong>Duration:</strong> {plan.duration}
          </li>
          <li>
            <strong>Budget:</strong> {plan.budget}
          </li>
          <li>
            <strong>Travelers:</strong> {plan.travelers}
          </li>
          <li>
            <strong>Best Time To Visit:</strong> {plan.bestTimeToVisit}
          </li>
        </ul>
      </div>

      {/* Hotels */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🏨 Hotel Suggestions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plan.hotels?.map((hotel, idx) => (
            <div
              key={idx}
              className="border rounded-lg shadow hover:shadow-lg transition p-4"
            >
              <img
                src={hotel.hotelImageUrl}
                alt={hotel.hotelName}
                className="rounded w-full h-48 object-cover mb-3"
              />
              <h3 className="text-lg font-bold">{hotel.hotelName}</h3>
              <p className="text-sm text-gray-600">{hotel.hotelAddress}</p>
              <p className="text-sm text-gray-600">💸 ₹{hotel.price}</p>
              <p className="text-sm text-gray-600">⭐ {hotel.rating}</p>
              <p className="mt-2 text-gray-700">{hotel.descriptions}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Itinerary */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📅 Suggested Itinerary</h2>
        {plan?.suggestedItinerary?.length > 0 ? (
          <div className="mt-8 space-y-10">
            {plan.suggestedItinerary.map((day, idx) => (
              <div key={idx}>
                <h3 className="text-xl font-semibold mb-2">
                  Day {idx + 1}: {day.theme}
                </h3>
                <div className="space-y-4">
                  {day.plan.map((activity, aIdx) => (
                    <div key={aIdx} className="border rounded-lg p-4 shadow">
                      <h4 className="text-lg font-bold">
                        {activity.placeName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {activity.placeDetails}
                      </p>
                      <p>
                        <strong>Rating:</strong> {activity.rating}
                      </p>
                      <p>
                        <strong>Estimated Time:</strong>{" "}
                        {activity.timeTravelEachLocation}
                      </p>
                      {activity.placeImageUrl && (
                        <img
                          src={activity.placeImageUrl}
                          alt={activity.placeName}
                          className="w-full h-64 object-cover rounded mt-2"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No itinerary available.</p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          <strong>Disclaimer:</strong> {plan.disclaimer}
        </p>
      </div>
    </div>
  );
};

export default TravelPlan;
