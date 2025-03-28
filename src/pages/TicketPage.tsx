import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Ticket } from '../types';

const calculateFare = (from: string, to: string, passengers: number) => {
  // Mock fare calculation - in production, this would use actual distance and rates
  const baseRate = 2.5;
  const distance = Math.abs(
    locations.findIndex(l => l.name === from) -
    locations.findIndex(l => l.name === to)
  );
  return baseRate * distance * passengers;
};

const locations = [
  { id: '1', name: 'City Center', distance: 0 },
  { id: '2', name: 'North Station', distance: 5 },
  { id: '3', name: 'South Terminal', distance: 8 },
  { id: '4', name: 'East Market', distance: 12 },
  { id: '5', name: 'West Mall', distance: 15 },
];

export const TicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addTicket } = useStore();
  const [isGenerated, setIsGenerated] = useState(false);

  const from = sessionStorage.getItem('from') || '';
  const to = sessionStorage.getItem('to') || '';
  const passengers = parseInt(sessionStorage.getItem('passengers') || '1', 10);
  const passengerId = sessionStorage.getItem('passengerId') || '';

  const fare = calculateFare(from, to, passengers);

  useEffect(() => {
    if (!from || !to || !passengers || !passengerId) {
      navigate('/');
    }
  }, [from, to, passengers, passengerId, navigate]);

  const handleGenerateTicket = () => {
    const ticket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      passengerId,
      from,
      to,
      passengers,
      fare,
      timestamp: Date.now(),
      conductorId: user?.id || '',
    };

    addTicket(ticket);
    setIsGenerated(true);
    
    // Clear session storage
    setTimeout(() => {
      sessionStorage.clear();
      navigate('/');
    }, 3000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Generate Ticket</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">From:</span>
            <span className="font-medium">{from}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To:</span>
            <span className="font-medium">{to}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Passengers:</span>
            <span className="font-medium">{passengers}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total Fare:</span>
            <span>${fare.toFixed(2)}</span>
          </div>
        </div>

        {!isGenerated ? (
          <button
            onClick={handleGenerateTicket}
            className="mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Printer className="mr-2 h-5 w-5" />
            Generate Ticket
          </button>
        ) : (
          <div className="mt-6 flex items-center justify-center text-green-600">
            <Check className="mr-2 h-5 w-5" />
            Ticket Generated Successfully
          </div>
        )}
      </div>
    </div>
  );
};