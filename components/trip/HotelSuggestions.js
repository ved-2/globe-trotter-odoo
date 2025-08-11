import React from 'react';

const HotelSuggestions = ({ hotels }) => {
  if (!hotels || hotels.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        🏨 Hotel Suggestions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((hotel, idx) => (
          <div key={idx} className="bg-white border rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
            {(hotel.imageUrl || hotel.hotelImageUrl) && (
              <img
                src={hotel.imageUrl || hotel.hotelImageUrl}
                alt={hotel.name || hotel.hotelName}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-xl font-bold text-gray-900">{hotel.name || hotel.hotelName}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-3">{hotel.address || hotel.hotelAddress}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-lg font-semibold text-green-600">
                ${hotel.price?.amount || hotel.price || 'N/A'}
              </span>
              <span className="flex items-center font-bold text-yellow-500">
                {'⭐'.repeat(Math.round(hotel.rating) || 0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelSuggestions;