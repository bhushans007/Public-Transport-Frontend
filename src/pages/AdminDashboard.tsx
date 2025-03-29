import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Passenger {
  _id: string;
  user_name: string;
  name: string;
  email: string;
  phone: string;
  wallet: {
    rewardPoints: number;
  };
}

interface AdminData {
  id: string;
  user_name: string;
  email?: string;
  role?: string;
  created_at?: string;
}

interface Conductor {
  _id: string;
  user_name: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

interface Route {
  _id: string;
  routeId: string;
  startingLocation: string;
  destination: string;
  stops: { name: string; distanceFromStart: number }[];
  totalDistanceKm: number;
  farePerKm: number;
  rewardPerKm: number;
  active: boolean;
  createdAt: string;
}

interface StopWithDistance {
  name: string;
  distanceFromStart: number;
}

// Configuration (Moved to a separate file if needed)
const API_BASE_URL = 'http://127.0.0.1:3000/api';

// Utility function for API calls
const fetchData = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch data');
  }
  return response.json();
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [conductors, setConductors] = useState<Conductor[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [newRoute, setNewRoute] = useState<any>({
    routeId: '',
    startingLocation: '',
    destination: '',
    stops: [] as StopWithDistance[],
    totalDistanceKm: 0,
    farePerKm: 2,
    rewardPerKm: 0.1,
    active: true,
  });
  const [error, setError] = useState('');
  const [viewPassengersLoading, setViewPassengersLoading] = useState(false);
  const [viewConductorsLoading, setViewConductorsLoading] = useState(false);
  const [updateConductorStatusData, setUpdateConductorStatusData] = useState({
    username: '',
    status: 'inactive',
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStop, setNewStop] = useState({ name: '', distanceFromStart: 0 });
  const [viewRoutesLoading, setViewRoutesLoading] = useState(false); // Added loading state for routes

  useEffect(() => {
    const loadAdminData = async () => {
      const storedToken = localStorage.getItem('adminToken');
      const storedAdminData = localStorage.getItem('adminData');

      if (!storedToken || !storedAdminData) {
        navigate('/admin/login');
        return;
      }

      try {
        setToken(storedToken);
        setAdminData(JSON.parse(storedAdminData));
      } catch (error) {
        console.error('Error loading admin data:', error);
        setError('Failed to load admin data. Please log in again.'); // Set error state
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const handleViewPassengers = async () => {
    setViewPassengersLoading(true);
    try {
      const data = await fetchData(`${API_BASE_URL}/admin/passenger-list`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (data && data.passengers) {
        setPassengers(data.passengers);
        toast.success(data.message);
      } else {
        toast.error('Failed to retrieve passenger list.');
      }
    } catch (error: any) {
      console.error('Error fetching passengers:', error);
      toast.error(error.message || 'An error occurred while fetching passengers.');
    } finally {
      setViewPassengersLoading(false);
    }
  };

  const handleViewConductors = async () => {
    setViewConductorsLoading(true);
    try {
      const data = await fetchData(`${API_BASE_URL}/admin/conductor-list`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (data && data.conductors) {
        setConductors(data.conductors);
        toast.success(data.message);
      } else {
        toast.error('Failed to retrieve conductor list.');
      }
    } catch (error: any) {
      console.error('Error fetching conductors:', error);
      toast.error(error.message || 'An error occurred while fetching conductors.');
    } finally {
      setViewConductorsLoading(false);
    }
  };

  const handleUpdateConductorStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const data = await fetchData(`${API_BASE_URL}/admin/update-conductor-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          user_name: updateConductorStatusData.username,
          status: updateConductorStatusData.status,
        }),
      });

      toast.success(data.message);
      setConductors((prevConductors) =>
        prevConductors.map((conductor) =>
          conductor.user_name === data.conductor.user_name ? { ...conductor, status: data.conductor.status } : conductor
        )
      );
      setUpdateConductorStatusData({ username: '', status: 'inactive' });
    } catch (error: any) {
      console.error('Error updating conductor status:', error);
      toast.error(error.message || 'An error occurred while updating status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddStop = () => {
    if (newStop.name && newStop.distanceFromStart >= 0) {
      const updatedStops = [...newRoute.stops, newStop];
      const newTotalDistance = updatedStops.reduce((sum, stop) => sum + stop.distanceFromStart, 0);

      setNewRoute({
        ...newRoute,
        stops: updatedStops,
        totalDistanceKm: newTotalDistance, // update totalDistanceKm
      });
      setNewStop({ name: '', distanceFromStart: 0 });
      setError('');
    } else {
      setError('Stop name and distance are required.');
    }
  };

  const handleRemoveStop = (index: number) => {
    const updatedStops = newRoute.stops.filter((_, i) => i !== index);
    const newTotalDistance = updatedStops.reduce((sum, stop) => sum + stop.distanceFromStart, 0);
    setNewRoute({
      ...newRoute,
      stops: updatedStops,
      totalDistanceKm: newTotalDistance
    });
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newRoute.routeId ||
      !newRoute.startingLocation ||
      !newRoute.destination ||
      newRoute.stops.length === 0 ||
      newRoute.totalDistanceKm <= 0
    ) {
      setError('All fields are required and distance must be greater than zero.');
      return;
    }

    try {
      const data = await fetchData(`${API_BASE_URL}/route/addRoutes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(newRoute),
      });

      setRoutes([...routes, data.route]);
      setNewRoute({
        routeId: '',
        startingLocation: '',
        destination: '',
        stops: [],
        totalDistanceKm: 0,
        farePerKm: 2,
        rewardPerKm: 0.1,
        active: true,
      });
      toast.success(data.message);
      setError('');
    } catch (error: any) {
      console.error('Error adding route:', error);
      toast.error(error.message || 'An error occurred while adding the route.');
    }
  };

  const handleViewRoutes = async () => {
    setViewRoutesLoading(true);
    try {
      const data = await fetchData(`${API_BASE_URL}/route/allRoutes`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (data && data.routes) {
        setRoutes(data.routes);
        toast.success(data.message);
      } else {
        toast.error('Failed to retrieve routes.');
      }
    } catch (error: any) {
      console.error('Error fetching routes:', error);
      toast.error(error.message);
    } finally {
      setViewRoutesLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Admin Info</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Username:</span> {adminData?.user_name}</p>
                <p><span className="font-medium">Email:</span> {adminData?.email || 'N/A'}</p>
                <p><span className="font-medium">Role:</span> {adminData?.role || 'Admin'}</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-2">Statistics</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Passengers:</span> {passengers.length}</p>
                <p><span className="font-medium">Conductors:</span> {conductors.length}</p>
                <p><span className="font-medium">Routes:</span> {routes.length}</p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-purple-800 mb-2">Session</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Token:</span> {token ? '********' + token.slice(-4) : 'None'}</p>
                <p><span className="font-medium">Logged In Since:</span> {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      case 'passengers':
        return (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Passenger List ({passengers.length})</h2>
              <button
                onClick={handleViewPassengers}
                disabled={viewPassengersLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {viewPassengersLoading ? (
                  <>
                    <LoadingSpinner size={20} />
                    <span className="ml-2">Loading...</span>
                  </>
                ) : (
                  'View Passengers'
                )}
              </button>
            </div>
            {passengers.length === 0 && !viewPassengersLoading ? (
              <p className="text-gray-500">No passengers found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward Points</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {passengers.map((passenger) => (
                      <tr key={passenger._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{passenger.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{passenger.user_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{passenger.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{passenger.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{passenger.wallet.rewardPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'conductors':
        return (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Conductor List ({conductors.length})</h2>
              <button
                onClick={handleViewConductors}
                disabled={viewConductorsLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {viewConductorsLoading ? (
                  <>
                    <LoadingSpinner size={20} />
                    <span className="ml-2">Loading...</span>
                  </>
                ) : (
                  'View Conductors'
                )}
              </button>
            </div>
            {conductors.length === 0 && !viewConductorsLoading ? (
              <p className="text-gray-500">No conductors found</p>
            ) : (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {conductors.map((conductor) => (
                      <tr key={conductor._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conductor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{conductor.user_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conductor.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conductor.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conductor.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'updateConductorStatus':
        return (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Conductor Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter Username</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={updateConductorStatusData.username}
                    onChange={(e) =>
                      setUpdateConductorStatusData({
                        ...updateConductorStatusData,
                        username: e.target.value,
                      })
                    }
                    placeholder="Enter conductor username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={updateConductorStatusData.status}
                    onChange={(e) =>
                      setUpdateConductorStatusData({
                        ...updateConductorStatusData,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="inactive">Inactive</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleUpdateConductorStatus}
                disabled={isUpdatingStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isUpdatingStatus ? (
                  <>
                    <LoadingSpinner size={20} />
                    <span className="ml-2">Updating...</span>
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        );

      case 'routes':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Route</h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <form onSubmit={handleAddRoute} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Route ID</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newRoute.routeId}
                      onChange={(e) => setNewRoute({ ...newRoute, routeId: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Starting Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newRoute.startingLocation}
                      onChange={(e) => setNewRoute({ ...newRoute, startingLocation: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newRoute.destination}
                      onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newRoute.totalDistanceKm}
                      onChange={(e) => setNewRoute({ ...newRoute, totalDistanceKm: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fare per km (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newRoute.farePerKm}
                      onChange={(e) => setNewRoute({ ...newRoute, farePerKm: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reward per km</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newRoute.rewardPerKm}
                      onChange={(e) => setNewRoute({ ...newRoute, rewardPerKm: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stops</label>
                  <div className="space-y-2">
                    {newRoute.stops.map((stop, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span>{stop.stop} ({stop.distanceFromStart} km)</span>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleRemoveStop(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Stop Name"
                        value={newStop.name}
                        onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                      />
                      <input
                        type="number"
                        className="w-1/4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Distance (km)"
                        value={newStop.distanceFromStart}
                        onChange={(e) => setNewStop({ ...newStop, distanceFromStart: parseFloat(e.target.value) || 0 })}
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={handleAddStop}
                      >
                        Add Stop
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={newRoute.active}
                    onChange={(e) => setNewRoute({ ...newRoute, active: e.target.checked })}
                  />
                  <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-900">Active</label>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Route
                </button>
              </form>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Routes</h2>
                <button
                  onClick={handleViewRoutes}
                  disabled={viewRoutesLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {viewRoutesLoading ? (
                    <>
                      <LoadingSpinner size={20} />
                      <span className="ml-2">Loading...</span>
                    </>
                  ) : (
                    'View Routes'
                  )}
                </button>
              </div>
              {routes.length === 0 && !viewRoutesLoading ? (
                <p className="text-gray-500">No routes found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Starting Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stops</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Distance (km)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fare per km (₹)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward per km</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {routes.map((route) => (
                        <tr key={route._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.routeId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.startingLocation}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.destination}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {route.stops.map(stop => `${stop.name} (${stop.distanceFromStart} km)`).join(', ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.totalDistanceKm}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.farePerKm}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.rewardPerKm}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.active ? 'Yes' : 'No'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">Select a tab to view content.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-800">Admin Dashboard</span>
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <span className="text-sm text-gray-600">Welcome, {adminData?.user_name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size={50} />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <button
                className={`mr-4 px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`mr-4 px-4 py-2 rounded ${activeTab === 'passengers' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setActiveTab('passengers')}
              >
                Passengers
              </button>
              <button
                className={`mr-4 px-4 py-2 rounded ${activeTab === 'conductors' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setActiveTab('conductors')}
              >
                Conductors
              </button>
              <button
                className={`mr-4 px-4 py-2 rounded ${activeTab === 'updateConductorStatus' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setActiveTab('updateConductorStatus')}
              >
                Update Conductor Status
              </button>
              <button
                className={`mr-4 px-4 py-2 rounded ${activeTab === 'routes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setActiveTab('routes')}
              >
                Routes
              </button>
            </div>
            {renderTabContent()}
          </>
        )}
    </main>
    </div>
  );
};
