import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { usePassengerStore } from '../store/PassengerStore';
import { AuthContainer } from './AuthContainer';
import { LoadingSpinner } from './LoadingSpinner';

const API_BASE_URL = 'https://public-transport.vercel.app/api/passenger';

export const PassengerLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = usePassengerStore();
  const [credentials, setCredentials] = useState({ user_name: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, credentials);
      const { token, id, user_name, name, email, phone, balance, rewardPoints } = response.data;
      
      const user = { id, user_name, name, email, phone, balance, rewardPoints };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      navigate('/passengerDashboard');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer title="Passenger Login">
      {message && <p className={`text-center ${message.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <input
            id="user_name"
            name="user_name"
            type="text"
            required
            value={credentials.user_name}
            onChange={handleChange}
            className="input-field"
            placeholder="Username"
          />
          <input
            id="password"
            name="password"
            type="password"
            required
            value={credentials.password}
            onChange={handleChange}
            className="input-field"
            placeholder="Password"
          />
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? <LoadingSpinner /> : 'Login'}
        </button>
        <Link to="/passenger/register" className="text-sm text-blue-600 hover:text-blue-800 text-center block">
          Don't have an account? Register
        </Link>
      </form>
    </AuthContainer>
  );
};
