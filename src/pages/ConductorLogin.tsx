import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';  // Changed to useStore
import { AuthContainer } from './AuthContainer';
import { LoadingSpinner } from './LoadingSpinner';

const API_BASE_URL = 'https://public-transport.vercel.app/api/conductor';

export const ConductorLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useStore(); // Changed to setUser
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
      const { token, conductor } = response.data;

      // Ensure all required fields are present
      if (!conductor.id || !conductor.user_name) {
        throw new Error("Missing required conductor data from API response.");
      }
      
      const conductorData = {
        id: conductor.id,
        user_name: conductor.user_name,
        name: conductor.name || "N/A",  // Provide default values
        email: conductor.email || "N/A",
        phone: conductor.phone || "N/A",
        status: conductor.status || "N/A",
        role: 'conductor' //Set the role
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(conductorData)); // Changed key to 'user'
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(conductorData); // Use setUser
      alert("Ready to navitage");
      navigate('/conductorDashboard');
    } catch (error: any) {
      setMessage(error.message || error.response?.data?.message || 'Login failed');
      console.error("Login Error:", error); // Log the error for debugging
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer title="Conductor Login">
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
        <Link to="/conductor/register" className="text-sm text-blue-600 hover:text-blue-800 text-center block">
          Don't have an account? Register
        </Link>
      </form>
    </AuthContainer>
  );
};
