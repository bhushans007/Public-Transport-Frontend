import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const passengerData = JSON.parse(sessionStorage.getItem('passengerData') || '{}');

const username = passengerData.user_name;

const passengerId = passengerData.id; // If available from QR code

const locations = [
  { id: '1', name: 'City Center', distance: 0 },
  { id: '2', name: 'North Station', distance: 5 },
  { id: '3', name: 'South Terminal', distance: 8 },
  { id: '4', name: 'East Market', distance: 12 },
  { id: '5', name: 'West Mall', distance: 15 },
];

export const LocationPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFrom, setSelectedFrom] = useState<string>('');

  const handleFromSelect = (locationName: string) => {
    setSelectedFrom(locationName);
    sessionStorage.setItem('from', locationName);
    const toElement = document.getElementById('to-section');
    toElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToSelect = (toLocation: string) => {
    if (!selectedFrom) {
      return;
    }
    sessionStorage.setItem('to', toLocation);
    // Force a small delay to ensure storage is set
    setTimeout(() => {
      navigate('/passengers', { replace: true });
    }, 100);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Route</h1>
      {username && (
        <div className="mb-2 text-lg text-gray-600">
          Welcome, <span className="font-medium">{username}</span>
        </div>
      )}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">From</h2>
          <div className="grid grid-cols-2 gap-4">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleFromSelect(location.name)}
                className={`flex items-center justify-center px-4 py-2 border rounded-md
                  ${selectedFrom === location.name
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <MapPin className={`mr-2 h-4 w-4 ${
                  selectedFrom === location.name ? 'text-blue-600' : 'text-gray-500'
                }`} />
                {location.name}
              </button>
            ))}
          </div>
        </div>

        <div id="to-section" className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">To</h2>
          <div className="grid grid-cols-2 gap-4">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleToSelect(location.name)}
                disabled={!selectedFrom || location.name === selectedFrom}
                className={`flex items-center justify-center px-4 py-2 border rounded-md
                  ${location.name === selectedFrom
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : !selectedFrom
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <MapPin className={`mr-2 h-4 w-4 ${
                  location.name === selectedFrom ? 'text-gray-400' : 'text-gray-500'
                }`} />
                {location.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};