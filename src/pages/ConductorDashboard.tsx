import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = 'https://public-transport.vercel.app/api';

export const ConductorDashboard: React.FC = () => {
    const { user, setUser, logout } = useStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [isFetchingAllRoutes, setIsFetchingAllRoutes] = useState(false);
    const [allRoutes, setAllRoutes] = useState<any[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [selectedRouteData, setSelectedRouteData] = useState<any | null>(null);
    const [calculatedTicket, setCalculatedTicket] = useState<any | null>(null);
    const [startLocation, setStartLocation] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [conductorId, setConductorId] = useState<string | null>(null);
    const [isGeneratingTicket, setIsGeneratingTicket] = useState<boolean>(false);
    const [generatedTicket, setGeneratedTicket] = useState<any | null>(null);
  
  

    const [ticketData, setTicketData] = useState({
        user_name: '',
        startLocation: '',
        destination: '',
        pin: '',
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setConductorId(parsedUser.id);
                setLoading(false);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [setUser]);

    const handleLogout = () => {
        logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/conductorLogin');
    };

    const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTicketData({ ...ticketData, [e.target.name]: e.target.value });
    };
  
    const fetchAllRoutesData = async () => {
        setIsFetchingAllRoutes(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/route/fetchAllRoutes`);
            setAllRoutes(response.data.routes);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch all routes');
        } finally {
            setIsFetchingAllRoutes(false);
        }
    };

    const handleRouteSelect = (routeId: string) => {
        setSelectedRouteId(routeId);
        setSelectedRouteData(null);
        setCalculatedTicket(null);
    };

    const handleSubmitRoute = () => {
        if (selectedRouteId) {
            const selectedRoute = allRoutes.find((route) => route._id === selectedRouteId);
            setSelectedRouteData(selectedRoute);
        } else {
            setSelectedRouteData(null);
            toast.error("Please select a route.");
        }
    };

    const handleCalculateTicketPrice = () => {
        setIsCalculating(true);
        if (!selectedRouteData || !startLocation || !destination) {
            toast.error("Please select a route, start location, and destination.");
            setIsCalculating(false);
            return;
        }

        const startStop = selectedRouteData.stops.find((stop: any) => stop.name === startLocation);
        const endStop = selectedRouteData.stops.find((stop: any) => stop.name === destination);

        if (!startStop || !endStop) {
            toast.error("Invalid start or destination location.");
            setIsCalculating(false);
            return;
        }

        const startIndex = selectedRouteData.stops.indexOf(startStop);
        const endIndex = selectedRouteData.stops.indexOf(endStop);

        if (startIndex >= endIndex) {
            toast.error("Destination must be after the start location.");
            setIsCalculating(false);
            return;
        }

        const distance = selectedRouteData.stops.slice(startIndex, endIndex + 1).reduce((acc: number, stop: any, index: number, arr: any[]) => {
            if (index > 0) {
                acc += arr[index].distanceFromStart - arr[index - 1].distanceFromStart;
            }
            return acc;
        }, 0);

        const fare = distance * selectedRouteData.farePerKm;
        const rewardPoints = Math.floor(fare / 10);
        const departureTimeFromSource = startStop.arrivalTime;
        const arrivalTimeAtDestination = endStop.arrivalTime;

        setCalculatedTicket({
            distance,
            fare,
            rewardPoints,
            departureTimeFromSource,
            arrivalTimeAtDestination,
        });

        toast.success("Ticket price calculated successfully!");
        setIsCalculating(false);
    };

    const handleGenerateTicket = async () => {
        setIsGeneratingTicket(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                `${API_BASE_URL}/transaction/book-ticket`,
                {
                    conductorId: conductorId,
                    user_name: ticketData.user_name,
                    startLocation: startLocation,
                    destination: destination,
                    pin: ticketData.pin,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setGeneratedTicket(response.data);
            toast.success("Ticket generated successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate ticket');
            setGeneratedTicket(null);
        } finally {
            setIsGeneratingTicket(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-blue-800 mb-2">Conductor Information</h2>
                            {user ? (
                                <div className="space-y-2">
                                    <p><span className="font-medium">Conductor ID:</span> {conductorId}</p>
                                    <p><span className="font-medium">Username:</span> {user.user_name}</p>
                                    <p><span className="font-medium">Name:</span> {user.name || 'N/A'}</p>
                                    <p><span className="font-medium">Email:</span> {user.email || 'N/A'}</p>
                                    <p><span className="font-medium">Phone:</span> {user.phone || 'N/A'}</p>
                                    <p><span className="font-medium">Status:</span> {user.status || 'N/A'}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">No user data available.</p>
                            )}
                        </div>
                    </div>
                );

            case 'availableRoutes':
                return (
                    <div className="bg-gray-100 p-6 rounded-lg mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Routes</h2>
                        <button
                            onClick={fetchAllRoutesData}
                            disabled={isFetchingAllRoutes}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
                        >
                            {isFetchingAllRoutes ? 'Loading Routes...' : 'Fetch Routes'}
                        </button>
                        {allRoutes.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-2 px-4 text-left">Select</th>
                                            <th className="py-2 px-4 text-left">Route ID</th>
                                            <th className="py-2 px-4 text-left">Starting Location</th>
                                            <th className="py-2 px-4 text-left">Stops</th>
                                            <th className="py-2 px-4 text-left">Destination</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allRoutes.map((route) => {
                                            const stops = route.stops.map((stop: any) => stop.name);
                                            return (
                                                <tr key={route._id} className="border-b border-gray-200">
                                                    <td className="py-2 px-4">
                                                        <input
                                                            type="radio"
                                                            name="selectedRoute"
                                                            value={route._id}
                                                            checked={selectedRouteId === route._id}
                                                            onChange={() => handleRouteSelect(route._id)}
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4">{route._id}</td>
                                                    <td className="py-2 px-4">{route.startingLocation}</td>
                                                    <td className="py-2 px-4">{stops.join(', ')}</td>
                                                    <td className="py-2 px-4">{route.destination}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {allRoutes.length === 0 && !isFetchingAllRoutes && (
                            <p>No routes available.</p>
                        )}
                        {selectedRouteData && (
                            <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-2">Selected Route Details:</h3>
                                <p><span className="font-medium">Route ID:</span> {selectedRouteData._id}</p>
                                <p><span className="font-medium">Starting Location:</span> {selectedRouteData.startingLocation}</p>
                                <p><span className="font-medium">Destination:</span> {selectedRouteData.destination}</p>
                                <p><span className="font-medium">Stops:</span></p>
                                <ul>
                                    {selectedRouteData.stops.map((stop: any) => (
                                        <li key={stop._id}>
                                            {stop.name} (Arrival: {stop.arrivalTime}, Departure: {stop.departureTime}, Distance: {stop.distanceFromStart} Km)
                                        </li>
                                    ))}
                                </ul>
                                <p><span className="font-medium">Total Distance:</span> {selectedRouteData.totalDistanceKm} Km</p>
                                <p><span className="font-medium">Fare per Km:</span> {selectedRouteData.farePerKm}</p>

                            </div>
                        )}
                        <button
                            onClick={handleSubmitRoute}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-4"
                        >
                            Submit Route
                        </button>
                        <div className='flex gap-4 mt-4'>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Location</label>
                                <select
                                    value={startLocation}
                                    onChange={(e) => setStartLocation(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Select Start Location</option>
                                    {selectedRouteData?.stops.map((stop: any) => (
                                        <option key={stop._id} value={stop.name}>
                                            {stop.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Destination</label>
                                <select
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Select Destination</option>
                                    {selectedRouteData?.stops.map((stop: any) => (
                                        <option key={stop._id} value={stop.name}>
                                            {stop.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleCalculateTicketPrice}
                                disabled={isCalculating}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-8"
                            >
                                {isCalculating ? 'Calculating...' : 'Calculate Ticket Price'}
                            </button>
                        </div>

                        {calculatedTicket && (
                            <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-2">Calculated Ticket Details:</h3>
                                <p><span className="font-medium">Distance:</span> {calculatedTicket.distance} Km</p>
                                <p><span className="font-medium">Fare:</span> {calculatedTicket.fare} Rs</p>
                                <p><span className="font-medium">Reward Points:</span> {calculatedTicket.rewardPoints}</p>
                                <p><span className="font-medium">Departure Time:</span> {calculatedTicket.departureTimeFromSource}</p>
                                <p><span className="font-medium">Arrival Time:</span> {calculatedTicket.arrivalTimeAtDestination}</p>
                            </div>
                        )}
                        
                        <div className="space-y-4 mt-4">
                            <input
                                type="text"
                                name="user_name"
                                placeholder="Passenger Username"
                                value={ticketData.user_name}
                                onChange={handleTicketChange}
                                className="input-field"
                                required
                            />
                            <input
                                type="text"
                                name="pin"
                                placeholder="PIN"
                                value={ticketData.pin}
                                onChange={handleTicketChange}
                                className="input-field"
                                required
                            />
                            <button
                                onClick={handleGenerateTicket}
                                disabled={isGeneratingTicket}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
                            >
                                {isGeneratingTicket ? <LoadingSpinner /> : 'Generate Ticket'}
                            </button>
                        </div>
                        {generatedTicket && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-md">
                                <h3 className="font-semibold">Generated Ticket Details:</h3>
                                <pre className="text-sm overflow-auto">
                                    {JSON.stringify(generatedTicket, null, 2)}
                                </pre>
                            </div>
                        )}
                        
                    </div>
                    
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-red-500 mb-4">No user data available</p>
                <button
                    onClick={() => navigate('/conductorLogin')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Navigation Bar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Conductor Menu</h2>
                </div>
                <nav className="p-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-4 py-3 rounded-md mb-1 ${activeTab === 'profile' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('availableRoutes')}
                        className={`w-full text-left px-4 py-3 rounded-md mb-1 ${activeTab === 'availableRoutes' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        Available Routes
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">Conductor Dashboard</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};
