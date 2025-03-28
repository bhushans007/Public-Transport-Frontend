import React from 'react';
import { useStore } from '../store/useStore';

export const ProfilePage: React.FC = () => {
  const { user, tickets } = useStore();

  const todayTickets = tickets.filter(
    ticket => new Date(ticket.timestamp).toDateString() === new Date().toDateString()
  );

  const totalRevenue = todayTickets.reduce((sum, ticket) => sum + ticket.fare, 0);

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Conductor Profile
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Today's Statistics</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-600 text-xs font-medium">Tickets Issued</p>
                    <p className="text-2xl font-bold text-blue-800">{todayTickets.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-600 text-xs font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-800">${totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};