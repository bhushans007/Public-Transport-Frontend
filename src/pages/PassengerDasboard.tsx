import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePassengerStore } from '../store/PassengerStore';
import { LoadingSpinner } from './LoadingSpinner';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { toast } from 'react-toastify';

export const PassengerDashboard: React.FC = () => {
  const { user, setUser, logout } = usePassengerStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [customAmount, setCustomAmount] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [addFundsMessage, setAddFundsMessage] = useState('');
  const [redeemPoints, setRedeemPoints] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemHistoryData, setRedeemHistoryData] = useState([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState('');


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
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

  const handleAddFunds = async (amount: number) => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsAddingFunds(true);
    setAddFundsMessage('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://public-transport.vercel.app/api/passenger/add-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_name: user.user_name,
          amount: amount.toString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...user, balance: user.balance + amount };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        toast.success(`Successfully added ₹${amount} to your account!`);
        setCustomAmount('');
        setAddFundsMessage('Fund Added Successfully');
      } else {
        toast.error(data.message || 'Failed to add funds');
        setAddFundsMessage('');
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('An error occurred while adding funds');
      setAddFundsMessage('');
    } finally {
      setIsAddingFunds(false);
    }
  };

  const handleRedeemRewards = async () => {
    if (!redeemPoints || parseInt(redeemPoints) <= 0) {
      toast.error('Please enter a valid number of points to redeem.');
      return;
    }
    if (parseInt(redeemPoints) % 100 !== 0) {
      toast.error('Please enter points in multiples of 100.');
      return;
    }

    if (parseInt(redeemPoints) > user.rewardPoints) {
      toast.error('You do not have sufficient reward points');
      return;
    }

    setIsRedeeming(true);
    setRedeemMessage('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://public-transport.vercel.app/api/passenger/redeem-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_name: user.user_name,
          rewardPointsToRedeem: redeemPoints,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const updatedUser = {
          ...user,
          balance: data.balance,
          rewardPoints: data.rewardPoints,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success(data.message);
        setRedeemPoints('');
        setRedeemMessage('Redeemed Successfully');
      } else {
        toast.error(data.message || 'Failed to redeem rewards.');
        setRedeemMessage('');
      }
    } catch (error) {
      console.error('Error redeeming rewards:', error);
      toast.error('An error occurred while redeeming rewards.');
      setRedeemMessage('');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleGetRedeemHistory = async () => {
    setIsFetchingHistory(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://public-transport.vercel.app/api/passenger/redeem-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_name: user.user_name,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRedeemHistoryData(data.redemptionHistory);
      } else {
        toast.error(data.message || 'Failed to fetch redeem history.');
      }
    } catch (error) {
      console.error('Error fetching redeem history:', error);
      toast.error('An error occurred while fetching redeem history.');
    } finally {
      setIsFetchingHistory(false);
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
          onClick={() => navigate('/passengerLogin')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    navigate('/passenger/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Passenger Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Username:</span> {user.user_name}</p>
                <p><span className="font-medium">Name:</span> {user.name}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Phone:</span> {user.phone}</p>
              </div>
            </div>
          </div>
        );
      case 'qrCode':
        return (
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold text-blue-800 mb-4">Your QR Code</h2>
            <div className="flex flex-col items-center">
              <QRCodeGenerator value={user.user_name} size={200} />
              <p className="mt-4 text-gray-700">
                {user.user_name}
              </p>
            </div>
          </div>
        );
      case 'addFunds':
        return (
          <div className="bg-yellow-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold text-yellow-800 mb-4">Add Funds</h2>
            <div className="space-y-4">
            

              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter Amount</label>
                <div className="flex">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter amount"
                    min="1"
                  />
                  <button
                    onClick={() => handleAddFunds(parseInt(customAmount))}
                    disabled={isAddingFunds || !customAmount || parseInt(customAmount) <= 0}
                    className={
                      "px-4 py-2 rounded-r " +
                      (isAddingFunds || !customAmount || parseInt(customAmount) <= 0
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700')
                    }
                  >
                    {isAddingFunds ? 'Processing...' : 'Add'}
                  </button>
                </div>
                {addFundsMessage && (
                  <span className="mt-2 text-green-600">{addFundsMessage}</span>
                )}
              </div>
            </div>
          </div>
        );
      case 'redeemRewards':
        return (
          <div className="bg-purple-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold text-purple-800 mb-4">Redeem Rewards</h2>
            <div className="space-y-4">
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points to Redeem:
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter points to Redeem"
                    min="1"
                  />
                </div>
                {redeemPoints && parseInt(redeemPoints) % 100 !== 0 && (
                  <span className="mt-2 text-red-600">Please enter points in multiples of 100.</span>
                )}
              </div>
              <button
                onClick={handleRedeemRewards}
                disabled={isRedeeming || !redeemPoints || parseInt(redeemPoints) <= 0 || parseInt(redeemPoints) > user.rewardPoints}
                className={
                  "px-4 py-2 rounded " +
                  (isRedeeming || !redeemPoints || parseInt(redeemPoints) <= 0 || parseInt(redeemPoints) > user.rewardPoints
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:shadow-outline')
                }
              >
                {isRedeeming ? 'Redeeming...' : 'Redeem'}
              </button>
              {redeemMessage && (
                <span className="mt-2 text-green-600">{redeemMessage}</span>
              )}
            </div>
          </div>
        );
      case 'redeemHistory':
        return (
          <div className="bg-green-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold text-green-800 mb-4">Redeem History</h2>
            <button
              onClick={handleGetRedeemHistory}
              disabled={isFetchingHistory}
              className={
                "px-4 py-2 rounded mb-4 " +
                (isFetchingHistory
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline')
              }
            >
              {isFetchingHistory ? 'Loading History...' : 'Get History'}
            </button>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Time</th>
                    <th className="py-2 px-4 text-left">Points Used</th>
                    <th className="py-2 px-4 text-left">Fund Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {redeemHistoryData.length > 0 ? (
                    redeemHistoryData.map((historyItem) => (
                      <tr key={historyItem._id} className="border-b border-gray-200">
                        <td className="py-2 px-4">{new Date(historyItem.timestamp).toLocaleString()}</td>
                        <td className="py-2 px-4">{historyItem.pointsUsed}</td>
                        <td className="py-2 px-4">₹{historyItem.fundGenerated}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-center" colSpan={3}>No history available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Navigation Bar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Passenger Menu</h2>
        </div>
        <nav className="p-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-md mb-1 ${activeTab === 'profile' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('qrCode')}
            className={`w-full text-left px-4 py-3 rounded-md mb-1 ${activeTab === 'qrCode' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('addFunds')}
            className={`w-full text-left px-4 py-3 rounded-md mb-1 ${activeTab === 'addFunds' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Add Funds
          </button>
          <button
            onClick={() => setActiveTab('redeemRewards')}
            className={`w-full text-left px-4 py-3 rounded-md mb-1 ${activeTab === 'redeemRewards' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Redeem Rewards
          </button>
          <button
            onClick={() => setActiveTab('redeemHistory')}
            className={`w-full text-left px-4 py-3 rounded-md mb-1 ${activeTab === 'redeemHistory' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Redeem History
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Passenger Dashboard</h1>
            <div className="flex space-x-4">
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded ">
                Fund ₹{user.balance}
              </span>
              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded">
                Redeem Points {user.rewardPoints}
              </span>
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
