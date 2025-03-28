import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Minus } from 'lucide-react';

export const PassengerPage: React.FC = () => {
  const [passengers, setPassengers] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = () => {
    sessionStorage.setItem('passengers', passengers.toString());
    navigate('/ticket');
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Number of Passengers</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={() => setPassengers(Math.max(1, passengers - 1))}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <Minus className="h-6 w-6 text-gray-600" />
          </button>
          
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-4xl font-bold text-gray-900">{passengers}</span>
          </div>
          
          <button
            onClick={() => setPassengers(Math.min(10, passengers + 1))}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <Plus className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        
        <button
          onClick={handleSubmit}
          className="mt-8 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
};