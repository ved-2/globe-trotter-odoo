import React from 'react';

const HotelSuggestions = ({ hotels }) => {
  if (!hotels || hotels.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text mb-6 flex items-center">
        🏨 Hotel Suggestions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((hotel, idx) => (
          <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 hover:border-amber-500/40">
            {(hotel.imageUrl || hotel.hotelImageUrl) && (
              <img
                src={hotel.imageUrl || hotel.hotelImageUrl}
                alt={hotel.name || hotel.hotelName}
                className="w-full h-48 object-cover rounded-lg mb-4 border border-amber-500/10"
              />
            )}
            <h3 className="text-xl font-bold text-amber-200">{hotel.name || hotel.hotelName}</h3>
            <p className="text-sm text-gray-400 mt-1 mb-3">{hotel.address || hotel.hotelAddress}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-lg font-semibold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
                ${hotel.price?.amount || hotel.price || 'N/A'}
              </span>
              <span className="flex items-center font-bold text-amber-500">
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