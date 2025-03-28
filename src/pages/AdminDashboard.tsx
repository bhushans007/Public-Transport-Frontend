import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner'; // Assuming you have this component
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
  stops: string[];
  totalDistanceKm: number;
  farePerKm: number;
  rewardPerKm: number;
  active: boolean;
  createdAt: string;
}

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
    startingLocation: '',
    destination: '',
    stops: '',
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
      const response = await fetch('https://public-transport.vercel.app/api/admin/passenger-list', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      if (data && data.passengers) {
        setPassengers(data.passengers);
        toast.success(data.message);
      } else {
        toast.error('Failed to retrieve passenger list.');
      }
    } catch (error) {
      console.error('Error fetching passengers:', error);
      toast.error('An error occurred while fetching passengers.');
    } finally {
      setViewPassengersLoading(false);
    }
  };

  const handleViewConductors = async () => {
    setViewConductorsLoading(true);
    try {
      const response = await fetch('https://public-transport.vercel.app/api/admin/conductor-list', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      if (data && data.conductors) {
        setConductors(data.conductors);
        toast.success(data.message);
      } else {
        toast.error('Failed to retrieve conductor list.');
      }
    } catch (error) {
      console.error('Error fetching conductors:', error);
      toast.error('An error occurred while fetching conductors.');
    } finally {
      setViewConductorsLoading(false);
    }
  };

  const handleUpdateConductorStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(
        'https://public-transport.vercel.app/api/admin/update-conductor-status',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: JSON.stringify({
            user_name: updateConductorStatusData.username,
            status: updateConductorStatusData.status,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        // Update the conductor in the list
        setConductors(prevConductors =>
          prevConductors.map(conductor =>
            conductor.user_name === data.conductor.user_name
              ? { ...conductor, status: data.conductor.status }
              : conductor
          )
        );
        setUpdateConductorStatusData({ username: '', status: 'inactive' }); // Reset form
      } else {
        toast.error(data.message || 'Failed to update conductor status');
      }
    } catch (error) {
      console.error('Error updating conductor status:', error);
      toast.error('An error occurred while updating status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

    const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRoute.startingLocation || !newRoute.destination || !newRoute.stops || !newRoute.totalDistanceKm) {
      setError('All fields are required.');
      return;
    }
    if (newRoute.totalDistanceKm <= 0) {
        setError('Distance must be greater than zero');
        return;
    }

    try {
      const response = await fetch('https://public-transport.vercel.app/api/admin/add-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          ...newRoute,
          stops: newRoute.stops.split(',').map((stop: string) => stop.trim()),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRoutes([...routes, data.route]); // Assuming the response includes the new route
        setNewRoute({  //reset
            startingLocation: '',
            destination: '',
            stops: '',
            totalDistanceKm: 0,
            farePerKm: 2,
            rewardPerKm: 0.1,
            active: true,
        });
        toast.success(data.message);
        setError('');
      } else {
        setError(data.message || 'Failed to add route');
      }
    } catch (error) {
      console.error('Error adding route:', error);
      setError('An error occurred while adding the route.');
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
        return(
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
        )

      case 'routes':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Route</h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <form onSubmit={handleAddRoute} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stops (comma separated)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newRoute.stops}
                    onChange={(e) => setNewRoute({ ...newRoute, stops: e.target.value })}
                    placeholder="Stop1, Stop2, Stop3"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={newRoute.active}
                    onChange={(e) => setNewRoute({ ...newRoute, active: e.target.checked })}
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    Active Route
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Route
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Route List ({routes.length})</h2>
              {routes.length === 0 ? (
                <p className="text-gray-500">No routes found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fare</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {routes.map(route => (
                        <tr key={route._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.routeId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {route.startingLocation} → {route.destination}
                            <div className="text-xs text-gray-500 mt-1">
                              Stops: {route.stops.join(', ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.totalDistanceKm} km</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{(route.totalDistanceKm * route.farePerKm).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                          ${route.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {route.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
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
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!adminData) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Logout
        </button>
      </div>

      <nav className="mb-8">
        <ul className="flex space-x-4">
          <li
            className={`cursor-pointer px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </li>
           <li
            className={`cursor-pointer px-4 py-2 rounded ${activeTab === 'updateConductorStatus' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('updateConductorStatus')}
          >
            Update Conductor Status
          </li>
          <li
            className={`cursor-pointer px-4 py-2 rounded ${activeTab === 'passengers' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('passengers')}
          >
            Passengers
          </li>
          <li
            className={`cursor-pointer px-4 py-2 rounded ${activeTab === 'conductors' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('conductors')}
          >
            Conductors
          </li>
          <li
            className={`cursor-pointer px-4 py-2 rounded ${activeTab === 'routes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('routes')}
          >
            Routes
          </li>
        </ul>
      </nav>

      {renderTabContent()}
    </div>
  );
};

