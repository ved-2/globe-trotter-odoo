import React from 'react';

const CommandSuggestions = ({ destination }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Try these commands...</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        <li className="p-2 bg-gray-50 rounded-md">"Add a relaxing beach day to my trip."</li>
        <li className="p-2 bg-gray-50 rounded-md">"Remove day 2."</li>
        <li className="p-2 bg-gray-50 rounded-md">"Move the museum visit from day 1 to day 3."</li>
        <li className="p-2 bg-gray-50 rounded-md">"Add a dinner reservation at 8 PM on day 1."</li>
        <li className="p-2 bg-gray-50 rounded-md">"Is my schedule for day 3 realistic?"</li>
      </ul>
    </div>
  );
};

export default CommandSuggestions;